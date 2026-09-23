// ============================================================================
// Supabase-Client – zentrale Verbindung zur Datenbank/Auth
// Lädt die supabase-js Bibliothek per CDN (kein Build-Schritt nötig, läuft
// direkt auf GitHub Pages o.ä., analog zum Aufbau der TVN-Apps).
// ============================================================================

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// supabase-js v2 wird in den HTML-Dateien per <script> Tag als UMD-Build
// eingebunden und stellt global "window.supabase" bereit.
export const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function isConfigured() {
  return (
    SUPABASE_URL &&
    !SUPABASE_URL.includes("DEINE_") &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes("DEIN_")
  );
}
