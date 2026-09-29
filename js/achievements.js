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
// ============================================================================

import { supabaseClient } from './supabase-client.js';

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
 */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'streak_4',
    title: '4 Wochen am Ball',
    description: 'Mindestens 4 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.',
    icon: '🔥',
    category: 'training',
    progress: (d) => ({ current: Math.min(d.longestStreak || 0, 4), target: 4 }),
    isEarned: (d) => (d.longestStreak || 0) >= 4,
  },
  {
    key: 'streak_13',
    title: '3 Monate durchgehend trainiert',
    description: 'Mindestens 13 Wochen in Folge (ca. ein Quartal) in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.',
    icon: '🏅',
    category: 'training',
    progress: (d) => ({ current: Math.min(d.longestStreak || 0, 13), target: 13 }),
    isEarned: (d) => (d.longestStreak || 0) >= 13,
  },
  {
    key: 'streak_26',
    title: 'Halbes Jahr durchgehend trainiert',
    description: 'Mindestens 26 Wochen in Folge in jeder Kalenderwoche mindestens eine Trainingseinheit absolviert.',
    icon: '🏆',
    category: 'training',
    progress: (d) => ({ current: Math.min(d.longestStreak || 0, 26), target: 26 }),
    isEarned: (d) => (d.longestStreak || 0) >= 26,
  },
  {
    key: 'first_pr',
    title: 'Erste persönliche Bestleistung',
    description: 'Die erste geloggte Bestleistung bei Gewicht, geschätztem 1RM oder Wiederholungen erzielt.',
    icon: '⭐',
    category: 'training',
    progress: (d) => ({ current: Math.min(d.prCount || 0, 1), target: 1 }),
    isEarned: (d) => (d.prCount || 0) >= 1,
  },
  {
    key: 'pr_10',
    title: '10 persönliche Bestleistungen',
    description: '10 persönliche Bestleistungen im Trainingstagebuch gesammelt.',
    icon: '💪',
    category: 'training',
    progress: (d) => ({ current: Math.min(d.prCount || 0, 10), target: 10 }),
    isEarned: (d) => (d.prCount || 0) >= 10,
  },
  {
    key: 'nutrition_30',
    title: '30 Tage Ernährungsprotokoll',
    description: 'An 30 verschiedenen Tagen mindestens eine Mahlzeit im Ernährungsprotokoll erfasst.',
    icon: '🥗',
    category: 'nutrition',
    progress: (d) => ({ current: Math.min(d.nutritionDaysLogged || 0, 30), target: 30 }),
    isEarned: (d) => (d.nutritionDaysLogged || 0) >= 30,
  },
  {
    key: 'prevention_complete',
    title: 'Präventionscheck komplett',
    description: 'Alle Kraftausdauer-, Beweglichkeits- und Herz-Kreislauf-Fitness-Tests des Präventionschecks mindestens einmal eingetragen.',
    icon: '✅',
    category: 'prevention',
    isEarned: (d) => !!d.preventionComplete,
  },
  {
    key: 'cardio_test_done',
    title: 'Herz-Kreislauf-Fitness getestet',
    description: 'Den ersten Cardio-Fitness-Test (Cooper- oder Rockport-Protokoll) durchgeführt.',
    icon: '🫀',
    category: 'prevention',
    isEarned: (d) => !!d.cardioTestDone,
  },
  {
    key: 'monthly_report_first',
    title: 'Erster Monatsbericht',
    description: 'Den ersten persönlichen Monatsbericht als PDF heruntergeladen.',
    icon: '📄',
    category: 'training',
    manual: true,
    isEarned: () => false,
  },
];

/**
 * Wertet alle Definitionen gegen ein Daten-Objekt aus. Erwartete Felder:
 * { longestStreak, prCount, nutritionDaysLogged, preventionComplete, cardioTestDone }
 * – fehlende Felder werden als "nicht erreicht" behandelt, nicht als Fehler.
 */
export function evaluateAchievements(data) {
  return ACHIEVEMENT_DEFINITIONS.map((def) => ({
    ...def,
    earned: def.isEarned(data || {}),
    progress: def.progress ? def.progress(data || {}) : null,
  }));
}

export async function listAchievements(clientId) {
  return supabaseClient.from('achievements').select('*').eq('client_id', clientId);
}

/**
 * Vergibt einen "manuellen" Erfolg direkt (z.B. beim erfolgreichen
 * Monatsbericht-Download) statt ihn aus Daten herzuleiten. Idempotent dank
 * ignoreDuplicates – mehrfaches Aufrufen für denselben Erfolg ist unschädlich.
 */
export async function awardAchievement(clientId, achievementKey, meta) {
  return supabaseClient
    .from('achievements')
    .upsert([{ client_id: clientId, achievement_key: achievementKey, meta: meta || null }], { onConflict: 'client_id,achievement_key', ignoreDuplicates: true })
    .select();
}

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
