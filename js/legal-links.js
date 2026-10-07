// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22: Fußzeilen-Links zu Impressum, Datenschutz und Nutzungsbedingungen
// auf jeder Seite (auch vor dem Login, z. B. bei der Registrierung).
// ============================================================================
function run() {
  let foot = document.querySelector('.footer-note');
  if (!foot) {
    foot = document.createElement('div');
    foot.className = 'footer-note';
    (document.querySelector('.page') || document.body).appendChild(foot);
  }
  if (foot.querySelector('.legal-links')) return;
  const nav = document.createElement('div');
  nav.className = 'legal-links';
  nav.innerHTML = '<a href="impressum.html">Impressum</a><span aria-hidden="true">·</span><a href="datenschutz.html">Datenschutz</a><span aria-hidden="true">·</span><a href="nutzungsbedingungen.html">Nutzungsbedingungen</a>';
  foot.appendChild(nav);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
