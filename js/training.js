// ============================================================================
// Datenzugriff für den Trainingsbereich
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// Übungsbibliothek
// ---------------------------------------------------------------------------

export async function listExercises() {
  return supabaseClient.from('exercises').select('*').order('name', { ascending: true });
}

export async function createExercise({ name, description, muscleGroup, imageUrl }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('exercises').insert({
    name,
    description: description || null,
    muscle_group: muscleGroup || null,
    image_url: imageUrl || null,
    created_by: userId,
  });
}

export async function deleteExercise(exerciseId) {
  return supabaseClient.from('exercises').delete().eq('id', exerciseId);
}

// ---------------------------------------------------------------------------
// Kundenliste (für die Plan-Zuweisung durch den Admin)
// ---------------------------------------------------------------------------

export async function listClients() {
  return supabaseClient
    .from('profiles')
    .select('id, full_name, email, access_locked')
    .eq('role', 'client')
    .order('full_name', { ascending: true });
}

// ---------------------------------------------------------------------------
// Trainingspläne
// ---------------------------------------------------------------------------

export async function listMyActivePlans(clientId) {
  return supabaseClient
    .from('training_plans')
    .select('id, title, notes, created_at, plan_exercises(id, target_sets, target_reps, target_weight_hint, notes, sort_order, exercises(id, name, description, muscle_group, image_url))')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
}

export async function listPlansForAdmin() {
  return supabaseClient
    .from('training_plans')
    .select('id, title, is_active, created_at, client_id, profiles!training_plans_client_id_fkey(full_name, email)')
    .order('created_at', { ascending: false });
}

export async function createPlan({ clientId, title, notes, exercises }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;

  const { data: plan, error: planError } = await supabaseClient
    .from('training_plans')
    .insert({ client_id: clientId, title, notes: notes || null, created_by: userId })
    .select()
    .single();

  if (planError) return { error: planError };

  const rows = exercises.map((ex, index) => ({
    plan_id: plan.id,
    exercise_id: ex.exerciseId,
    target_sets: ex.targetSets || null,
    target_reps: ex.targetReps || null,
    target_weight_hint: ex.targetWeightHint || null,
    sort_order: index,
    notes: ex.notes || null,
  }));

  const { error: exError } = await supabaseClient.from('plan_exercises').insert(rows);
  if (exError) return { error: exError };

  return { data: plan, error: null };
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
    .select('id, performed_at, set_number, reps, weight_kg, notes, exercises(name)')
    .eq('client_id', clientId)
    .order('performed_at', { ascending: false })
    .limit(limit);
}
