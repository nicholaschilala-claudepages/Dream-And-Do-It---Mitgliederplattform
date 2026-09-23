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
