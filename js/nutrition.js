// ============================================================================
// Ernährung & Körperzusammensetzung: Berechnungen und Datenzugriff
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// PAL-Rechner (Grundumsatz nach Mifflin-St Jeor + Aktivitätsfaktor)
// ---------------------------------------------------------------------------

export const PAL_LEVELS = [
  { value: 1.2, label: 'Sitzende Tätigkeit, kaum Bewegung' },
  { value: 1.375, label: 'Leichte Aktivität (1-3x Sport/Woche)' },
  { value: 1.55, label: 'Moderate Aktivität (3-5x Sport/Woche)' },
  { value: 1.725, label: 'Hohe Aktivität (6-7x Sport/Woche)' },
  { value: 1.9, label: 'Sehr hohe Aktivität (körperliche Arbeit + Sport)' },
];

/**
 * Grundumsatz (BMR) nach Mifflin-St Jeor. Referenz: Mifflin et al. 1990,
 * heute von DGE/EFSA als zuverlässigste Formel für die Allgemeinbevölkerung
 * eingestuft (genauer als die ältere Harris-Benedict-Formel).
 */
export function calculateBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTee(bmr, pal) {
  return bmr * pal;
}

/**
 * Fettfreie Masse (FFM) = Körpergewicht − Fettmasse. Grundlage für die
 * Katch-McArdle-Formel unten.
 */
export function calculateFatFreeMass(weightKg, bodyFatPercent) {
  return weightKg * (1 - bodyFatPercent / 100);
}

/**
 * Katch-McArdle-Formel (Katch & McArdle, 1996, "Exercise Physiology"): BMR
 * direkt über die fettfreie Masse (FFM) statt über Bevölkerungsdurchschnitte
 * für Alter/Geschlecht. Begründung: Muskel- und Organgewebe ist deutlich
 * stoffwechselaktiver als Fettgewebe, daher liefert eine Formel, die die
 * tatsächliche Körperzusammensetzung kennt, tendenziell präzisere Schätzungen
 * als reine Gewichts-/Größen-/Alters-Formeln wie Mifflin-St Jeor – vor allem
 * bei Personen mit über- oder unterdurchschnittlicher Muskelmasse. Die
 * Formel selbst braucht dafür kein Alter und kein Geschlecht mehr, weil beides
 * implizit schon in der gemessenen Körperzusammensetzung steckt.
 */
export function calculateBmrKatchMcArdle(fatFreeMassKg) {
  return 370 + 21.6 * fatFreeMassKg;
}

// ---------------------------------------------------------------------------
// Navy-Methode (Körperfett-Schätzung über Umfangsmessungen)
// ---------------------------------------------------------------------------

/**
 * Navy-Methode nach Hodgdon & Beckett (1984), validiert an über 1000
 * Personen, Fehlerspanne ca. ±3-4 Prozentpunkte gegenüber DEXA.
 * Alle Maße in cm.
 */
export function calculateNavyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }) {
  const log10 = Math.log10;
  if (sex === 'male') {
    return 495 / (1.0324 - 0.19077 * log10(waistCm - neckCm) + 0.15456 * log10(heightCm)) - 450;
  }
  if (!hipCm) return null;
  return 495 / (1.29579 - 0.35004 * log10(waistCm + hipCm - neckCm) + 0.22100 * log10(heightCm)) - 450;
}

export function calculateWaistToHip(waistCm, hipCm) {
  if (!hipCm) return null;
  return waistCm / hipCm;
}

// ---------------------------------------------------------------------------
// Körpermaße-Verlauf
// ---------------------------------------------------------------------------

export async function insertBodyMeasurement(entry) {
  return supabaseClient.from('body_measurements').insert(entry);
}

export async function listMyBodyMeasurements(clientId) {
  return supabaseClient
    .from('body_measurements')
    .select('*')
    .eq('client_id', clientId)
    .order('measured_at', { ascending: true });
}

export async function deleteBodyMeasurement(id) {
  return supabaseClient.from('body_measurements').delete().eq('id', id);
}

// ---------------------------------------------------------------------------
// Rezepte
// ---------------------------------------------------------------------------

export async function listRecipes() {
  return supabaseClient.from('recipes').select('*').order('category', { ascending: true }).order('title', { ascending: true });
}

export async function createRecipe({ title, description, category, pdfUrl, imageUrl }) {
  const session = await supabaseClient.auth.getSession();
  const userId = session.data.session?.user?.id;
  return supabaseClient.from('recipes').insert({
    title, description: description || null, category: category || null,
    pdf_url: pdfUrl, image_url: imageUrl || null, created_by: userId,
  });
}

export async function deleteRecipe(id) {
  return supabaseClient.from('recipes').delete().eq('id', id);
}
