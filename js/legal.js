// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22: Rendert ein Rechtsdokument (js/legal-content.js) in legal-Seiten.
// ============================================================================
import { LEGAL_DOCS, LEGAL_DRAFT, LEGAL_VERSION } from './legal-content.js';

function mark(html) {
  // [[Platzhalter]] hervorheben
  return html.replace(/\[\[(.+?)\]\]/g, '<mark class="legal-todo">$1</mark>');
}

export function renderLegal(docKey, mount) {
  const doc = LEGAL_DOCS[docKey];
  if (!doc || !mount) return;
  document.title = `${doc.title} – Dream And Do It`;
  const parts = [];
  parts.push(`<h1>${doc.title}</h1>`);
  if (LEGAL_DRAFT) {
    parts.push(`<div class="legal-draft" role="note"><strong>Entwurf:</strong> Dieser Text ist noch nicht rechtlich geprüft. Markierte Stellen müssen vor dem Start ergänzt werden. (Version ${LEGAL_VERSION})</div>`);
  }
  if (doc.intro) parts.push(`<p class="legal-intro">${mark(doc.intro)}</p>`);
  doc.sections.forEach((s) => {
    parts.push(`<section class="legal-sec"><h2>${s.h}</h2>`);
    (s.p || []).forEach((t) => parts.push(`<p>${mark(t)}</p>`));
    if (s.ul) parts.push(`<ul>${s.ul.map((li) => `<li>${mark(li)}</li>`).join('')}</ul>`);
    parts.push('</section>');
  });
  mount.innerHTML = parts.join('');
}
