// ============================================================================
// Datenzugriff für den Trainingsbereich
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// Übungsbibliothek
// ---------------------------------------------------------------------------

export async function listExercises() {
  return supabaseClient.from('exercises').select('*').order('category', { ascending: true }).order('name', { ascending: true });
}

export async function createExercise({ name, description, muscleGroup, category, imageUrl }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('exercises').insert({
    name,
    description: description || null,
    muscle_group: muscleGroup || null,
    category: category || null,
    image_url: imageUrl || null,
    created_by: userId,
  });
}

export async function deleteExercise(exerciseId) {
  return supabaseClient.from('exercises').delete().eq('id', exerciseId);
}

// ---------------------------------------------------------------------------
// Kundenliste (für die Plan-/Vorlagen-Zuweisung durch den Admin)
// ---------------------------------------------------------------------------

export async function listClients() {
  return supabaseClient
    .from('profiles')
    .select('id, full_name, email, access_locked, birth_date')
    .eq('role', 'client')
    .order('full_name', { ascending: true });
}

// ---------------------------------------------------------------------------
// Trainingsplan-Vorlagen (wiederverwendbar, kundenunabhängig)
// ---------------------------------------------------------------------------

const TEMPLATE_SELECT =
  'id, title, description, created_at, ' +
  'plan_template_days(id, label, sort_order, ' +
  'plan_template_exercises(id, exercise_id, target_sets, target_reps, target_weight_hint, target_duration_seconds, ' +
  'target_distance_meters, target_speed_kmh, target_watt, target_heart_rate_percent, sort_order, notes, exercises(id, name, muscle_group, category, image_url)))';

export async function listTemplates() {
  return supabaseClient.from('plan_templates').select(TEMPLATE_SELECT).order('created_at', { ascending: false });
}

export async function getTemplate(templateId) {
  return supabaseClient.from('plan_templates').select(TEMPLATE_SELECT).eq('id', templateId).maybeSingle();
}

// days = [{ label, exercises: [{ exerciseId, targetSets, targetReps, targetWeightHint, targetDurationSeconds, notes }] }]
export async function createTemplate({ title, description, days }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;

  const { data: template, error: templateError } = await supabaseClient
    .from('plan_templates')
    .insert({ title, description: description || null, created_by: userId })
    .select()
    .single();
  if (templateError) return { error: templateError };

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    const { data: dayRow, error: dayError } = await supabaseClient
      .from('plan_template_days')
      .insert({ template_id: template.id, label: day.label, sort_order: dayIndex })
      .select()
      .single();
    if (dayError) return { error: dayError };

    const exerciseRows = (day.exercises || []).map((ex, index) => ({
      template_day_id: dayRow.id,
      exercise_id: ex.exerciseId,
      target_sets: ex.targetSets || null,
      target_reps: ex.targetReps || null,
      target_weight_hint: ex.targetWeightHint || null,
      target_duration_seconds: ex.targetDurationSeconds || null,
      target_distance_meters: ex.targetDistanceMeters || null,
      target_speed_kmh: ex.targetSpeedKmh || null,
      target_watt: ex.targetWatt || null,
      target_heart_rate_percent: ex.targetHeartRatePercent || null,
      sort_order: index,
      notes: ex.notes || null,
    }));

    if (exerciseRows.length > 0) {
      const { error: exError } = await supabaseClient.from('plan_template_exercises').insert(exerciseRows);
      if (exError) return { error: exError };
    }
  }

  return { data: template, error: null };
}

export async function deleteTemplate(templateId) {
  return supabaseClient.from('plan_templates').delete().eq('id', templateId);
}

// Nutzer-Feedback Runde 13: Vorlagen waren bisher nur löschbar, nicht
// bearbeitbar. Die RLS-Policy 'plan_templates_admin_update' existierte
// bereits (Etappe 10), wurde aus der App heraus aber nie genutzt.
//
// Statt die verschachtelte Tage-/Übungen-Struktur einzeln abzugleichen
// (aufwendig und fehleranfällig bei Umsortierungen), werden beim Bearbeiten
// alle bestehenden Trainingstage der Vorlage gelöscht (cascadet dank
// on-delete-cascade automatisch zu plan_template_exercises, siehe sql/010)
// und aus den aktuellen Formulardaten neu angelegt — inhaltlich identisch
// zu createTemplate(), nur mit Update statt Insert auf plan_templates.
// days = [{ label, exercises: [{ exerciseId, targetSets, targetReps, targetWeightHint, targetDurationSeconds, notes }] }]
export async function updateTemplate(templateId, { title, description, days }) {
  const { error: templateError } = await supabaseClient
    .from('plan_templates')
    .update({ title, description: description || null })
    .eq('id', templateId);
  if (templateError) return { error: templateError };

  const { error: deleteDaysError } = await supabaseClient
    .from('plan_template_days')
    .delete()
    .eq('template_id', templateId);
  if (deleteDaysError) return { error: deleteDaysError };

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    const { data: dayRow, error: dayError } = await supabaseClient
      .from('plan_template_days')
      .insert({ template_id: templateId, label: day.label, sort_order: dayIndex })
      .select()
      .single();
    if (dayError) return { error: dayError };

    const exerciseRows = (day.exercises || []).map((ex, index) => ({
      template_day_id: dayRow.id,
      exercise_id: ex.exerciseId,
      target_sets: ex.targetSets || null,
      target_reps: ex.targetReps || null,
      target_weight_hint: ex.targetWeightHint || null,
      target_duration_seconds: ex.targetDurationSeconds || null,
      target_distance_meters: ex.targetDistanceMeters || null,
      target_speed_kmh: ex.targetSpeedKmh || null,
      target_watt: ex.targetWatt || null,
      target_heart_rate_percent: ex.targetHeartRatePercent || null,
      sort_order: index,
      notes: ex.notes || null,
    }));

    if (exerciseRows.length > 0) {
      const { error: exError } = await supabaseClient.from('plan_template_exercises').insert(exerciseRows);
      if (exError) return { error: exError };
    }
  }

  return { data: { id: templateId }, error: null };
}

// ---------------------------------------------------------------------------
// Trainingspläne (konkret, einem Kunden zugewiesen)
// ---------------------------------------------------------------------------

const CLIENT_PLAN_SELECT =
  'id, title, notes, template_source_id, created_at, ' +
  'training_plan_days(id, label, sort_order), ' +
  'plan_exercises(id, plan_day_id, target_sets, target_reps, target_weight_hint, target_duration_seconds, ' +
  'target_distance_meters, target_speed_kmh, target_watt, target_heart_rate_percent, notes, sort_order, exercise_id, exercises(id, name, description, muscle_group, category, image_url))';

export async function listMyActivePlans(clientId) {
  return supabaseClient
    .from('training_plans')
    .select(CLIENT_PLAN_SELECT)
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
}

export async function listPlansForAdmin() {
  return supabaseClient
    .from('training_plans')
    .select('id, title, is_active, created_at, client_id, template_source_id, profiles!training_plans_client_id_fkey(full_name, email)')
    .order('created_at', { ascending: false });
}

export async function getPlanForAdmin(planId) {
  return supabaseClient.from('training_plans').select(CLIENT_PLAN_SELECT).eq('id', planId).maybeSingle();
}

// Freien, individuellen Plan anlegen (ohne Vorlage) – optional bereits mit Tagen.
// days = [{ label, exercises: [{...}] }]; exercises ohne Tag via topLevelExercises.
export async function createPlan({ clientId, title, notes, days, topLevelExercises }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;

  const { data: plan, error: planError } = await supabaseClient
    .from('training_plans')
    .insert({ client_id: clientId, title, notes: notes || null, created_by: userId })
    .select()
    .single();
  if (planError) return { error: planError };

  for (let dayIndex = 0; dayIndex < (days || []).length; dayIndex++) {
    const day = days[dayIndex];
    const { data: dayRow, error: dayError } = await supabaseClient
      .from('training_plan_days')
      .insert({ plan_id: plan.id, label: day.label, sort_order: dayIndex })
      .select()
      .single();
    if (dayError) return { error: dayError };

    const exerciseRows = (day.exercises || []).map((ex, index) => ({
      plan_id: plan.id,
      plan_day_id: dayRow.id,
      exercise_id: ex.exerciseId,
      target_sets: ex.targetSets || null,
      target_reps: ex.targetReps || null,
      target_weight_hint: ex.targetWeightHint || null,
      target_duration_seconds: ex.targetDurationSeconds || null,
      target_distance_meters: ex.targetDistanceMeters || null,
      target_speed_kmh: ex.targetSpeedKmh || null,
      target_watt: ex.targetWatt || null,
      target_heart_rate_percent: ex.targetHeartRatePercent || null,
      sort_order: index,
      notes: ex.notes || null,
    }));
    if (exerciseRows.length > 0) {
      const { error: exError } = await supabaseClient.from('plan_exercises').insert(exerciseRows);
      if (exError) return { error: exError };
    }
  }

  const looseRows = (topLevelExercises || []).map((ex, index) => ({
    plan_id: plan.id,
    plan_day_id: null,
    exercise_id: ex.exerciseId,
    target_sets: ex.targetSets || null,
    target_reps: ex.targetReps || null,
    target_weight_hint: ex.targetWeightHint || null,
    target_duration_seconds: ex.targetDurationSeconds || null,
    target_distance_meters: ex.targetDistanceMeters || null,
    target_speed_kmh: ex.targetSpeedKmh || null,
    target_watt: ex.targetWatt || null,
    target_heart_rate_percent: ex.targetHeartRatePercent || null,
    sort_order: index,
    notes: ex.notes || null,
  }));
  if (looseRows.length > 0) {
    const { error: exError } = await supabaseClient.from('plan_exercises').insert(looseRows);
    if (exError) return { error: exError };
  }

  return { data: plan, error: null };
}

// Vorlage einem Kunden zuweisen: kopiert Tage + Übungen in einen neuen,
// eigenständigen Plan (keine Live-Verknüpfung zur Vorlage).
export async function assignTemplateToClient({ templateId, clientId, title, notes }) {
  const { data: template, error: templateError } = await getTemplate(templateId);
  if (templateError) return { error: templateError };
  if (!template) return { error: { message: 'Vorlage nicht gefunden.' } };

  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;

  const { data: plan, error: planError } = await supabaseClient
    .from('training_plans')
    .insert({
      client_id: clientId,
      title: title || template.title,
      notes: notes || template.description || null,
      template_source_id: template.id,
      created_by: userId,
    })
    .select()
    .single();
  if (planError) return { error: planError };

  const days = (template.plan_template_days || []).sort((a, b) => a.sort_order - b.sort_order);

  for (const day of days) {
    const { data: dayRow, error: dayError } = await supabaseClient
      .from('training_plan_days')
      .insert({ plan_id: plan.id, label: day.label, sort_order: day.sort_order })
      .select()
      .single();
    if (dayError) return { error: dayError };

    const exercises = (day.plan_template_exercises || []).sort((a, b) => a.sort_order - b.sort_order);
    const rows = exercises.map((ex) => ({
      plan_id: plan.id,
      plan_day_id: dayRow.id,
      exercise_id: ex.exercise_id,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_weight_hint: ex.target_weight_hint,
      target_duration_seconds: ex.target_duration_seconds,
      target_distance_meters: ex.target_distance_meters,
      target_speed_kmh: ex.target_speed_kmh,
      target_watt: ex.target_watt,
      target_heart_rate_percent: ex.target_heart_rate_percent,
      sort_order: ex.sort_order,
      notes: ex.notes,
    }));
    if (rows.length > 0) {
      const { error: exError } = await supabaseClient.from('plan_exercises').insert(rows);
      if (exError) return { error: exError };
    }
  }

  return { data: plan, error: null };
}

// Einzelne Übung nachträglich einem Kundenplan hinzufügen – entweder lose
// (planDayId = null) oder in einen bestehenden Trainingstag integriert.
export async function addExerciseToPlan({ planId, planDayId, exerciseId, targetSets, targetReps, targetWeightHint, targetDurationSeconds, targetDistanceMeters, targetSpeedKmh, targetWatt, targetHeartRatePercent, notes, sortOrder }) {
  return supabaseClient.from('plan_exercises').insert({
    plan_id: planId,
    plan_day_id: planDayId || null,
    exercise_id: exerciseId,
    target_sets: targetSets || null,
    target_reps: targetReps || null,
    target_weight_hint: targetWeightHint || null,
    target_duration_seconds: targetDurationSeconds || null,
    target_distance_meters: targetDistanceMeters || null,
    target_speed_kmh: targetSpeedKmh || null,
    target_watt: targetWatt || null,
    target_heart_rate_percent: targetHeartRatePercent || null,
    notes: notes || null,
    sort_order: sortOrder || 0,
  });
}

export async function removePlanExercise(planExerciseId) {
  return supabaseClient.from('plan_exercises').delete().eq('id', planExerciseId);
}

export async function setPlanActive(planId, isActive) {
  return supabaseClient.from('training_plans').update({ is_active: isActive }).eq('id', planId);
}

// ---------------------------------------------------------------------------
// Trainingstagebuch
// ---------------------------------------------------------------------------

export async function insertTrainingLog(entry) {
  return supabaseClient.from('training_logs').insert(entry);
}

// Nutzer-Feedback Runde 14: Schnell-Logging (ganze Übung/Einheit per Klick)
// fügt mehrere Sätze/Übungen auf einmal ein statt einzeln übers Formular.
export async function insertTrainingLogs(entries) {
  if (!entries || entries.length === 0) return { data: [], error: null };
  return supabaseClient.from('training_logs').insert(entries);
}

// Nutzer-Feedback Runde 14: 'session_id' ergänzt (fürs nach Trainingseinheiten
// gruppierte Trainingstagebuch) und Limit erhöht, da jetzt mehrere Einheiten
// mit jeweils mehreren Sätzen dargestellt werden statt einer flachen Liste
// der letzten 30 Einzel-Sätze.
export async function listMyTrainingLogs(clientId, limit = 300) {
  return supabaseClient
    .from('training_logs')
    .select('id, performed_at, session_id, set_number, reps, weight_kg, duration_seconds, distance_meters, notes, plan_exercise_id, exercise_id, exercises(name, image_url, category)')
    .eq('client_id', clientId)
    .order('performed_at', { ascending: false })
    .limit(limit);
}

// Nutzer-Feedback Runde 14: für das nach Trainingseinheiten gruppierte
// Trainingstagebuch — jüngste Einheiten inkl. Plan-/Tag-Bezeichnung.
export async function listMyRecentSessions(clientId, limit = 40) {
  return supabaseClient
    .from('training_sessions')
    .select('id, plan_id, plan_day_id, started_at, ended_at, notes, calories_burned, training_plans(title), training_plan_days(label)')
    .eq('client_id', clientId)
    .order('started_at', { ascending: false })
    .limit(limit);
}

// Alle Logs zu den Übungen des/der aktiven Pläne (für Soll/Ist-Abgleich je
// plan_exercise_id, nicht nur die letzten N Einträge insgesamt).
export async function listLogsForPlanExercises(clientId, planExerciseIds) {
  if (!planExerciseIds || planExerciseIds.length === 0) return { data: [], error: null };
  return supabaseClient
    .from('training_logs')
    .select('id, performed_at, set_number, reps, weight_kg, duration_seconds, distance_meters, plan_exercise_id')
    .eq('client_id', clientId)
    .in('plan_exercise_id', planExerciseIds)
    .order('performed_at', { ascending: false });
}

// ---------------------------------------------------------------------------
// Trainingseinheiten (Sessions) – expliziter Start/Ende
// ---------------------------------------------------------------------------

export async function getActiveSession(clientId) {
  return supabaseClient
    .from('training_sessions')
    .select('id, plan_id, plan_day_id, started_at, notes')
    .eq('client_id', clientId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function startSession({ clientId, planId, planDayId, notes }) {
  return supabaseClient
    .from('training_sessions')
    .insert({ client_id: clientId, plan_id: planId || null, plan_day_id: planDayId || null, notes: notes || null })
    .select()
    .single();
}

export async function endSession(sessionId, { caloriesBurned } = {}) {
  const patch = { ended_at: new Date().toISOString() };
  if (caloriesBurned != null && caloriesBurned !== '') patch.calories_burned = caloriesBurned;
  return supabaseClient.from('training_sessions').update(patch).eq('id', sessionId);
}

export async function listSessions(clientId, { from, to } = {}) {
  let query = supabaseClient
    .from('training_sessions')
    .select('id, plan_id, plan_day_id, started_at, ended_at, notes, calories_burned')
    .eq('client_id', clientId)
    .order('started_at', { ascending: true });
  if (from) query = query.gte('started_at', from);
  if (to) query = query.lte('started_at', to);
  return query;
}

// ---------------------------------------------------------------------------
// Auswertung / Analytics (bewegte Kilos, Steigerung über Zeit, Dysbalance)
// ---------------------------------------------------------------------------

// Alle Trainingslogs eines Kunden in einem Zeitraum, inkl. Übungsdaten
// (Kategorie, Muskelgruppe, Bewegungsmuster) für Auswertung/Charts.
export async function listLogsForAnalytics(clientId, { from, to } = {}) {
  let query = supabaseClient
    .from('training_logs')
    .select('id, performed_at, session_id, exercise_id, set_number, reps, weight_kg, duration_seconds, distance_meters, exercises(id, name, category, muscle_group, movement_pattern)')
    .eq('client_id', clientId)
    .order('performed_at', { ascending: true });
  if (from) query = query.gte('performed_at', from);
  if (to) query = query.lte('performed_at', to);
  return query;
}

// ---------------------------------------------------------------------------
// Kraft-Rekord-Tracker (automatische PR-Erkennung aus bereits geloggten Daten)
// ---------------------------------------------------------------------------

// Geschätzte Maximalkraft (1RM) nach der Epley-Formel. Weit verbreitete,
// einfache Schätzformel (Epley, 1985) — geeignet für Trainingssteuerung,
// nicht für exakte Diagnostik. Bei reps <= 1 entspricht 1RM dem Gewicht selbst.
export function estimate1RM(weightKg, reps) {
  if (!weightKg || weightKg <= 0 || !reps || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

// Leichtgewichtige Abfrage über die GESAMTE Trainingshistorie eines Kunden
// (nicht nur die letzten N Einträge wie listMyTrainingLogs), damit die
// PR-Erkennung auch ältere Bestleistungen kennt. Bewusst auf die für die
// Rekord-Berechnung nötigen Felder beschränkt.
export async function listAllTrainingLogsForRecords(clientId, limit = 5000) {
  return supabaseClient
    .from('training_logs')
    .select('id, performed_at, exercise_id, reps, weight_kg, set_number, exercises(id, name, category)')
    .eq('client_id', clientId)
    .order('performed_at', { ascending: true })
    .limit(limit);
}

// Reine Berechnungsfunktion (kein Netzwerkzugriff): ermittelt aus einer
// chronologischen Liste von Trainingslogs pro Übung die aktuellen
// Bestleistungen sowie die einzelnen Momente, in denen ein neuer Rekord
// aufgestellt wurde ("PR-Events"). Erkannte Rekordarten:
//   - "weight"  Gewichts-PR: neues Bestgewicht bei genau dieser Wiederholungszahl
//   - "e1rm"    1RM-PR: neue geschätzte Maximalkraft (Epley) für diese Übung
//   - "reps"    Wiederholungs-PR: neue Bestwiederholungszahl bei Übungen ohne
//               (oder ohne relevantes) Zusatzgewicht, z. B. Klimmzüge/Liegestütze
export function computePersonalRecords(logs) {
  const list = (logs || [])
    .filter((l) => l && l.exercise_id && (l.reps || l.weight_kg))
    .slice()
    .sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at));

  const byExercise = new Map(); // exercise_id -> { name, category, bestWeightByReps: Map, bestE1RM, bestE1RMAt, bestReps, bestRepsAt }
  const prEvents = [];

  for (const log of list) {
    const exId = log.exercise_id;
    const exName = log.exercises?.name || 'Unbekannte Übung';
    const exCategory = log.exercises?.category || null;
    if (!byExercise.has(exId)) {
      byExercise.set(exId, {
        exerciseId: exId,
        name: exName,
        category: exCategory,
        bestWeightByReps: new Map(),
        bestE1RM: 0,
        bestE1RMAt: null,
        bestReps: 0,
        bestRepsAt: null,
      });
    }
    const rec = byExercise.get(exId);
    const weight = Number(log.weight_kg) || 0;
    const reps = Number(log.reps) || 0;
    if (!reps) continue;

    if (weight > 0) {
      // Gewichts-PR: neues Bestgewicht bei genau dieser Wiederholungszahl.
      const prevBestAtReps = rec.bestWeightByReps.get(reps) || 0;
      if (weight > prevBestAtReps) {
        rec.bestWeightByReps.set(reps, weight);
        prEvents.push({
          logId: log.id, exerciseId: exId, exerciseName: exName, category: exCategory,
          type: 'weight', weightKg: weight, reps, value: weight, performedAt: log.performed_at,
        });
      }
      // 1RM-PR: neue geschätzte Maximalkraft für diese Übung.
      const e1rm = estimate1RM(weight, reps);
      if (e1rm > rec.bestE1RM * 1.0001) { // kleine Toleranz gegen Rundungsrauschen
        rec.bestE1RM = e1rm;
        rec.bestE1RMAt = log.performed_at;
        prEvents.push({
          logId: log.id, exerciseId: exId, exerciseName: exName, category: exCategory,
          type: 'e1rm', weightKg: weight, reps, value: e1rm, performedAt: log.performed_at,
        });
      }
    } else {
      // Wiederholungs-PR: kein Zusatzgewicht geloggt (z. B. Klimmzüge, Liegestütze, Plank-Reps).
      if (reps > rec.bestReps) {
        rec.bestReps = reps;
        rec.bestRepsAt = log.performed_at;
        prEvents.push({
          logId: log.id, exerciseId: exId, exerciseName: exName, category: exCategory,
          type: 'reps', weightKg: 0, reps, value: reps, performedAt: log.performed_at,
        });
      }
    }
  }

  const records = Array.from(byExercise.values()).map((rec) => ({
    exerciseId: rec.exerciseId,
    name: rec.name,
    category: rec.category,
    bestE1RM: rec.bestE1RM,
    bestE1RMAt: rec.bestE1RMAt,
    bestReps: rec.bestReps,
    bestRepsAt: rec.bestRepsAt,
    bestWeightByReps: Array.from(rec.bestWeightByReps.entries())
      .map(([reps, weight]) => ({ reps, weight }))
      .sort((a, b) => b.weight - a.weight),
  }));

  prEvents.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

  return { records, prEvents };
}

// Menge der Log-IDs, die (in irgendeiner Form) einen PR ausgelöst haben —
// praktisch für schnelle Lookups beim Rendern des Trainingstagebuchs (Badges).
export function prLogIdSet(prEvents) {
  return new Set((prEvents || []).map((e) => e.logId));
}

// ---------------------------------------------------------------------------
// Trainings-Streak (durchgehend trainierte Kalenderwochen)
// ---------------------------------------------------------------------------

// ISO-Kalenderwoche als Sortier-/Vergleichsschlüssel "YYYY-Www" (Montag als
// Wochenbeginn, ISO-8601). So zählt eine Woche unabhängig vom Wochentag der
// einzelnen Einheiten.
function isoWeekKey(dateInput) {
  const d = new Date(Date.UTC(
    new Date(dateInput).getFullYear(),
    new Date(dateInput).getMonth(),
    new Date(dateInput).getDate()
  ));
  const dayNum = (d.getUTCDay() + 6) % 7; // Montag = 0 ... Sonntag = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Donnerstag derselben Woche
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDay + 3);
  const week = 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Montag 00:00 UTC der Woche, die dateInput enthält — für Anzeige/Sortierung.
function isoWeekMonday(dateInput) {
  const d = new Date(Date.UTC(
    new Date(dateInput).getFullYear(),
    new Date(dateInput).getMonth(),
    new Date(dateInput).getDate()
  ));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum);
  return d;
}

// Berechnet die aktuelle und längste Streak "durchgehend trainierter Wochen"
// aus den Zeitstempeln der Trainingssessions bzw. -logs eines Kunden. Regel
// (vom Kunden/Trainer so festgelegt): eine Kalenderwoche zählt als aktiv,
// sobald mindestens EINE Trainingseinheit in dieser Woche geloggt wurde —
// unabhängig davon, ob ein Plan hinterlegt ist.
// `timestamps`: Array von Datums-/Zeitstempeln (z. B. performed_at aus
// training_logs oder started_at aus training_sessions).
export function computeTrainingStreak(timestamps, { now = new Date() } = {}) {
  const activeWeeks = new Set();
  for (const ts of timestamps || []) {
    if (!ts) continue;
    activeWeeks.add(isoWeekKey(ts));
  }
  if (activeWeeks.size === 0) {
    return { currentStreak: 0, longestStreak: 0, activeWeeksTotal: 0, currentWeekActive: false };
  }

  const currentWeekKey = isoWeekKey(now);
  const currentWeekActive = activeWeeks.has(currentWeekKey);

  // Aktuelle Streak: rückwärts ab der jüngsten "zählbaren" Woche (dieser Woche,
  // falls schon aktiv, sonst der Vorwoche — damit ein noch laufendes Training
  // in der aktuellen Woche die Streak nicht fälschlich auf 0 zurücksetzt).
  let cursor = isoWeekMonday(now);
  if (!currentWeekActive) {
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }
  let currentStreak = 0;
  // Sicherheitslimit gegen Endlosschleifen bei kaputten Daten (10 Jahre).
  for (let i = 0; i < 520; i++) {
    const key = isoWeekKey(cursor);
    if (activeWeeks.has(key)) {
      currentStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 7);
    } else {
      break;
    }
  }

  // Längste je erreichte Streak: alle aktiven Wochen chronologisch durchgehen.
  const sortedMondays = Array.from(activeWeeks)
    .map((key) => key)
    .sort();
  // Wochenschlüssel sind als "YYYY-Www" lexikografisch sortierbar (Jahr zuerst),
  // außer am Jahreswechsel mit W01 vs. W52/53 - dafür genügt hier die Fehlertoleranz,
  // da wir die Differenz über echte Datumswerte (nicht Strings) prüfen.
  const mondayDates = Array.from(activeWeeks).map((key) => {
    const [y, w] = key.split('-W').map(Number);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = (jan4.getUTCDay() + 6) % 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day);
    const monday = new Date(week1Monday);
    monday.setUTCDate(week1Monday.getUTCDate() + (w - 1) * 7);
    return monday;
  }).sort((a, b) => a - b);

  let longestStreak = 1;
  let running = 1;
  for (let i = 1; i < mondayDates.length; i++) {
    const diffWeeks = Math.round((mondayDates[i] - mondayDates[i - 1]) / (7 * 24 * 3600 * 1000));
    if (diffWeeks === 1) {
      running++;
    } else {
      running = 1;
    }
    if (running > longestStreak) longestStreak = running;
  }

  return {
    currentStreak,
    longestStreak,
    activeWeeksTotal: activeWeeks.size,
    currentWeekActive,
  };
}
