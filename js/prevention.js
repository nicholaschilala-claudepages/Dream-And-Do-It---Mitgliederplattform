// ============================================================================
// Präventionscheck: Testprotokolle, Benchmark-Tabellen, Score-Berechnung
//
// Rahmen/Datenzusammenführung (Nutzer-Feedback Runde 4): führt Alter
// (Geburtsdatum), Körperfett, Sitzzeit, Trainings-Balance (Dysbalancen aus
// dem Trainingstagebuch) sowie die vom Nutzer bereitgestellten Kraftausdauer-
// und Beweglichkeitstests aus dem Athletikkonzept zu einem Score von 0-100
// zusammen (100 = für das Alter maximal gesund/leistungsfähig).
//
// WICHTIG zur Transparenz: Gewichtung und Stufenwerte unten sind eine erste,
// dokumentierte Version des Bewertungsrahmens ("Rahmen jetzt schon bauen" –
// Antwort auf Rückfrage). Jede Teilkennzahl ist einzeln nachvollziehbar
// ausgewiesen, damit Gewichte/Schwellen bei Bedarf gemeinsam nachjustiert
// werden können, sobald mehr Praxiserfahrung mit dem Score vorliegt.
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// Alter
// ---------------------------------------------------------------------------

export function calcAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function updateBirthDate(clientId, birthDate) {
  return supabaseClient.from('profiles').update({ birth_date: birthDate || null }).eq('id', clientId);
}

// ---------------------------------------------------------------------------
// Körpergröße (Runde 18): analog zum Geburtsdatum zentral in profiles
// gepflegt statt bei jeder Körperfett-Messung bzw. im PAL-Rechner erneut
// abgefragt zu werden – ändert sich bei Erwachsenen praktisch nie.
// ---------------------------------------------------------------------------

export async function updateHeight(clientId, heightCm) {
  return supabaseClient.from('profiles').update({ height_cm: heightCm || null }).eq('id', clientId);
}

// ---------------------------------------------------------------------------
// Geschlecht (Runde 19): zentral in profiles.sex ('male' | 'female' | NULL),
// einmalig auf der Startseite gepflegt. Alle geschlechtsspezifischen
// Einstufungen (Liegestütz, Kniebeuge, Fersenheben, Sit-and-Reach, VO2max,
// Körperfett) werden OHNE Angabe nicht berechnet, sondern ausgeblendet –
// mit Hinweis, wo die Angabe ergänzt werden kann (needsSex).
// ---------------------------------------------------------------------------

export async function updateSex(clientId, sex) {
  return supabaseClient.from('profiles').update({ sex: sex === 'male' || sex === 'female' ? sex : null }).eq('id', clientId);
}

export function isKnownSex(sex) {
  return sex === 'male' || sex === 'female';
}

/**
 * Liest Geburtsdatum und Geschlecht eines Profils. Läuft die Migration
 * sql/052 (profiles.sex) noch nicht, fällt die Funktion auf nur das
 * Geburtsdatum zurück statt zu scheitern.
 */
export async function loadProfileBasics(clientId) {
  let { data, error } = await supabaseClient.from('profiles').select('birth_date, sex').eq('id', clientId).maybeSingle();
  if (error && /sex/i.test(error.message || '')) {
    ({ data, error } = await supabaseClient.from('profiles').select('birth_date').eq('id', clientId).maybeSingle());
  }
  return { birthDate: data ? data.birth_date : null, sex: data && isKnownSex(data.sex) ? data.sex : null, error };
}

export const SEX_HINT_TEXT = 'Für diese Einstufung wird dein Geschlecht benötigt – die Vergleichswerte unterscheiden sich zwischen Männern und Frauen. Bitte auf der Startseite ergänzen.';

// ---------------------------------------------------------------------------
// Benchmarks (Kraftausdauer + Sit-and-Reach). Quellenstatus je Test siehe
// "note" im Rückgabewert; die Einstufung auf die vier Plattformstufen
// (top/mid/low/below → grün/grün/gelb/rot) ist die dokumentierte Abbildung
// der jeweiligen Quellkategorien, nicht Teil der Quellen selbst.
// ---------------------------------------------------------------------------

// Plank: weiterhin die bisherige Tabelle (Entscheidung: später entscheiden).
const PLANK_BANDS = [
  { maxAge: 19, solide: [45, 89], gut: [90, 119], sehrGutMin: 120 },
  { minAge: 20, maxAge: 29, solide: [45, 89], gut: [90, 119], sehrGutMin: 120 },
  { minAge: 30, maxAge: 39, solide: [40, 74], gut: [75, 109], sehrGutMin: 110 },
];

function findBand(bands, ageYears) {
  return bands.find((b) => (b.minAge == null || ageYears >= b.minAge) && (b.maxAge == null || ageYears <= b.maxAge)) || null;
}

function categorizeFromBand(band, value, labels) {
  if (!band) return null;
  const [lowKey, midKey, topKey] = Object.keys(band).filter((k) => k !== 'minAge' && k !== 'maxAge');
  const low = band[lowKey], mid = band[midKey], topMin = band[topKey];
  if (value >= topMin) return { key: 'top', label: labels.top };
  if (value >= mid[0]) return { key: 'mid', label: labels.mid };
  if (value >= low[0]) return { key: 'low', label: labels.low };
  return { key: 'below', label: labels.below };
}

// Tabellengesteuert: cuts = UNTERE Grenzen der Kategorien, von der besten zur
// schlechtesten; Alterbänder als [minAge, maxAge, cuts].
function bandByAge(rows, ageYears) {
  const r = rows.find(([min, max]) => ageYears >= min && ageYears <= max);
  return r ? r[2] : null;
}
function classifyByCuts(cuts, labels, levels, value) {
  for (let i = 0; i < cuts.length; i++) {
    if (value >= cuts[i]) return { key: levels[i], label: labels[i] };
  }
  return { key: 'below', label: 'Unter dem Referenzbereich' };
}

// Liegestütz – ACSM-Normtabellen "Maximum Push Up Norms" (Männer, Standard-
// Liegestütz) bzw. "Maximum Modified Push Up Norms" (Frauen, modifizierter
// Liegestütz auf den Knien), bereitgestellt vom Institute for Aerobics
// Research, Dallas TX (1991) – Tabellenvorlage vom Nutzer (Runde 20). Test bis
// zum Muskelversagen ohne Pause; Altersgruppen 20–29 … 60+.
// Die Quelle gibt Perzentil-Zeilen (99 … 5) und sechs Bewertungsstufen an:
//   S = Superior (Perzentil 99–85), E = Excellent (80–65), G = Good (60–45),
//   F = Fair (40–25), P = Poor (20–10), VP = Very Poor (5).
// Hinterlegt sind je Altersgruppe die Untergrenzen der Stufen:
//   s = Wert der 85.-Perzentil-Zeile (ab hier S), e = 65. (ab hier E),
//   g = 45. (ab hier G), f = 25. (ab hier F), vp = Wert der 5.-Zeile
//   (bis einschließlich = VP; dazwischen P).
// Hinweis zur Quelle: In der Frauen-Spalte 40–49 steht in der Zeile "99" der
// Wert "≥60" (bei 95. Perzentil = 33) – offensichtlich ein Übertragungsfehler
// der Vorlage; er wird für die Einstufung nicht gebraucht (S beginnt bei 85).
// Altersgruppe unter 20 Jahren ist in der Quelle nicht enthalten.
const PUSHUP_TABLE = {
  male: [
    [20, 29, { s: 51, e: 39, g: 31, f: 24, vp: 13 }],
    [30, 39, { s: 41, e: 31, g: 25, f: 19, vp: 9 }],
    [40, 49, { s: 34, e: 25, g: 19, f: 13, vp: 5 }],
    [50, 59, { s: 28, e: 20, g: 14, f: 9.5, vp: 3 }],
    [60, 130, { s: 24, e: 20, g: 12, f: 7, vp: 2 }],
  ],
  female: [
    [20, 29, { s: 39, e: 31, g: 25, f: 19, vp: 9 }],
    [30, 39, { s: 33, e: 26, g: 20, f: 14, vp: 4 }],
    [40, 49, { s: 26, e: 19, g: 14, f: 9, vp: 1 }],
    [50, 59, { s: 23, e: 18, g: 13, f: 8, vp: 0 }],
    [60, 130, { s: 15, e: 13, g: 6, f: 2, vp: 0 }],
  ],
};
// Zuordnung auf die vier Plattformstufen (Runde 20, Annahme): S/E → top (grün),
// G → mid (grün), F → low (gelb), P/VP → below (rot).
const PUSHUP_RATINGS = {
  S: { key: 'top', label: 'Überragend (Superior, ab 85. Perzentil)' },
  E: { key: 'top', label: 'Ausgezeichnet (Excellent, 65.–80. Perzentil)' },
  G: { key: 'mid', label: 'Gut (Good, 45.–60. Perzentil)' },
  F: { key: 'low', label: 'Befriedigend (Fair, 25.–40. Perzentil)' },
  P: { key: 'below', label: 'Schwach (Poor, 10.–20. Perzentil)' },
  VP: { key: 'below', label: 'Sehr schwach (Very Poor, bis 5. Perzentil)' },
};
function classifyPushup(c, v) {
  const r = v >= c.s ? 'S' : v >= c.e ? 'E' : v >= c.g ? 'G' : v >= c.f ? 'F' : v > c.vp ? 'P' : 'VP';
  return { ...PUSHUP_RATINGS[r] };
}

// Kniebeuge – ACE "Bodyweight Squat Assessment Protocol" (Normtabelle nach
// Mackenzie 2005, "101 Performance Evaluation Tests"): Praxisrichtwert, kein
// peer-reviewter Normwert. Sieben Kategorien (beste → schlechteste). Die in
// der Quelltabelle sichtbaren Unstimmigkeiten wurden so aufgelöst, dass die
// Abbildung auf die vier Plattformstufen davon nicht berührt wird:
//  - Männer 46–55 "Above average 25–38": als 25–28 gelesen (Good beginnt bei 29).
//  - Männer 46–55 Lücke 9–12: fällt in "Sehr schwach" (wie "Schwach" → rot).
//  - Frauen 56–65: Überlappung bei 24 → Excellent ab 25.
//  - Altersbänder 56–64 und 65+ (Quelle: 56–65 und 65+).
const SQUAT_LEVELS = ['top', 'top', 'mid', 'mid', 'low', 'below', 'below'];
const SQUAT_LABELS = ['Ausgezeichnet', 'Gut', 'Überdurchschnittlich', 'Durchschnitt', 'Unterdurchschnittlich', 'Schwach', 'Sehr schwach'];
const SQUAT_TABLE = {
  male: [
    [18, 25, [50, 44, 39, 35, 31, 25, 0]],
    [26, 35, [46, 40, 35, 31, 29, 22, 0]],
    [36, 45, [42, 35, 30, 27, 23, 17, 0]],
    [46, 55, [36, 29, 25, 22, 18, 13, 0]],
    [56, 64, [32, 25, 21, 17, 13, 9, 0]],
    [65, 130, [29, 22, 19, 15, 11, 7, 0]],
  ],
  female: [
    [18, 25, [44, 37, 33, 29, 25, 18, 0]],
    [26, 35, [40, 33, 29, 25, 21, 13, 0]],
    [36, 45, [34, 27, 23, 19, 15, 7, 0]],
    [46, 55, [28, 22, 18, 14, 10, 5, 0]],
    [56, 64, [25, 18, 13, 10, 7, 3, 0]],
    [65, 130, [24, 17, 14, 11, 5, 2, 0]],
  ],
};

// Einbeiniges Fersenheben – Hébert-Losier, Wessman, Alricsson & Svantesson
// (2017), Physiotherapy 103 (n = 566, 20–81 Jahre; 10°-Neigung, Metronom).
// Median und untere Referenzgrenze (P2,5) je Dekade, Mittel aus linkem und
// rechtem Bein; dazwischen wird linear interpoliert. Das untere Quartil (P25)
// ist in der Studie nicht veröffentlicht und wird NÄHERUNGSWEISE als
// Median − 0,344 × (Median − P2,5) abgeleitet (grob normalverteilte untere
// Hälfte) – daher als "orientierend" gekennzeichnet.
const HEEL_RAISE_TABLE = {
  male: { ages: [20, 30, 40, 50, 60, 70, 80], median: [37.5, 32.9, 28.3, 23.8, 19.1, 14.6, 10.0], p025: [16.2, 13.2, 10.1, 7.0, 4.0, 0.9, 0.0] },
  female: { ages: [20, 30, 40, 50, 60, 70, 80], median: [30.1, 27.4, 24.6, 22.0, 19.2, 16.4, 13.7], p025: [13.4, 10.8, 8.3, 6.0, 3.2, 0.7, 0.0] },
};
function interp(ages, vals, age) {
  const a = Math.min(Math.max(age, ages[0]), ages[ages.length - 1]);
  for (let i = 0; i < ages.length - 1; i++) {
    if (a >= ages[i] && a <= ages[i + 1]) {
      const t = (a - ages[i]) / (ages[i + 1] - ages[i]);
      return vals[i] + t * (vals[i + 1] - vals[i]);
    }
  }
  return vals[vals.length - 1];
}
export function heelRaiseReference(ageYears, sex) {
  if (!isKnownSex(sex) || ageYears == null || ageYears < 20 || ageYears > 81) return null;
  const t = HEEL_RAISE_TABLE[sex];
  const median = interp(t.ages, t.median, ageYears);
  const p025 = interp(t.ages, t.p025, ageYears);
  const p25 = median - 0.344 * (median - p025);
  return { median, p25, p025 };
}

// Sit-and-Reach – Normtabelle der IAT-Testothek "Sit-and-Reach"
// (https://sport-iat.de/testothek/detail/sit-and-reach; dort ohne Quellenangabe,
// identische Zahlen für 16–19-Jährige bei Davis et al. 2000 nach brianmac.co.uk,
// Skala mit Fußsohlen bei 15 cm). Die Tabelle gibt Werte >= 0 an, die
// Plattform misst aber ab den Fußsohlen = 0 cm (vor den Fußsohlen negativ).
// Entscheidung Nutzer (Runde 20): Der Bereich "sehr gut" beginnt, sobald die
// Fußsohlen erreicht bzw. überschritten sind (überdurchschnittlich beweglich);
// Werte davor (negativ) sind entsprechend schlechter. Daher sind die Tabellen-
// werte um 15 cm auf die Fußsohlen-Skala verschoben (Männer: IAT 14/11/7/4 →
// −1/−4/−8/−11; Frauen: IAT 15/12/7/4 → 0/−3/−8/−11).
// Hinterlegt sind die Untergrenzen: sehr gut = über `vg` (>), gut ab `g`,
// durchschnittlich ab `a`, ausreichend ab `f`, darunter ungenügend.
const SIT_REACH_IAT = {
  male: { vg: -1, g: -4, a: -8, f: -11 },
  female: { vg: 0, g: -3, a: -8, f: -11 },
};

const NO_SEX = { key: null, label: 'Geschlecht nicht hinterlegt – Einstufung ausgeblendet', bandFound: false, needsSex: true };
const NO_AGE_BAND = { key: null, label: 'Keine Referenzwerte für dieses Alter hinterlegt', bandFound: false };

/**
 * Ordnet einen Testwert der passenden Benchmark-Kategorie zu.
 * @returns {{key:'top'|'mid'|'low'|'below'|null, label:string, bandFound:boolean, needsSex?:boolean, note?:string, genderNote?:string}}
 */
export function evaluateStrengthBenchmark(testKey, ageYears, value, sex) {
  if (ageYears == null) return { key: null, label: 'Kein Geburtsdatum hinterlegt', bandFound: false };
  const v = Number(value);

  if (testKey === 'plank') {
    const band = findBand(PLANK_BANDS, ageYears);
    if (!band) return { ...NO_AGE_BAND };
    return { ...categorizeFromBand(band, v, { below: 'Unter Basis-Niveau', low: 'Solide Basis', mid: 'Gut', top: 'Sehr gut' }), bandFound: true };
  }

  // Ab hier: geschlechtsspezifische Einstufungen – ohne Angabe ausblenden.
  if (!isKnownSex(sex)) {
    if (testKey === 'pushup' || testKey === 'squat' || testKey === 'heel_raise' || testKey === 'sit_reach_cm') return { ...NO_SEX };
    return { key: null, label: '', bandFound: false };
  }

  if (testKey === 'pushup') {
    const cuts = bandByAge(PUSHUP_TABLE[sex], ageYears);
    if (!cuts) return { ...NO_AGE_BAND, label: 'Keine Referenzwerte für dieses Alter hinterlegt (Tabelle: ab 20 Jahren)' };
    const form = sex === 'female' ? 'modifizierter Liegestütz (auf den Knien)' : 'Standard-Liegestütz (auf den Zehen)';
    return { ...classifyPushup(cuts, v), bandFound: true, note: `Referenz: ACSM-Normtabelle "Maximum ${sex === 'female' ? 'Modified ' : ''}Push Up Norms" (Institute for Aerobics Research, Dallas TX, 1991) – gilt für den ${form}, Test bis zum Muskelversagen ohne Pause.` };
  }
  if (testKey === 'squat') {
    const cuts = bandByAge(SQUAT_TABLE[sex], ageYears);
    if (!cuts) return { ...NO_AGE_BAND };
    return { ...classifyByCuts(cuts, SQUAT_LABELS, SQUAT_LEVELS, v), bandFound: true, note: 'Referenz: ACSM Guidelines for Exercise Testing and Prescription und ACE-Normtabelle (nach Mackenzie, 101 Performance Evaluation Tests).' };
  }
  if (testKey === 'heel_raise') {
    const ref = heelRaiseReference(ageYears, sex);
    if (!ref) return { ...NO_AGE_BAND, label: 'Keine Referenzwerte für dieses Alter hinterlegt (Studie: 20–81 Jahre)' };
    const labels = { top: 'Überdurchschnittlich (ab Median deiner Altersgruppe)', mid: 'Im üblichen Bereich (ab unterem Quartil)', low: 'Unterer Referenzbereich', below: 'Unter dem Referenzbereich' };
    const key = v >= ref.median ? 'top' : v >= ref.p25 ? 'mid' : v >= ref.p025 ? 'low' : 'below';
    return {
      key, label: labels[key], bandFound: true,
      note: `Referenz: Hébert-Losier et al. (2017), Physiotherapy 103(4), 446–452 – Median ${ref.median.toFixed(0)} Wdh., unteres Quartil ≈ ${ref.p25.toFixed(0)} (näherungsweise abgeleitet) – orientierend. Die Normwerte entstanden auf einer um ca. 10° geneigten Fläche.`,
    };
  }
  if (testKey === 'sit_reach_cm') {
    const c = SIT_REACH_IAT[sex];
    const lv = v > c.vg ? ['top', 'Sehr gut'] : v >= c.g ? ['top', 'Gut'] : v >= c.a ? ['mid', 'Durchschnittlich'] : v >= c.f ? ['low', 'Ausreichend'] : ['below', 'Ungenügend'];
    return {
      key: lv[0], label: lv[1], bandFound: true,
      note: `Referenz: Normtabelle der IAT-Testothek Sit-and-Reach (nach Geschlecht, ohne Altersstufen; dort ohne Quellenangabe), auf 0 cm = Fußsohlen verschoben: ab Erreichen der Fußsohlen beginnt der sehr gute Bereich, negative Werte (Finger erreichen die Fußsohlen nicht) sind entsprechend schlechter – orientierend.`,
    };
  }
  return { key: null, label: '', bandFound: false };
}

/** Wall-Angel-Punkte (0–3) → Plattformskala −1/0/+1 (Annahme: 3 → +1, 2 → 0, 0–1 → −1). */
export function mobilityRatingValue(testKey, value) {
  const v = Number(value);
  if (testKey === 'wall_angel') return v >= 3 ? 1 : v >= 2 ? 0 : -1;
  return Math.sign(v);
}

// ---------------------------------------------------------------------------
// Testdefinitionen (Protokoll-Texte für die Anzeige) – Kraftausdauer +
// Beweglichkeit. Übungsauswahl/Durchführung ursprünglich aus dem
// Athletikkonzept übernommen; die ANGEZEIGTEN Quellen (source) verweisen
// jedoch ausschließlich auf wissenschaftliche Literatur (Nutzer-Feedback
// Runde 8: "wir verwenden aber nur wissenschaftliche quellen oder keine
// angabe" – das interne Athletikkonzept-Dokument darf nicht als Quelle
// angezeigt werden).
// ---------------------------------------------------------------------------

export const STRENGTH_TESTS = [
  {
    key: 'plank',
    label: 'Rumpfstabilität (Unterarmstütz/Plank)',
    unit: 'Sekunden',
    valueLabel: 'Gehaltene Zeit bis Formverlust',
    ausfuehrung: 'Unterarmstütz einnehmen, Ellenbogen unter der Schulter, Körper in einer geraden Linie von Kopf bis Ferse.',
    typischeFehler: 'Hüfte sackt durch oder wird zu hoch gestreckt, Kopf fällt nach unten, Schultern hochgezogen.',
    abbruchkriterium: 'Abbruch, sobald die Hüfte sichtbar durchhängt oder die saubere Linie nicht mehr gehalten werden kann.',
    kontraindikation: 'Nicht bei akuten Rückenbeschwerden, direkt nach Bauchmuskel-Verletzungen oder starken Schulterschmerzen testen.',
    selbsttest: 'Handy-Stoppuhr starten und saubere Unterarmstütz-Position einnehmen. Bis zum ersten Formverlust (Hüfte sackt/hebt) halten. Zeit notieren und mit der Benchmark-Tabelle vergleichen.',
    source: 'Strand et al. (2014); TopendSports Normtabellen',
    feeds: 'Speist die Marker Bauchmuskeln und Unterer Rücken.',
    ausfuehrungImage: 'content/tests/plank-ausfuehrung.jpg',
    abbruchImage: 'content/tests/plank-abbruch.jpg',
  },
  {
    key: 'pushup',
    label: 'Kraftausdauer Oberkörper (Liegestütz)',
    unit: 'Wiederholungen',
    valueLabel: 'Maximale saubere Wiederholungen ohne Pause',
    ausfuehrung: 'Männer: Standard-Liegestütz (Körper auf den Zehen). Frauen: modifizierter Liegestütz (Knie am Boden als Auflage, Körper in gerader Linie von Knie bis Kopf) – die Normtabelle verwendet für Frauen die modifizierte Form. Volle Bewegungsamplitude (Beugung bis ca. 5 cm über dem Boden, Ellenbogen ca. 45°), ohne Pause bis zum Muskelversagen.',
    typischeFehler: 'Unvollständige Bewegungsamplitude, Hüfte sackt durch oder wird hochgestreckt.',
    abbruchkriterium: 'Test beenden, sobald keine saubere Wiederholung mehr gelingt (Hüfte sackt durch, Amplitude wird nicht mehr erreicht) oder eine Pause nötig wird – die Normtabelle gilt für den Test bis zum Muskelversagen ohne Pause.',
    kontraindikation: 'Nicht bei akuter Schulter-, Hüft-, Knie-, Sprung- oder Handgelenksverletzung sowie unmittelbar nach intensivem Training testen.',
    selbsttest: 'Saubere Liegestütz-Position einnehmen. So viele Wiederholungen wie möglich ohne Pause ausführen (Männer Standardform, Frauen auf den Knien). Bei Formverlust abbrechen, Wiederholungen zählen und notieren.',
    source: 'American College of Sports Medicine (ACSM) – Normtabellen „Maximum Push Up Norms“ (Männer) und „Maximum Modified Push Up Norms“ (Frauen), bereitgestellt vom Institute for Aerobics Research, Dallas, TX (1991)',
    feeds: 'Speist die Marker Brustmuskulatur und Muskeln Arm li./re.',
    ausfuehrungImage: 'content/tests/liegestuetz-ausfuehrung.jpg',
    abbruchImage: 'content/tests/liegestuetz-abbruch.jpg',
  },
  {
    key: 'squat',
    label: 'Kraftausdauer Beine (Kniebeuge)',
    unit: 'Wiederholungen',
    valueLabel: 'Maximale saubere Wiederholungen ohne Pause',
    ausfuehrung: 'Aufrechter Stand, kontrollierte Abwärtsbewegung, bis die Oberschenkel parallel zum Boden sind – nur dann zählt die Wiederholung. Die Arme dürfen zur Balance seitlich oder nach vorn gestreckt sein, das Tempo ist frei wählbar.',
    typischeFehler: 'Hüfte wird nicht tief genug abgesenkt (Oberschenkel nicht parallel zum Boden), Pausen oder Stocken in der Aufstehphase.',
    abbruchkriterium: 'Abbruch bei Ermüdungszeichen: Tiefe wird nicht mehr erreicht, Pause oder Stocken in der Aufstehphase – nicht bis zur völligen muskulären Erschöpfung um jeden Preis zählen.',
    kontraindikation: 'Nicht bei akuter Schulter-, Hüft-, Knie-, Sprung- oder Handgelenksverletzung sowie unmittelbar nach intensivem Training testen.',
    selbsttest: 'Aufrechten Stand einnehmen. So viele Kniebeugen wie möglich (Oberschenkel mindestens parallel zum Boden) ohne Pause ausführen. Bei Formverlust abbrechen, gültige Wiederholungen zählen und notieren.',
    source: 'American College of Sports Medicine – ACSM Guidelines for Exercise Testing and Prescription und ACE-Normtabelle (nach Mackenzie, 101 Performance Evaluation Tests)',
    feeds: 'Speist die Marker Knie li./re. und Oberschenkel li./re.',
    ausfuehrungImage: 'content/tests/kniebeuge-ausfuehrung.jpg',
    abbruchImage: 'content/tests/kniebeuge-abbruch.jpg',
  },
  {
    key: 'heel_raise',
    label: 'Wadenkraftausdauer je Seite (einbeiniges Fersenheben)',
    hasSide: true,
    unit: 'Wiederholungen',
    valueLabel: 'Wiederholungen bis Abbruch (diese Seite)',
    ausfuehrung: 'Barfuß auf einem Bein stehen, Knie gestreckt, Oberkörper aufrecht. Am besten auf einer leicht geneigten Fläche (ca. 10°, z. B. Brett auf einem Buch), wie in den Normwertstudien. Mit den Fingerspitzen in Schulterhöhe leicht an einer Wand abstützen (nur Balancehilfe, kein Hochziehen). Metronom auf 60 Schläge pro Minute: Schlag 1 Ferse so hoch wie möglich anheben, Schlag 2 kontrolliert absenken. Gezählt werden nur vollständige Wiederholungen. Beide Seiten nacheinander, mit mindestens 2 Minuten Pause.',
    typischeFehler: 'Knie beugen; Ferse nicht hoch genug heben; Tempo nicht halten; an der Wand hochziehen; Schwung aus dem Oberkörper.',
    abbruchkriterium: 'Test beenden, wenn die Ferse nicht mehr vollständig angehoben werden kann, das Tempo nicht mehr gehalten wird, das Knie beugt, der Oberkörper nicht aufrecht bleibt oder die Balance nur mit mehr als Fingerspitzenkontakt zu halten ist. Sofortiger Abbruch bei Schmerz in Wade, Achillessehne oder Fußgelenk.',
    kontraindikation: 'Nicht bei akuten Achillessehnen-, Waden- oder Sprunggelenksbeschwerden, frischer Verletzung oder direkt nach intensivem Lauf-/Wadentraining testen.',
    selbsttest: 'Metronom auf 60 starten, auf einem Bein im Takt Fersen heben und senken, Fingerspitzen an der Wand. Zählen, bis eines der Abbruchkriterien eintritt. Danach die andere Seite.',
    source: 'Primärquelle der Normwerte: Hébert-Losier, K., Wessman, C., Alricsson, M., & Svantesson, U. (2017). Updated reliability and normative values for the standing heel-rise test in healthy adults. Physiotherapy, 103(4), 446–452. https://doi.org/10.1016/j.physio.2017.03.002 (n = 566, 20–81 Jahre, einbeiniges Fersenheben auf 10°-Neigung bis zur Ermüdung)',
    feeds: 'Speist die Marker Fußgelenk li./re. und Wade li./re. (je Seite).',
    ausfuehrungImage: 'content/tests/fersenheben-ausfuehrung.jpg',
    abbruchImage: 'content/tests/fersenheben-abbruch.jpg',
  },
];

// ---------------------------------------------------------------------------
// Cardio-Fitness-Test (Runde 16) – Cooper-12-Minuten-Lauf ODER Rockport-
// Gehtest, beide münden in einen geschätzten VO2max-Wert (ml/kg/min), der
// wie die übrigen Kraftausdauertests im Präventionscheck geloggt wird
// (test_key 'cardio_fitness' in prevention_test_results; value = der
// berechnete VO2max, die gewählten Rohdaten/das Protokoll werden zusätzlich
// als Klartext in notes gespeichert – kein Schema-Umbau nötig).
//
// Begründung für die Aufnahme: Mandsager et al. (2018), JAMA Network Open,
// fanden in einer Kohorte von 122.007 Personen einen durchgehenden,
// nahezu linearen Zusammenhang zwischen kardiorespiratorischer Fitness und
// Gesamtmortalität, ohne erkennbare Obergrenze des Nutzens.
// ---------------------------------------------------------------------------

/**
 * Cooper, K. H. (1968). "A Means of Assessing Maximal Oxygen Intake."
 * JAMA, 203(3), 201–204. 12-Minuten-Lauftest: möglichst weite Strecke in
 * 12 Minuten zurücklegen, VO2max aus der Distanz schätzen.
 */
export function computeCooperVO2max(distanceMeters) {
  if (!distanceMeters || distanceMeters <= 0) return null;
  const vo2max = (distanceMeters - 504.9) / 44.73;
  return vo2max > 0 ? Math.round(vo2max * 10) / 10 : null;
}

/**
 * Kline, G. M. et al. (1987). "Estimation of VO2max from a one-mile track
 * walk, gender, age, and body weight." Medicine & Science in Sports &
 * Exercise, 19(3), 253–259. 1-Meile-Gehtest (zügig gehen, nicht laufen):
 * Zeit und Puls direkt am Ziel messen.
 */
export function computeRockportVO2max({ weightKg, ageYears, sex, timeMinutes, heartRateBpm }) {
  if (!weightKg || !ageYears || !timeMinutes || !heartRateBpm || !isKnownSex(sex)) return null;
  const weightLb = weightKg * 2.20462;
  const genderValue = sex === 'female' ? 0 : 1;
  const vo2max = 132.853
    - (0.0769 * weightLb)
    - (0.3877 * ageYears)
    + (6.315 * genderValue)
    - (3.2649 * timeMinutes)
    - (0.1565 * heartRateBpm);
  return vo2max > 0 ? Math.round(vo2max * 10) / 10 : null;
}

/**
 * Einstufungs-Tabelle: Cooper Institute, "Physical Fitness Specialist
 * Certification Manual" (rev. 1997), Dallas TX – zitiert nach Heyward, V.H.
 * (1998), "Advanced Fitness Assessment & Exercise Prescription", 3. Aufl.,
 * S. 48. Hinweis zur Transparenz: VO2max-Normtabellen unterscheiden sich je
 * nach Quelle spürbar (das aktuelle ACSM-Regelwerk nutzt inzwischen
 * perzentilbasierte Referenzwerte aus der FRIEND-Registry, Kaminsky et al.
 * 2022, Mayo Clinic Proceedings). Die hier hinterlegte Cooper-Institute-
 * Tabelle ist eine der am häufigsten zitierten kategorialen Einstufungen und
 * dient der eigenen Verlaufskontrolle, nicht einer diagnostischen Aussage.
 * Werte je Altersband = untere Grenze der jeweiligen Kategorie (ml/kg/min).
 */
const VO2MAX_BANDS_MALE = [
  { minAge: 20, maxAge: 29, schlecht: 33.0, maessig: 36.5, gut: 42.5, ausgezeichnet: 46.5, superior: 52.5 },
  { minAge: 30, maxAge: 39, schlecht: 31.5, maessig: 35.5, gut: 41.0, ausgezeichnet: 45.0, superior: 49.5 },
  { minAge: 40, maxAge: 49, schlecht: 30.2, maessig: 33.6, gut: 39.0, ausgezeichnet: 43.8, superior: 48.1 },
  { minAge: 50, maxAge: 59, schlecht: 26.1, maessig: 31.0, gut: 35.8, ausgezeichnet: 41.0, superior: 45.4 },
  { minAge: 60, maxAge: 120, schlecht: 20.5, maessig: 26.1, gut: 32.3, ausgezeichnet: 36.5, superior: 44.3 },
];

const VO2MAX_BANDS_FEMALE = [
  { minAge: 20, maxAge: 29, schlecht: 23.6, maessig: 29.0, gut: 33.0, ausgezeichnet: 37.0, superior: 41.1 },
  { minAge: 30, maxAge: 39, schlecht: 22.8, maessig: 27.0, gut: 31.5, ausgezeichnet: 35.7, superior: 40.1 },
  { minAge: 40, maxAge: 49, schlecht: 21.0, maessig: 24.5, gut: 29.0, ausgezeichnet: 32.9, superior: 37.0 },
  { minAge: 50, maxAge: 59, schlecht: 20.2, maessig: 22.8, gut: 27.0, ausgezeichnet: 31.5, superior: 35.8 },
  { minAge: 60, maxAge: 120, schlecht: 17.5, maessig: 20.2, gut: 24.5, ausgezeichnet: 30.3, superior: 31.5 },
];

export function evaluateCardioFitness(ageYears, sex, vo2max) {
  if (ageYears == null || vo2max == null) return { key: null, label: 'Keine Auswertung möglich', bandFound: false };
  if (!isKnownSex(sex)) return { key: null, label: 'Geschlecht nicht hinterlegt – Einstufung ausgeblendet', bandFound: false, needsSex: true };
  const bands = sex === 'female' ? VO2MAX_BANDS_FEMALE : VO2MAX_BANDS_MALE;
  const band = bands.find((b) => ageYears >= b.minAge && ageYears <= b.maxAge);
  if (!band) return { key: null, label: 'Keine Referenzwerte für dieses Alter hinterlegt', bandFound: false };
  let key, label;
  if (vo2max >= band.superior) { key = 'top'; label = 'Superior'; }
  else if (vo2max >= band.ausgezeichnet) { key = 'high'; label = 'Ausgezeichnet'; }
  else if (vo2max >= band.gut) { key = 'mid'; label = 'Gut'; }
  else if (vo2max >= band.maessig) { key = 'low'; label = 'Mäßig'; }
  else if (vo2max >= band.schlecht) { key = 'poor'; label = 'Schlecht'; }
  else { key = 'below'; label = 'Sehr schlecht'; }
  return { key, label, bandFound: true };
}

// Nur für die "aktuell/veraltet"-Vollständigkeitsprüfung (getStaleTestSummary,
// renderTestsSection/renderTestsReminder in training.html) – die eigentliche
// Test-Karte mit den beiden Protokoll-Formularen wird in training.html
// eigenständig gerendert (cardioTestCardHtml), nicht generisch wie bei
// STRENGTH_TESTS/MOBILITY_TESTS.
export const CARDIO_TESTS = [
  { key: 'cardio_fitness', label: 'Herz-Kreislauf-Fitness (VO2max)', hasSide: false },
];

// ---------------------------------------------------------------------------
// Blutdruck & Ruhepuls (Runde 20)
//
// Speicherung in prevention_test_results: Blutdruck als ZWEI Zeilen mit
// identischem Datum (bp_systolic, bp_diastolic; beide in einer Anfrage
// gespeichert, daher gleicher created_at-Zeitstempel), Ruhepuls als
// resting_hr (Schläge/min). measured_by: 'client' = Selbsttest, 'trainer' =
// vom Trainer/Coach gemessen. Beide Werte sind optionale Tests: sie fließen in
// den Präventions-Score und die Berichte ein, lösen aber keine Erinnerung aus
// und zählen nicht für "Präventionscheck komplett".
// ---------------------------------------------------------------------------

export const BP_SOURCE = 'praktischArzt (pA Medien GmbH): „Normale Blutdruckwerte nach Alter & Geschlecht (Tabelle)“, https://www.praktischarzt.de/untersuchungen/blutdruck-messen/blutdruckwerte/ (Stand der Seite: 02/2026). Einteilung nach den Leitlinien der Deutschen Gesellschaft für Kardiologie und den Empfehlungen der Deutschen Hochdruckliga; Altersmittelwerte: Gesundheitsberichterstattung des Bundes.';
export const RHR_SOURCE = 'praktischArzt (pA Medien GmbH): „Ruhepuls: Normalwerte nach Alter & Geschlecht“, https://www.praktischarzt.de/untersuchungen/puls-messen/ruhepuls/ (Stand der Seite: 09/2025). Literatur dort u. a.: Behrends, J. et al., Duale Reihe Physiologie, Thieme, 2. Aufl. 2012.';

export const VITAL_PROTOCOLS = {
  bp: {
    ausfuehrung: 'Mindestens 5 Minuten ruhig sitzen (Rücken angelehnt, Füße flach auf dem Boden, nicht sprechen), Oberarm-Manschette auf Herzhöhe am entspannt aufliegenden Arm. Zwei Messungen im Abstand von 1–2 Minuten, den Mittelwert eintragen. Nicht direkt nach Training, Koffein, Nikotin oder vollem Magen messen.',
    hinweis: 'Eine einzelne Messung ist keine Diagnose. Erhöhte Werte bitte an mehreren Tagen wiederholen und ärztlich abklären lassen; bei Werten ab 180/110 mmHg oder Beschwerden (Brustschmerz, Atemnot, starker Schwindel) zeitnah ärztliche Hilfe suchen.',
  },
  hr: {
    ausfuehrung: 'Morgens nach dem Aufwachen (oder nach 5 Minuten ruhigem Liegen/Sitzen) vor dem Aufstehen bzw. Frühstück messen: 60 Sekunden am Handgelenk oder Hals zählen oder per Pulsuhr/Brustgurt ablesen. Am besten den Mittelwert aus 2–3 Tagen eintragen. Nicht nach Training, Koffein oder Stress messen.',
    hinweis: 'Der Ruhepuls schwankt mit Schlaf, Stress, Infekten und Training. Dauerhaft über 100 oder unter 40 Schlägen pro Minute (ohne Ausdauersport-Hintergrund) bitte ärztlich abklären lassen.',
  },
};

// Blutdruck – Einteilung der praktischArzt-Seite (nach DGK-Leitlinien und
// Empfehlungen der Deutschen Hochdruckliga). Die Seite nennt je Kategorie
// Obergrenzen bzw. Bereiche (mmHg); die Operatoren ("unter", "und/oder")
// sind auf der Seite im Abruf nicht erkennbar und werden hier nach der
// üblichen Leseweise dieser Einteilung angewendet (siehe Doku Runde 20):
//   Optimal      unter 120 und unter 80
//   Normal       120–129 und/oder 80–84
//   Hochnormal   130–139 und/oder 85–89
//   Grad 1       140–159 und/oder 90–99
//   Grad 2       160–179 und/oder 100–109
//   Grad 3       ab 180 und/oder ab 110
//   Niedrig      unter 105 oder unter 65 (nur wenn sonst "optimal")
// Bei Abweichung zwischen systolisch und diastolisch zählt die schlechtere
// Kategorie. Plattformstufen: optimal/normal → grün, hochnormal → gelb,
// Grad 1–3 → rot; "niedrig" ist ein Hinweis ohne Warnfarbe.
const BP_CATEGORIES = [
  { category: 'optimal', label: 'Optimal', key: 'top', score: 100, range: 'unter 120 und unter 80 mmHg' },
  { category: 'normal', label: 'Normal', key: 'mid', score: 90, range: '120–129 und/oder 80–84 mmHg' },
  { category: 'high_normal', label: 'Hochnormal', key: 'low', score: 65, range: '130–139 und/oder 85–89 mmHg' },
  { category: 'hypertension_1', label: 'Hypertonie Grad 1', key: 'below', score: 40, range: '140–159 und/oder 90–99 mmHg' },
  { category: 'hypertension_2', label: 'Hypertonie Grad 2', key: 'below', score: 25, range: '160–179 und/oder 100–109 mmHg' },
  { category: 'hypertension_3', label: 'Hypertonie Grad 3', key: 'below', score: 10, range: 'ab 180 und/oder ab 110 mmHg' },
];
const BP_LOW = { category: 'low', label: 'Niedrig', key: 'mid', score: 85, range: 'unter 105 oder unter 65 mmHg' };
function bpGrade(sys, dia) {
  const g = (v, cuts) => cuts.filter((c) => v >= c).length; // 0 = optimal … 5 = Grad 3
  return Math.max(g(sys, [120, 130, 140, 160, 180]), g(dia, [80, 85, 90, 100, 110]));
}

/** Normtabelle Blutdruck (Anzeigezeilen). */
export const BP_REFERENCE_ROWS = [
  { category: 'low', label: BP_LOW.label, range: BP_LOW.range },
  ...BP_CATEGORIES.map((c) => ({ category: c.category, label: c.label, range: c.range })),
];

// Bevölkerungsmittel nach Alter und Geschlecht (praktischArzt, Quelle dort:
// Gesundheitsberichterstattung des Bundes) – Orientierungswerte, KEINE Zielwerte
// (der Mittelwert enthält auch Menschen mit Bluthochdruck); nicht für den Score.
const BP_AGE_MEANS = {
  female: [[20, 29, 119, 75], [30, 39, 122, 78], [40, 49, 130, 82], [50, 59, 143, 86], [60, 69, 153, 86], [70, 79, 155, 83]],
  male: [[20, 29, 129, 78], [30, 39, 130, 84], [40, 49, 135, 88], [50, 59, 143, 89], [60, 69, 150, 88], [70, 79, 153, 83]],
};
/** Bevölkerungsmittel für Alter/Geschlecht, null außerhalb 20–79 Jahre oder ohne Geschlecht. */
export function bloodPressureAgeReference(ageYears, sex) {
  if (ageYears == null || !isKnownSex(sex)) return null;
  const r = BP_AGE_MEANS[sex].find(([min, max]) => ageYears >= min && ageYears <= max);
  return r ? { range: `${r[0]}–${r[1]} Jahre`, systolic: r[2], diastolic: r[3] } : null;
}
/** Alle Altersmittelwerte (für die Tabellenanzeige), markiert nach Alter/Geschlecht. */
export function bloodPressureAgeTable(ageYears, sex) {
  if (!isKnownSex(sex)) return null;
  return BP_AGE_MEANS[sex].map(([min, max, sys, dia]) => ({ label: `${min}–${max} Jahre`, range: `${sys}/${dia} mmHg`, active: ageYears != null && ageYears >= min && ageYears <= max }));
}

export function evaluateBloodPressure(systolic, diastolic) {
  const sys = Number(systolic), dia = Number(diastolic);
  if (!Number.isFinite(sys) || !Number.isFinite(dia) || sys <= 0 || dia <= 0) return { key: null, label: 'Keine Auswertung möglich', bandFound: false };
  const grade = bpGrade(sys, dia);
  let c = BP_CATEGORIES[grade];
  if (grade === 0 && (sys < 105 || dia < 65)) c = BP_LOW;
  const urgent = grade === 5;
  return {
    key: c.key, category: c.category, label: `${c.label} (${c.range})`, shortLabel: c.label, score: c.score, bandFound: true,
    note: `Referenz: praktischArzt (DGK-/Hochdruckliga-Einteilung). Eine Einzelmessung ersetzt keine ärztliche Diagnose.${urgent ? ' Sehr hoher Wert – bitte zeitnah ärztlich abklären lassen.' : ''}${c.category === 'low' ? ' Bei Schwindel oder Beschwerden ärztlich abklären lassen.' : ''}`,
  };
}

// Ruhepuls – praktischArzt, Tabellen "Ruhepuls Frauen" / "Ruhepuls Männer"
// (nach Geschlecht, ohne Altersstufen; Alterswerte der Seite gelten für
// Erwachsene: Frauen 75/min, Männer 70/min als Normalwert). Je Stufe die
// Obergrenze (inkl.) von Sehr gut, Gut, Normal, Unterdurchschnittlich; darüber
// "Schlecht". Männer: Die Seite nennt "Unterdurchschnittlich 74–80" und
// "Schlecht ≥ 80" – die Überschneidung bei 80 wird zugunsten von 80 =
// unterdurchschnittlich aufgelöst (Schlecht ab 81). Werte unter der
// Untergrenze von "Sehr gut" (Männer unter 40, Frauen unter 50) zählen als
// "Sehr gut", erhalten aber einen Hinweis. Niedriger ist besser.
const RHR_TABLE = {
  male: { min: 40, caps: [60, 69, 73, 80] },
  female: { min: 50, caps: [65, 74, 78, 84] },
};
const RHR_LEVELS = ['top', 'top', 'mid', 'low', 'below'];
const RHR_LABELS = ['Sehr gut', 'Gut', 'Normal', 'Unterdurchschnittlich', 'Schlecht'];
const RHR_SCORES = { top: 100, mid: 80, low: 60, below: 35 };

export function evaluateRestingHeartRate(ageYears, sex, bpm) {
  const v = Number(bpm);
  if (!Number.isFinite(v) || v <= 0) return { key: null, label: 'Keine Auswertung möglich', bandFound: false };
  if (!isKnownSex(sex)) return { ...NO_SEX };
  const t = RHR_TABLE[sex];
  let i = t.caps.findIndex((c) => v <= c);
  if (i < 0) i = t.caps.length; // über der letzten Obergrenze → Schlecht
  const key = RHR_LEVELS[i];
  const extra = v < t.min ? ' Der Wert liegt unter dem Bereich der Tabelle – bei Beschwerden oder ohne Ausdauersport-Hintergrund ärztlich abklären lassen.' : '';
  return {
    key, label: RHR_LABELS[i], score: RHR_SCORES[key], bandFound: true,
    note: `Referenz: praktischArzt, Ruhepuls-Normalwerte nach Geschlecht – niedrigerer Ruhepuls ist günstiger; keine Diagnose.${extra}`,
  };
}

/** Normtabelle Ruhepuls für das Geschlecht als Anzeigezeilen (null ohne Geschlecht). */
export function restingHrReferenceRows(ageYears, sex) {
  if (!isKnownSex(sex)) return null;
  const t = RHR_TABLE[sex];
  return RHR_LABELS.map((label, i) => {
    const lo = i === 0 ? t.min : t.caps[i - 1] + 1;
    const hi = i < t.caps.length ? t.caps[i] : null;
    return { label, range: hi == null ? `ab ${lo} bpm` : `${lo}–${hi} bpm`, key: RHR_LEVELS[i] };
  });
}

/**
 * Zusammenfassung der Vitalwerte für Berichte (Monatsbericht/Rückblick):
 * jeweils aktuellster Wert mit Einstufung, erster Wert zum Vergleich und
 * Quellenangabe. Gibt null zurück, wenn weder Blutdruck noch Ruhepuls vorliegen.
 */
export function summarizeVitals(results, ageYears, sex) {
  const list = (results || []).filter((r) => r && r.value != null);
  const bpSeries = bloodPressureSeries(list);
  const hrRows = list.filter((r) => r.test_key === 'resting_hr').sort((a, b) => (a.measured_at < b.measured_at ? -1 : a.measured_at > b.measured_at ? 1 : String(a.created_at || '') < String(b.created_at || '') ? -1 : 1));
  if (!bpSeries.length && !hrRows.length) return null;
  const out = { bp: null, hr: null, bpSource: BP_SOURCE, hrSource: RHR_SOURCE };
  if (bpSeries.length) {
    const last = bpSeries[bpSeries.length - 1];
    const ev = evaluateBloodPressure(last.systolic, last.diastolic);
    const first = bpSeries.length > 1 ? bpSeries[0] : null;
    out.bp = { systolic: last.systolic, diastolic: last.diastolic, date: last.date, measuredBy: last.measuredBy, label: ev.label, category: ev.category, key: ev.key, first: first ? { systolic: first.systolic, diastolic: first.diastolic, date: first.date } : null, referenceRows: BP_REFERENCE_ROWS, ageReference: bloodPressureAgeReference(ageYears, sex) };
  }
  if (hrRows.length) {
    const last = hrRows[hrRows.length - 1];
    const ev = evaluateRestingHeartRate(ageYears, sex, last.value);
    const first = hrRows.length > 1 ? hrRows[0] : null;
    out.hr = { value: Number(last.value), date: last.measured_at, measuredBy: last.measured_by, label: ev.bandFound ? ev.label : null, hint: ev.bandFound ? null : ev.label, key: ev.key, first: first ? { value: Number(first.value), date: first.measured_at } : null, referenceRows: restingHrReferenceRows(ageYears, sex) };
  }
  return out;
}

/** Blutdruck-Verlauf: paart bp_systolic/bp_diastolic (gleiches Datum + created_at) aus der vollständigen Historie. */
export function bloodPressureSeries(results) {
  const dias = new Map();
  for (const r of results || []) if (r.test_key === 'bp_diastolic') dias.set(`${r.measured_at}|${r.created_at || ''}`, r);
  const out = [];
  for (const r of results || []) {
    if (r.test_key !== 'bp_systolic') continue;
    const d = dias.get(`${r.measured_at}|${r.created_at || ''}`);
    if (d) out.push({ date: r.measured_at, createdAt: r.created_at || '', systolic: Number(r.value), diastolic: Number(d.value), measuredBy: r.measured_by, notes: r.notes || null });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  return out;
}

export const MOBILITY_TESTS = [
  {
    key: 'shoulder_mobility',
    label: 'Schultertest (Nacken-/Rückgriff)',
    hasSide: true,
    ratingLabels: { '1': 'Excellent – Überlappung/Berührung der Hände', '0': 'Normal – Abstand unter 5 cm', '-1': 'Eingeschränkt – Abstand über 5 cm, Handlungsbedarf' },
    ausfuehrung: 'In ruhiger Umgebung, ohne Zeitdruck testen. Beide Seiten nacheinander testen (einmal jede Hand oben).',
    typischeFehler: 'Ausweichbewegungen und über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Gelenkverletzung, frischer Prellung oder unmittelbar nach intensivem Training testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Apley Scratch Test – etablierter klinischer Test der kombinierten Schulterrotation (Innen-/Außenrotation), benannt nach dem Orthopäden A. G. Apley',
    feeds: 'Speist die Marker Schulter li./re.',
    goodImage: 'content/tests/schultertest-normal.jpg',
    limitedImage: 'content/tests/schultertest-eingeschraenkt.jpg',
  },
  {
    key: 'sit_reach_cm',
    label: 'Beinrückseite (Sit-and-Reach, in cm)',
    hasSide: false,
    kind: 'measure',
    unit: 'cm',
    valueLabel: 'Reichweite in cm (0 = Fußsohlen; vor den Fußsohlen negativ, z. B. −8; darüber hinaus positiv)',
    ausfuehrung: 'Barfuß aufrecht auf den Boden setzen, Beine gestreckt und geschlossen, Fußsohlen flach an einer Kiste oder Wand. Ein Maßband bzw. Lineal liegt mittig zwischen den Beinen auf dem Boden, der Nullpunkt (0 cm) liegt auf Höhe der Fußsohlen. Langsam mit gestreckten Armen übereinanderliegender Hände so weit wie möglich nach vorn schieben, Knie bleiben gestreckt, die Endposition ca. 2 Sekunden halten. Gemessen wird der Abstand vom Nullpunkt bis zu den Fingerspitzen der Mittelfinger: erreichen die Finger die Fußsohlen nicht, ist der Wert negativ (z. B. −8 cm), reichen sie darüber hinaus, positiv (z. B. +12 cm). Drei Versuche, der beste Wert zählt. Ein Wert für beide Beine.',
    typischeFehler: 'Knie beugen, ruckartig wippen, nur eine Hand weiter schieben, über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuten Rücken- oder Beinbeschwerden, frischer Verletzung oder unmittelbar nach intensivem Training testen – Ermüdung verfälscht das Ergebnis.',
    source: 'Messprotokoll: Institut für Angewandte Trainingswissenschaft (IAT), Leipzig – Testothek „Sit-and-Reach“, https://sport-iat.de/testothek/detail/sit-and-reach (Nullpunkt = Fußsohlen/Kastenanfang, drei Versuche; Literatur laut IAT u. a. Ayala et al. 2012, Physical Therapy in Sport 13(4); Mayorga-Vega et al. 2014, Journal of Sports Science & Medicine 13(1)). Normtabelle: Kategorien nach der IAT-Seite (dort ohne Quellenangabe; identische Werte werden für 16–19-Jährige Davis et al. (2000), Physical Education and the Study of Sport, 4. Aufl., zugeschrieben, nach brianmac.co.uk), um 15 cm auf die Skala „Fußsohlen = 0 cm“ verschoben. Testidee: Wells & Dillon (1952), Research Quarterly 23(1), 115–118.',
    feeds: 'Speist die Marker Beinrückseite li./re. (ein Wert für beide Seiten).',
  },
  {
    key: 'thomas_mobility',
    label: 'Iliopsoas-Test (Thomas-Test)',
    hasSide: true,
    ratingLabels: { '1': 'Normal – anderes Bein bleibt flach', '0': 'Leicht eingeschränkt', '-1': 'Verkürzt – gestrecktes Bein hebt ab' },
    ausfuehrung: 'In ruhiger Umgebung, ohne Zeitdruck testen. Beide Seiten nacheinander testen. Da man in Rückenlage das eigene gestreckte Bein selbst schlecht beobachten kann, am besten ein Handyvideo von der Seite aufnehmen oder einen Spiegel seitlich aufstellen, um zuverlässig zu erkennen, ob das Bein abhebt.',
    typischeFehler: 'Ausweichbewegungen und über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Gelenkverletzung, frischer Prellung oder unmittelbar nach intensivem Training testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Clapis, P. A., Davis, S. M., & Davis, R. O. (2008). Reliability of inclinometer and goniometric measurements of hip extension flexibility using the modified Thomas test. Physiotherapy Theory and Practice, 24(2), 135–141.',
    feeds: 'Speist die Marker Hüfte li./re.',
    goodImage: 'content/tests/thomas-test-normal.jpg',
    limitedImage: 'content/tests/thomas-test-verkuerzt.jpg',
  },
  {
    key: 'chair_pickup',
    label: 'Ellbogen je Seite (Stuhl-Hebetest, Chair-Pick-up-Test)',
    hasSide: true,
    ratingLabels: { '1': 'Gut – schmerzfrei, Stuhl kontrolliert angehoben und gehalten', '0': 'Normal – leichtes Ziehen an der Ellbogenaußenseite (bis ca. 3/10), Stuhl kontrolliert gehalten', '-1': 'Auffällig – deutlicher Schmerz (über ca. 3/10) an der Ellbogenaußenseite/im Unterarm oder Stuhl nicht haltbar' },
    ausfuehrung: 'Hinter einen leichten Standardstuhl ohne Armlehnen stellen. Mit einer Hand von oben die Oberkante der Rückenlehne greifen, Ellbogen gestreckt, Unterarm nach innen gedreht (Handfläche zeigt zum Stuhl), Schulter locker. Den Stuhl ca. 10 cm vom Boden anheben, 3 Sekunden halten und kontrolliert absetzen. Sofort danach die Schmerzintensität an der Ellbogenaußenseite (0–10) notieren. Beide Seiten nacheinander testen, Pause dazwischen. Die 3/10-Schwelle ist eine pragmatische Festlegung für die Dreistufigkeit, nicht aus den Studien übernommen.',
    typischeFehler: 'Ellbogen beugen und den Stuhl „schwingen“; Stuhl mit dem Rücken statt mit dem Arm anheben; Schmerz „wegatmen“ oder die Bewertung erst Minuten später vornehmen.',
    abbruchkriterium: 'Sofort abbrechen bei starkem oder ausstrahlendem Schmerz, Taubheit oder Kribbeln im Arm.',
    kontraindikation: 'Nicht bei akuter Ellbogen-, Handgelenks- oder Schulterverletzung, frischer Entzündung oder direkt nach intensivem Arm-/Greiftraining testen.',
    alertNotice: 'Auffällig – eine ärztliche oder physiotherapeutische Abklärung der Ellbogenaußenseite ist empfehlenswert. Das ist ein Screening, keine Diagnose.',
    source: 'Gardner, R. C. (1970), Clinical Orthopaedics and Related Research, 72, 248–253; Paoloni, J. A., Appleyard, R. C., & Murrell, G. A. C. (2004). The Orthopaedic Research Institute–Tennis Elbow Testing System: a modified chair pick-up test. Journal of Shoulder and Elbow Surgery, 13(1), 72–77. Schmerzprovokationstest ohne Altersnormen – das klinische Kriterium selbst ist der Maßstab.',
    feeds: 'Speist die Marker Ellbogen li./re.',
    goodImage: 'content/tests/chair-pickup-test-gut.jpg',
    limitedImage: 'content/tests/chair-pickup-test-eingeschraenkt.jpg',
  },
  {
    key: 'phalen_test',
    label: 'Handgelenk je Seite (Phalen-Test)',
    hasSide: true,
    ratingLabels: { '1': 'Gut – keine Missempfindungen innerhalb von 60 Sekunden', '0': 'Normal – leichtes Druckgefühl oder Kribbeln erst nach über 40 s, sofort nach dem Lösen weg', '-1': 'Auffällig – Kribbeln, Taubheit oder Brennen in Daumen/Zeige-/Mittelfinger innerhalb von 40 s oder anhaltend nach dem Lösen' },
    ausfuehrung: 'Aufrecht sitzen oder stehen. Beide Handrücken vor der Brust gegeneinander pressen, Finger zeigen nach unten, Handgelenke dadurch maximal gebeugt, Ellbogen seitlich auf etwa Brusthöhe. Mäßigen, gleichmäßigen Druck halten, Stoppuhr starten und bis zu 60 Sekunden halten. Notieren, ob und nach wie vielen Sekunden Kribbeln oder Taubheit in Daumen, Zeige- und Mittelfinger auftritt. Der Test läuft mit beiden Händen gleichzeitig, bewertet wird je Hand. Die Zeitstufung ist eine pragmatische Anpassung ans Dreistufenschema; klassisch gilt der Test als positiv oder negativ.',
    typischeFehler: 'Hände zu fest gegeneinander pressen; Handgelenke nicht wirklich beugen; vor Ablauf der Zeit abbrechen, ohne die Empfindung zu notieren; Kribbeln im kleinen Finger fälschlich als Befund werten (das gehört nicht zum Mittelnerv-Gebiet).',
    abbruchkriterium: 'Sofort lösen bei starkem Kribbeln, Taubheit oder Schmerz.',
    kontraindikation: 'Nicht bei akuter Handgelenksverletzung, frischer Entzündung oder bereits diagnostiziertem Karpaltunnelsyndrom mit akuten Beschwerden testen.',
    alertNotice: 'Auffällig – das kann ein Hinweis auf eine Reizung des Mittelnervs am Handgelenk sein, ist aber keine Diagnose. Der Test ist nur mäßig genau; bitte ärztlich oder physiotherapeutisch abklären lassen.',
    source: 'Phalen, G. S. (1966), Journal of Bone and Joint Surgery (Am), 48(2), 211–228; Dabbagh, A. et al. (2023), Physical Therapy, 103(6), pzad029 (Sensitivität 0,57, Spezifität 0,67). Provokationstest ohne Altersnormen – das klinische Kriterium selbst ist der Maßstab.',
    feeds: 'Speist die Marker Handgelenk li./re.',
    goodImage: 'content/tests/phalen-test-gut.jpg',
    limitedImage: 'content/tests/phalen-test-eingeschraenkt.jpg',
  },
  {
    key: 'wall_angel',
    label: 'Oberer Rücken und Schulter je Seite (Seated Wall Angel)',
    hasSide: true,
    unit: 'Punkte',
    inputOptions: [
      { value: 3, label: '3 Punkte – Ellbogen, Rückseite des Unterarms und Rückseite der Hand berühren die Wand' },
      { value: 2, label: '2 Punkte – Ellbogen und Rückseite der Finger berühren die Wand' },
      { value: 1, label: '1 Punkt – Ellbogen und Fingerspitzen berühren die Wand' },
      { value: 0, label: '0 Punkte – weniger als 2 Kontaktpunkte' },
    ],
    ratingLabels: { '1': 'Gut – 3 Punkte (voller Wandkontakt)', '0': 'Normal – 2 Punkte', '-1': 'Eingeschränkt – 0 bis 1 Punkt' },
    ausfuehrung: 'Auf dem Boden mit dem Rücken an eine Wand setzen, Knie angewinkelt, Füße flach. Kreuz und Hinterkopf berühren die Wand, Hände liegen zunächst seitlich. Beide Ellbogen auf Schulterhöhe anheben und die Schultern so weit wie möglich nach außen drehen, Kontakt zur Wand halten. Position halten und bewerten (einmalig, maximale Bewegung). Kontaktpunkte am besten im Spiegel oder per Handyvideo prüfen. Punkte je Seite: 0 = weniger als 2 Kontaktpunkte, 1 = Ellbogen und Fingerspitzen, 2 = Ellbogen und Rückseite der Finger, 3 = Ellbogen, Rückseite des Unterarms und Rückseite der Hand. Die Umrechnung auf die Plattformskala (3 Punkte = gut, 2 = normal, 0–1 = eingeschränkt) ist eine Annahme.',
    typischeFehler: 'Kopf löst sich von der Wand; Kreuz geht ins Hohlkreuz und verliert Wandkontakt; Schultern werden hochgezogen; Ellbogen sinken unter Schulterhöhe; Rippen spreizen ab.',
    abbruchkriterium: 'Sofortiger Abbruch bei Schmerz oder einem „Ausrasten“-Gefühl in der Schulter.',
    kontraindikation: 'Nicht bei akuten Schulter-, Nacken- oder Rückenbeschwerden, Schulterinstabilität oder -luxation in der Vorgeschichte oder frischer Verletzung ohne ärztliche Freigabe.',
    source: 'Kofoed, C., Palmsten, A., Diercks, J., Obermeier, M., Tompkins, M., & Chmielewski, T. L. (2024). The clinical utility of the seated wall angel as a test with scoring. International Journal of Sports Physical Therapy. Der Test prüft Beweglichkeit/Kontrolle von Schulter, Schulterblatt und Brustwirbelsäule, nicht die Kraftausdauer; es gibt keine Alters- oder Geschlechtsnormen (Studie: n = 14, Patienten mit Schulterinstabilität) – das Wandkontakt-Kriterium selbst ist der Maßstab.',
    feeds: 'Speist den Marker Oberer Rücken (schlechterer der beiden Werte).',
    goodImage: 'content/tests/wall-angel-gut.jpg',
    limitedImage: 'content/tests/wall-angel-eingeschraenkt.jpg',
  },
  {
    key: 'ake_hamstring',
    label: 'Beinrückseite je Seite (Aktive Kniestreckung, wandgestützt) – optional',
    hasSide: true,
    optional: true,
    ratingLabels: { '1': 'Gut – nahezu volle Streckung (Knie kommt nah an die Wand-Senkrechte)', '0': 'Normal – moderates Streckdefizit', '-1': 'Eingeschränkt – deutliches Streckdefizit' },
    ausfuehrung: 'Zusätzlicher, seitengetrennter Test (optional, ohne Wirkung auf die Körper-Visualisierung; fließt in den Beweglichkeits-Score ein). Rückenlage auf dem Boden, Gesäß nah an einer Wand oder einem Türrahmen, das zu testende Bein senkrecht an der Wand anlehnen (Hüfte dadurch bei ca. 90°). Das andere Bein bleibt flach am Boden gestreckt. Das angelehnte Knie dann aktiv so weit wie möglich strecken (Ferse gleitet die Wand hinauf) und das verbleibende Streckdefizit grob einschätzen – am besten mit einem Handyfoto von der Seite dokumentieren. Beide Seiten nacheinander testen.',
    typischeFehler: 'Gesäß von der Wand wegrutschen lassen (verfälscht den 90°-Hüftwinkel); das andere Bein vom Boden abheben; über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Knie-/Hüftverletzung, frischer Prellung oder unmittelbar nach intensivem Beintraining testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Gajdosik, R. L., & Lusin, G. (1983). Hamstring muscle tightness: reliability of an active-knee-extension test. Physical Therapy, 63(7), 1085–1090 (Active Knee Extension/AKE-Test); wandgestützte Fixierung der Hüfte bei 90° als alltagstaugliche Selbsttest-Variante ohne Hilfsperson.',
  },
  // ---- Frühere Tests (Runde 14): in der Eingabe ausgeblendet, vorhandene
  // Messwerte bleiben erhalten und zählen im Score nur, solange es keinen
  // Nachfolgetest gibt (supersededBy). ----
  {
    key: 'hamstring_mobility',
    label: 'Hamstring-Test (früherer Sit-and-Reach, Bewertung)',
    hasSide: false,
    legacy: true,
    supersededBy: 'sit_reach_cm',
    ratingLabels: { '1': 'Gut – Hände erreichen Fußspitzen oder darüber', '0': 'Normal', '-1': 'Eingeschränkt – Hände erreichen die Füße nicht' },
    ausfuehrung: '', typischeFehler: '', abbruchkriterium: '', kontraindikation: '',
    source: 'Wells, K. F., & Dillon, E. K. (1952). The Sit and Reach – A Test of Back and Leg Flexibility. Research Quarterly, 23(1), 115–118.',
  },
  {
    key: 'wrist_extension',
    label: 'Handgelenk-Streck-Test (früher, Wandtest)',
    hasSide: true,
    legacy: true,
    supersededBy: 'phalen_test',
    ratingLabels: { '1': 'Gut', '0': 'Normal', '-1': 'Eingeschränkt' },
    ausfuehrung: '', typischeFehler: '', abbruchkriterium: '', kontraindikation: '',
    source: 'Klinischer Screening-Test für Handgelenksextension (Prayer-Stretch-Variante).',
  },
  {
    key: 'elbow_extension',
    label: 'Ellbogen-Streckungs-Test (früher)',
    hasSide: true,
    legacy: true,
    supersededBy: 'chair_pickup',
    ratingLabels: { '1': 'Gut', '0': 'Normal', '-1': 'Eingeschränkt' },
    ausfuehrung: '', typischeFehler: '', abbruchkriterium: '', kontraindikation: '',
    source: 'Standard-orthopädische Untersuchungstechnik nach der Neutral-Null-Methode.',
  },
];

/** Tests, die in der Eingabe angezeigt werden (ohne frühere/ersetzte Tests). */
export const isInputTest = (t) => !t.legacy;
/** Tests, die für Vollständigkeit/Erinnerung zählen (ohne frühere und optionale Tests). */
export const isRequiredTest = (t) => !t.legacy && !t.optional;

// ---------------------------------------------------------------------------
// Visuelle +/-/0-Bewertungsanzeige (Beweglichkeitstests) – kompaktes Icon +
// Farbe, ergänzend zur Textbeschreibung. Wird sowohl beim Eintragen (Auswahl)
// als auch bei der Anzeige eines gespeicherten Ergebnisses verwendet.
// ---------------------------------------------------------------------------
export const MOBILITY_RATING_VISUALS = {
  '1': { symbol: '+', color: 'var(--color-success)', short: 'gut' },
  '0': { symbol: '0', color: 'var(--color-gold)', short: 'normal' },
  '-1': { symbol: '–', color: 'var(--color-danger)', short: 'eingeschränkt' },
};

export function mobilityRatingLabel(value) {
  const v = Number(value);
  if (v > 0) return { symbol: '+', text: 'gut' };
  if (v < 0) return { symbol: '–', text: 'schlecht' };
  return { symbol: '0', text: 'normal' };
}

// ---------------------------------------------------------------------------
// Datenzugriff
// ---------------------------------------------------------------------------

export async function insertPreventionResult({ clientId, testKey, side, value, measuredBy, measuredAt, notes }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('prevention_test_results').insert({
    client_id: clientId,
    test_key: testKey,
    side: side || null,
    value,
    measured_by: measuredBy || 'client',
    measured_at: measuredAt || new Date().toISOString().slice(0, 10),
    notes: notes || null,
    created_by: userId,
  });
}

/** Mehrere Zeilen in EINER Anfrage speichern (z. B. systolisch + diastolisch mit identischem created_at). */
export async function insertPreventionResultsBatch(rows) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  const today = new Date().toISOString().slice(0, 10);
  return supabaseClient.from('prevention_test_results').insert(rows.map((r) => ({
    client_id: r.clientId,
    test_key: r.testKey,
    side: r.side || null,
    value: r.value,
    measured_by: r.measuredBy || 'client',
    measured_at: r.measuredAt || today,
    notes: r.notes || null,
    created_by: userId,
  })));
}

export async function listPreventionResults(clientId) {
  return supabaseClient
    .from('prevention_test_results')
    .select('*')
    .eq('client_id', clientId)
    .order('measured_at', { ascending: true })
    .order('created_at', { ascending: true });
}

export async function deletePreventionResult(id) {
  return supabaseClient.from('prevention_test_results').delete().eq('id', id);
}

// Neuester Eintrag je test_key(+side) aus einer chronologisch aufsteigend
// sortierten Liste (wie von listPreventionResults geliefert).
export function latestByKey(results) {
  const map = {};
  for (const r of results) {
    const k = r.side ? `${r.test_key}:${r.side}` : r.test_key;
    map[k] = r; // letzter Treffer gewinnt, da aufsteigend sortiert
  }
  return map;
}

export function isStale(dateStr, days = 84) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const diffDays = (Date.now() - d.getTime()) / 86400000;
  return diffDays > days;
}

// ---------------------------------------------------------------------------
// Test-Erinnerung – zentrale Ermittlung, welche Tests fehlen oder älter als
// 12 Wochen sind. Wird an drei Stellen verwendet (Nutzer-Feedback Runde 5):
// im Tests-Tab des Kunden selbst, als Hinweis-Banner im Nachrichten-Tab und
// in der Kundendatei der Traineransicht – daher hier zentral statt dreifach
// dupliziert.
// ---------------------------------------------------------------------------
export async function getStaleTestSummary(clientId) {
  const { data: results, error } = await listPreventionResults(clientId);
  if (error) return { items: [], count: 0, results: [], error };
  const latest = latestByKey(results || []);
  const items = [];
  [...STRENGTH_TESTS, ...MOBILITY_TESTS, ...CARDIO_TESTS].filter(isRequiredTest).forEach((t) => {
    const sides = t.hasSide ? ['left', 'right'] : [null];
    sides.forEach((side) => {
      const key = side ? `${t.key}:${side}` : t.key;
      const r = latest[key];
      const sideLabel = side ? ` (${SIDE_LABEL_LOCAL[side]})` : '';
      if (!r) items.push({ testKey: t.key, side, label: `${t.label}${sideLabel}`, reason: 'fehlt', text: `${t.label}${sideLabel} – noch kein Test eingetragen` });
      else if (isStale(r.measured_at)) items.push({ testKey: t.key, side, label: `${t.label}${sideLabel}`, reason: 'veraltet', measuredAt: r.measured_at, text: `${t.label}${sideLabel} – letzter Test vor über 12 Wochen (${r.measured_at})` });
    });
  });
  return { items, count: items.length, results: results || [], latest, error: null };
}

const SIDE_LABEL_LOCAL = { left: 'links', right: 'rechts' };

/**
 * Runde 16: reine Vollständigkeitsprüfung für das "Präventionscheck
 * komplett"-Achievement (js/achievements.js) – anders als getStaleTestSummary()
 * interessiert hier NUR, ob jeder Test schon mindestens einmal eingetragen
 * wurde, nicht ob er noch aktuell (< 12 Wochen) ist.
 */
export function isPreventionCheckComplete(results) {
  const latest = latestByKey(results || []);
  return [...STRENGTH_TESTS, ...MOBILITY_TESTS, ...CARDIO_TESTS].filter(isRequiredTest).every((t) => {
    const sides = t.hasSide ? ['left', 'right'] : [null];
    return sides.every((side) => !!latest[side ? `${t.key}:${side}` : t.key]);
  });
}

// ---------------------------------------------------------------------------
// Körperzusammensetzung – ACE Body Fat Percentage Categories
// ---------------------------------------------------------------------------

const BODY_FAT_CATEGORIES = {
  male: [
    { key: 'essential', max: 5, label: 'Essential Fat', score: 75 },
    { key: 'athletes', max: 13, label: 'Athletes', score: 100 },
    { key: 'fitness', max: 17, label: 'Fitness', score: 90 },
    { key: 'acceptable', max: 24, label: 'Acceptable', score: 70 },
    { key: 'obese', max: Infinity, label: 'Obese', score: 40 },
  ],
  female: [
    { key: 'essential', max: 13, label: 'Essential Fat', score: 75 },
    { key: 'athletes', max: 20, label: 'Athletes', score: 100 },
    { key: 'fitness', max: 24, label: 'Fitness', score: 90 },
    { key: 'acceptable', max: 31, label: 'Acceptable', score: 70 },
    { key: 'obese', max: Infinity, label: 'Obese', score: 40 },
  ],
};

export function evaluateBodyFatCategory(sex, bodyFatPercent) {
  const table = BODY_FAT_CATEGORIES[sex === 'female' ? 'female' : 'male'];
  const cat = table.find((c) => bodyFatPercent <= c.max) || table[table.length - 1];
  return { ...cat, source: 'American Council on Exercise (ACE) Body Fat Percentage Categories' };
}

// ---------------------------------------------------------------------------
// Sitzverhalten – grober, dokumentierter Stufenwert (kein Ersatz für eine
// individuelle arbeitsmedizinische Einschätzung). Orientiert an gängigen
// Public-Health-Empfehlungen, wonach das Gesundheitsrisiko mit der täglichen
// Sitzzeit ab ca. 6-8 Stunden spürbar zunimmt.
// ---------------------------------------------------------------------------

export function evaluateSittingScore(hoursPerDay) {
  if (hoursPerDay == null) return null;
  if (hoursPerDay <= 2) return { score: 100, label: 'Sehr wenig Sitzzeit' };
  if (hoursPerDay <= 4) return { score: 85, label: 'Wenig Sitzzeit' };
  if (hoursPerDay <= 6) return { score: 65, label: 'Mittlere Sitzzeit' };
  if (hoursPerDay <= 8) return { score: 45, label: 'Viel Sitzzeit' };
  return { score: 25, label: 'Sehr viel Sitzzeit' };
}

// ---------------------------------------------------------------------------
// Lebensstil: Ernährung, Rauchen, Alkohol – kompakte Selbstauskünfte, die
// direkt im Präventionscheck erhoben werden (ergänzend zu den ausführlicheren
// Ernährungsprotokollen/PAL-Angaben im Bereich "Ernährung", die hier bewusst
// nicht dupliziert werden).
// ---------------------------------------------------------------------------

// Ernährungsqualität: vereinfachte 5-Fragen-Kurzeinschätzung, angelehnt an die
// WHO-Empfehlungen zu Obst/Gemüse (>=400g/Tag, ca. 5 Portionen) sowie zur
// Begrenzung von freiem Zucker und stark verarbeiteten Lebensmitteln (WHO
// "Healthy Diet" Fact Sheet). Jede Frage liefert 0-4 Punkte, die Summe (0-20)
// wird auf 0-100 skaliert. Ersetzt kein ausführliches Ernährungsprotokoll,
// dient als grober, wiederholbarer Screening-Wert für den Score.
export const NUTRITION_QUIZ = [
  {
    key: 'obstgemuese',
    question: 'Wie viele Portionen Obst & Gemüse isst du durchschnittlich pro Tag?',
    options: [
      { value: 0, label: 'Keine bis 1 Portion' },
      { value: 1, label: '2 Portionen' },
      { value: 2, label: '3 Portionen' },
      { value: 3, label: '4 Portionen' },
      { value: 4, label: '5 oder mehr Portionen' },
    ],
  },
  {
    key: 'vollkorn',
    question: 'Wie oft greifst du zu Vollkorn- statt Weißmehlprodukten?',
    options: [
      { value: 0, label: 'Nie' }, { value: 1, label: 'Selten' }, { value: 2, label: 'Manchmal' }, { value: 3, label: 'Meistens' }, { value: 4, label: 'Immer' },
    ],
  },
  {
    key: 'verarbeitet',
    question: 'Wie oft isst du stark verarbeitete Lebensmittel/Fast Food?',
    options: [
      { value: 0, label: 'Täglich' }, { value: 1, label: 'Mehrmals pro Woche' }, { value: 2, label: 'Etwa 1× pro Woche' }, { value: 3, label: 'Selten' }, { value: 4, label: 'So gut wie nie' },
    ],
  },
  {
    key: 'zucker',
    question: 'Wie oft trinkst du zuckerhaltige Getränke (Limo, gesüßte Säfte etc.)?',
    options: [
      { value: 0, label: 'Täglich' }, { value: 1, label: 'Mehrmals pro Woche' }, { value: 2, label: 'Etwa 1× pro Woche' }, { value: 3, label: 'Selten' }, { value: 4, label: 'So gut wie nie' },
    ],
  },
  {
    key: 'wasser',
    question: 'Trinkst du ausreichend Wasser (ca. 1,5-2 Liter/Tag)?',
    options: [
      { value: 0, label: 'Nie' }, { value: 1, label: 'Selten' }, { value: 2, label: 'Manchmal' }, { value: 3, label: 'Meistens' }, { value: 4, label: 'Immer' },
    ],
  },
];

export const NUTRITION_QUIZ_SOURCE = 'Vereinfachte Kurz-Selbsteinschätzung, angelehnt an die WHO-Empfehlungen zu Obst/Gemüse (≥400g/Tag) und zur Begrenzung von freiem Zucker/stark verarbeiteten Lebensmitteln (WHO "Healthy Diet" Fact Sheet). Ersetzt kein ausführliches Ernährungsprotokoll.';

export function computeNutritionQuizScore(answerValues) {
  const sum = answerValues.reduce((a, b) => a + (Number(b) || 0), 0);
  return Math.round((sum / (NUTRITION_QUIZ.length * 4)) * 100);
}

export function evaluateNutritionQuality(score) {
  if (score == null || Number.isNaN(Number(score))) return null;
  const s = Number(score);
  if (s >= 80) return { score: s, label: 'Sehr ausgewogen' };
  if (s >= 60) return { score: s, label: 'Gut' };
  if (s >= 40) return { score: s, label: 'Ausbaufähig' };
  return { score: s, label: 'Deutlich verbesserungswürdig' };
}

// Raucherstatus – Risikokategorisierung angelehnt an CDC ("Health Effects of
// Cigarette Smoking") und WHO Tobacco Free Initiative: das Krankheitsrisiko
// sinkt nach Rauchstopp graduell und nähert sich über mehrere Jahre dem eines
// Nie-Rauchers an. Hier vereinfacht in 5 Kategorien für den Score.
export const SMOKING_OPTIONS = [
  { value: 0, label: 'Nie geraucht', score: 100 },
  { value: 1, label: 'Ex-Raucher/in, seit über 12 Monaten rauchfrei', score: 85 },
  { value: 2, label: 'Ex-Raucher/in, seit unter 12 Monaten rauchfrei', score: 60 },
  { value: 3, label: 'Gelegentlich bzw. unter 10 Zigaretten/Tag', score: 40 },
  { value: 4, label: 'Regelmäßig, 10 oder mehr Zigaretten/Tag', score: 10 },
];

export const SMOKING_SOURCE = 'Risikokategorisierung angelehnt an CDC ("Health Effects of Cigarette Smoking") und WHO Tobacco Free Initiative: das Krankheitsrisiko sinkt nach Rauchstopp graduell und nähert sich über mehrere Jahre dem von Nie-Rauchern an.';

export function evaluateSmokingStatus(value) {
  if (value == null || value === '') return null;
  const opt = SMOKING_OPTIONS.find((o) => o.value === Number(value));
  return opt ? { score: opt.score, label: opt.label } : null;
}

// Alkoholkonsum – Standarddrinks/Woche, Schwellenwerte angelehnt an NIAAA/
// CDC-Leitlinien für risikoarmen Konsum (Frauen ≤7, Männer ≤14 Standard-
// drinks/Woche). WHO weist darauf hin (2023), dass es keinen völlig
// risikofreien Alkoholkonsum gibt – daher wird auch risikoarmer Konsum nicht
// mit voller Punktzahl bewertet, nur kein Konsum.
const ALCOHOL_LOW_RISK_MAX = { male: 14, female: 7 };

export const ALCOHOL_SOURCE = 'Schwellenwerte angelehnt an NIAAA/CDC-Leitlinien für risikoarmen Konsum (Frauen ≤7, Männer ≤14 Standarddrinks/Woche). WHO (2023): es gibt keinen völlig risikofreien Alkoholkonsum – daher wird auch risikoarmer Konsum nicht mit voller Punktzahl bewertet.';

export function evaluateAlcoholRisk(drinksPerWeek, sex) {
  if (drinksPerWeek == null || drinksPerWeek === '' || Number.isNaN(Number(drinksPerWeek))) return null;
  const v = Number(drinksPerWeek);
  // Bei unbekanntem Geschlecht konservativ die niedrigere (Frauen-)Schwelle ansetzen.
  const lowMax = ALCOHOL_LOW_RISK_MAX[sex === 'male' ? 'male' : 'female'];
  if (v <= 0) return { score: 100, label: 'Kein Konsum' };
  if (v <= lowMax) return { score: 70, label: 'Im Rahmen gängiger Niedrigrisiko-Grenzwerte' };
  if (v <= lowMax * 2) return { score: 40, label: 'Über den Niedrigrisiko-Grenzwerten' };
  return { score: 15, label: 'Deutlich über den Niedrigrisiko-Grenzwerten' };
}

// ---------------------------------------------------------------------------
// Trainings-Balance – nutzt dieselbe Bewegungsmuster-Logik wie die
// Dysbalance-Anzeige in der Kundenanalyse (training.html), hier als
// Score-Beitrag statt als Balkendiagramm.
// ---------------------------------------------------------------------------

export function evaluateBalanceScore(pairRatios) {
  // pairRatios: Array von {ratio:number|null, bothZero? }
  const valid = pairRatios.filter((p) => p.ratio != null);
  if (valid.length === 0) return null;
  const scores = valid.map((p) => {
    if (!Number.isFinite(p.ratio)) return 20; // eine Seite komplett unbelastet
    if (p.ratio <= 1.2) return 100;
    if (p.ratio <= 1.5) return 70;
    return 40;
  });
  return { score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
}

// ---------------------------------------------------------------------------
// Gesamt-Score
// ---------------------------------------------------------------------------

// Gewichte nach Ergänzung um Ernährung/Rauchen/Alkohol neu verteilt (Summe
// 1.0 für die Basiskategorien). Rauchen ist trotz nur grober Selbstauskunft vergleichsweise
// hoch gewichtet, da der Gesundheitseffekt in der Literatur besonders groß
// ist; Alkohol niedriger, da die Dosis-Wirkungs-Beziehung feiner gestuft und
// die Selbstauskunft naturgemäß unschärfer ist.
const WEIGHTS = {
  strength: 0.20,
  mobility: 0.15,
  bodyFat: 0.15,
  balance: 0.15,
  sitting: 0.10,
  nutrition: 0.10,
  smoking: 0.10,
  alcohol: 0.05,
  // Runde 20: Vitalwerte als zusätzliche Kategorien. Die Gewichte werden bei
  // der Berechnung ohnehin auf die vorhandenen Kategorien normiert (Division
  // durch die Gewichtssumme) – die Altwerte bleiben daher unverändert, damit
  // sich der Score von Kunden ohne Blutdruck-/Pulswerte nicht verschiebt.
  bloodPressure: 0.10,
  restingHr: 0.05,
};

/**
 * @param {object} p
 * @param {number|null} p.ageYears
 * @param {'male'|'female'|null} p.sex
 * @param {object} p.latestResults - von latestByKey()
 * @param {number|null} p.bodyFatPercent
 * @param {Array} p.balancePairRatios
 * @returns {{total:number|null, breakdown:Array<{key,label,score,weight,note}>}}
 */
export function computePreventionScore({ ageYears, sex, latestResults, bodyFatPercent, balancePairRatios }) {
  const breakdown = [];

  // Kraftausdauer (heel_raise je Seite). Ohne Geschlecht werden die
  // geschlechtsspezifischen Tests nicht gewertet (Einstufung ausgeblendet).
  const strengthScores = [];
  for (const t of STRENGTH_TESTS) {
    const sides = t.hasSide ? ['left', 'right'] : [null];
    for (const side of sides) {
      const r = latestResults[side ? `${t.key}:${side}` : t.key];
      if (!r) continue;
      const evalRes = evaluateStrengthBenchmark(t.key, ageYears, r.value, sex);
      if (!evalRes.bandFound) continue;
      strengthScores.push({ top: 100, mid: 80, low: 60, below: 35 }[evalRes.key]);
    }
  }
  if (strengthScores.length > 0) {
    breakdown.push({ key: 'strength', label: 'Kraftausdauer', score: Math.round(strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length), weight: WEIGHTS.strength });
  }

  // Beweglichkeit. Frühere Tests (legacy) zählen nur, solange es keinen
  // Nachfolgetest gibt; Sit-and-Reach in cm wird über die Perzentil-
  // Einstufung bewertet (ohne Geschlecht/Alter nicht gewertet).
  const mobilityScores = [];
  const ratingScore = { '-1': 40, '0': 70, '1': 100 };
  const hasAnyResult = (testKey) => Object.keys(latestResults).some((k) => k === testKey || k.startsWith(`${testKey}:`));
  for (const t of MOBILITY_TESTS) {
    if (t.supersededBy && hasAnyResult(t.supersededBy)) continue;
    const sides = t.hasSide ? ['left', 'right'] : [null];
    for (const side of sides) {
      const r = latestResults[side ? `${t.key}:${side}` : t.key];
      if (!r) continue;
      if (t.kind === 'measure') {
        const evalRes = evaluateStrengthBenchmark(t.key, ageYears, r.value, sex);
        if (evalRes.bandFound) mobilityScores.push({ top: 100, mid: 80, low: 60, below: 35 }[evalRes.key]);
      } else {
        mobilityScores.push(ratingScore[String(mobilityRatingValue(t.key, r.value))] ?? 70);
      }
    }
  }
  if (mobilityScores.length > 0) {
    breakdown.push({ key: 'mobility', label: 'Beweglichkeit', score: Math.round(mobilityScores.reduce((a, b) => a + b, 0) / mobilityScores.length), weight: WEIGHTS.mobility });
  }

  // Körperzusammensetzung
  if (bodyFatPercent != null && sex) {
    const cat = evaluateBodyFatCategory(sex, bodyFatPercent);
    breakdown.push({ key: 'bodyFat', label: 'Körperzusammensetzung', score: cat.score, weight: WEIGHTS.bodyFat, note: cat.label });
  }

  // Trainings-Balance
  const balance = evaluateBalanceScore(balancePairRatios || []);
  if (balance) {
    breakdown.push({ key: 'balance', label: 'Trainings-Balance', score: balance.score, weight: WEIGHTS.balance });
  }

  // Sitzverhalten
  const sittingResult = latestResults.sitting_hours;
  if (sittingResult) {
    const s = evaluateSittingScore(sittingResult.value);
    if (s) breakdown.push({ key: 'sitting', label: 'Sitzverhalten', score: s.score, weight: WEIGHTS.sitting, note: s.label });
  }

  // Ernährung (Kurz-Selbsteinschätzung)
  const nutritionResult = latestResults.nutrition_quality;
  if (nutritionResult) {
    const n = evaluateNutritionQuality(nutritionResult.value);
    if (n) breakdown.push({ key: 'nutrition', label: 'Ernährung', score: n.score, weight: WEIGHTS.nutrition, note: n.label });
  }

  // Rauchen
  const smokingResult = latestResults.smoking_status;
  if (smokingResult) {
    const s = evaluateSmokingStatus(smokingResult.value);
    if (s) breakdown.push({ key: 'smoking', label: 'Rauchen', score: s.score, weight: WEIGHTS.smoking, note: s.label });
  }

  // Alkohol
  const alcoholResult = latestResults.alcohol_weekly_drinks;
  if (alcoholResult) {
    const a = evaluateAlcoholRisk(alcoholResult.value, sex);
    if (a) breakdown.push({ key: 'alcohol', label: 'Alkohol', score: a.score, weight: WEIGHTS.alcohol, note: a.label });
  }

  // Blutdruck (Einteilung DGK/Hochdruckliga, praktischArzt) – benötigt beide Werte
  const sysResult = latestResults.bp_systolic;
  const diaResult = latestResults.bp_diastolic;
  if (sysResult && diaResult) {
    const bp = evaluateBloodPressure(sysResult.value, diaResult.value);
    if (bp.bandFound) breakdown.push({ key: 'bloodPressure', label: 'Blutdruck', score: bp.score, weight: WEIGHTS.bloodPressure, note: `${Math.round(sysResult.value)}/${Math.round(diaResult.value)} mmHg – ${bp.shortLabel}` });
  }

  // Ruhepuls (nach Alter/Geschlecht)
  const hrResult = latestResults.resting_hr;
  if (hrResult) {
    const hr = evaluateRestingHeartRate(ageYears, sex, hrResult.value);
    if (hr.bandFound) breakdown.push({ key: 'restingHr', label: 'Ruhepuls', score: hr.score, weight: WEIGHTS.restingHr, note: `${Math.round(hrResult.value)} bpm – ${hr.label}` });
  }

  if (breakdown.length === 0) return { total: null, breakdown: [] };

  const weightSum = breakdown.reduce((sum, b) => sum + b.weight, 0);
  const total = Math.round(breakdown.reduce((sum, b) => sum + b.score * b.weight, 0) / weightSum);
  return { total, breakdown };
}
