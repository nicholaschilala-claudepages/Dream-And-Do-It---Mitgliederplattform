// ============================================================================
// Coaching: Content-Downloads, validierte Fragebögen, GROW-Ziel-Modul
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// Content (PDF-Downloads zu persönlicher Entwicklung)
// ---------------------------------------------------------------------------

export async function listCoachingContent() {
  return supabaseClient.from('coaching_content').select('*').order('category', { ascending: true }).order('title', { ascending: true });
}

export async function createCoachingContent({ title, description, category, pdfUrl }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('coaching_content').insert({
    title, description: description || null, category: category || null,
    pdf_url: pdfUrl, created_by: userId,
  });
}

export async function deleteCoachingContent(id) {
  return supabaseClient.from('coaching_content').delete().eq('id', id);
}

// ---------------------------------------------------------------------------
// Fragebögen (validierte Skalen)
// ---------------------------------------------------------------------------

/**
 * Datengetriebene Fragebogen-Definitionen. Neue Skalen lassen sich einfach
 * als weiteres Objekt in diesem Array ergänzen, ohne die UI-Logik in
 * coaching.html anfassen zu müssen.
 *
 * Aktuell enthalten: Allgemeine Selbstwirksamkeitserwartung (GSE-10) nach
 * Schwarzer & Jerusalem (1995) – eine der am häufigsten validierten und
 * frei verfügbaren Skalen der Gesundheits-/Sportpsychologie, u.a. eingesetzt
 * zur Einschätzung, wie zuversichtlich jemand ist, Herausforderungen (z.B.
 * im Training oder bei Verhaltensänderungen) aus eigener Kraft zu bewältigen.
 * Referenz: Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy
 * scale. In J. Weinman, S. Wright & M. Johnston (Hrsg.), Measures in health
 * psychology: A user's portfolio (S. 35-37). Windsor: NFER-NELSON.
 */
export const QUESTIONNAIRES = [
  {
    key: 'gse10',
    title: 'Allgemeine Selbstwirksamkeitserwartung (GSE-10)',
    shortLabel: 'Selbstwirksamkeit',
    source: 'Schwarzer & Jerusalem (1995)',
    intro: 'Dieser Fragebogen erfasst, wie zuversichtlich du bist, schwierige Situationen und Herausforderungen aus eigener Kraft zu bewältigen. Es gibt keine richtigen oder falschen Antworten – wähle einfach, was am ehesten auf dich zutrifft.',
    scaleLabels: [
      { value: 1, label: 'Stimmt nicht' },
      { value: 2, label: 'Stimmt kaum' },
      { value: 3, label: 'Stimmt eher' },
      { value: 4, label: 'Stimmt genau' },
    ],
    items: [
      'Wenn sich Widerstände auftun, finde ich Mittel und Wege, mich durchzusetzen.',
      'Die Lösung schwieriger Probleme gelingt mir immer, wenn ich mich darum bemühe.',
      'Es bereitet mir keine Schwierigkeiten, meine Absichten und Ziele zu verwirklichen.',
      'In unerwarteten Situationen weiß ich immer, wie ich mich verhalten soll.',
      'Auch bei überraschenden Ereignissen glaube ich, dass ich gut mit ihnen zurechtkommen kann.',
      'Schwierigkeiten sehe ich gelassen entgegen, weil ich meinen Fähigkeiten immer vertrauen kann.',
      'Was auch immer passiert, ich werde schon klarkommen.',
      'Für jedes Problem kann ich eine Lösung finden.',
      'Wenn eine neue Sache auf mich zukommt, weiß ich, wie ich damit umgehen kann.',
      'Wenn ein Problem auftaucht, kann ich es aus eigener Kraft meistern.',
    ],
    scoreMin: 10,
    scoreMax: 40,
    interpret(score) {
      let band;
      if (score < 24) band = 'unterdurchschnittlich';
      else if (score <= 34) band = 'im durchschnittlichen Bereich';
      else band = 'überdurchschnittlich';
      return `Summenwert ${score} von 40 – ${band} im Vergleich zu in Studien berichteten Normwerten (Mittelwert meist ca. 29-30). Es gibt keine offiziellen klinischen Grenzwerte; der Wert dient der Selbstreflexion und als Gesprächsgrundlage im Coaching, nicht als Diagnose.`;
    },
  },
];

export function getQuestionnaire(key) {
  return QUESTIONNAIRES.find((q) => q.key === key) || null;
}

export function scoreQuestionnaire(questionnaire, answers) {
  const score = answers.reduce((sum, v) => sum + v, 0);
  return {
    score,
    maxScore: questionnaire.scoreMax,
    interpretation: questionnaire.interpret(score),
  };
}

export async function insertQuestionnaireResponse({ clientId, questionnaireKey, answers, score, maxScore, interpretation }) {
  return supabaseClient.from('questionnaire_responses').insert({
    client_id: clientId,
    questionnaire_key: questionnaireKey,
    answers,
    score,
    max_score: maxScore,
    interpretation,
  });
}

export async function listMyQuestionnaireResponses(clientId) {
  return supabaseClient
    .from('questionnaire_responses')
    .select('*')
    .eq('client_id', clientId)
    .order('completed_at', { ascending: false });
}

export async function listAllQuestionnaireResponses() {
  return supabaseClient
    .from('questionnaire_responses')
    .select('*, profiles!questionnaire_responses_client_id_fkey(full_name, email)')
    .order('completed_at', { ascending: false });
}

export async function deleteQuestionnaireResponse(id) {
  return supabaseClient.from('questionnaire_responses').delete().eq('id', id);
}

// ---------------------------------------------------------------------------
// Ziel-Modul (GROW: Goal, Reality, Options, Will)
// ---------------------------------------------------------------------------

export async function listMyGoals(clientId) {
  return supabaseClient
    .from('coaching_goals')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
}

export async function listGoalsForAdmin() {
  return supabaseClient
    .from('coaching_goals')
    .select('*, profiles!coaching_goals_client_id_fkey(full_name, email)')
    .order('created_at', { ascending: false });
}

export async function createGoal({ clientId, title, goalText, realityText, targetDate }) {
  return supabaseClient.from('coaching_goals').insert({
    client_id: clientId,
    title,
    goal_text: goalText,
    reality_text: realityText || null,
    target_date: targetDate || null,
  });
}

export async function updateGoal(id, fields) {
  return supabaseClient.from('coaching_goals').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteGoal(id) {
  return supabaseClient.from('coaching_goals').delete().eq('id', id);
}

export async function getGoalDetail(goalId) {
  return supabaseClient
    .from('coaching_goals')
    .select('*, goal_options(*), goal_will_actions(*)')
    .eq('id', goalId)
    .maybeSingle();
}

export async function insertGoalOption({ goalId, authorRole, optionText }) {
  return supabaseClient.from('goal_options').insert({
    goal_id: goalId,
    author_role: authorRole,
    option_text: optionText,
  });
}

export async function updateGoalOption(id, fields) {
  return supabaseClient.from('goal_options').update(fields).eq('id', id);
}

export async function deleteGoalOption(id) {
  return supabaseClient.from('goal_options').delete().eq('id', id);
}

export async function insertWillAction({ goalId, optionId, description, dueDate }) {
  return supabaseClient.from('goal_will_actions').insert({
    goal_id: goalId,
    option_id: optionId || null,
    description,
    due_date: dueDate || null,
  });
}

export async function updateWillActionStatus(id, status) {
  return supabaseClient.from('goal_will_actions').update({ status }).eq('id', id);
}

export async function deleteWillAction(id) {
  return supabaseClient.from('goal_will_actions').delete().eq('id', id);
}
