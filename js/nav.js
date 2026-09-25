// ============================================================================
// Dream And Do It – Kundenplattform
// Etappe 19: Zentrale Kopfzeilen-Navigation ("Reiter") im Premium-Look.
//
// Ersetzt die bisherigen einzelnen "Nachrichten"/"Zum Dashboard"-Links im
// Topbar sowie die Karten im unteren .section-grid auf den Startseiten
// (dashboard.html) — beides führte zur selben Navigation doppelt. Diese
// Funktion liefert eine EINZIGE, auf jeder Seite eingebundene Reiter-Leiste
// direkt unter dem Topbar, gestylt wie die bisherigen .section-card-Kacheln
// (siehe .nav-tab in css/styles.css).
// ============================================================================

/**
 * @param {object} profile - das geladene Profil (role, training_enabled, ...)
 * @param {object} [opts]
 * @param {string} [opts.currentPage] - Schlüssel des aktuell aktiven Reiters
 *   ('dashboard' | 'training' | 'nutrition' | 'coaching' | 'messages' | 'betrieb')
 * @param {number} [opts.unreadMessages] - Anzahl ungelesener Nachrichten (Badge)
 * @param {number} [opts.newSignups] - Anzahl neuer, ungesichteter Anmeldungen
 *   (Badge auf dem Trainer-Dashboard-Reiter, nur für Admins relevant)
 * @returns {string} HTML für die <nav class="nav-tabs">-Leiste, oder '' ohne Profil.
 */
export function navTabsHtml(profile, opts) {
  if (!profile) return '';
  const { currentPage = '', unreadMessages = 0, newSignups = 0 } = opts || {};
  const isAdmin = profile.role === 'admin';

  const tabs = [
    { key: 'dashboard', href: 'dashboard.html', label: 'Start' },
    { key: 'training', href: 'training.html', label: 'Training', locked: !isAdmin && !profile.training_enabled },
    { key: 'nutrition', href: 'nutrition.html', label: 'Ernährung', locked: !isAdmin && !profile.nutrition_enabled },
    { key: 'coaching', href: 'coaching.html', label: 'Coaching', locked: !isAdmin && !profile.coaching_enabled },
    { key: 'messages', href: 'messages.html', label: 'Nachrichten', badge: unreadMessages },
  ];
  if (isAdmin) {
    tabs.push({ key: 'betrieb', href: 'betrieb.html', label: 'Trainer-Dashboard', badge: newSignups });
  }

  return `<nav class="nav-tabs">${tabs.map((t) => tabHtml(t, currentPage)).join('')}</nav>`;
}

function tabHtml(t, currentPage) {
  const classes = ['nav-tab'];
  if (t.key === currentPage) classes.push('active');
  if (t.locked) classes.push('locked');
  const lockIcon = t.locked ? ' <span class="nav-tab-lock" title="Für dich aktuell noch nicht freigeschaltet">🔒</span>' : '';
  const badge = t.badge > 0 ? `<span class="nav-tab-badge">${t.badge > 9 ? '9+' : t.badge}</span>` : '';
  return `<a class="${classes.join(' ')}" href="${t.href}">${escapeHtmlLocal(t.label)}${lockIcon}${badge}</a>`;
}

function escapeHtmlLocal(str) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!div) return str;
  div.textContent = str;
  return div.innerHTML;
}
