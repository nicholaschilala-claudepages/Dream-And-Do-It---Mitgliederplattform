// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 16: Achievements/Erfolge – erweitert die bestehende Streak-/
// Rekord-Anzeige (js/training.js, Runde 15) um ein kleines Katalog-System
// aus Meilensteinen über mehrere Module hinweg (Training, Ernährung,
// Präventionscheck).
//
// Bewusst einfach gehalten: alle Bedingungen werden rein client-seitig aus
// bereits vorhandenen Daten berechnet (genau wie der Präventions-Score und
// die Trainings-Streak selbst) – hier wird nur das Ergebnis (welcher Erfolg
// wann freigeschaltet wurde) in der Tabelle "achievements" persistiert,
// damit Kunde und Trainer denselben Stand sehen und der "neu
// freigeschaltet"-Hinweis nicht bei jedem Laden erneut erscheint.
//
// Evidenzlage zur Einordnung (siehe Nutzer-Feedback-Gespräch Runde 16):
// eine Metaanalyse von 16 RCTs (Yang et al., 2022, JMIR, "Evaluating the
// Effectiveness of Gamification on Physical Activity") fand einen kleinen
// bis moderaten positiven Effekt von Gamification-Elementen auf körperliche
// Aktivität, der über die Zeit spürbar abnimmt – Achievements werden daher
// bewusst als motivierende Ergänzung zur bestehenden Streak positioniert,
// nicht als alleinige Bindungsstrategie.
//
// Q5 (Rekorde & Erfolge für 24 Monate): der Katalog ist jetzt in Stufenserien
// (Bronze bis Krone) gegliedert, die über zwei Jahre "mitwachsen". Dieselbe
// Datei liefert außerdem die komplette Auswertung für die Seite erfolge.html
// (Rekorde-Board, "Dein Training in Zahlen", 24-Monats-Zeitstrahl, Rückblicke
// bei Monat 6/12/24) – als reine Berechnungsfunktionen ohne DOM-Zugriff, damit
// sie sich in Node mit synthetischen Daten testen lassen. Es ist KEIN SQL
// nötig: achievements.achievement_key ist freier Text, alles Weitere wird
// aus bereits vorhandenen Tabellen im Browser berechnet.
// ============================================================================

import { supabaseClient } from './supabase-client.js';
import { computePersonalRecords, computeTrainingStreak, estimate1RM } from './training.js';
// Namespace-Import (statt benannter Importe): prevention.js wird parallel
// weiterentwickelt (Testüberarbeitung). Fehlt künftig eine Funktion, bricht
// dadurch nicht das Laden dieses Moduls ab, sondern nur die jeweilige
// Teilauswertung (siehe Guards mit typeof unten).
import * as Prevention from './prevention.js';

// ---------------------------------------------------------------------------
// Katalog: Stufenserien
// ---------------------------------------------------------------------------

export const TIER_MEDALS = ['🥉', '🥈', '🥇', '💎', '👑'];
export const TIER_NAMES = ['Bronze', 'Silber', 'Gold', 'Diamant', 'Krone'];

// Ab diesem Präventions-Score gilt der Bereich als "grün" (identisch zur
// Farblogik im Monatsbericht-PDF, js/monthly-report.js: >= 80 = grün).
export const SCORE_GREEN_THRESHOLD = 80;
// Mindestanzahl unterschiedlicher Tests, damit ein späterer Messtermin als
// "Retest" und der erste Termin als vollwertiger "erster Check" zählt.
export const RETEST_MIN_TESTS = 3;
export const REVIEW_MONTHS = [6, 12, 24];
export const TIMELINE_MONTHS = [1, 3, 6, 12, 18, 24];

function fmtNumDe(n, digits = 0) {
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * Baut die Definitionen einer Zahlen-Serie (Stufen mit Schwellenwert).
 * `legacy` ordnet bereits vorhandenen Schlüsseln ihren bisherigen Titel/
 * ihr Icon zu, damit bereits vergebene Erfolge unverändert erkennbar bleiben.
 */
function numericSeries({ key, title, subtitle, icon, category, unit, labelUnit = unit, thresholds, keys, metric, describe, titleOf, legacy = {}, progressDigits = 0 }) {
  const defs = thresholds.map((threshold, i) => {
    const k = keys[i];
    const lg = legacy[k] || {};
    return {
      key: k,
      title: lg.title || titleOf(threshold, i),
      description: lg.description || describe(threshold, i),
      icon: lg.icon || TIER_MEDALS[i] || TIER_MEDALS[TIER_MEDALS.length - 1],
      tierIcon: TIER_MEDALS[i] || TIER_MEDALS[TIER_MEDALS.length - 1],
      tierName: TIER_NAMES[i] || '',
      tierLabel: labelUnit ? `${fmtNumDe(threshold)} ${labelUnit}` : fmtNumDe(threshold),
      category,
      series: key,
      tier: i + 1,
      threshold,
      unit,
      progress: (d) => {
        const v = metric(d || {});
        const cur = Math.min(v, threshold);
        const factor = Math.pow(10, progressDigits);
        // abgerundet: ein noch nicht erreichter Erfolg zeigt nie "10/10"
        return { current: Math.floor(cur * factor + 1e-9) / factor, target: threshold };
      },
      isEarned: (d) => metric(d || {}) >= threshold,
    };
  });
  return {
    series: { key, title, subtitle, icon, category, kind: 'tiers', unit, metric, keys: defs.map((x) => x.key), progressDigits },
    defs,
  };
}

/**
 * Baut die Definitionen einer Serie aus Einzelschritten (jeder Schritt hat
 * ein eigenes Icon/eine eigene Bedingung), z. B. Prävention und Coaching.
 */
function stepSeries({ key, title, subtitle, icon, category, steps }) {
  const defs = steps.map((s, i) => ({
    key: s.key,
    title: s.title,
    description: s.description,
    icon: s.icon,
    tierIcon: s.icon,
    tierName: '',
    tierLabel: s.label,
    category,
    series: key,
    tier: i + 1,
    ...(s.manual ? { manual: true } : {}),
    ...(s.progress ? { progress: s.progress } : {}),
    isEarned: s.isEarned,
  }));
  return { series: { key, title, subtitle, icon, category, kind: 'steps', keys: defs.map((x) => x.key) }, defs };
}

const SERIES_BUILDS = [
  numericSeries({
    key: 'streak', title: 'Konstanz', subtitle: 'Wochen in Folge mit mindestens einer Einheit', icon: '🔥', category: 'training', unit: 'Wochen',
    thresholds: [4, 13, 26, 52, 104], keys: ['streak_4', 'streak_13', 'streak_26', 'streak_52', 'streak_104'],
    metric: (d) => d.longestStreak || 0,
    titleOf: (t) => `${t} Wochen durchgehend trainiert`,
    describe: (t) => `Mindestens ${t} Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.`,
    legacy: {
      streak_4: { title: '4 Wochen am Ball', icon: '🔥', description: 'Mindestens 4 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.' },
      streak_13: { title: '3 Monate durchgehend trainiert', icon: '🏅', description: 'Mindestens 13 Wochen in Folge (ca. ein Quartal) in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.' },
      streak_26: { title: 'Halbes Jahr durchgehend trainiert', icon: '🏆', description: 'Mindestens 26 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.' },
      streak_52: { title: 'Ein Jahr durchgehend trainiert', description: 'Mindestens 52 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.' },
      streak_104: { title: 'Zwei Jahre durchgehend trainiert', description: 'Mindestens 104 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.' },
    },
  }),
  numericSeries({
    key: 'sessions', title: 'Trainingseinheiten', subtitle: 'Einheiten insgesamt', icon: '🏋️', category: 'training', unit: 'Einheiten',
    thresholds: [10, 25, 50, 100, 200], keys: ['sessions_10', 'sessions_25', 'sessions_50', 'sessions_100', 'sessions_200'],
    metric: (d) => d.sessionCount || 0,
    titleOf: (t) => `${t} Trainingseinheiten`,
    describe: (t) => `Insgesamt ${t} Trainingseinheiten im Trainingstagebuch erfasst.`,
  }),
  numericSeries({
    key: 'tonnage', title: 'Bewegte Kilos', subtitle: 'Gesamtgewicht aus Gewicht × Wiederholungen', icon: '📦', category: 'training', unit: 't',
    thresholds: [10, 50, 100, 250, 500], keys: ['tonnage_10', 'tonnage_50', 'tonnage_100', 'tonnage_250', 'tonnage_500'],
    metric: (d) => (d.totalVolumeKg || 0) / 1000,
    titleOf: (t) => `${t} Tonnen bewegt`,
    describe: (t) => `Insgesamt ${t} Tonnen bewegt (Summe aus Gewicht × Wiederholungen aller geloggten Sätze).`,
    progressDigits: 1,
  }),
  numericSeries({
    key: 'prs', title: 'Kraft', subtitle: 'Persönliche Bestleistungen', icon: '💪', category: 'training', unit: 'Bestleistungen', labelUnit: '',
    thresholds: [1, 10, 25, 50, 100], keys: ['first_pr', 'pr_10', 'pr_25', 'pr_50', 'pr_100'],
    metric: (d) => d.prCount || 0,
    titleOf: (t) => `${t} persönliche Bestleistungen`,
    describe: (t) => `${t} persönliche Bestleistungen im Trainingstagebuch gesammelt.`,
    legacy: {
      first_pr: { title: 'Erste persönliche Bestleistung', icon: '⭐', description: 'Die erste geloggte Bestleistung bei Gewicht, geschätztem 1RM oder Wiederholungen erzielt.' },
      pr_10: { title: '10 persönliche Bestleistungen', icon: '💪', description: '10 persönliche Bestleistungen im Trainingstagebuch gesammelt.' },
    },
  }),
  numericSeries({
    key: 'nutrition', title: 'Ernährungsprotokoll', subtitle: 'Tage mit mindestens einer erfassten Mahlzeit', icon: '🥗', category: 'nutrition', unit: 'Tage',
    thresholds: [30, 100, 200, 365, 500], keys: ['nutrition_30', 'nutrition_100', 'nutrition_200', 'nutrition_365', 'nutrition_500'],
    metric: (d) => d.nutritionDaysLogged || 0,
    titleOf: (t) => `${t} Tage Ernährungsprotokoll`,
    describe: (t) => `An ${t} verschiedenen Tagen mindestens eine Mahlzeit im Ernährungsprotokoll erfasst.`,
    legacy: {
      nutrition_30: { title: '30 Tage Ernährungsprotokoll', icon: '🥗', description: 'An 30 verschiedenen Tagen mindestens eine Mahlzeit im Ernährungsprotokoll erfasst.' },
    },
  }),
  stepSeries({
    key: 'prevention', title: 'Prävention', subtitle: 'Check, Retests und Präventions-Score', icon: '🫀', category: 'prevention',
    steps: [
      { key: 'prevention_complete', label: 'Check komplett', icon: '✅', title: 'Präventionscheck komplett', description: 'Alle Kraftausdauer-, Beweglichkeits- und Herz-Kreislauf-Fitness-Tests des Präventionschecks mindestens einmal eingetragen.', isEarned: (d) => !!d.preventionComplete },
      { key: 'cardio_test_done', label: 'Herz-Kreislauf getestet', icon: '🫀', title: 'Herz-Kreislauf-Fitness getestet', description: 'Den ersten Cardio-Fitness-Test (Cooper- oder Rockport-Protokoll) durchgeführt.', isEarned: (d) => !!d.cardioTestDone },
      { key: 'prevention_retest_6', label: 'Retest nach 6 Monaten', icon: '🔁', title: 'Retest nach 6 Monaten', description: `Mindestens ${RETEST_MIN_TESTS} Tests des Präventionschecks frühestens 6 Monate nach dem ersten Check erneut durchgeführt.`, isEarned: (d) => (d.preventionRetestMonths || 0) >= 6 },
      { key: 'prevention_retest_12', label: 'Retest nach 12 Monaten', icon: '🔁', title: 'Retest nach 12 Monaten', description: `Mindestens ${RETEST_MIN_TESTS} Tests des Präventionschecks frühestens 12 Monate nach dem ersten Check erneut durchgeführt.`, isEarned: (d) => (d.preventionRetestMonths || 0) >= 12 },
      { key: 'prevention_score_plus10', label: 'Score +10 Punkte', icon: '📈', title: 'Präventions-Score um 10 Punkte verbessert', description: 'Der Präventions-Score liegt mindestens 10 Punkte über dem Wert deines ersten vollwertigen Checks.', progress: (d) => ({ current: Math.max(0, Math.min(Math.round(d.scoreImprovement || 0), 10)), target: 10 }), isEarned: (d) => (d.scoreImprovement || 0) >= 10 },
      { key: 'prevention_score_green', label: 'Score im grünen Bereich', icon: '🎯', title: 'Präventions-Score im grünen Bereich', description: `Der Präventions-Score erreicht mindestens ${SCORE_GREEN_THRESHOLD} von 100 Punkten.`, isEarned: (d) => !!d.scoreGreen },
    ],
  }),
  stepSeries({
    key: 'coaching', title: 'Coaching', subtitle: 'Ziele nach dem GROW-Modell', icon: '🧭', category: 'coaching',
    steps: [
      { key: 'grow_goal_first', label: 'Erstes Ziel angelegt', icon: '🧭', title: 'Erstes GROW-Ziel angelegt', description: 'Das erste persönliche Ziel im Bereich Coaching (GROW) angelegt.', progress: (d) => ({ current: Math.min(d.growGoalsCreated || 0, 1), target: 1 }), isEarned: (d) => (d.growGoalsCreated || 0) >= 1 },
      { key: 'grow_achieved_1', label: '1 Ziel erreicht', icon: '🏁', title: 'Erstes Ziel erreicht', description: 'Ein GROW-Ziel als erreicht abgeschlossen.', progress: (d) => ({ current: Math.min(d.growGoalsAchieved || 0, 1), target: 1 }), isEarned: (d) => (d.growGoalsAchieved || 0) >= 1 },
      { key: 'grow_achieved_3', label: '3 Ziele erreicht', icon: '🥈', title: '3 Ziele erreicht', description: 'Drei GROW-Ziele als erreicht abgeschlossen.', progress: (d) => ({ current: Math.min(d.growGoalsAchieved || 0, 3), target: 3 }), isEarned: (d) => (d.growGoalsAchieved || 0) >= 3 },
      { key: 'grow_achieved_5', label: '5 Ziele erreicht', icon: '🥇', title: '5 Ziele erreicht', description: 'Fünf GROW-Ziele als erreicht abgeschlossen.', progress: (d) => ({ current: Math.min(d.growGoalsAchieved || 0, 5), target: 5 }), isEarned: (d) => (d.growGoalsAchieved || 0) >= 5 },
    ],
  }),
  numericSeries({
    key: 'member', title: 'Dabei seit', subtitle: 'Monate seit deiner Anmeldung', icon: '🗓️', category: 'member', unit: 'Monate',
    thresholds: [3, 6, 12, 18, 24], keys: ['member_3', 'member_6', 'member_12', 'member_18', 'member_24'],
    metric: (d) => d.monthsActive || 0,
    titleOf: (t) => (t === 12 ? 'Ein Jahr dabei' : t === 24 ? 'Zwei Jahre dabei' : `${t} Monate dabei`),
    describe: (t) => `Seit mindestens ${t} Monaten bei Dream And Do It dabei.`,
  }),
  numericSeries({
    key: 'reports', title: 'Monatsberichte', subtitle: 'Heruntergeladene Monatsberichte', icon: '📄', category: 'training', unit: 'Berichte',
    thresholds: [1, 6, 12, 24], keys: ['monthly_report_first', 'monthly_report_6', 'monthly_report_12', 'monthly_report_24'],
    metric: (d) => d.monthlyReports || 0,
    titleOf: (t) => `${t} Monatsberichte`,
    describe: (t) => `${t} persönliche Monatsberichte als PDF heruntergeladen.`,
    legacy: {
      monthly_report_first: { title: 'Erster Monatsbericht', icon: '📄', description: 'Den ersten persönlichen Monatsbericht als PDF heruntergeladen.' },
    },
  }),
];

export const ACHIEVEMENT_SERIES = SERIES_BUILDS.map((b) => b.series);

/**
 * Katalog aller Erfolge. Jede Definition prüft anhand eines gemeinsamen
 * Daten-Objekts (siehe evaluateAchievements()), ob der Erfolg aktuell
 * erreicht ist, und liefert optional einen Fortschritt (current/target) für
 * die Anzeige bei noch nicht erreichten Erfolgen.
 *
 * `manual: true` markiert Erfolge, die nicht aus Daten hergeleitet, sondern
 * an anderer Stelle direkt vergeben werden (siehe awardAchievement()) – für
 * diese liefert isEarned() immer false, der tatsächliche Status kommt aus
 * der bereits in der Datenbank gespeicherten Liste.
 *
 * Neu (Q5): jede Definition gehört zu einer Serie (`series`, `tier`); die
 * bisherigen Schlüssel (streak_4/13/26, first_pr, pr_10, nutrition_30,
 * prevention_complete, cardio_test_done, monthly_report_first) und ihre
 * Titel/Icons sind unverändert, damit bereits vergebene Erfolge erhalten
 * bleiben. "monthly_report_first" bleibt außerdem manuell kompatibel: wer den
 * Schlüssel in der Datenbank hat, gilt als erreicht (siehe isAchievementEarned).
 */
export const ACHIEVEMENT_DEFINITIONS = SERIES_BUILDS.flatMap((b) => b.defs);

const DEFINITION_BY_KEY = new Map(ACHIEVEMENT_DEFINITIONS.map((d) => [d.key, d]));

/**
 * Wertet alle Definitionen gegen ein Daten-Objekt aus. Erwartete Felder:
 * { longestStreak, prCount, nutritionDaysLogged, preventionComplete, cardioTestDone,
 *   sessionCount, totalVolumeKg, monthsActive, monthlyReports, preventionRetestMonths,
 *   scoreImprovement, scoreGreen, growGoalsCreated, growGoalsAchieved }
 * – fehlende Felder werden als "nicht erreicht" behandelt, nicht als Fehler.
 */
export function evaluateAchievements(data) {
  return ACHIEVEMENT_DEFINITIONS.map((def) => ({
    ...def,
    earned: def.isEarned(data || {}),
    progress: def.progress ? def.progress(data || {}) : null,
  }));
}

/**
 * Ob ein Erfolg als erreicht gilt: entweder in der Datenbank vorhanden
 * (bereits vergeben – verschwindet nie wieder) oder aktuell aus den Daten
 * erreicht.
 */
export function isAchievementEarned(evaluatedItem, earnedKeys) {
  return !!(evaluatedItem && (evaluatedItem.earned || (earnedKeys && earnedKeys.has(evaluatedItem.key))));
}

/**
 * Fasst die ausgewerteten Erfolge je Serie zusammen (für Dashboard-Kurzansicht
 * und die Erfolge-Seite): erreichte Stufen, aktuelle Stufe, nächste Stufe samt
 * Fortschritt (0..1).
 */
export function summarizeSeries(evaluated, earnedKeys) {
  const byKey = new Map((evaluated || []).map((e) => [e.key, e]));
  return ACHIEVEMENT_SERIES.map((series) => {
    const items = series.keys.map((k) => byKey.get(k) || { ...DEFINITION_BY_KEY.get(k), earned: false, progress: null })
      .map((it) => ({ ...it, done: isAchievementEarned(it, earnedKeys) }));
    const earnedCount = items.filter((it) => it.done).length;
    const next = items.find((it) => !it.done) || null;
    const nextRatio = next && next.progress && next.progress.target ? Math.min(1, next.progress.current / next.progress.target) : 0;
    return { series, items, earnedCount, total: items.length, currentTier: earnedCount, next, nextRatio, complete: earnedCount === items.length };
  });
}

export async function listAchievements(clientId) {
  return supabaseClient.from('achievements').select('*').eq('client_id', clientId);
}

function localDayStamp(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Vergibt einen "manuellen" Erfolg direkt (z.B. beim erfolgreichen
 * Monatsbericht-Download) statt ihn aus Daten herzuleiten. Idempotent dank
 * ignoreDuplicates – mehrfaches Aufrufen für denselben Erfolg ist unschädlich.
 *
 * Q5: Für die Serie "Monatsberichte" (1/6/12/24) muss mitgezählt werden, wie
 * viele Berichte heruntergeladen wurden. Dafür legt der Download zusätzlich
 * eine Zählzeile "monthly_report_dl_<Tag>" an (max. eine je Kalendertag, Teil
 * derselben Anfrage). Die Zählzeilen gehören zu keiner Definition und tauchen
 * in keiner Erfolge-Ansicht auf; erfolge.html zählt sie in loadAchievementRaw().
 */
export async function awardAchievement(clientId, achievementKey, meta) {
  const rows = [{ client_id: clientId, achievement_key: achievementKey, meta: meta || null }];
  if (achievementKey === 'monthly_report_first') {
    rows.push({ client_id: clientId, achievement_key: `${REPORT_DOWNLOAD_KEY_PREFIX}${localDayStamp()}`, meta: null });
  }
  return supabaseClient
    .from('achievements')
    .upsert(rows, { onConflict: 'client_id,achievement_key', ignoreDuplicates: true })
    .select();
}

export const REPORT_DOWNLOAD_KEY_PREFIX = 'monthly_report_dl_';

/**
 * Schreibt alle neu erreichten (nicht-manuellen) Erfolge aus einer bereits
 * ausgewerteten Liste (evaluateAchievements()) in die Datenbank. Wird von
 * der aufrufenden Seite typischerweise nur für Erfolge aufgerufen, die noch
 * nicht in der vorher geladenen Liste (listAchievements()) enthalten waren.
 */
export async function syncEarnedAchievements(clientId, newlyEarned) {
  const rows = (newlyEarned || []).filter((a) => a.earned && !a.manual).map((a) => ({ client_id: clientId, achievement_key: a.key }));
  if (!rows.length) return { data: [], error: null };
  return supabaseClient
    .from('achievements')
    .upsert(rows, { onConflict: 'client_id,achievement_key', ignoreDuplicates: true })
    .select();
}

// ============================================================================
// Datum/Zeit-Helfer (alle in lokaler Zeit des Geräts – "Tag" = lokaler
// Kalendertag, so wie auch die Trainings-Streak in js/training.js rechnet)
// ============================================================================

const DAY_MS = 86400000;

export function localDayKey(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "YYYY-MM-DD" -> Date um 00:00 lokaler Zeit.
export function parseDayKey(key) {
  const [y, m, d] = String(key).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfLocalDay(input) {
  const d = new Date(input);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Datum + n Monate; ein 31. wird bei kürzeren Monaten auf den letzten Tag gekürzt. Ergebnis: 00:00 lokal. */
export function addMonths(input, n) {
  const d = startOfLocalDay(input);
  const total = d.getMonth() + n;
  const year = d.getFullYear() + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return new Date(year, month, Math.min(d.getDate(), daysInMonth(year, month)));
}

/** Volle Monate zwischen zwei Daten (>= 0), konsistent zu addMonths(). */
export function wholeMonthsBetween(from, to) {
  const f = startOfLocalDay(from);
  const t = startOfLocalDay(to);
  if (t < f) return 0;
  let months = (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
  while (addMonths(f, months + 1) <= t) months += 1;
  while (months > 0 && addMonths(f, months) > t) months -= 1;
  return months;
}

/** Differenz in ganzen lokalen Kalendertagen (b - a). */
export function dayDiff(a, b) {
  const x = startOfLocalDay(a);
  const y = startOfLocalDay(b);
  return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / DAY_MS);
}

// ISO-8601-Kalenderwoche (Montag = Wochenbeginn) eines lokalen Datums.
export function isoWeekInfo(input) {
  const src = new Date(input);
  const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const ftDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ftDay + 3);
  const week = 1 + Math.round((d - firstThursday) / (7 * DAY_MS));
  return { year: d.getUTCFullYear(), week, key: `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`, label: `KW ${week}/${d.getUTCFullYear()}` };
}

const MONTH_NAMES_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const WEEKDAY_NAMES_DE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function monthLabelOfKey(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES_DE[m - 1]} ${y}`;
}

function ageAt(birthDate, onDayKey) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const on = parseDayKey(onDayKey);
  let age = on.getFullYear() - b.getFullYear();
  const m = on.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < b.getDate())) age -= 1;
  return age;
}

// ============================================================================
// Datenbeschaffung
// ============================================================================

const PAGE_SIZE = 1000; // Supabase/PostgREST liefert standardmäßig max. 1000 Zeilen je Anfrage

async function fetchAllPages(buildQuery, maxPages = 40) {
  const rows = [];
  for (let page = 0; page < maxPages; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { data: rows, error: null };
}

async function safely(label, fn, warnings) {
  try {
    const res = await fn();
    if (res && res.error) {
      warnings.push(`${label}: ${res.error.message || res.error}`);
      return res.data || [];
    }
    return (res && res.data) || [];
  } catch (err) {
    warnings.push(`${label}: ${err && err.message ? err.message : err}`);
    return [];
  }
}

/**
 * Lädt alle Rohdaten, die Erfolge/Rekorde/Rückblicke brauchen. Robust: jede
 * Quelle wird einzeln abgesichert (fehlende Tabelle, RLS-Fehler, Netzwerk) –
 * eine fehlschlagende Quelle liefert eine leere Liste und einen Eintrag in
 * `warnings`, die Seite bricht nie. Seitenweises Nachladen (range), weil die
 * API sonst bei 1000 Zeilen abschneidet – über 24 Monate Training/Ernährung
 * kommt das schnell zusammen.
 *
 * @param {string} clientId
 * @param {{trainingEnabled?:boolean,nutritionEnabled?:boolean,coachingEnabled?:boolean}} [access]
 */
export async function loadAchievementRaw(clientId, access = {}) {
  const { trainingEnabled = true, nutritionEnabled = true, coachingEnabled = true } = access;
  const warnings = [];
  const db = supabaseClient;

  const [profile, logs, plans, preventionResults, bodyMeasurements, nutritionRows, goals, achievementRows] = await Promise.all([
    safely('profiles', async () => {
      const { data, error } = await db.from('profiles').select('*').eq('id', clientId).maybeSingle();
      return { data: data ? [data] : [], error };
    }, warnings),
    trainingEnabled
      ? safely('training_logs', () => fetchAllPages(() => db.from('training_logs')
        .select('id, performed_at, session_id, exercise_id, set_number, reps, weight_kg, duration_seconds, distance_meters, exercises(id, name, category, muscle_group, movement_pattern)')
        .eq('client_id', clientId).order('performed_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    trainingEnabled
      ? safely('training_plans', () => fetchAllPages(() => db.from('training_plans').select('id, title, is_active, created_at').eq('client_id', clientId).order('created_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    trainingEnabled
      ? safely('prevention_test_results', () => fetchAllPages(() => db.from('prevention_test_results').select('*').eq('client_id', clientId).order('measured_at', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    trainingEnabled
      ? safely('body_measurements', () => fetchAllPages(() => db.from('body_measurements').select('*').eq('client_id', clientId).order('measured_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    nutritionEnabled
      ? safely('nutrition_logs', () => fetchAllPages(() => db.from('nutrition_logs').select('id, logged_at').eq('client_id', clientId).order('logged_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    coachingEnabled
      ? safely('coaching_goals', () => fetchAllPages(() => db.from('coaching_goals').select('id, status, created_at, updated_at').eq('client_id', clientId).order('created_at', { ascending: true }).order('id', { ascending: true })), warnings)
      : Promise.resolve([]),
    safely('achievements', () => listAchievements(clientId), warnings),
  ]);

  return {
    clientId,
    profile: (profile && profile[0]) || null,
    logs,
    plans,
    preventionResults,
    bodyMeasurements,
    nutritionTimestamps: nutritionRows.map((r) => r.logged_at).filter(Boolean),
    goals,
    achievementRows,
    access: { trainingEnabled, nutritionEnabled, coachingEnabled },
    warnings,
  };
}

/**
 * Komfortfunktion für Seiten, die nur die Erfolge-Datenbasis brauchen (z. B.
 * dashboard.html): lädt die Rohdaten und liefert das fertige Daten-Objekt für
 * evaluateAchievements(). Wirft nie – im Fehlerfall ein leeres Daten-Objekt.
 */
export async function loadAchievementData(clientId, access = {}) {
  try {
    const raw = await loadAchievementRaw(clientId, access);
    return { data: buildAchievementData(raw), raw, warnings: raw.warnings };
  } catch (err) {
    return { data: buildAchievementData({}), raw: null, warnings: [err && err.message ? err.message : String(err)] };
  }
}

// ============================================================================
// Auswertung (reine Funktionen, kein Netzwerk/DOM)
// ============================================================================

function isCardio(log) {
  const cat = log && log.exercises && log.exercises.category;
  // Runde 22 (Nachtrag 5): Kursformate ("Kurs: Yoga" …) sind Dauer-Einheiten und zählen zur Ausdauer-/Zeit-Auswertung.
  const name = log && log.exercises && log.exercises.name;
  if (typeof name === 'string' && /^Kurs:\s/.test(name)) return true;
  return typeof cat === 'string' && cat.trim().toLowerCase() === 'cardio';
}

function logVolume(log) {
  const w = Number(log.weight_kg) || 0;
  const r = Number(log.reps) || 0;
  return w > 0 && r > 0 ? w * r : 0;
}

/**
 * Trainingseinheiten ("Einheiten") aus den Logs: Sätze mit session_id gehören
 * zu einer Session, Sätze ohne session_id (ältere Einträge) werden – genau wie
 * im Trainingstagebuch von training.html – nach Kalendertag gruppiert.
 * Der Tag einer Einheit ist der lokale Tag ihres ersten Satzes.
 */
export function buildUnits(logs) {
  const map = new Map();
  for (const l of logs || []) {
    if (!l || !l.performed_at) continue;
    const t = new Date(l.performed_at).getTime();
    if (Number.isNaN(t)) continue;
    const key = l.session_id ? `s:${l.session_id}` : `d:${localDayKey(t)}`;
    let u = map.get(key);
    if (!u) { u = { key, firstTs: t, volumeKg: 0, sets: 0 }; map.set(key, u); }
    if (t < u.firstTs) u.firstTs = t;
    u.sets += 1;
    u.volumeKg += logVolume(l);
  }
  const units = Array.from(map.values()).sort((a, b) => a.firstTs - b.firstTs);
  for (const u of units) {
    u.dayKey = localDayKey(u.firstTs);
    const [y, m, d] = u.dayKey.split('-').map(Number);
    u.weekday = (new Date(y, m - 1, d).getDay() + 6) % 7; // 0 = Montag ... 6 = Sonntag
    u.week = isoWeekInfo(u.firstTs);
    u.monthKey = u.dayKey.slice(0, 7);
  }
  return units;
}

function longestDayRun(dayKeys) {
  const nums = Array.from(new Set(dayKeys)).map((k) => { const d = parseDayKey(k); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS; }).sort((a, b) => a - b);
  if (!nums.length) return 0;
  let best = 1; let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] - nums[i - 1] === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** Rohdaten auf den Stand eines Stichtags (Millisekunden) beschränken – Grundlage der Rückblicke. */
export function filterRawUntil(raw, cutoffMs) {
  const cutoffDay = localDayKey(cutoffMs);
  const upTo = (ts) => ts && new Date(ts).getTime() <= cutoffMs;
  return {
    ...raw,
    logs: (raw.logs || []).filter((l) => upTo(l.performed_at)),
    plans: (raw.plans || []).filter((p) => upTo(p.created_at)),
    preventionResults: (raw.preventionResults || []).filter((r) => r.measured_at && String(r.measured_at).slice(0, 10) <= cutoffDay),
    bodyMeasurements: (raw.bodyMeasurements || []).filter((m) => m.measured_at && String(m.measured_at).slice(0, 10) <= cutoffDay),
    nutritionTimestamps: (raw.nutritionTimestamps || []).filter(upTo),
    goals: (raw.goals || []).filter((g) => upTo(g.created_at)).map((g) => (g.status === 'achieved' && !upTo(g.updated_at || g.created_at) ? { ...g, status: 'active' } : g)),
    achievementRows: (raw.achievementRows || []).filter((a) => !a.earned_at || upTo(a.earned_at)),
  };
}

/**
 * Präventions-Score zu Stichtagen: je Messtermin (und zusätzlich zum
 * Stichtag selbst) wird der Score mit derselben Funktion wie in der App
 * (Prevention.computePreventionScore) aus dem damaligen Stand berechnet –
 * neueste Testwerte bis dahin, Alter zum Stichtag, zuletzt bekannte
 * Körperfett-/Geschlechtsangabe, Trainings-Balance aus den Logs bis dahin.
 */
export function computeScoreHistory(raw, { now = new Date() } = {}) {
  if (typeof Prevention.computePreventionScore !== 'function' || typeof Prevention.latestByKey !== 'function') return [];
  const results = (raw.preventionResults || [])
    .filter((r) => r && r.measured_at && r.value != null && r.test_key)
    .map((r) => ({ ...r, _day: String(r.measured_at).slice(0, 10) }))
    .sort((a, b) => (a._day < b._day ? -1 : a._day > b._day ? 1 : 0));
  if (!results.length) return [];

  const profile = raw.profile || {};
  const bodies = (raw.bodyMeasurements || []).filter((m) => m.measured_at).map((m) => ({ ...m, _day: String(m.measured_at).slice(0, 10) })).sort((a, b) => (a._day < b._day ? -1 : 1));
  const logs = (raw.logs || []).filter((l) => l.performed_at && l.exercises && l.exercises.movement_pattern && l.exercises.movement_pattern !== 'sonstige')
    .map((l) => ({ day: localDayKey(l.performed_at), pattern: l.exercises.movement_pattern, vol: logVolume(l) })).filter((l) => l.vol > 0 && l.day).sort((a, b) => (a.day < b.day ? -1 : 1));

  const todayKey = localDayKey(now);
  const days = Array.from(new Set(results.map((r) => r._day)));
  if (!days.includes(todayKey) && days[days.length - 1] < todayKey) days.push(todayKey);

  const BALANCE_PAIRS = [['push_oberkoerper', 'pull_oberkoerper'], ['vordere_beinkette', 'hintere_beinkette'], ['rumpf_vorne', 'rumpf_hinten']];
  const history = [];
  for (const day of days) {
    const upTo = results.filter((r) => r._day <= day);
    if (!upTo.length) continue;
    const latest = Prevention.latestByKey(upTo);
    const keys = new Set(upTo.map((r) => r.test_key).filter((k) => k !== 'bp_diastolic')); // Blutdruck zählt als ein Test
    const bodiesUpTo = bodies.filter((m) => m._day <= day);
    const lastBody = bodiesUpTo[bodiesUpTo.length - 1] || null;
    const lastFat = [...bodiesUpTo].reverse().find((m) => m.body_fat_percent != null) || null;
    const sex = profile.sex || null; // Runde 19: Geschlecht nur noch aus profiles.sex
    const totals = {};
    for (const l of logs) { if (l.day > day) break; totals[l.pattern] = (totals[l.pattern] || 0) + l.vol; }
    const balancePairRatios = BALANCE_PAIRS.map(([a, b]) => {
      const av = totals[a] || 0; const bv = totals[b] || 0;
      if (av === 0 && bv === 0) return { ratio: null };
      if (av === 0 || bv === 0) return { ratio: Infinity };
      return { ratio: Math.max(av, bv) / Math.min(av, bv) };
    });
    let total = null; let breakdown = [];
    try {
      const sc = Prevention.computePreventionScore({ ageYears: ageAt(profile.birth_date, day), sex, latestResults: latest, bodyFatPercent: lastFat ? lastFat.body_fat_percent : null, balancePairRatios });
      total = sc.total; breakdown = sc.breakdown || [];
    } catch (err) { total = null; }
    history.push({ date: day, total, breakdown, testCount: keys.size, isToday: day === todayKey && !results.some((r) => r._day === day) });
  }
  return history.filter((h) => h.total != null);
}

/** Ergebnis der Retest-Logik: 0, 6 oder 12 (größte erreichte Stufe). */
export function computeRetestMonths(results) {
  const dated = (results || []).filter((r) => r && r.measured_at && r.test_key && r.test_key !== 'bp_diastolic').map((r) => ({ key: r.test_key, day: String(r.measured_at).slice(0, 10) }));
  if (!dated.length) return 0;
  const first = dated.reduce((m, r) => (r.day < m ? r.day : m), dated[0].day);
  for (const months of [12, 6]) {
    const threshold = localDayKey(addMonths(parseDayKey(first), months));
    const keys = new Set(dated.filter((r) => r.day >= threshold).map((r) => r.key));
    if (keys.size >= RETEST_MIN_TESTS) return months;
  }
  return 0;
}

/**
 * Berechnet das Daten-Objekt für evaluateAchievements() aus den Rohdaten.
 * Fehlende Quellen führen zu 0/false, nie zu einem Fehler.
 */
export function buildAchievementData(raw, { now = new Date(), scoreHistory = null } = {}) {
  const r = raw || {};
  const logs = r.logs || [];
  const units = buildUnits(logs);

  let longestStreak = 0; let currentStreak = 0; let prCount = 0;
  try {
    const streak = computeTrainingStreak(logs.map((l) => l.performed_at), { now });
    longestStreak = streak.longestStreak; currentStreak = streak.currentStreak;
    prCount = computePersonalRecords(logs).prEvents.length;
  } catch (err) { /* defekte Daten: Werte bleiben 0 */ }

  const nutritionDays = new Set((r.nutritionTimestamps || []).map((ts) => localDayKey(ts)).filter(Boolean));
  const results = r.preventionResults || [];
  let preventionComplete = false;
  try { preventionComplete = typeof Prevention.isPreventionCheckComplete === 'function' ? !!results.length && Prevention.isPreventionCheckComplete(results) : false; } catch (err) { preventionComplete = false; }
  const cardioTestDone = results.some((x) => x.test_key === 'cardio_fitness');

  const history = scoreHistory || computeScoreHistory(r, { now });
  const baseline = history.find((h) => h.testCount >= RETEST_MIN_TESTS) || null;
  const current = history.length ? history[history.length - 1] : null;
  const scoreImprovement = baseline && current && history.indexOf(baseline) < history.length - 1 ? current.total - baseline.total : 0;

  const createdAt = r.profile && r.profile.created_at ? new Date(r.profile.created_at) : null;
  const monthsActive = createdAt && !Number.isNaN(createdAt.getTime()) ? wholeMonthsBetween(createdAt, now) : 0;

  const rows = r.achievementRows || [];
  const reportDownloads = rows.filter((a) => String(a.achievement_key || '').startsWith(REPORT_DOWNLOAD_KEY_PREFIX)).length;
  const reportFirst = rows.some((a) => a.achievement_key === 'monthly_report_first') ? 1 : 0;

  const goals = r.goals || [];
  return {
    longestStreak, currentStreak, prCount,
    sessionCount: units.length,
    totalVolumeKg: units.reduce((s, u) => s + u.volumeKg, 0),
    nutritionDaysLogged: nutritionDays.size,
    preventionComplete, cardioTestDone,
    preventionRetestMonths: computeRetestMonths(results),
    scoreCurrent: current ? current.total : null,
    scoreBaseline: baseline ? baseline.total : null,
    scoreImprovement,
    scoreGreen: !!current && current.total >= SCORE_GREEN_THRESHOLD,
    growGoalsCreated: goals.length,
    growGoalsAchieved: goals.filter((g) => g.status === 'achieved').length,
    monthsActive,
    monthlyReports: Math.max(reportDownloads, reportFirst),
  };
}

// ---------------------------------------------------------------------------
// 24-Monats-Zeitstrahl
// ---------------------------------------------------------------------------

export function computeTimeline(createdAtInput, now = new Date()) {
  const created = createdAtInput ? new Date(createdAtInput) : null;
  if (!created || Number.isNaN(created.getTime())) return null;
  const start = startOfLocalDay(created);
  const monthsDone = wholeMonthsBetween(start, now);
  const lo = addMonths(start, monthsDone);
  const hi = addMonths(start, monthsDone + 1);
  const frac = Math.max(0, Math.min(1, (startOfLocalDay(now) - lo) / Math.max(1, hi - lo)));
  const progressMonths = Math.min(24, monthsDone + (monthsDone >= 24 ? 0 : frac));
  const milestones = TIMELINE_MONTHS.map((months) => {
    const date = addMonths(start, months);
    const daysLeft = dayDiff(now, date);
    return { months, date, reached: daysLeft <= 0, daysLeft: Math.max(0, daysLeft), hasReview: REVIEW_MONTHS.includes(months) };
  });
  const next = milestones.find((m) => !m.reached) || null;
  return { start, monthsDone, month: Math.min(24, monthsDone + 1), progressMonths, progressPct: (progressMonths / 24) * 100, milestones, next, complete: !next };
}

// ---------------------------------------------------------------------------
// Rekorde-Board + "Dein Training in Zahlen"
// ---------------------------------------------------------------------------

function bestOf(items, scoreFn) {
  let best = null;
  for (const it of items) { const s = scoreFn(it); if (best === null || s > best.score) best = { score: s, item: it }; }
  return best;
}

function groupSum(units, keyFn, valFn) {
  const m = new Map();
  for (const u of units) { const k = keyFn(u); m.set(k, (m.get(k) || 0) + valFn(u)); }
  return m;
}

function shortTestLabel(label) {
  const m = /\(([^)]+)\)/.exec(label || '');
  return m ? m[1] : (label || '');
}

const UNIT_SHORT = { Sekunden: 'Sek.', Wiederholungen: 'Wdh.' };

export function computeRecordsBoard(raw, { now = new Date(), scoreHistory = null } = {}) {
  const logs = raw.logs || [];
  const units = buildUnits(logs);

  // --- Kraft je Übung (ohne Cardio) ------------------------------------
  const byEx = new Map();
  for (const l of logs) {
    if (!l || !l.exercise_id || !l.performed_at || isCardio(l)) continue;
    if (!byEx.has(l.exercise_id)) byEx.set(l.exercise_id, { exerciseId: l.exercise_id, name: (l.exercises && l.exercises.name) || 'Unbekannte Übung', muscleGroup: (l.exercises && l.exercises.muscle_group) || null, logs: [] });
    byEx.get(l.exercise_id).logs.push(l);
  }
  const strength = [];
  for (const ex of byEx.values()) {
    const sorted = ex.logs.slice().sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at));
    let bestWeight = null; let bestE1 = null; let maxReps = null;
    for (const l of sorted) {
      const w = Number(l.weight_kg) || 0; const reps = Number(l.reps) || 0;
      if (!reps) continue;
      if (w > 0 && (!bestWeight || w > bestWeight.kg)) bestWeight = { kg: w, reps, at: l.performed_at };
      const e = w > 0 ? estimate1RM(w, reps) : 0;
      if (e > 0 && (!bestE1 || e > bestE1.kg * 1.0001)) bestE1 = { kg: e, weightKg: w, reps, at: l.performed_at };
      if (!maxReps || reps > maxReps.reps) maxReps = { reps, weightKg: w, at: l.performed_at };
    }
    // "Seit Start": Bestwerte des ersten Trainingstags dieser Übung als Ausgangspunkt.
    const firstDay = localDayKey(sorted[0].performed_at);
    const firstLogs = sorted.filter((l) => localDayKey(l.performed_at) === firstDay);
    const f = { weight: 0, e1: 0, reps: 0 };
    for (const l of firstLogs) {
      const w = Number(l.weight_kg) || 0; const reps = Number(l.reps) || 0;
      if (!reps) continue;
      if (w > f.weight) f.weight = w;
      f.e1 = Math.max(f.e1, w > 0 ? estimate1RM(w, reps) : 0);
      f.reps = Math.max(f.reps, reps);
    }
    const days = new Set(sorted.map((l) => localDayKey(l.performed_at)));
    const gain = (cur, base) => (cur != null && base > 0 && days.size >= 2 && cur - base > 0.0001 ? cur - base : null);
    if (!bestWeight && !maxReps) continue;
    strength.push({
      exerciseId: ex.exerciseId, name: ex.name, muscleGroup: ex.muscleGroup, sessions: days.size, sets: sorted.length,
      bestWeight, bestE1RM: bestE1, maxReps,
      gainWeight: gain(bestWeight && bestWeight.kg, f.weight),
      gainE1RM: gain(bestE1 && bestE1.kg, f.e1),
      gainReps: gain(maxReps && maxReps.reps, f.reps),
    });
  }
  strength.sort((a, b) => b.sessions - a.sessions || b.sets - a.sets || a.name.localeCompare(b.name, 'de'));

  // --- Konstanz & Volumen ----------------------------------------------
  let streak = { currentStreak: 0, longestStreak: 0 };
  try { streak = computeTrainingStreak(logs.map((l) => l.performed_at), { now }); } catch (err) { /* ignorieren */ }
  const perWeek = groupSum(units, (u) => u.week.key, () => 1);
  const weekLabel = new Map(units.map((u) => [u.week.key, u.week.label]));
  const bestWeekSessions = bestOf(Array.from(perWeek.entries()), ([, n]) => n);
  const perMonthSessions = groupSum(units, (u) => u.monthKey, () => 1);
  const bestMonthSessions = bestOf(Array.from(perMonthSessions.entries()), ([, n]) => n);
  const weekVolume = groupSum(units, (u) => u.week.key, (u) => u.volumeKg);
  const bestWeekVolume = bestOf(Array.from(weekVolume.entries()), ([, v]) => v);
  const monthVolume = groupSum(units, (u) => u.monthKey, (u) => u.volumeKg);
  const bestMonthVolume = bestOf(Array.from(monthVolume.entries()), ([, v]) => v);
  const bestSession = bestOf(units, (u) => u.volumeKg);
  const consistency = {
    longestStreak: streak.longestStreak, currentStreak: streak.currentStreak,
    streakRunning: streak.currentStreak > 0 && streak.currentStreak === streak.longestStreak,
    mostSessionsInWeek: bestWeekSessions ? { count: bestWeekSessions.score, label: weekLabel.get(bestWeekSessions.item[0]) } : null,
    mostSessionsInMonth: bestMonthSessions ? { count: bestMonthSessions.score, label: monthLabelOfKey(bestMonthSessions.item[0]) } : null,
    bestWeekVolume: bestWeekVolume && bestWeekVolume.score > 0 ? { kg: bestWeekVolume.score, label: weekLabel.get(bestWeekVolume.item[0]) } : null,
    bestMonthVolume: bestMonthVolume && bestMonthVolume.score > 0 ? { kg: bestMonthVolume.score, label: monthLabelOfKey(bestMonthVolume.item[0]) } : null,
    bestSessionVolume: bestSession && bestSession.score > 0 ? { kg: bestSession.score, date: bestSession.item.dayKey } : null,
    totalSessions: units.length,
  };

  // --- Prävention: beste Testwerte + bester Score -----------------------
  const results = (raw.preventionResults || []).filter((x) => x && x.value != null && x.test_key);
  const testDefs = [];
  for (const t of (Prevention.STRENGTH_TESTS || [])) testDefs.push({ key: t.key, label: shortTestLabel(t.label), unit: UNIT_SHORT[t.unit] || t.unit || '' });
  testDefs.push({ key: 'cardio_fitness', label: 'VO2max (Herz-Kreislauf)', unit: 'ml/kg/min', decimals: 1 });
  const testBests = [];
  for (const def of testDefs) {
    const rows = results.filter((x) => x.test_key === def.key).sort((a, b) => (String(a.measured_at) < String(b.measured_at) ? -1 : 1));
    if (!rows.length) continue;
    const best = rows.reduce((m, x) => (Number(x.value) > Number(m.value) ? x : m), rows[0]);
    const first = rows[0];
    testBests.push({ ...def, value: Number(best.value), side: best.side || null, date: String(best.measured_at).slice(0, 10), count: rows.length, gain: rows.length >= 2 && Number(best.value) > Number(first.value) ? Number(best.value) - Number(first.value) : null });
  }
  const history = scoreHistory || computeScoreHistory(raw, { now });
  const bestScore = bestOf(history, (h) => h.total);
  const prevention = {
    tests: testBests,
    bestScore: bestScore ? { value: bestScore.score, date: bestScore.item.date } : null,
    currentScore: history.length ? history[history.length - 1].total : null,
    scoreCount: history.length,
  };

  // --- Ernährung & Coaching ----------------------------------------------
  const nutritionDays = Array.from(new Set((raw.nutritionTimestamps || []).map((ts) => localDayKey(ts)).filter(Boolean)));
  const goals = raw.goals || [];
  const nutritionCoaching = {
    longestNutritionRun: longestDayRun(nutritionDays),
    nutritionDays: nutritionDays.length,
    goalsCreated: goals.length,
    goalsAchieved: goals.filter((g) => g.status === 'achieved').length,
  };

  return { strength, consistency, prevention, nutritionCoaching, scoreHistory: history };
}

/** "Dein Training in Zahlen" – Statistiken, keine Rekorde im engen Sinn. */
export function computeTrainingNumbers(raw) {
  const logs = raw.logs || [];
  const units = buildUnits(logs);

  const muscle = new Map();
  const exStats = new Map();
  const cardio = new Map();
  for (const l of logs) {
    if (!l || !l.performed_at) continue;
    const ex = l.exercises || {};
    const name = ex.name || 'Unbekannte Übung';
    const key = l.exercise_id || name;
    const unitKey = l.session_id ? `s:${l.session_id}` : `d:${localDayKey(l.performed_at)}`;
    if (!exStats.has(key)) exStats.set(key, { name, unitKeys: new Set(), sets: 0 });
    const es = exStats.get(key); es.unitKeys.add(unitKey); es.sets += 1;
    if (isCardio(l)) {
      const secs = Number(l.duration_seconds) || 0;
      if (secs > 0) {
        if (!cardio.has(key)) cardio.set(key, { name, seconds: 0, unitKeys: new Set() });
        const c = cardio.get(key); c.seconds += secs; c.unitKeys.add(unitKey);
      }
    } else if (ex.muscle_group) {
      muscle.set(ex.muscle_group, (muscle.get(ex.muscle_group) || 0) + logVolume(l));
    }
  }

  const muscleList = Array.from(muscle.entries()).map(([name, kg]) => ({ name, kg })).filter((m) => m.kg > 0).sort((a, b) => b.kg - a.kg);
  const muscleTotal = muscleList.reduce((s, m) => s + m.kg, 0);
  const favoriteEx = Array.from(exStats.values()).sort((a, b) => b.unitKeys.size - a.unitKeys.size || b.sets - a.sets || a.name.localeCompare(b.name, 'de'))[0] || null;
  const topCardio = Array.from(cardio.values()).sort((a, b) => b.seconds - a.seconds)[0] || null;

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const u of units) weekdayCounts[u.weekday] += 1;
  const maxCount = Math.max(...weekdayCounts);
  const MIN_UNITS_FOR_FAVORITE_DAY = 3;

  const plans = raw.plans || [];
  return {
    plans: { count: plans.length, active: plans.filter((p) => p.is_active).length },
    strongestMuscleGroup: muscleList.length ? { name: muscleList[0].name, kg: muscleList[0].kg, share: muscleTotal ? muscleList[0].kg / muscleTotal : 0, top: muscleList.slice(0, 5).map((m) => ({ ...m, share: muscleTotal ? m.kg / muscleTotal : 0 })) } : null,
    favoriteExercise: favoriteEx ? { name: favoriteEx.name, sessions: favoriteEx.unitKeys.size, sets: favoriteEx.sets } : null,
    topCardio: topCardio ? { name: topCardio.name, seconds: topCardio.seconds, sessions: topCardio.unitKeys.size } : null,
    favoriteDay: units.length >= MIN_UNITS_FOR_FAVORITE_DAY && maxCount > 0
      ? { index: weekdayCounts.indexOf(maxCount), name: WEEKDAY_NAMES_DE[weekdayCounts.indexOf(maxCount)], count: maxCount, counts: weekdayCounts, total: units.length, tie: weekdayCounts.filter((c) => c === maxCount).length > 1 }
      : { index: null, name: null, count: 0, counts: weekdayCounts, total: units.length, tie: false, tooFew: true },
    totalSessions: units.length,
  };
}

// ---------------------------------------------------------------------------
// Rückblicke bei Monat 6 / 12 / 24
// ---------------------------------------------------------------------------

/**
 * Rückblick-Daten für einen Meilenstein. `unlocked` ist erst ab dem
 * Meilenstein-Datum (Anmeldedatum + N Monate) wahr; vorher liefert die
 * Funktion nur Datum und Resttage. Der Zeitraum reicht vom Start bis zum
 * Meilensteintag (kumulativ). Erfolge "im Zeitraum" werden aus dem damaligen
 * Datenstand neu berechnet (nicht aus achievements.earned_at, das bei
 * nachträglicher Auswertung das Auswertungsdatum trüge).
 */
export function computeReview(raw, months, { now = new Date(), previousKeys = null } = {}) {
  const created = raw.profile && raw.profile.created_at ? new Date(raw.profile.created_at) : null;
  if (!created || Number.isNaN(created.getTime())) return { months, unlocked: false, available: false };
  const start = startOfLocalDay(created);
  const unlockDate = addMonths(start, months);
  const daysLeft = dayDiff(now, unlockDate);
  const base = { months, available: true, start, unlockDate, daysLeft: Math.max(0, daysLeft), unlocked: daysLeft <= 0 };
  if (!base.unlocked) return base;

  const cutoffMs = Math.min(now.getTime(), unlockDate.getTime() + DAY_MS - 1);
  const cutoffNow = new Date(cutoffMs);
  const sub = filterRawUntil(raw, cutoffMs);
  // Der Stichtag-Datenstand kennt die Zählzeilen der Berichte nur bis dorthin.
  const history = computeScoreHistory(sub, { now: cutoffNow });
  const data = buildAchievementData(sub, { now: cutoffNow, scoreHistory: history });
  const evaluated = evaluateAchievements(data);
  const earned = evaluated.filter((e) => e.earned || (sub.achievementRows || []).some((a) => a.achievement_key === e.key));
  const earnedKeys = earned.map((e) => e.key);
  const prev = previousKeys ? new Set(previousKeys) : null;
  const newKeys = prev ? earnedKeys.filter((k) => !prev.has(k)) : earnedKeys;
  const board = computeRecordsBoard(sub, { now: cutoffNow, scoreHistory: history });
  const scoreStart = history.length ? history[0] : null;
  const scoreEnd = history.length ? history[history.length - 1] : null;
  return {
    ...base,
    periodEnd: cutoffNow,
    stats: {
      sessionCount: data.sessionCount, totalVolumeKg: data.totalVolumeKg, prCount: data.prCount,
      longestStreak: data.longestStreak, nutritionDays: data.nutritionDaysLogged,
      goalsAchieved: data.growGoalsAchieved,
    },
    scoreHistory: history,
    scoreStart: scoreStart ? scoreStart.total : null,
    scoreEnd: scoreEnd ? scoreEnd.total : null,
    scoreBreakdown: scoreEnd ? scoreEnd.breakdown : [],
    earnedKeys,
    newKeys,
    topRecords: board.strength.filter((s) => s.bestE1RM).sort((a, b) => b.bestE1RM.kg - a.bestE1RM.kg).slice(0, 5),
    // Runde 20: Blutdruck/Ruhepuls (aktuellster Stand bis zum Stichtag) samt Normtabellen-Referenz
    vitals: typeof Prevention.summarizeVitals === 'function'
      ? Prevention.summarizeVitals(sub.preventionResults || [], ageAt((raw.profile || {}).birth_date, localDayKey(cutoffNow)), (raw.profile || {}).sex || null)
      : null,
  };
}

/**
 * Komplettauswertung für erfolge.html in einem Aufruf.
 * @returns {object} { data, evaluated, board, numbers, timeline, reviews, scoreHistory }
 */
export function analyzeAchievements(raw, { now = new Date() } = {}) {
  const scoreHistory = computeScoreHistory(raw, { now });
  const data = buildAchievementData(raw, { now, scoreHistory });
  const evaluated = evaluateAchievements(data);
  const board = computeRecordsBoard(raw, { now, scoreHistory });
  const numbers = computeTrainingNumbers(raw);
  const timeline = computeTimeline(raw.profile && raw.profile.created_at, now);
  const reviews = [];
  let previousKeys = null;
  for (const months of REVIEW_MONTHS) {
    const rv = computeReview(raw, months, { now, previousKeys });
    reviews.push(rv);
    if (rv.unlocked) previousKeys = rv.earnedKeys;
  }
  return { data, evaluated, board, numbers, timeline, reviews, scoreHistory };
}
