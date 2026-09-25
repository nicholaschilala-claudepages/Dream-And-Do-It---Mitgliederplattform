// ============================================================================
// Dream And Do It – Kundenplattform
// Etappe 19: Wiederverwendbare Ein-/Ausklapp-Komponente für längere Fließtexte
// auf Start- und Reiter-Seiten (Begrüßung, Lead-Text, wissenschaftlicher
// Hintergrund) — Nutzer sehen den Text zunächst angeschnitten mit Fade-Effekt
// und einem "Mehr erfahren"-Button, statt ihn permanent komplett zu sehen.
// ============================================================================

let uidCounter = 0;

/**
 * Wrappt beliebiges HTML in einen ein-/ausklappbaren Block.
 * @param {string} innerHtml - der einzuklappende Inhalt (z.B. ein oder mehrere <p>...</p>)
 * @param {object} [opts]
 * @param {boolean} [opts.expanded=false] - initial bereits ausgeklappt?
 * @param {string} [opts.fadeVar] - CSS-Variable für die Fade-Hintergrundfarbe,
 *   passend zum umgebenden Container (z.B. "var(--color-navy)" für .welcome-card,
 *   "var(--color-bg)" für .science-box). Ohne Angabe wird var(--color-surface)
 *   verwendet (Standard für .section-hero).
 * @param {string} [opts.moreLabel='Mehr erfahren']
 * @param {string} [opts.lessLabel='Weniger anzeigen']
 * @returns {string}
 */
export function collapsibleHtml(innerHtml, opts) {
  const {
    expanded = false,
    fadeVar = '',
    moreLabel = 'Mehr erfahren',
    lessLabel = 'Weniger anzeigen',
  } = opts || {};
  const style = fadeVar ? ` style="--collapsible-fade:${fadeVar};"` : '';
  const id = `collapsible-${++uidCounter}`;
  return `
    <div class="collapsible-wrap${expanded ? ' expanded' : ''}" data-collapsible id="${id}"${style}>
      <div class="collapsible-body">${innerHtml}</div>
      <div class="collapsible-fade"></div>
      <button class="collapsible-toggle" type="button" data-collapsible-toggle
        data-more="${escapeAttr(moreLabel)}" data-less="${escapeAttr(lessLabel)}">
        <span data-toggle-label>${escapeAttr(expanded ? lessLabel : moreLabel)}</span>
        <span class="arrow">▾</span>
      </button>
    </div>
  `;
}

/**
 * Muss nach jedem innerHTML-Rendering aufgerufen werden, das collapsibleHtml()
 * verwendet hat. Event-Delegation auf einen festen Container wäre eleganter,
 * aber da viele Seiten hier den kompletten Container-innerHTML per Re-Render
 * ersetzen, ist ein erneutes (idempotentes) Binden pro Aufruf am robustesten.
 * @param {ParentNode} [root] - Suchbereich, Standard: gesamtes Dokument.
 */
export function initCollapsibles(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-collapsible-toggle]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.collapsible-wrap');
      if (!wrap) return;
      const nowExpanded = wrap.classList.toggle('expanded');
      const label = btn.querySelector('[data-toggle-label]');
      if (label) label.textContent = nowExpanded ? btn.dataset.less : btn.dataset.more;
    });
  });
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
