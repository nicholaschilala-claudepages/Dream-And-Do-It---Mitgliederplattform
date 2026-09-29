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
// Testprotokolle (Kraftausdauer) – Quelle: vom Nutzer bereitgestelltes
// Athletikkonzept, Benchmark-Tabellen ACSM/Mackenzie bzw. Strand et al./
// Topend Sports.
// ---------------------------------------------------------------------------

// Altersbänder + Grenzwerte je Kategorie. "sehrGutMin" ist die untere Grenze
// der besten Kategorie (offenes oberes Ende), die anderen Kategorien sind
// [min, max]. Fällt das Alter in keine hinterlegte Spanne, gibt
// evaluateStrengthBenchmark() das offen zu ("keine Referenzwerte") statt zu
// extrapolieren.
const PLANK_BANDS = [
  { maxAge: 19, solide: [45, 89], gut: [90, 119], sehrGutMin: 120 },
  { minAge: 20, maxAge: 29, solide: [45, 89], gut: [90, 119], sehrGutMin: 120 },
  { minAge: 30, maxAge: 39, solide: [40, 74], gut: [75, 109], sehrGutMin: 110 },
];

const PUSHUP_BANDS_MALE = [
  { maxAge: 19, durchschnitt: [35, 44], gut: [45, 54], ausgezeichnetMin: 55 },
  { minAge: 20, maxAge: 29, durchschnitt: [35, 44], gut: [45, 54], ausgezeichnetMin: 55 },
  { minAge: 30, maxAge: 39, durchschnitt: [24, 34], gut: [35, 44], ausgezeichnetMin: 45 },
];

const SQUAT_BANDS_MALE = [
  { minAge: 18, maxAge: 25, durchschnitt: [31, 38], gut: [39, 49], ausgezeichnetMin: 50 },
  { minAge: 26, maxAge: 35, durchschnitt: [29, 34], gut: [35, 45], ausgezeichnetMin: 46 },
  { minAge: 36, maxAge: 45, durchschnitt: [23, 29], gut: [30, 41], ausgezeichnetMin: 42 },
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

/**
 * Ordnet einen Testwert der passenden Benchmark-Kategorie zu.
 * @returns {{key:'top'|'mid'|'low'|'below', label:string, bandFound:boolean, genderNote?:string}}
 */
export function evaluateStrengthBenchmark(testKey, ageYears, value, sex) {
  if (ageYears == null) return { key: null, label: 'Kein Geburtsdatum hinterlegt', bandFound: false };

  if (testKey === 'plank') {
    const band = findBand(PLANK_BANDS, ageYears);
    if (!band) return { key: null, label: 'Keine Referenzwerte für dieses Alter hinterlegt', bandFound: false };
    return { ...categorizeFromBand(band, value, { below: 'Unter Basis-Niveau', low: 'Solide Basis', mid: 'Gut', top: 'Sehr gut' }), bandFound: true };
  }
  if (testKey === 'pushup') {
    const band = findBand(PUSHUP_BANDS_MALE, ageYears);
    if (!band) return { key: null, label: 'Keine Referenzwerte für dieses Alter hinterlegt', bandFound: false };
    const result = categorizeFromBand(band, value, { below: 'Unter Durchschnitt', low: 'Durchschnitt', mid: 'Gut', top: 'Ausgezeichnet' });
    return { ...result, bandFound: true, genderNote: sex === 'female' ? 'Referenzwerte stammen aus einer männlichen Stichprobe (ACSM/Mackenzie) – bei Frauen nur grobe Orientierung, keine exakte Norm.' : null };
  }
  if (testKey === 'squat') {
    const band = findBand(SQUAT_BANDS_MALE, ageYears);
    if (!band) return { key: null, label: 'Keine Referenzwerte für dieses Alter hinterlegt', bandFound: false };
    const result = categorizeFromBand(band, value, { below: 'Unter Durchschnitt', low: 'Durchschnitt', mid: 'Gut', top: 'Ausgezeichnet' });
    return { ...result, bandFound: true, genderNote: sex === 'female' ? 'Referenzwerte stammen aus einer männlichen Stichprobe (ACSM/Mackenzie) – bei Frauen nur grobe Orientierung, keine exakte Norm.' : null };
  }
  return { key: null, label: '', bandFound: false };
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
    source: 'Strand et al. (2014); Topend Sports Normtabellen',
    ausfuehrungImage: 'content/tests/plank-ausfuehrung.jpg',
    abbruchImage: 'content/tests/plank-abbruch.jpg',
  },
  {
    key: 'pushup',
    label: 'Kraftausdauer Oberkörper (Liegestütz)',
    unit: 'Wiederholungen',
    valueLabel: 'Maximale saubere Wiederholungen ohne Pause',
    ausfuehrung: 'Saubere Liegestütz-Position, volle Bewegungsamplitude (Beugung bis ca. 5 cm über dem Boden, Ellenbogen ca. 45°).',
    typischeFehler: 'Unvollständige Bewegungsamplitude, Hüfte sackt durch oder wird hochgestreckt.',
    abbruchkriterium: 'Abbruch bei Formverlust – nicht bis zur völligen muskulären Erschöpfung um jeden Preis zählen.',
    kontraindikation: 'Nicht bei akuter Schulter-, Hüft-, Knie-, Sprung- oder Handgelenksverletzung sowie unmittelbar nach intensivem Training testen.',
    selbsttest: 'Saubere Liegestütz-Position einnehmen. So viele Wiederholungen wie möglich ohne Pause ausführen. Bei Formverlust abbrechen, Wiederholungen zählen und notieren.',
    source: 'American College of Sports Medicine (ACSM) – Guidelines for Exercise Testing and Prescription; ACE-Normtabelle nach Mackenzie, "101 Performance Evaluation Tests"',
    ausfuehrungImage: 'content/tests/liegestuetz-ausfuehrung.jpg',
    abbruchImage: 'content/tests/liegestuetz-abbruch.jpg',
  },
  {
    key: 'squat',
    label: 'Kraftausdauer Beine (Kniebeuge)',
    unit: 'Wiederholungen',
    valueLabel: 'Maximale saubere Wiederholungen ohne Pause',
    ausfuehrung: 'Aufrechter Stand, kontrollierte Abwärtsbewegung in eine tiefe Kniebeuge, volle Bewegungsamplitude.',
    typischeFehler: 'Hüfte wird nicht tief genug abgesenkt.',
    abbruchkriterium: 'Abbruch bei Formverlust – nicht bis zur völligen muskulären Erschöpfung um jeden Preis zählen.',
    kontraindikation: 'Nicht bei akuter Schulter-, Hüft-, Knie-, Sprung- oder Handgelenksverletzung sowie unmittelbar nach intensivem Training testen.',
    selbsttest: 'Aufrechten Stand einnehmen. So viele tiefe Kniebeugen wie möglich ohne Pause ausführen. Bei Formverlust abbrechen, Wiederholungen zählen und notieren.',
    source: 'American College of Sports Medicine (ACSM) – Guidelines for Exercise Testing and Prescription; ACE-Normtabelle nach Mackenzie, "101 Performance Evaluation Tests"',
    ausfuehrungImage: 'content/tests/kniebeuge-ausfuehrung.jpg',
    abbruchImage: 'content/tests/kniebeuge-abbruch.jpg',
  },
];

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
    goodImage: 'content/tests/schultertest-normal.jpg',
    limitedImage: 'content/tests/schultertest-eingeschraenkt.jpg',
  },
  {
    key: 'hamstring_mobility',
    label: 'Hamstring-Test (Sit-and-Reach)',
    hasSide: false,
    ratingLabels: { '1': 'Gut – Hände erreichen Fußspitzen oder darüber', '0': 'Normal', '-1': 'Eingeschränkt – Hände erreichen die Füße nicht' },
    ausfuehrung: 'In ruhiger Umgebung, ohne Zeitdruck testen.',
    typischeFehler: 'Ausweichbewegungen und über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Gelenkverletzung, frischer Prellung oder unmittelbar nach intensivem Training testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Wells, K. F., & Dillon, E. K. (1952). The Sit and Reach – A Test of Back and Leg Flexibility. Research Quarterly, 23(1), 115–118.',
    goodImage: 'content/tests/hamstring-test-gut.jpg',
    limitedImage: 'content/tests/hamstring-test-eingeschraenkt.jpg',
  },
  {
    key: 'thomas_mobility',
    label: 'Iliopsoas-Test (Thomas-Test)',
    hasSide: true,
    ratingLabels: { '1': 'Normal – anderes Bein bleibt flach', '0': 'Leicht eingeschränkt', '-1': 'Verkürzt – gestrecktes Bein hebt ab' },
    ausfuehrung: 'In ruhiger Umgebung, ohne Zeitdruck testen. Beide Seiten nacheinander testen. Da man in Rückenlage das eigene gestrecktes Bein selbst schlecht beobachten kann, am besten ein Handyvideo von der Seite aufnehmen oder einen Spiegel seitlich aufstellen, um zuverlässig zu erkennen, ob das Bein abhebt.',
    typischeFehler: 'Ausweichbewegungen und über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Gelenkverletzung, frischer Prellung oder unmittelbar nach intensivem Training testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Clapis, P. A., Davis, S. M., & Davis, R. O. (2008). Reliability of inclinometer and goniometric measurements of hip extension flexibility using the modified Thomas test. Physiotherapy Theory and Practice, 24(2), 135–141.',
    goodImage: 'content/tests/thomas-test-normal.jpg',
    limitedImage: 'content/tests/thomas-test-verkuerzt.jpg',
  },
  // Nutzer-Feedback Runde 14: drei neue, vom Nutzer freigegebene Tests für die
  // neuen Körper-Visualisierungspunkte (Handgelenke, Ellbogen, zweiter Punkt
  // Beinrückseite). Auf ausdrücklichen Wunsch bewusst so gestaltet, dass sie
  // ohne Hilfsperson zuverlässig durchführbar sind (Handgelenk: ohnehin allein
  // machbar; Ellbogen: Hinweis auf Spiegel/Foto für den Seitenvergleich;
  // Beinrückseite: wandgestützte AKE-Variante statt der Standardausführung mit
  // Partner, der die Hüfte bei 90° fixiert).
  {
    key: 'wrist_extension',
    label: 'Handgelenk-Streck-Test (Wandtest)',
    hasSide: true,
    ratingLabels: { '1': 'Gut – Oberkörper nahezu senkrecht bei flacher Handfläche', '0': 'Normal – leichte Einschränkung', '-1': 'Eingeschränkt – Handfläche hebt schnell ab bzw. deutliche Spannung' },
    ausfuehrung: 'Handfläche flach gegen eine Wand pressen, Finger zeigen nach unten, Arm gestreckt. Langsam den Oberkörper der Wand annähern, so weit wie möglich, ohne dass die Handfläche den Wandkontakt verliert. Beide Seiten nacheinander testen.',
    typischeFehler: 'Handgelenk zur Seite verdrehen statt gerade zu strecken; über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Handgelenks-/Unterarmverletzung, frischer Prellung oder unmittelbar nach intensivem Training testen.',
    source: 'Klinischer Screening-Test für Handgelenksextension (Prayer-Stretch-Variante); ROM-Referenzwerte für eine normale Handgelenksextension (ca. 70–80°) nach American Academy of Orthopaedic Surgeons (AAOS), Joint Motion: Method of Measuring and Recording.',
  },
  {
    key: 'elbow_extension',
    label: 'Ellbogen-Streckungs-Test',
    hasSide: true,
    ratingLabels: { '1': 'Gut – vollständige, seitengleiche Streckung', '0': 'Normal – minimales Streckdefizit (unter ca. 10°)', '-1': 'Eingeschränkt – deutliches Streckdefizit oder Seitenunterschied' },
    ausfuehrung: 'Arm seitlich am Körper vollständig entspannt hängen lassen, Handfläche nach vorne. Im Seitenvergleich beobachten, ob der Ellbogen vollständig durchgestreckt werden kann. Da man das selbst nur schwer sieht, am besten vor einem Spiegel stehen oder ein Handyfoto von vorne machen und beide Arme vergleichen.',
    typischeFehler: 'Schulter mitbewegen statt den Arm wirklich locker hängen zu lassen; Einschätzung ohne Spiegel/Foto rein nach Gefühl.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Ellbogenverletzung, frischer Prellung oder unmittelbar nach intensivem Arm-/Oberkörpertraining testen.',
    source: 'Standard-orthopädische Untersuchungstechnik nach der Neutral-Null-Methode (Bewegungsausmaß-Dokumentation in der Orthopädie/Physiotherapie).',
  },
  {
    key: 'ake_hamstring',
    label: 'Beinrückseite je Seite (Aktive Kniestreckung, wandgestützt)',
    hasSide: true,
    ratingLabels: { '1': 'Gut – nahezu volle Streckung (Knie kommt nah an die Wand-Senkrechte)', '0': 'Normal – moderates Streckdefizit', '-1': 'Eingeschränkt – deutliches Streckdefizit' },
    ausfuehrung: 'Ergänzt den bestehenden beidseitigen Sit-and-Reach-Test um eine seitengetrennte Messung. Rückenlage auf dem Boden, Gesäß nah an einer Wand oder einem Türrahmen, das zu testende Bein senkrecht an der Wand anlehnen (Hüfte dadurch automatisch bei ca. 90°, ohne dass jemand festhalten muss). Das andere Bein bleibt flach am Boden gestreckt. Das angelehnte Knie dann aktiv so weit wie möglich strecken (Ferse gleitet die Wand hinauf) und den verbleibenden Abstand/Winkel zur Wand-Senkrechten grob einschätzen – am besten mit einem Handyfoto von der Seite dokumentieren, dann ist der Seiten- und Verlaufsvergleich zuverlässiger. Beide Seiten nacheinander testen.',
    typischeFehler: 'Gesäß von der Wand wegrutschen lassen (verfälscht den 90°-Hüftwinkel); das andere Bein vom Boden abheben; über die Schmerzgrenze hinaus gehen.',
    abbruchkriterium: 'Bei Schmerz oder deutlichem Unsicherheitsgefühl sofort abbrechen.',
    kontraindikation: 'Nicht bei akuter Knie-/Hüftverletzung, frischer Prellung oder unmittelbar nach intensivem Beintraining testen – Ermüdung verfälscht das Bewegungsbild.',
    source: 'Gajdosik, R. L., & Lusin, G. (1983). Hamstring muscle tightness: reliability of an active-knee-extension test. Physical Therapy, 63(7), 1085–1090 (Active Knee Extension/AKE-Test); wandgestützte Fixierung der Hüfte bei 90° als alltagstaugliche Selbsttest-Variante ohne Hilfsperson.',
  },
];

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

export async function listPreventionResults(clientId) {
  return supabaseClient
    .from('prevention_test_results')
    .select('*')
    .eq('client_id', clientId)
    .order('measured_at', { ascending: true });
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
  [...STRENGTH_TESTS, ...MOBILITY_TESTS].forEach((t) => {
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
// weiterhin 1.0). Rauchen ist trotz nur grober Selbstauskunft vergleichsweise
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

  // Kraftausdauer
  const strengthScores = [];
  for (const t of STRENGTH_TESTS) {
    const r = latestResults[t.key];
    if (!r) continue;
    const evalRes = evaluateStrengthBenchmark(t.key, ageYears, r.value, sex);
    if (!evalRes.bandFound) continue;
    const score = { top: 100, mid: 80, low: 60, below: 35 }[evalRes.key];
    strengthScores.push(score);
  }
  if (strengthScores.length > 0) {
    breakdown.push({ key: 'strength', label: 'Kraftausdauer', score: Math.round(strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length), weight: WEIGHTS.strength });
  }

  // Beweglichkeit
  const mobilityScores = [];
  for (const t of MOBILITY_TESTS) {
    if (t.hasSide) {
      for (const side of ['left', 'right']) {
        const r = latestResults[`${t.key}:${side}`];
        if (r) mobilityScores.push({ '-1': 40, '0': 70, '1': 100 }[String(Math.sign(r.value))] ?? 70);
      }
    } else {
      const r = latestResults[t.key];
      if (r) mobilityScores.push({ '-1': 40, '0': 70, '1': 100 }[String(Math.sign(r.value))] ?? 70);
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

  if (breakdown.length === 0) return { total: null, breakdown: [] };

  const weightSum = breakdown.reduce((sum, b) => sum + b.weight, 0);
  const total = Math.round(breakdown.reduce((sum, b) => sum + b.score * b.weight, 0) / weightSum);
  return { total, breakdown };
}
