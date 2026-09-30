// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 18: Granulare Zugriffssteuerung je Unterpunkt (siehe sql/046).
//
// Steuert NUR den Zugriff auf den Inhalt eines Unterpunkts, nicht dessen
// Sichtbarkeit in der Navigation – ein gesperrter Unterpunkt bleibt in der
// Reiter-Navigation (js/nav.js) sichtbar, zeigt beim Öffnen aber eine
// Teaser-Ansicht (verschwommene Platzhalter-Vorschau + Schloss-Symbol)
// statt des echten Inhalts, um Neugier zu wecken statt den Bereich einfach
// verschwinden zu lassen.
//
// WICHTIG: Die Teaser-Ansicht zeigt bewusst KEINE echten Kundendaten
// verschwommen im Hintergrund (ein CSS-Blur lässt sich per Browser-
// Entwicklertools trivial aufheben bzw. der Text bleibt im DOM auslesbar –
// das wäre ein Datenleck). Stattdessen zeigt sie generische, dekorative
// Platzhalter-Balken/-Blöcke im Stil eines Lade-Skeletons.
// ============================================================================

import { supabaseClient } from './supabase-client.js';

// Entspricht 1:1 dem `client`-Zweig von SECTION_SUBTABS in js/nav.js. Bewusst
// hier dupliziert statt importiert, damit dieses Modul ohne DOM-Abhängigkeiten
// (nav.js baut HTML für die Kopfzeile) auch serverseitig/losgelöst nutzbar
// bliebe; bei einer Änderung der Unterpunkt-Struktur in nav.js bitte auch
// hier nachziehen (siehe Kommentar dort).
export const CLIENT_SUBTABS = {
  training: [
    { key: 'plan', label: 'Mein Plan' },
    { key: 'progress', label: 'Meine Entwicklung' },
    { key: 'praevention', label: 'Präventionscheck' },
    { key: 'tests', label: 'Tests' },
    { key: 'monatsbericht', label: 'Monatsbericht' },
  ],
  nutrition: [
    { key: 'pal', label: 'PAL-Rechner' },
    { key: 'bodyfat', label: 'Körperfett-Verlauf' },
    { key: 'protokoll', label: 'Ernährungsprotokoll' },
    { key: 'recipes', label: 'Rezepte' },
  ],
  coaching: [
    { key: 'content', label: 'Content' },
    { key: 'atem', label: 'Atemübungen' },
    { key: 'fragebogen', label: 'Fragebögen' },
    { key: 'ziele', label: 'Ziele (GROW)' },
  ],
};

const SECTION_LABEL = { training: 'Training', nutrition: 'Ernährung', coaching: 'Coaching' };

/**
 * Lädt alle gesperrten Unterpunkte eines Kunden auf einmal (ein Query pro
 * Seitenaufruf statt pro Unterpunkt). Gibt ein Set von "section:subtab_key"
 * zurück, die gesperrt (enabled=false) sind. Kein Eintrag = nicht gesperrt.
 */
export async function loadClientSubtabLocks(clientId) {
  const { data, error } = await supabaseClient
    .from('client_subtab_access')
    .select('section, subtab_key, enabled')
    .eq('client_id', clientId);
  if (error) return { locks: new Set(), error };
  const locks = new Set(
    (data || []).filter((row) => row.enabled === false).map((row) => `${row.section}:${row.subtab_key}`)
  );
  return { locks, error: null };
}

export function isLocked(locks, section, subtabKey) {
  return !!(locks && locks.has(`${section}:${subtabKey}`));
}

/** Admin-Ansicht ist von dieser Sperre nie betroffen (Trainer sieht immer alles). */
export function shouldGateSubtab(profile, locks, section, subtabKey) {
  if (!profile || profile.role === 'admin') return false;
  return isLocked(locks, section, subtabKey);
}

export async function setSubtabAccess(clientId, section, subtabKey, enabled, updatedBy) {
  return supabaseClient.from('client_subtab_access').upsert(
    {
      client_id: clientId,
      section,
      subtab_key: subtabKey,
      enabled,
      updated_by: updatedBy || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'client_id,section,subtab_key' }
  );
}

/**
 * Rendert die Teaser-Ansicht für einen gesperrten Unterpunkt: Platzhalter-
 * Skeleton (rein dekorativ, keine echten Daten), Schloss-Symbol, Titel und
 * ein Hinweistext, der Neugier weckt statt nur "kein Zugriff" zu sagen.
 */
export function lockedSubtabHtml(section, subtabKey) {
  const entry = (CLIENT_SUBTABS[section] || []).find((s) => s.key === subtabKey);
  const label = entry ? entry.label : 'Dieser Bereich';
  const sectionLabel = SECTION_LABEL[section] || section;
  return `
    <div class="card subtab-locked-card">
      <div class="subtab-locked-skeleton" aria-hidden="true">
        <div class="sls-bar sls-bar-title"></div>
        <div class="sls-row"><div class="sls-block"></div><div class="sls-block"></div></div>
        <div class="sls-bar sls-bar-wide"></div>
        <div class="sls-bar sls-bar-med"></div>
        <div class="sls-row"><div class="sls-block"></div><div class="sls-block"></div><div class="sls-block"></div></div>
      </div>
      <div class="subtab-locked-overlay">
        <div class="subtab-locked-icon">🔒</div>
        <h3>${label} wartet schon auf dich</h3>
        <p>Dieser Bereich gehört zu ${sectionLabel}, ist für dich aber noch nicht freigeschaltet.</p>
        <p class="subtab-locked-cta">Sprich uns an, wenn du „${label}" freigeschaltet haben möchtest.</p>
      </div>
    </div>
  `;
}
