// ============================================================================
// Auth-Logik: Registrierung, Login, Logout, Passwort-Reset, Profil-Check
// ============================================================================

import { supabaseClient } from './supabase-client.js';

/**
 * Registriert einen neuen Kunden-Account.
 * Der zugehörige Eintrag in "profiles" wird automatisch per Datenbank-Trigger
 * angelegt (siehe sql/001_fundament.sql).
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin + '/index.html',
    },
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  await supabaseClient.auth.signOut();
}

export async function requestPasswordReset(email) {
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password.html',
  });
  return { data, error };
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword });
  return { data, error };
}

export async function getCurrentSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

/**
 * Lädt das Profil (Rolle, Zugriffsstatus, Name) des eingeloggten Nutzers.
 */
export async function getMyProfile() {
  const session = await getCurrentSession();
  if (!session) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, role, access_locked, created_at')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Profil konnte nicht geladen werden:', error);
    return null;
  }
  return data;
}

// ----------------------------------------------------------------------------
// Geräte-Limit (max. 2 Geräte je Kunde) – siehe sql/012_..., register_device()
// ----------------------------------------------------------------------------
const DEVICE_ID_KEY = 'dadi-device-id';

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    // localStorage evtl. nicht verfügbar (z.B. privater Modus) – dann pro
    // Seitenaufruf ein neues Gerät, das Limit greift in diesem Fall nicht.
    return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function deviceLabel() {
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';
  let os = '';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua)) os = 'Mac';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  return `${browser}${os ? ' · ' + os : ''}`;
}

/**
 * Registriert dieses Gerät beim Login (nur für Kunden, Admin ist nicht
 * limitiert). Gibt { ok: true } zurück, oder { ok: false, error: 'device_limit_reached' }
 * wenn das Geräte-Limit erreicht ist und dieses Gerät neu wäre.
 */
export async function ensureDeviceRegistered() {
  const deviceId = getOrCreateDeviceId();
  const { data, error } = await supabaseClient.rpc('register_device', {
    p_device_id: deviceId,
    p_label: deviceLabel(),
  });
  if (error) {
    console.error('Geräte-Registrierung fehlgeschlagen:', error);
    return { ok: true }; // Im Zweifel nicht aussperren, falls die Funktion (noch) fehlt
  }
  return data;
}

/**
 * Zentrale Zugangsprüfung für geschützte Seiten (z.B. dashboard.html).
 * Leitet nicht eingeloggte Nutzer zurück zum Login.
 * Gibt das Profil zurück, oder null bei fehlender Session.
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  const profile = await getMyProfile();
  if (profile && profile.role === 'client') {
    const deviceResult = await ensureDeviceRegistered();
    if (!deviceResult.ok && deviceResult.error === 'device_limit_reached') {
      await signOut();
      window.location.href = 'index.html?geraetelimit=1';
      return null;
    }
  }
  return profile;
}

// ----------------------------------------------------------------------------
// Theme (Hell/Dunkel) – Speicherung nur lokal im Browser, rein für Komfort
// ----------------------------------------------------------------------------

export function initTheme() {
  try {
    const saved = localStorage.getItem('dadi-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {
    // localStorage evtl. nicht verfügbar – kein Problem, Standard greift
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const isDark = current
    ? current === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('dadi-theme', next);
  } catch (e) {
    /* ignore */
  }
}
