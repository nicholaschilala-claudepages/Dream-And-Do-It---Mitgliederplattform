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
    .select('id, full_name, email, access_locked')
    .eq('role', 'client')
    .order('full_name', { ascending: true });
}

// ---------------------------------------------------------------------------
// Trainingsplan-Vorlagen (wiederverwendbar, kundenunabhängig)
// ---------------------------------------------------------------------------

const TEMPLATE_SELECT =
  'id, title, description, created_at, ' +
  'plan_template_days(id, label, sort_order, ' +
  'plan_template_exercises(id, exercise_id, target_sets, target_reps, target_weight_hint, target_duration_seconds, sort_order, notes, exercises(id, name, muscle_group, category, image_url)))';

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

// ---------------------------------------------------------------------------
// Trainingspläne (konkret, einem Kunden zugewiesen)
// ---------------------------------------------------------------------------

const CLIENT_PLAN_SELECT =
  'id, title, notes, template_source_id, created_at, ' +
  'training_plan_days(id, label, sort_order), ' +
  'plan_exercises(id, plan_day_id, target_sets, target_reps, target_weight_hint, target_duration_seconds, notes, sort_order, exercise_id, exercises(id, name, description, muscle_group, category, image_url))';

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
export async function addExerciseToPlan({ planId, planDayId, exerciseId, targetSets, targetReps, targetWeightHint, targetDurationSeconds, notes, sortOrder }) {
  return supabaseClient.from('plan_exercises').insert({
    plan_id: planId,
    plan_day_id: planDayId || null,
    exercise_id: exerciseId,
    target_sets: targetSets || null,
    target_reps: targetReps || null,
    target_weight_hint: targetWeightHint || null,
    target_duration_seconds: targetDurationSeconds || null,
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

export async function listMyTrainingLogs(clientId, limit = 30) {
  return supabaseClient
    .from('training_logs')
    .select('id, performed_at, set_number, reps, weight_kg, duration_seconds, notes, plan_exercise_id, exercises(name)')
    .eq('client_id', clientId)
    .order('performed_at', { ascending: false })
    .limit(limit);
}

// Alle Logs zu den Übungen des/der aktiven Pläne (für Soll/Ist-Abgleich je
// plan_exercise_id, nicht nur die letzten N Einträge insgesamt).
export async function listLogsForPlanExercises(clientId, planExerciseIds) {
  if (!planExerciseIds || planExerciseIds.length === 0) return { data: [], error: null };
  return supabaseClient
    .from('training_logs')
    .select('id, performed_at, set_number, reps, weight_kg, duration_seconds, plan_exercise_id')
    .eq('client_id', clientId)
    .in('plan_exercise_id', planExerciseIds)
    .order('performed_at', { ascending: false });
}
