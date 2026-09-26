// ============================================================================
// Dream And Do It – Kundenplattform
// Nutzer-Feedback nach Etappe 19: Die untere Pill-Button-Reiterleiste
// innerhalb einer Sektion (z.B. bei Ernährung: Start/PAL-Rechner/Rezepte/...)
// wirkte wie eine zweite, störende Reiter-Ebene neben der neuen einheitlichen
// Kopfzeilen-Navigation ("Reiter oben reichen"). Ersetzt durch ein schlichtes
// Dropdown-Menü neben der Seitenüberschrift — gleiche Funktion, unaufdringlich.
// ============================================================================

/**
 * @param {{key:string,label:string}[]} tabs
 * @param {string} activeKey
 * @param {string} [selectId='subnav-select']
 * @returns {string} HTML für eine <div class="subnav-bar"> mit <select>
 */
export function subnavSelectHtml(tabs, activeKey, selectId) {
  const id = selectId || 'subnav-select';
  return `
    <div class="subnav-bar">
      <label class="subnav-label" for="${id}">Bereich:</label>
      <select class="subnav-select" id="${id}">
        ${tabs.map((t) => `<option value="${escapeAttr(t.key)}"${t.key === activeKey ? ' selected' : ''}>${escapeHtmlLocal(t.label)}</option>`).join('')}
      </select>
    </div>
  `;
}

/**
 * Bindet den change-Handler eines subnavSelectHtml()-Dropdowns.
 * @param {ParentNode} root - Container, in dem sich der <select> befindet.
 * @param {(key:string)=>void} onChange
 * @param {string} [selectId='subnav-select']
 */
export function bindSubnavSelect(root, onChange, selectId) {
  const id = selectId || 'subnav-select';
  const select = (root || document).querySelector(`#${id}`);
  if (!select) return;
  select.addEventListener('change', () => onChange(select.value));
}

/**
 * Setzt den aktuell gewählten Wert eines subnavSelectHtml()-Dropdowns, ohne
 * ein change-Event auszulösen — für programmatische Sprünge (z.B. nach dem
 * Speichern direkt zum Tab "Bestehende Pläne" springen).
 * @param {ParentNode} root
 * @param {string} key
 * @param {string} [selectId='subnav-select']
 */
export function setSubnavValue(root, key, selectId) {
  const id = selectId || 'subnav-select';
  const select = (root || document).querySelector(`#${id}`);
  if (select) select.value = key;
}

function escapeHtmlLocal(str) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!div) return str;
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
