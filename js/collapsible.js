// ============================================================================
// Dream And Do It – Kundenplattform
// Etappe 19 (+ Nutzer-Feedback danach): Wiederverwendbare Ein-/Ausklapp-
// Komponente für längere Fließtexte auf Start- und Reiter-Seiten.
//
// WICHTIGE REGELN (aus dem Feedback nach dem ersten Entwurf):
// 1) Text ist standardmäßig immer VOLLSTÄNDIG AUSGEKLAPPT sichtbar. Ein-
//    klappen ist nur eine bewusste Nutzer-Aktion, kein Ausgangszustand.
// 2) Die Ein-/Ausklapp-UI wird nur überhaupt eingebaut, wenn das Einklappen
//    wirklich einen spürbaren Unterschied macht: der volle Text muss
//    mindestens 50% länger sein als die eingeklappte Vorschau (siehe
//    MIN_EXTRA_RATIO). Ist der Text dafür zu kurz, wird er ganz normal ohne
//    jeden Wrapper/Button ausgegeben — kein "Mehr erfahren" für einen Gewinn
//    von nur einer Zeile.
// ============================================================================

let uidCounter = 0;

// Grobe Zeichen-Schätzung für das, was die eingeklappte Höhe (siehe
// .collapsible-body { max-height: 4.4em } in css/styles.css) bei typischer
// Textbreite auf dieser Plattform noch zeigt (~3 Zeilen).
const PREVIEW_CHARS = 260;
// "mindestens 50% mehr Inhalt" beim Auf-/Zuklappen (Nutzer-Vorgabe).
const MIN_EXTRA_RATIO = 0.5;

/**
 * Wrappt beliebiges HTML in einen ein-/ausklappbaren Block — ABER NUR, wenn
 * sich das lohnt (siehe MIN_EXTRA_RATIO oben). Andernfalls wird innerHtml
 * unverändert (immer vollständig sichtbar, ohne Button) zurückgegeben.
 * @param {string} innerHtml - der Inhalt (z.B. ein oder mehrere <p>...</p>)
 * @param {object} [opts]
 * @param {string} [opts.fadeVar] - CSS-Variable für die Fade-Hintergrundfarbe,
 *   passend zum umgebenden Container (z.B. "var(--color-navy)" für .welcome-card,
 *   "var(--color-bg)" für .science-box). Ohne Angabe wird var(--color-surface)
 *   verwendet (Standard für .section-hero).
 * @param {string} [opts.moreLabel='Mehr anzeigen']
 * @param {string} [opts.lessLabel='Text einklappen']
 * @returns {string}
 */
export function collapsibleHtml(innerHtml, opts) {
  const {
    fadeVar = '',
    moreLabel = 'Mehr anzeigen',
    lessLabel = 'Text einklappen',
  } = opts || {};

  const plainLength = stripTags(innerHtml).length;
  if (plainLength < PREVIEW_CHARS * (1 + MIN_EXTRA_RATIO)) {
    // Einklappen würde weniger als 50% mehr Inhalt zeigen — Funktion weglassen,
    // Text bleibt einfach immer normal und vollständig sichtbar.
    return innerHtml;
  }

  const id = `collapsible-${++uidCounter}`;
  const style = fadeVar ? ` style="--collapsible-fade:${fadeVar};"` : '';
  // Standardmäßig AUSGEKLAPPT — der Nutzer klappt bei Bedarf bewusst EIN.
  return `
    <div class="collapsible-wrap expanded" data-collapsible id="${id}"${style}>
      <div class="collapsible-body">${innerHtml}</div>
      <div class="collapsible-fade"></div>
      <button class="collapsible-toggle" type="button" data-collapsible-toggle
        data-more="${escapeAttr(moreLabel)}" data-less="${escapeAttr(lessLabel)}">
        <span data-toggle-label>${escapeAttr(lessLabel)}</span>
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

function stripTags(html) {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
