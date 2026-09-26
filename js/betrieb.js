// ============================================================================
// Betreiber-Seite: Trainer-Frühwarnsystem, Zugriffsverwaltung, Wochenreport-Daten
// ============================================================================

import { supabaseClient } from './supabase-client.js';
import { listRecipes } from './nutrition.js';
import { listCoachingContent } from './coaching.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Kundenübersicht mit letzter Aktivität + Zugriffssperre
// ---------------------------------------------------------------------------

export async function listClientOverview() {
  const [clientsRes, activityRes] = await Promise.all([
    supabaseClient
      .from('profiles')
      .select('id, full_name, email, access_locked, created_at, max_devices, training_enabled, nutrition_enabled, coaching_enabled, new_signup_seen')
      .eq('role', 'client')
      .order('full_name', { ascending: true }),
    supabaseClient.from('client_last_activity').select('*'),
  ]);

  if (clientsRes.error) return { data: null, error: clientsRes.error };
  if (activityRes.error) return { data: null, error: activityRes.error };

  const activityMap = new Map((activityRes.data || []).map((a) => [a.client_id, a.last_activity_at]));
  const now = Date.now();

  const merged = (clientsRes.data || []).map((c) => {
    const lastActivityAt = activityMap.get(c.id) || null;
    const daysSinceActivity = lastActivityAt ? Math.floor((now - new Date(lastActivityAt).getTime()) / DAY_MS) : null;
    return { ...c, last_activity_at: lastActivityAt, days_since_activity: daysSinceActivity };
  });

  // Nie aktiv gewesene und lange inaktive Kunden zuerst.
  merged.sort((a, b) => {
    if (a.days_since_activity == null && b.days_since_activity == null) return 0;
    if (a.days_since_activity == null) return -1;
    if (b.days_since_activity == null) return 1;
    return b.days_since_activity - a.days_since_activity;
  });

  return { data: merged, error: null };
}

export async function setClientLock(clientId, locked) {
  return supabaseClient.from('profiles').update({ access_locked: locked }).eq('id', clientId);
}

// ---------------------------------------------------------------------------
// Badge für neue Anmeldungen (siehe sql/023_neue_anmeldungen_badge.sql).
// ---------------------------------------------------------------------------

export async function getNewSignupCount() {
  const { count, error } = await supabaseClient
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'client')
    .eq('new_signup_seen', false);
  if (error) return { count: 0, error };
  return { count: count || 0, error: null };
}

export async function markNewSignupsSeen() {
  return supabaseClient
    .from('profiles')
    .update({ new_signup_seen: true })
    .eq('role', 'client')
    .eq('new_signup_seen', false);
}

// ---------------------------------------------------------------------------
// Reiter-Freigabe (Training/Ernährung/Coaching einzeln pro Kunde), siehe
// sql/020_reiter_freigabe.sql. field ist eines von 'training_enabled',
// 'nutrition_enabled', 'coaching_enabled'.
// ---------------------------------------------------------------------------

export async function setClientModuleAccess(clientId, field, enabled) {
  return supabaseClient.from('profiles').update({ [field]: enabled }).eq('id', clientId);
}

// ---------------------------------------------------------------------------
// Granulare Dokument-Freigabe (Rezepte/Coaching-Content einzeln pro Kunde),
// siehe sql/024_dokument_freigabe.sql. Opt-in: ein Dokument ist für einen
// Kunden erst sichtbar, wenn hierüber explizit eine Freigabe-Zeile angelegt
// wurde (zusätzlich zur Modul-Freigabe oben).
// ---------------------------------------------------------------------------

/**
 * Liefert alle Rezepte plus, für den angegebenen Kunden, ob jeweils eine
 * Freigabe existiert — fertig zusammengesetzt für eine Checklisten-UI.
 */
export async function listRecipesWithAccess(clientId) {
  const [{ data: recipes, error: recipesError }, { data: access, error: accessError }] = await Promise.all([
    listRecipes(),
    supabaseClient.from('client_recipe_access').select('recipe_id').eq('client_id', clientId),
  ]);
  if (recipesError) return { data: null, error: recipesError };
  if (accessError) return { data: null, error: accessError };
  const grantedSet = new Set((access || []).map((a) => a.recipe_id));
  const merged = (recipes || []).map((r) => ({ ...r, granted: grantedSet.has(r.id) }));
  return { data: merged, error: null };
}

/** Analog zu listRecipesWithAccess(), für Coaching-Content-Dokumente. */
export async function listCoachingContentWithAccess(clientId) {
  const [{ data: items, error: itemsError }, { data: access, error: accessError }] = await Promise.all([
    listCoachingContent(),
    supabaseClient.from('client_coaching_content_access').select('content_id').eq('client_id', clientId),
  ]);
  if (itemsError) return { data: null, error: itemsError };
  if (accessError) return { data: null, error: accessError };
  const grantedSet = new Set((access || []).map((a) => a.content_id));
  const merged = (items || []).map((c) => ({ ...c, granted: grantedSet.has(c.id) }));
  return { data: merged, error: null };
}

export async function setRecipeAccess(clientId, recipeId, granted) {
  if (granted) {
    return supabaseClient.from('client_recipe_access').upsert({ client_id: clientId, recipe_id: recipeId });
  }
  return supabaseClient.from('client_recipe_access').delete().eq('client_id', clientId).eq('recipe_id', recipeId);
}

export async function setCoachingContentAccess(clientId, contentId, granted) {
  if (granted) {
    return supabaseClient.from('client_coaching_content_access').upsert({ client_id: clientId, content_id: contentId });
  }
  return supabaseClient.from('client_coaching_content_access').delete().eq('client_id', clientId).eq('content_id', contentId);
}

/** Bequemlichkeitsfunktion: alle Rezepte für einen Kunden auf einmal freigeben/sperren. */
export async function setAllRecipeAccess(clientId, recipeIds, granted) {
  if (granted) {
    const rows = recipeIds.map((id) => ({ client_id: clientId, recipe_id: id }));
    if (rows.length === 0) return { data: [], error: null };
    return supabaseClient.from('client_recipe_access').upsert(rows);
  }
  return supabaseClient.from('client_recipe_access').delete().eq('client_id', clientId);
}

/** Bequemlichkeitsfunktion: alle Coaching-Content-Dokumente für einen Kunden auf einmal freigeben/sperren. */
export async function setAllCoachingContentAccess(clientId, contentIds, granted) {
  if (granted) {
    const rows = contentIds.map((id) => ({ client_id: clientId, content_id: id }));
    if (rows.length === 0) return { data: [], error: null };
    return supabaseClient.from('client_coaching_content_access').upsert(rows);
  }
  return supabaseClient.from('client_coaching_content_access').delete().eq('client_id', clientId);
}

// ---------------------------------------------------------------------------
// Geräte-Verwaltung (max. Geräte je Kunde, siehe sql/012_..., register_device())
// ---------------------------------------------------------------------------

export async function listClientDevices(clientId) {
  return supabaseClient
    .from('client_devices')
    .select('*')
    .eq('client_id', clientId)
    .order('last_seen', { ascending: false });
}

export async function deleteClientDevice(id) {
  return supabaseClient.from('client_devices').delete().eq('id', id);
}

export async function setClientMaxDevices(clientId, maxDevices) {
  return supabaseClient.from('profiles').update({ max_devices: maxDevices }).eq('id', clientId);
}

// ---------------------------------------------------------------------------
// Datenbasis für den Wochenreport (wird clientseitig zu einem PDF zusammengebaut)
// ---------------------------------------------------------------------------

export async function getReportData(clientId, fromDate, toDate) {
  const fromIso = new Date(fromDate + 'T00:00:00').toISOString();
  const toIso = new Date(toDate + 'T23:59:59').toISOString();

  const [profileRes, logsRes, measurementsRes, questionnairesRes, goalsRes] = await Promise.all([
    supabaseClient.from('profiles').select('full_name, email').eq('id', clientId).maybeSingle(),
    supabaseClient
      .from('training_logs')
      .select('*, exercises(name)')
      .eq('client_id', clientId)
      .gte('performed_at', fromIso)
      .lte('performed_at', toIso)
      .order('performed_at', { ascending: true }),
    supabaseClient
      .from('body_measurements')
      .select('*')
      .eq('client_id', clientId)
      .gte('measured_at', fromDate)
      .lte('measured_at', toDate)
      .order('measured_at', { ascending: true }),
    supabaseClient
      .from('questionnaire_responses')
      .select('*')
      .eq('client_id', clientId)
      .gte('completed_at', fromIso)
      .lte('completed_at', toIso)
      .order('completed_at', { ascending: true }),
    supabaseClient
      .from('coaching_goals')
      .select('*, goal_will_actions(*)')
      .eq('client_id', clientId)
      .eq('status', 'active'),
  ]);

  const error = profileRes.error || logsRes.error || measurementsRes.error || questionnairesRes.error || goalsRes.error;
  if (error) return { data: null, error };

  // Trainingslogs je Übung zusammenfassen (Anzahl Sätze, Gesamtvolumen).
  const exerciseMap = new Map();
  (logsRes.data || []).forEach((log) => {
    const name = log.exercises ? log.exercises.name : 'Unbekannte Übung';
    if (!exerciseMap.has(name)) exerciseMap.set(name, { sets: 0, volumeKg: 0 });
    const entry = exerciseMap.get(name);
    entry.sets += 1;
    if (log.weight_kg != null && log.reps != null) {
      entry.volumeKg += log.weight_kg * log.reps;
    }
  });
  const trainingSummary = Array.from(exerciseMap.entries()).map(([name, v]) => ({ name, ...v }));
  const distinctTrainingDays = new Set((logsRes.data || []).map((l) => l.performed_at.slice(0, 10))).size;

  // Offene und in der Woche erledigte Maßnahmen aus dem Ziel-Modul.
  const openActions = [];
  const doneActionsInRange = [];
  (goalsRes.data || []).forEach((g) => {
    (g.goal_will_actions || []).forEach((a) => {
      if (a.status === 'open') openActions.push({ goalTitle: g.title, ...a });
      else if (a.status === 'done') doneActionsInRange.push({ goalTitle: g.title, ...a });
    });
  });

  return {
    data: {
      profile: profileRes.data,
      trainingSummary,
      distinctTrainingDays,
      measurements: measurementsRes.data || [],
      questionnaires: questionnairesRes.data || [],
      activeGoals: goalsRes.data || [],
      openActions,
    },
    error: null,
  };
}
