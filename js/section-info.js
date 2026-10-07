// ============================================================================
// Dream And Do It – Kundenplattform
// Etappe 17: Zentrale Texte für die Start-/Landingpages der drei Reiter
// (Training/Ernährung/Coaching) sowie die persönliche Kunden-Begrüßung und
// die Trainer-Startseite. An einer Stelle gepflegt, damit dashboard.html,
// training.html, nutrition.html und coaching.html konsistente Texte zeigen
// (Start-Tab UND die Teaser-Seite bei gesperrtem Reiter greifen auf dieselben
// Bausteine zurück).
//
// WICHTIG: Der Begrüßungstext (welcomeParagraphs) ist ein Entwurf in Nicholas'
// Namen. Grundlage: reale Aussagen von www.dreamanddoit.de (Seiten "Über uns"
// und "Privatkunden", Stand 26.09.2026) sowie die von Nicholas zur Verfügung
// gestellten Dokumente (Lebenslauf Stand 2026, Abschlussdokumentation M.A.
// Deutsche Hochschule für Prävention und Gesundheitsmanagement, Referenzen,
// Arbeitszeugnisse Krauthammer/Lepaya, Stand 25.09.2026) — bitte vor dem
// Livegang gegenlesen und bei Bedarf anpassen.
// ============================================================================

import { supabaseClient } from './supabase-client.js';
import { BREATHING_TECHNIQUES, QUESTIONNAIRES } from './coaching.js';
import { STRENGTH_TESTS, MOBILITY_TESTS, CARDIO_TESTS, isInputTest } from './prevention.js';
import { ACHIEVEMENT_DEFINITIONS } from './achievements.js';

export const SECTION_INFO = {
  training: {
    title: 'Training',
    fieldName: 'training_enabled',
    heroLine: 'Technik vor Intensität — dein Plan, deine Entwicklung, sauber dokumentiert.',
    // Runde 19 (Q7): Ein-Satz-Kurztexte für die Startseiten-Kacheln; der volle
    // Text (clientIntro/adminIntro) steht hinter „Mehr“.
    clientShort: 'Dein Plan, dein Tagebuch, deine Entwicklung.',
    adminShort: 'Übungen, Plan-Vorlagen und Kunden&shy;analyse.',
    clientIntro:
      'Hier findest du deinen persönlichen Trainingsplan, trägst nach jeder Einheit Sätze, Wiederholungen, ' +
      'Gewicht oder Distanz ein — so, wie es tatsächlich war — und siehst, wie sich deine bewegten Kilos und ' +
      'die Balance zwischen deinen Muskelgruppen über die Zeit entwickeln.',
    // Statischer Fallback ohne Zahlen – die Seiten ersetzen ihn per
    // hydrateSectionInfo() durch sectionBenefits() mit Live-Zahlen.
    benefits: [
      { h: 'Dein persönlicher Trainingsplan', t: 'von mir zusammengestellt und laufend an deinen Fortschritt angepasst – du weißt bei jedem Training, was zu tun ist.' },
      { h: 'Übungsbibliothek', t: 'viele Übungen mit Bild, Anleitung und beanspruchter Muskulatur – saubere Technik zum Nachschlagen, wann immer du sie brauchst.' },
      { h: 'Tagebuch mit Belohnung', t: 'jeder Satz zählt: Rekorde, Wochen-Serien und Erfolge zeigen dir, dass du vorankommst – nach jeder Einheit gibt es den verdienten Applaus.' },
      { h: 'Präventionscheck', t: 'Tests und Messungen zu Kraft, Beweglichkeit, Ausdauer, Blutdruck und Ruhepuls mit Normwerten und Präventionsscore – Messen statt Raten.' },
      { h: 'Auswertung & Rückblick', t: 'bewegte Kilos, Fortschritt, Dysbalancen, Monatsbericht und Rückblick nach 6/12/24 Monaten als PDF.' },
    ],
    scienceText:
      'Der Trainingsaufbau folgt dem Prinzip „Technik vor Intensität": sauber ausgeführte Bewegungen mit ' +
      'angemessener, planvoll gesteigerter Belastung senken das Verletzungsrisiko und sichern langfristig ' +
      'bessere Ergebnisse als reines Gewichtsteigern ohne Kontrolle. Die Dysbalance-Auswertung dieser Plattform ' +
      'orientiert sich am Push-Pull-Prinzip der Trainingslehre: werden gegenüberliegende Muskelgruppen (z.B. ' +
      'Brust vs. Rücken, vordere vs. hintere Beinkette) über längere Zeit unausgewogen belastet, steigt das ' +
      'Risiko für Haltungsprobleme und Überlastungsschäden — ein Grund, warum wir genau darauf automatisch achten.',
    adminIntro:
      'Hier verwaltest du die Übungsbibliothek, baust Trainingsplan-Vorlagen, weist sie einzelnen Kunden zu ' +
      'oder erstellst individuelle Einzelpläne. Unter „Kundenanalyse" siehst du Trainingsentwicklung, bewegte ' +
      'Kilos und mögliche Dysbalancen jedes Kunden auf einen Blick.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },

  nutrition: {
    title: 'Ernährung',
    fieldName: 'nutrition_enabled',
    heroLine: 'Klare Daten statt Vermutungen — für deine Ernährung genauso wie für dein Training.',
    // Runde 19 (Q7): Ein-Satz-Kurztexte für die Startseiten-Kacheln; der volle
    // Text (clientIntro/adminIntro) steht hinter „Mehr“.
    clientShort: 'Kalorienbedarf, Körperfett-Verlauf, Protokoll und Rezepte.',
    adminShort: 'Rezepte, Lebensmittel und Kunden&shy;protokolle.',
    clientIntro:
      'Hier berechnest du deinen individuellen Kalorienbedarf, verfolgst deinen Körperfettanteil nach der ' +
      'Navy-Methode, protokollierst deine Mahlzeiten mit Soll-Ist-Vergleich und findest abwechslungsreiche ' +
      'Rezepte nach dem Dream-And-Do-It-Teller-Prinzip.',
    benefits: [
      { h: 'PAL-Rechner', t: 'dein individueller Kalorien- und Energiebedarf auf Basis deines Aktivitätslevels – die Grundlage für jedes Ernährungsziel.' },
      { h: 'Körperfett-Verlauf', t: 'nach der validierten Navy-Methode, inklusive Trend über die Zeit – du siehst, was wirklich passiert, nicht nur die Waage.' },
      { h: 'Ernährungsprotokoll', t: 'Mahlzeiten mit Menge, Uhrzeit und Kalorien erfassen, mit Soll-Ist-Vergleich zum Trainingsverbrauch und persönlichem Kommentar von mir.' },
      { h: 'Rezepte mit Makros', t: 'alltagstaugliche Rezepte mit vollständigen Makros, filterbar nach Ernährungsform, Geschmack, Mahlzeit und Zeit – nach dem Dream-And-Do-It-Teller-Prinzip.' },
    ],
    scienceText:
      'Der Dream-And-Do-It-Teller orientiert sich an der Aufteilung 50&nbsp;% Gemüse &amp; Obst, 25&nbsp;% Protein, ' +
      '25&nbsp;% vollwertige Kohlenhydrate — ein Prinzip, das in ähnlicher Form u.a. im „Healthy Eating Plate"-Modell ' +
      'der Harvard T.H. Chan School of Public Health sowie in den Empfehlungen der Deutschen Gesellschaft für ' +
      'Ernährung (DGE) beschrieben wird. Es dient als einfacher, alltagstauglicher Richtwert für ausgewogene ' +
      'Mahlzeiten — kein starres Regelwerk. Iss so viele Portionen, dass du satt bist.',
    adminIntro:
      'Hier pflegst du die Rezept- und Lebensmitteldatenbank und siehst die Ernährungsprotokolle deiner Kunden ' +
      'inklusive der Möglichkeit, direkt einen Kommentar zu hinterlassen.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },

  coaching: {
    title: 'Coaching',
    fieldName: 'coaching_enabled',
    heroLine: 'Mentale Stärke ist trainierbar — genau wie Kraft und Ausdauer.',
    // Runde 19 (Q7): Ein-Satz-Kurztexte für die Startseiten-Kacheln; der volle
    // Text (clientIntro/adminIntro) steht hinter „Mehr“.
    clientShort: 'Mentale Stärke, Atemübungen, Fragebögen, Ziele nach GROW.',
    adminShort: 'Inhalte, Fragebögen und GROW-Ziele deiner Kunden.',
    clientIntro:
      'Hier findest du Inhalte zu mentaler Stärke und persönlicher Entwicklung, übst mit geführten Atemtechniken, ' +
      'kannst wissenschaftlich validierte Fragebögen zur Standortbestimmung ausfüllen und deine Ziele strukturiert ' +
      'nach dem GROW-Modell verfolgen — gemeinsam mit mir als Coach.',
    benefits: [
      { h: 'Coaching-Content-Bibliothek', t: 'Dokumente zu Selbstwirksamkeit, Gewohnheiten, Resilienz, Zielsetzung, Kommunikation und mehr – zum Lesen, wann immer du Impulse brauchst.' },
      { h: 'Atemübungen mit Animation', t: 'geführte Atemtechniken für Ruhe, Fokus und Erholung – mit Taktgeber, Erklärung und wissenschaftlicher Einordnung.' },
      { h: 'Validierte Fragebögen', t: 'Selbstwirksamkeit, Wohlbefinden, Stress, Veränderungsbereitschaft und Motivation – zur ehrlichen Standortbestimmung und zum Vergleich über die Zeit.' },
      { h: 'Ziel-Modul nach GROW', t: 'Goal – Reality – Options – Will: aus einem Wunsch wird gemeinsam mit mir ein konkreter, umsetzbarer Plan mit Zwischenschritten.' },
    ],
    scienceText:
      'Mein eigener Zugang zum Coaching basiert auf einem Master of Arts in Prävention &amp; Gesundheitsmanagement ' +
      'mit Studienschwerpunkt Coaching. In meiner Masterthesis habe ich mich mit Selbstwirksamkeit im ' +
      'Führungskräfte-Coaching auseinandergesetzt — unter anderem auf Basis von Albert Banduras ' +
      'Selbstwirksamkeitstheorie und dem GROW-Modell. Beide Konzepte bilden bis heute die wissenschaftliche ' +
      'Grundlage der Coaching-Inhalte auf dieser Plattform: Bandura zeigt, dass der Glaube an die eigene ' +
      'Handlungsfähigkeit direkten Einfluss auf tatsächliches Verhalten und Durchhaltevermögen hat; das ' +
      'GROW-Modell liefert die Struktur, mit der aus einem Wunsch ein konkreter, umsetzbarer Plan wird.',
    adminIntro:
      'Hier pflegst du die Coaching-Content-Bibliothek und siehst sowohl die verfügbaren Fragebogen-Vorlagen als ' +
      'auch die ausgefüllten Fragebögen und GROW-Ziele deiner Kunden.',
    lockedLead: 'Dieser Bereich ist für dich aktuell noch nicht freigeschaltet.',
  },
};

/**
 * Runde 19 (Q7): Kurztexte/Volltexte für die beiden Start-Kacheln, die keinen
 * eigenen SECTION_INFO-Eintrag haben (Nachrichten, Trainer-Betrieb).
 */
export const START_TILE_EXTRAS = {
  messages: {
    title: 'Nachrichten',
    clientShort: 'Direkter Austausch mit mir, immer erreichbar.',
    clientIntro:
      'Direkter Austausch mit mir zu deinen Leistungen — dieser Bereich ist für dich immer zugänglich, egal ' +
      'welche anderen Bereiche freigeschaltet sind.',
    adminShort: 'Austausch mit all deinen Kunden.',
    adminIntro:
      'Direkter Austausch mit all deinen Kunden zu ihren Leistungen — immer erreichbar, unabhängig von ' +
      'Reiter-Freigaben.',
  },
  betrieb: {
    title: 'Trainer-Dashboard (Betrieb)',
    adminShort: 'Kunden&shy;übersicht, Früh&shy;warn&shy;system, Reiter-Freigabe.',
    adminIntro:
      'Kundenübersicht mit Aktivitäts-Frühwarnsystem, Wochenreport-Erstellung, Geräteverwaltung und die ' +
      'Reiter-Freigabe je Kunde (Training/Ernährung/Coaching einzeln sperr-/freischaltbar).',
  },
};

/**
 * Persönlicher Begrüßungstext für die Kunden-Startseite (dashboard.html).
 * ENTWURF — gestützt auf www.dreamanddoit.de sowie die von Nicholas
 * bereitgestellten Dokumente (siehe Hinweis oben), bitte von Nicholas vor
 * dem Livegang gegenlesen/freigeben.
 */
export function welcomeParagraphs(firstName) {
  const name = firstName ? escapeHtmlLocal(firstName) : '';
  return [
    `Hallo${name ? ' ' + name : ''}, schön, dass du da bist!`,
    'Mein Name ist Nicholas Chilala, Gründer und Head Coach von Dream And Do It. Ich freue mich sehr, dass ' +
      'du dich für mich und diesen Weg entschieden hast.',
    'Meine eigene Geschichte hat mich hierher geführt: Als Leistungssportler im Karate stoppte mich kurz vor ' +
      'meinem großen Ziel, den Deutschen Meisterschaften, eine Herzmuskelentzündung — nicht aus mangelnder ' +
      'Leistung, sondern aus Überbelastung und zu wenig Erholung. Diese Erfahrung hat meinen Blick auf ' +
      'Gesundheit und Leistungsfähigkeit grundlegend verändert und mich in die Prävention geführt: über ein ' +
      'Freiwilliges Soziales Jahr im Sport, eine Ausbildung zum Fitness- und Gesundheitscoach (IHK) und ' +
      'schließlich ein Studium mit Bachelor in Fitnessökonomie und Master of Arts in Prävention und ' +
      'Gesundheitsmanagement mit den Schwerpunkten Coaching und Sportpsychologie.',
    'In den Jahren danach habe ich dieses Wissen auf zwei Ebenen vertieft: ganz praktisch als Personal ' +
      'Trainer und Coach für Privatkunden — vom individuellen Abnehm-Konzept bis zur Trainingsbegleitung von ' +
      'Leistungssportlern — und parallel als zertifizierter Trainer und Coach für internationale Unternehmen, ' +
      'wo ich globale Leadership- und Sales-Programme mitentwickelt und Führungskräfte in Konzernen wie WIKA ' +
      'oder Vantage Towers begleitet habe. Genau dieses Muster — Höchstleistung, die auf Kosten der eigenen ' +
      'Gesundheit geht — begegnet mir dort bis heute, bei Spitzensportlern genau wie bei Führungskräften.',
    'Genau deshalb verbindet Dream And Do It Körper und Geist in einem ganzheitlichen, wissenschaftlich ' +
      'fundierten System aus Diagnostik, Training/Intervention und Begleitung. Meine Überzeugung: Jeder Traum ' +
      'braucht eine Taten-Komponente. Auf dieser Plattform begleite ich dich als Strategiepartner auf ' +
      'Augenhöhe — mit klaren Daten statt Vermutungen und einem Plan, der wirklich zu deinem Alltag passt.',
    'Schau dich gerne in Ruhe um: unten siehst du, was dich unter jedem Reiter erwartet — auch die Bereiche, ' +
      'die aktuell noch nicht für dich freigeschaltet sind. Sprich mich einfach über die Nachrichten-Funktion ' +
      'an, wenn dich etwas davon interessiert.',
  ];
}

function escapeHtmlLocal(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============================================================================
// Runde 21 / Q12: Live-Zahlen für die Rubrik-Erklärungen
//
// Die Erklärungen sollen zeigen, wie viel in jeder Rubrik steckt (Übungen,
// Rezepte, Coaching-Content, Atemtechniken, Fragebögen, Tests, Erfolge,
// Funktionen). Datenbank-Anzahlen werden live gezählt (Funktion
// section_counts(), sql/054 – unabhängig von der Freigabe des Kunden, damit
// auch gesperrte Rubriken ihren Umfang zeigen können; Fallback: direkte
// Zählabfragen). Alles, was im Code definiert ist (Atemtechniken, Fragebögen,
// Tests, Erfolge, Funktionen), wird direkt aus den jeweiligen Listen gezählt –
// so bleiben die Zahlen automatisch korrekt, wenn etwas dazukommt.
// ============================================================================

/** Funktionen je Rubrik (Liste = Quelle der „Funktionen“-Zahl). */
export const SECTION_FEATURES = {
  training: [
    'Persönlicher Trainingsplan mit Tagen und Vorgaben',
    'Schnell-Logging je Satz, Übung oder ganzer Einheit',
    'Satzpausen-Timer',
    'Einheit starten und beenden – mit Belohnungs-Effekt',
    'Trainingstagebuch nach Einheiten',
    'Rekord-Tracker (Gewicht, 1RM, Wiederholungen)',
    'Wochen-Serie (Streak)',
    'Übungsbibliothek mit Bild und Anleitung',
    'Entwicklung: bewegte Kilos je Übung und Workout',
    'Erkennung muskulärer Dysbalancen',
    'Präventionscheck mit Präventionsscore',
    'Blutdruck und Ruhepuls mit Normwerten',
    'Tests mit Verlauf und Wiederholungsmessung',
    'Monatsbericht als PDF',
    'Rückblick nach 6, 12 und 24 Monaten als PDF',
  ],
  nutrition: [
    'PAL-Rechner für deinen Kalorienbedarf',
    'Körperfett-Rechner (Navy-Methode)',
    'Körperfett- und Gewichtsverlauf',
    'Ernährungsprotokoll mit Uhrzeit und Kalorien',
    'Soll-Ist-Vergleich zum Trainingsverbrauch',
    'Persönliche Kommentare vom Coach',
    'Rezepte mit vollständigen Makros',
    'Rezeptfilter (Ernährungsform, Geschmack, Mahlzeit, Zeit)',
    'Lebensmitteldatenbank mit Nährwerten',
  ],
  coaching: [
    'Coaching-Content-Bibliothek (PDF-Downloads)',
    'Filter nach Themengruppen',
    'Atemübungen mit Animation und Taktgeber',
    'Validierte Fragebögen',
    'Fragebogen-Verlauf über die Zeit',
    'Ziele nach dem GROW-Modell',
    'Optionen und Umsetzungsschritte mit Status',
    'Persönliche Hinweise passend zu deinen Interessen',
  ],
  // Rubrik-übergreifend (immer verfügbar)
  platform: [
    'Nachrichten direkt an deinen Coach',
    'Erfolge und Rekorde',
    'Offline-Logging mit automatischer Synchronisierung',
    'Als App auf dem Handy installierbar',
    'Heller und dunkler Modus',
  ],
};

const COUNTS_TIMEOUT_MS = 2500;
let countsPromise = null;

function codeCounts() {
  const tests = [...STRENGTH_TESTS, ...MOBILITY_TESTS, ...CARDIO_TESTS].filter(isInputTest).length;
  return {
    breathing: BREATHING_TECHNIQUES.length,
    questionnaires: QUESTIONNAIRES.length,
    // + Blutdruck und Ruhepuls (eigene Messkarte, siehe js/prevention.js)
    tests: tests + 2,
    achievements: ACHIEVEMENT_DEFINITIONS.length,
    features: {
      training: SECTION_FEATURES.training.length,
      nutrition: SECTION_FEATURES.nutrition.length,
      coaching: SECTION_FEATURES.coaching.length,
      platform: SECTION_FEATURES.platform.length,
    },
  };
}

async function exactCount(table) {
  const { count, error } = await supabaseClient.from(table).select('id', { count: 'exact', head: true });
  return error ? null : count;
}

async function fetchDbCounts() {
  try {
    const { data, error } = await supabaseClient.rpc('section_counts');
    if (!error && data) {
      return {
        exercises: data.exercises, recipes: data.recipes, foodItems: data.food_items,
        coachingContent: data.coaching_content, coachingGroups: data.coaching_groups,
      };
    }
  } catch (_) { /* Fallback unten */ }
  // Fallback (Migration 054 noch nicht eingespielt): direkte Zählabfragen. Je
  // nach Freigabe des Kunden liefert die Datenbank dabei ggf. weniger/keine Zeilen.
  const [exercises, recipes, foodItems, coachingContent] = await Promise.all([
    exactCount('exercises'), exactCount('recipes'), exactCount('food_items'), exactCount('coaching_content'),
  ]);
  return { exercises, recipes, foodItems, coachingContent, coachingGroups: null };
}

/**
 * Lädt alle Zahlen (einmal je Seitenaufruf, danach aus dem Cache). Wirft nie:
 * bei Fehlern/Timeout fehlen nur die Datenbank-Zahlen (null) – die im Code
 * definierten Zahlen sind immer da.
 */
export function loadSectionCounts() {
  if (!countsPromise) {
    countsPromise = Promise.race([
      fetchDbCounts(),
      new Promise((resolve) => setTimeout(() => resolve({}), COUNTS_TIMEOUT_MS)),
    ]).catch(() => ({})).then((db) => ({ ...codeCounts(), ...Object.fromEntries(Object.entries(db || {}).filter(([, v]) => v != null && v > 0)) }));
  }
  return countsPromise;
}

const fmt = (n) => Number(n).toLocaleString('de-DE');
const has = (n) => typeof n === 'number' && n > 0;

/** Kennzahlen-Leiste je Rubrik: [{ value, label }] – nur, was bekannt ist. */
export function sectionFacts(key, c) {
  const f = (c && c.features) || {};
  const out = [];
  if (key === 'training') {
    if (has(c.exercises)) out.push({ value: fmt(c.exercises), label: 'Übungen mit Bild & Anleitung', short: 'Übungen' });
    out.push({ value: fmt(c.tests), label: 'Tests & Messungen', short: 'Tests' });
    out.push({ value: fmt(c.achievements), label: 'Erfolge & Rekorde', short: 'Erfolge' });
    out.push({ value: fmt(f.training), label: 'Funktionen' });
  } else if (key === 'nutrition') {
    if (has(c.recipes)) out.push({ value: fmt(c.recipes), label: 'Rezepte mit Makros', short: 'Rezepte' });
    if (has(c.foodItems)) out.push({ value: fmt(c.foodItems), label: 'Lebensmittel mit Nährwerten', short: 'Lebensmittel' });
    out.push({ value: fmt(f.nutrition), label: 'Funktionen' });
  } else if (key === 'coaching') {
    if (has(c.coachingContent)) out.push({ value: fmt(c.coachingContent), label: 'Coaching-Dokumente', short: 'Dokumente' });
    out.push({ value: fmt(c.breathing), label: 'Atemtechniken', short: 'Atemtechniken' });
    out.push({ value: fmt(c.questionnaires), label: 'validierte Fragebögen', short: 'Fragebögen' });
    out.push({ value: fmt(f.coaching), label: 'Funktionen' });
  }
  return out;
}

/** Nutzenkarten mit Live-Zahlen (gleiche Form wie SECTION_INFO[key].benefits). */
export function sectionBenefits(key, c) {
  const n = (v, one, many) => (has(v) ? `${fmt(v)} ${v === 1 ? one : many}` : null);
  if (key === 'training') {
    const ex = n(c.exercises, 'Übung', 'Übungen');
    return [
      { h: 'Dein persönlicher Trainingsplan', t: 'von mir zusammengestellt und laufend an deinen Fortschritt angepasst – du weißt bei jedem Training, was zu tun ist.' },
      { h: ex ? `Übungsbibliothek: ${ex}` : 'Übungsbibliothek', t: 'mit Bild, Anleitung und beanspruchter Muskulatur – saubere Technik zum Nachschlagen, wann immer du sie brauchst.' },
      { h: 'Tagebuch mit Belohnung', t: `jeder Satz zählt: Rekorde, Wochen-Serien und ${fmt(c.achievements)} Erfolge zum Freischalten zeigen dir, dass du vorankommst – nach jeder Einheit gibt es den verdienten Applaus.` },
      { h: `Präventionscheck: ${fmt(c.tests)} Tests & Messungen`, t: 'Kraft, Beweglichkeit, Ausdauer, Blutdruck und Ruhepuls – mit Normwerten und Präventionsscore. Messen statt Raten.' },
      { h: 'Auswertung & Rückblick', t: 'bewegte Kilos, Fortschritt, Dysbalancen, Monatsbericht und Rückblick nach 6, 12 und 24 Monaten als PDF.' },
    ];
  }
  if (key === 'nutrition') {
    const rc = n(c.recipes, 'Rezept', 'Rezepte');
    const fd = n(c.foodItems, 'Lebensmittel', 'Lebensmittel');
    return [
      { h: 'PAL-Rechner', t: 'dein individueller Kalorien- und Energiebedarf auf Basis deines Aktivitätslevels – die Grundlage für jedes Ernährungsziel.' },
      { h: 'Körperfett-Verlauf', t: 'nach der validierten Navy-Methode, inklusive Trend über die Zeit – du siehst, was wirklich passiert, nicht nur die Waage.' },
      { h: 'Ernährungsprotokoll', t: `Mahlzeiten mit Menge, Uhrzeit und Kalorien erfassen${fd ? ` – ${fd} mit Nährwerten stehen bereit –` : ''} mit Soll-Ist-Vergleich zum Trainingsverbrauch und persönlichem Kommentar von mir.` },
      { h: rc ? `${rc} mit Makros` : 'Rezepte mit Makros', t: 'alltagstaugliche Gerichte nach dem Dream-And-Do-It-Teller-Prinzip, filterbar nach Ernährungsform, Geschmack, Mahlzeit und Zubereitungszeit.' },
    ];
  }
  if (key === 'coaching') {
    const cc = n(c.coachingContent, 'Dokument', 'Dokumente');
    return [
      { h: cc ? `Coaching-Bibliothek: ${cc}` : 'Coaching-Bibliothek', t: `${has(c.coachingGroups) ? `verteilt auf ${fmt(c.coachingGroups)} Themengruppen: ` : ''}Selbstwirksamkeit, Gewohnheiten, Resilienz, Zielsetzung, Kommunikation und mehr – zum Lesen, wann immer du Impulse brauchst.` },
      { h: `${fmt(c.breathing)} Atemtechniken mit Animation`, t: 'geführte Übungen für Ruhe, Fokus und Erholung – mit Taktgeber, Erklärung und wissenschaftlicher Einordnung.' },
      { h: `${fmt(c.questionnaires)} validierte Fragebögen`, t: 'Selbstwirksamkeit, Wohlbefinden, Stress, Veränderungsbereitschaft und Motivation – zur ehrlichen Standortbestimmung und zum Vergleich über die Zeit.' },
      { h: 'Ziel-Modul nach GROW', t: 'Goal – Reality – Options – Will: aus einem Wunsch wird gemeinsam mit mir ein konkreter, umsetzbarer Plan mit Zwischenschritten.' },
    ];
  }
  return [];
}

/**
 * Gesamtüberblick für die Startseite: was steht dem Kunden zur Verfügung,
 * was käme mit den noch gesperrten Rubriken dazu.
 * profile: { role, training_enabled, nutrition_enabled, coaching_enabled }
 */
export function platformOverview(c, profile) {
  const isAdmin = profile && profile.role === 'admin';
  const enabled = {
    training: isAdmin || !!(profile && profile.training_enabled),
    nutrition: isAdmin || !!(profile && profile.nutrition_enabled),
    coaching: isAdmin || !!(profile && profile.coaching_enabled),
  };
  const f = (c && c.features) || {};
  const sum = (keys) => keys.reduce((a, k) => a + (f[k] || 0), 0);
  const pack = (keys) => {
    const list = [];
    const add = (value, label) => { if (has(value)) list.push({ value, label }); };
    const features = sum(keys) + (f.platform || 0);
    if (keys.includes('training')) { add(c.exercises, 'Übungen'); add(c.tests, 'Tests & Messungen'); }
    if (keys.includes('nutrition')) { add(c.recipes, 'Rezepte'); add(c.foodItems, 'Lebensmittel'); }
    if (keys.includes('coaching')) { add(c.coachingContent, 'Coaching-Dokumente'); add(c.breathing, 'Atemtechniken'); add(c.questionnaires, 'Fragebögen'); }
    add(c.achievements, 'Erfolge & Rekorde');
    return { features, items: list };
  };
  const have = Object.keys(enabled).filter((k) => enabled[k]);
  const missing = Object.keys(enabled).filter((k) => !enabled[k]);
  return {
    enabled, have, missing,
    available: pack(have),
    potential: missing.length ? pack(missing) : null,
    all: pack(['training', 'nutrition', 'coaching']),
  };
}

/** Kompakte Zeile für die Startseiten-Kacheln: "87 Übungen · 14 Tests · 15 Funktionen". */
export function tileFactsText(key, c) {
  return sectionFacts(key, c).map((x) => `${x.value} ${x.short || x.label}`).join(' · ');
}

/** Zahlen als "87 Übungen, 12 Tests" – für Fließtext. */
export function formatCountList(items) {
  return items.map((i) => `${fmt(i.value)} ${i.label}`).join(' · ');
}

function escapeText(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/**
 * Füllt in einem Container alle Platzhalter mit Live-Zahlen:
 *   [data-section-facts="training"]     → Kennzahlen-Leiste
 *   [data-section-benefits="training"]  → Nutzenkarten (ersetzt den Fallback)
 *   [data-tile-facts="training"]       → kompakte Zahlen-Zeile in der Startseiten-Kachel
 * Rendert nichts Neues, wenn die Platzhalter fehlen. Wirft nie.
 */
export async function hydrateSectionInfo(root) {
  try {
    const nodes = Array.from((root || document).querySelectorAll('[data-section-facts], [data-section-benefits], [data-tile-facts]'));
    if (nodes.length === 0) return;
    const counts = await loadSectionCounts();
    nodes.forEach((node) => {
      if (node.hasAttribute('data-section-facts')) {
        const facts = sectionFacts(node.getAttribute('data-section-facts'), counts);
        node.innerHTML = facts.map((x) => `<div class="fact"><b>${escapeText(x.value)}</b><span>${escapeText(x.label)}</span></div>`).join('');
        node.hidden = facts.length === 0;
      }
      if (node.hasAttribute('data-tile-facts')) {
        node.textContent = tileFactsText(node.getAttribute('data-tile-facts'), counts);
      }
      if (node.hasAttribute('data-section-benefits')) {
        const list = sectionBenefits(node.getAttribute('data-section-benefits'), counts);
        if (list.length) node.innerHTML = list.map((b) => `<div class="benefit-card"><h4>${escapeText(b.h)}</h4><p>${escapeText(b.t)}</p></div>`).join('');
      }
    });
  } catch (e) {
    console.warn('Rubrik-Zahlen nicht verfügbar', e);
  }
}
