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
//
// Nutzer-Feedback Runde 5: "Hamburger-Menü nicht richtig platziert – soll
// sich öffnen, wenn ich auf Training/Coaching/Ernährung klicke, alles in
// einem Button". Die oberen Reiter bleiben bestehen, aber ein Klick auf
// einen Reiter mit Unterseiten (Training/Ernährung/Coaching) öffnet direkt
// ein Dropdown mit "Übersicht" + den Unterseiten dieser Sektion, statt erst
// auf die Seite zu navigieren und dort ein zweites Menü (js/subnav.js)
// anzuzeigen. Die Unterseiten-Liste je Sektion ist bewusst hier zentral
// gepflegt (SECTION_SUBTABS) und muss beim Ändern der Tab-Struktur einer
// Seite (z.B. training.html CLIENT_TRAINING_TABS) mit angepasst werden.
// ============================================================================

const SECTION_SUBTABS = {
  training: [
    { key: 'plan', label: 'Mein Plan' },
    { key: 'progress', label: 'Meine Entwicklung' },
    { key: 'praevention', label: 'Präventionscheck' },
    { key: 'tests', label: 'Tests' },
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
  const subtabs = !t.locked ? SECTION_SUBTABS[t.key] : null;

  if (!subtabs) {
    return `<a class="${classes.join(' ')}" href="${t.href}">${escapeHtmlLocal(t.label)}${lockIcon}${badge}</a>`;
  }

  // Kein <a> als äußeres Element: die Unterseiten-Links im Panel sind selbst
  // <a>-Tags, und verschachtelte <a>-Elemente sind ungültiges HTML (der
  // Browser würde das äußere <a> vorzeitig schließen). Der Reiter selbst wird
  // stattdessen zu einem fokussierbaren "Button", der nur das Panel öffnet;
  // die eigentliche Navigation übernehmen ausschließlich die Links darin
  // ("Übersicht" navigiert zur Sektionsstartseite).
  classes.push('has-submenu');
  return `
    <div class="${classes.join(' ')}" data-nav-submenu-toggle tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
      ${escapeHtmlLocal(t.label)}${lockIcon}${badge}
      <span class="nav-tab-caret" aria-hidden="true">▾</span>
      <div class="nav-submenu-panel" hidden>
        <a href="${t.href}">Übersicht</a>
        ${subtabs.map((s) => `<a href="${t.href}?tab=${encodeURIComponent(s.key)}">${escapeHtmlLocal(s.label)}</a>`).join('')}
      </div>
    </div>
  `;
}

/**
 * Bindet das Öffnen/Schließen der Untermenüs (Training/Ernährung/Coaching)
 * innerhalb der Kopfzeilen-Navigation. Muss von jeder Seite nach dem
 * Einfügen von navTabsHtml() in den DOM einmalig aufgerufen werden.
 * @param {ParentNode} root - Container, in dem sich die .nav-tabs-Leiste befindet.
 */
export function bindNavSubmenus(root) {
  const scope = root || document;
  const toggles = scope.querySelectorAll('[data-nav-submenu-toggle]');
  if (!toggles.length) return;

  const closeAll = () => {
    scope.querySelectorAll('.nav-submenu-panel').forEach((p) => { p.hidden = true; });
    scope.querySelectorAll('[data-nav-submenu-toggle]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  };

  toggles.forEach((tab) => {
    const panel = tab.querySelector('.nav-submenu-panel');
    if (!panel) return;

    const toggle = () => {
      const isOpen = !panel.hidden;
      closeAll();
      if (!isOpen) {
        panel.hidden = false;
        tab.setAttribute('aria-expanded', 'true');
      }
    };

    // Klick auf den Reiter selbst öffnet/schließt das Untermenü, statt sofort
    // zu navigieren ("Klick öffnet Untermenü") – "Übersicht" im Panel
    // übernimmt die direkte Navigation zur Sektionsstartseite. Klicks auf
    // einen Menüpunkt im Panel navigieren normal (kein Toggle, kein preventDefault).
    tab.addEventListener('click', (e) => {
      if (e.target.closest('.nav-submenu-panel')) return;
      toggle();
    });
    tab.addEventListener('keydown', (e) => {
      if (e.target.closest('.nav-submenu-panel')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-nav-submenu-toggle]')) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}

function escapeHtmlLocal(str) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!div) return str;
  div.textContent = str;
  return div.innerHTML;
}
