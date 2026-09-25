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

export async function createCoachingContent({ title, description, category, pdfUrl, imageUrl }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('coaching_content').insert({
    title, description: description || null, category: category || null,
    pdf_url: pdfUrl, image_url: imageUrl || null, created_by: userId,
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

  /**
   * WHO-5-Wohlbefindens-Index — 5 Items, offizielle deutsche Übersetzung der
   * WHO (World Health Organization). Weit verbreitetes Kurzinstrument für
   * subjektives Wohlbefinden der letzten zwei Wochen, u.a. in der
   * Präventivmedizin eingesetzt.
   * Referenz: WHO Regional Office for Europe / WHO Collaborating Center for
   * Mental Health, Psychiatric Research Unit, Frederiksborg (deutsche
   * Fassung); Topp, C. W. et al. (2015). The WHO-5 Well-Being Index: A
   * systematic review of the literature. Psychotherapy and Psychosomatics.
   */
  {
    key: 'who5',
    title: 'WHO-5-Wohlbefindens-Index',
    shortLabel: 'Wohlbefinden',
    source: 'WHO (deutsche Fassung); Topp et al. (2015)',
    intro: 'Bitte gib für jede der folgenden fünf Aussagen an, wie du dich in den letzten zwei Wochen gefühlt hast. Es gibt keine richtigen oder falschen Antworten.',
    scaleLabels: [
      { value: 0, label: 'Zu keinem Zeitpunkt' },
      { value: 1, label: 'Ab und zu' },
      { value: 2, label: 'Etwas weniger als die Hälfte der Zeit' },
      { value: 3, label: 'Etwas mehr als die Hälfte der Zeit' },
      { value: 4, label: 'Meistens' },
      { value: 5, label: 'Die ganze Zeit' },
    ],
    items: [
      'In den letzten zwei Wochen war ich froh und guter Laune.',
      'In den letzten zwei Wochen habe ich mich ruhig und entspannt gefühlt.',
      'In den letzten zwei Wochen habe ich mich energisch und aktiv gefühlt.',
      'In den letzten zwei Wochen habe ich mich beim Aufwachen frisch und ausgeruht gefühlt.',
      'In den letzten zwei Wochen war mein Alltag voller Dinge, die mich interessieren.',
    ],
    scoreMin: 0,
    scoreMax: 25,
    interpret(score) {
      const percent = score * 4;
      let band;
      if (percent >= 76) band = 'hoch';
      else if (percent >= 51) band = 'im mittleren Bereich';
      else band = 'niedrig';
      let hint = '';
      if (percent <= 50) {
        hint = ' Ein Wert von 50 % oder darunter gilt in der WHO-5-Literatur als Hinweis, dass ein ausführlicheres Gespräch (z.B. mit Hausarzt/Hausärztin oder einer Psychotherapeutin/einem Psychotherapeuten) sinnvoll sein könnte — das ist keine Diagnose, sondern nur ein Anlass, genauer hinzuschauen.';
      }
      return `Rohwert ${score} von 25, entspricht ${percent} % – Wohlbefinden ${band}.${hint} Der WHO-5 ersetzt kein diagnostisches Gespräch und dient hier der Selbstreflexion und als Coaching-Gesprächsgrundlage.`;
    },
  },

  /**
   * Perceived Stress Scale, Kurzform PSS-4 — 4 Items, eigene Übersetzung der
   * englischen Originalitems (keine offizielle deutsche Fassung frei
   * verfügbar). Items 2 und 3 sind positiv formuliert und werden invers
   * gepolt ausgewertet.
   * Referenz: Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global
   * measure of perceived stress. Journal of Health and Social Behavior;
   * Cohen, S., & Williamson, G. (1988). Perceived stress in a probability
   * sample of the United States (PSS-4-Kurzform); Warttig, S. L. et al.
   * (2013). New, normative, English-sample data for the PSS-4.
   */
  {
    key: 'pss4',
    title: 'Wahrgenommener Stress (PSS-4)',
    shortLabel: 'Stresswahrnehmung',
    source: 'Cohen, Kamarck & Mermelstein (1983); Cohen & Williamson (1988)',
    intro: 'Die folgenden Fragen beziehen sich auf deine Gefühle und Gedanken im letzten Monat. Wähle jeweils die Antwort, die am ehesten zutrifft.',
    scaleLabels: [
      { value: 0, label: 'Nie' },
      { value: 1, label: 'Fast nie' },
      { value: 2, label: 'Manchmal' },
      { value: 3, label: 'Ziemlich oft' },
      { value: 4, label: 'Sehr oft' },
    ],
    items: [
      'Wie oft hatten Sie im letzten Monat das Gefühl, wichtige Dinge in Ihrem Leben nicht kontrollieren zu können?',
      'Wie oft waren Sie sich im letzten Monat sicher, mit Ihren persönlichen Problemen zurechtzukommen?',
      'Wie oft hatten Sie im letzten Monat das Gefühl, dass die Dinge nach Ihren Vorstellungen liefen?',
      'Wie oft hatten Sie im letzten Monat das Gefühl, dass sich Schwierigkeiten so sehr aufgetürmt haben, dass Sie sie nicht mehr bewältigen konnten?',
    ],
    reverseItems: [1, 2],
    scoreMin: 0,
    scoreMax: 16,
    interpret(score) {
      let band;
      if (score <= 4) band = 'gering';
      else if (score <= 8) band = 'moderat';
      else if (score <= 12) band = 'erhöht';
      else band = 'hoch';
      return `Summenwert ${score} von 16 – wahrgenommener Stress im letzten Monat ${band}. Es gibt keine einheitlich festgelegten klinischen Grenzwerte für die PSS-4; Vergleichsstudien an großen Stichproben (z.B. Warttig et al. 2013, N=1.568) berichten Mittelwerte im mittleren einstelligen Bereich. Der Wert dient der Selbstreflexion und als Gesprächsgrundlage im Coaching, nicht als Diagnose.`;
    },
  },

  /**
   * Veränderungsbereitschaft für Bewegungsverhalten — einstufiges
   * Klassifikationsinstrument nach dem Transtheoretischen Modell (Prochaska
   * & DiClemente), operationalisiert für Bewegung nach Marcus & Simkin.
   * Anders als die übrigen Fragebögen hier keine Summenskala: die Person
   * wählt die EINE Aussage, die am besten passt, und wird direkt einer von
   * fünf Stufen zugeordnet.
   * Referenz: Marcus, B. H., & Simkin, L. R. (1993). The stages of exercise
   * behavior. Journal of Sports Medicine and Physical Fitness; Cancer
   * Prevention Research Center, University of Rhode Island (Stages of
   * Change – Short Form, Bewegungsverhalten).
   */
  {
    key: 'stages_of_change',
    title: 'Veränderungsbereitschaft (Bewegungsverhalten)',
    shortLabel: 'Veränderungsbereitschaft',
    source: 'Marcus & Simkin (1993); Cancer Prevention Research Center, URI',
    intro: 'Regelmäßige Bewegung bedeutet hier: geplante körperliche Aktivität wie zügiges Gehen, Training, Radfahren oder Schwimmen, mindestens 3-5 Mal pro Woche für 20-60 Minuten. Wähle die EINE Aussage, die aktuell am besten auf dich zutrifft.',
    items: [
      'Welche der folgenden Aussagen beschreibt dein aktuelles Bewegungsverhalten am besten?',
    ],
    scaleLabels: [
      { value: 1, label: 'Ich bin nicht regelmäßig aktiv und habe auch nicht vor, in den nächsten 6 Monaten damit anzufangen.' },
      { value: 2, label: 'Ich bin nicht regelmäßig aktiv, denke aber darüber nach, in den nächsten 6 Monaten damit anzufangen.' },
      { value: 3, label: 'Ich bin nicht regelmäßig aktiv, plane aber konkret, in den nächsten 30 Tagen damit anzufangen.' },
      { value: 4, label: 'Ich bin seit weniger als 6 Monaten regelmäßig aktiv.' },
      { value: 5, label: 'Ich bin seit mehr als 6 Monaten regelmäßig aktiv.' },
    ],
    scoreMin: 1,
    scoreMax: 5,
    interpret(score) {
      const stages = {
        1: {
          name: 'Absichtslosigkeit (Precontemplation)',
          note: 'Hier hilft vor allem sachliche Information über den Nutzen von Bewegung und ein niedrigschwelliges, unverbindliches Angebot — noch kein Druck, konkrete Pläne zu machen.',
        },
        2: {
          name: 'Absichtsbildung (Contemplation)',
          note: 'Hier hilft es, Vor- und Nachteile gemeinsam abzuwägen und persönliche Gründe für die Veränderung herauszuarbeiten, ohne bereits einen festen Fahrplan einzufordern.',
        },
        3: {
          name: 'Vorbereitung (Preparation)',
          note: 'Hier ist der Moment für einen konkreten, kleinen ersten Schritt mit festem Termin — je konkreter, desto eher wird aus der Absicht Handlung.',
        },
        4: {
          name: 'Handlung (Action)',
          note: 'Hier zählt vor allem Rückfallprävention: schwierige Situationen im Voraus durchdenken und soziale Unterstützung (z.B. feste Trainingstermine mit Coach) nutzen, um die neue Routine zu festigen.',
        },
        5: {
          name: 'Aufrechterhaltung (Maintenance)',
          note: 'Hier geht es vor allem darum, Abwechslung und neue Reize einzubauen, damit Motivation und Fortschritt langfristig erhalten bleiben.',
        },
      };
      const s = stages[score] || stages[1];
      return `Stufe: ${s.name}. ${s.note} Diese Einstufung ist eine Momentaufnahme und kann sich im Laufe des Coachings verändern — sie dient als gemeinsame Gesprächsgrundlage, nicht als Etikett.`;
    },
  },

  /**
   * Behavioral Regulation in Exercise Questionnaire (BREQ) — 15 Items in 4
   * Subskalen (externale, introjizierte, identifizierte, intrinsische
   * Regulation), ausgewertet über den Relative Autonomy Index (RAI): ein
   * einzelner Kennwert, der angibt, ob die Trainingsmotivation eher von
   * außen auferlegt oder eher selbstbestimmt/aus eigenem Antrieb ist
   * (Selbstbestimmungstheorie nach Deci & Ryan).
   * Referenz: Mullan, E., Markland, D., & Ingledew, D. K. (1997). A graded
   * conceptualisation of self-determination in the regulation of exercise
   * behaviour: development of a measure using confirmatory factor analytic
   * procedures. Personality and Individual Differences, 23(5), 745-752.
   * RAI-Formel nach der Auswertungskonvention der Bangor University
   * Exercise Motivation Group (exercise-motivation.bangor.ac.uk).
   */
  {
    key: 'breq',
    title: 'Trainingsmotivation (BREQ)',
    shortLabel: 'Trainingsmotivation',
    source: 'Mullan, Markland & Ingledew (1997)',
    intro: 'Warum trainierst du? Gib für jede Aussage an, wie sehr sie auf dich zutrifft — es gibt keine "richtige" Motivation, nur unterschiedliche Ausgangspunkte für das Coaching.',
    scaleLabels: [
      { value: 0, label: 'Trifft gar nicht zu' },
      { value: 1, label: 'Trifft ein wenig zu' },
      { value: 2, label: 'Trifft mittelmäßig zu' },
      { value: 3, label: 'Trifft ziemlich zu' },
      { value: 4, label: 'Trifft völlig zu' },
    ],
    items: [
      'Ich trainiere, weil andere Leute sagen, ich sollte es tun.',
      'Ich fühle mich schuldig, wenn ich nicht trainiere.',
      'Ich schätze den Nutzen des Trainings.',
      'Ich trainiere, weil es Spaß macht.',
      'Ich trainiere, weil Freunde/Familie/Partner sagen, ich sollte es tun.',
      'Ich schäme mich, wenn ich eine Trainingseinheit verpasse.',
      'Es ist mir wichtig, regelmäßig zu trainieren.',
      'Ich genieße meine Trainingseinheiten.',
      'Ich trainiere, weil andere enttäuscht wären, wenn ich es nicht täte.',
      'Ich fühle mich wie ein Versager, wenn ich eine Zeit lang nicht trainiert habe.',
      'Ich finde es wichtig, mich anzustrengen, um regelmäßig zu trainieren.',
      'Ich finde Training eine angenehme Tätigkeit.',
      'Ich fühle mich von Freunden/Familie unter Druck gesetzt, zu trainieren.',
      'Ich werde unruhig, wenn ich nicht regelmäßig trainiere.',
      'Ich empfinde Freude und Zufriedenheit, wenn ich trainiere.',
    ],
    scoreMin: -44,
    scoreMax: 48,
    customScore(answers) {
      const sum = (idxs) => idxs.reduce((s, i) => s + answers[i], 0);
      const ext = sum([0, 4, 8, 12]);
      const ij = sum([1, 5, 9]);
      const id = sum([2, 6, 10, 13]);
      const im = sum([3, 7, 11, 14]);
      return -2 * ext - ij + id + 2 * im;
    },
    interpret(score, answers) {
      const sum = (idxs) => idxs.reduce((s, i) => s + (answers ? answers[i] : 0), 0);
      const ext = sum([0, 4, 8, 12]);
      const ij = sum([1, 5, 9]);
      const id = sum([2, 6, 10, 13]);
      const im = sum([3, 7, 11, 14]);
      let band;
      if (score >= 15) band = 'überwiegend selbstbestimmt/intrinsisch — Training wird aus eigenem Antrieb und Freude an der Sache heraus ausgeübt';
      else if (score >= -5) band = 'gemischt — sowohl äußere als auch innere Beweggründe spielen eine Rolle';
      else band = 'überwiegend fremdbestimmt — Training wird eher aus äußerem Druck oder Pflichtgefühl heraus ausgeübt';
      return `Relative-Autonomy-Index (RAI): ${score} (Wertebereich -44 bis +48) – ${band}. Teilwerte: externale Regulation ${ext}/16, introjizierte Regulation ${ij}/12, identifizierte Regulation ${id}/16, intrinsische Regulation ${im}/16. Nach der Selbstbestimmungstheorie (Deci & Ryan) ist selbstbestimmte Motivation langfristig stabiler — ein niedriger RAI ist kein Versagen, sondern ein Hinweis, im Coaching gezielt an mehr Eigenmotivation (z.B. Trainingsformen, die wirklich Freude machen) zu arbeiten.`;
    },
  },
];

export function getQuestionnaire(key) {
  return QUESTIONNAIRES.find((q) => q.key === key) || null;
}

export function scoreQuestionnaire(questionnaire, answers) {
  let score;
  if (typeof questionnaire.customScore === 'function') {
    // Für Fragebögen mit eigener Score-Formel (z.B. Subskalen-Index statt
    // einfacher Summe), siehe BREQ weiter unten.
    score = questionnaire.customScore(answers);
  } else {
    // Reverse-Items (invers gepolte Aussagen, z.B. bei der PSS-4) werden vor
    // der Summenbildung an der Skalenmitte gespiegelt.
    const reverseSet = new Set(questionnaire.reverseItems || []);
    const values = questionnaire.scaleLabels.map((s) => s.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    score = answers.reduce((sum, v, i) => sum + (reverseSet.has(i) ? (maxV + minV - v) : v), 0);
  }
  return {
    score,
    maxScore: questionnaire.scoreMax,
    interpretation: questionnaire.interpret(score, answers),
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
