// ============================================================================
// Dream And Do It – Kundenplattform
// Nutzer-Feedback nach Etappe 19: Die untere Pill-Button-Reiterleiste
// innerhalb einer Sektion (z.B. bei Ernährung: Start/PAL-Rechner/Rezepte/...)
// wirkte wie eine zweite, störende Reiter-Ebene neben der neuen einheitlichen
// Kopfzeilen-Navigation ("Reiter oben reichen"). Zunächst durch ein natives
// <select>-Dropdown ersetzt (schlicht, aber wirkte auf Dauer wie ein reines
// Systemelement statt Teil der App).
//
// Nutzer-Feedback-Runde 3: Die Reiter sollen komplett verschwinden und wie
// ein Hamburger-Menü direkt unter den Hauptbuttons (js/nav.js, .nav-tabs)
// erscheinen. Diese Datei behält bewusst dieselben Funktionsnamen/Signaturen
// (subnavSelectHtml/bindSubnavSelect/setSubnavValue) wie die Dropdown-Version
// bei – nur Darstellung/Interaktion darunter wurden ausgetauscht –, damit an
// den Einbindungsstellen in nutrition.html/coaching.html/training.html
// nichts geändert werden musste.
// ============================================================================

/**
 * @param {{key:string,label:string,hidden?:boolean}[]} tabs - `hidden: true`
 *   lässt den Eintrag als aktuell angezeigten Wert zu (z.B. die anfängliche
 *   "Start"-Unterseite), ohne ihn in der aufgeklappten Liste als wählbaren
 *   Menüpunkt anzuzeigen – diese Funktion übernimmt bereits der Start-Button
 *   in der Kopfzeile, ein doppelter Eintrag im Menü wäre redundant.
 * @param {string} activeKey
 * @param {string} [selectId='subnav-select']
 * @returns {string} HTML für eine <div class="subnav-bar"> mit Hamburger-Button + Panel
 */
export function subnavSelectHtml(tabs, activeKey, selectId) {
  const id = selectId || 'subnav-select';
  const activeTab = tabs.find((t) => t.key === activeKey) || tabs[0] || { label: '' };
  const visibleTabs = tabs.filter((t) => !t.hidden);
  const tabsJson = escapeAttr(JSON.stringify(tabs));
  return `
    <div class="subnav-bar" data-subnav-id="${id}" data-subnav-tabs="${tabsJson}">
      <button type="button" class="subnav-toggle" id="${id}-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-panel">
        <span class="subnav-hamburger" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="subnav-current" data-subnav-current>${escapeHtmlLocal(activeTab.label)}</span>
        <span class="subnav-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="subnav-panel" id="${id}-panel" data-subnav-panel hidden>
        ${visibleTabs.map((t) => `<button type="button" class="subnav-item${t.key === activeKey ? ' active' : ''}" data-key="${escapeAttr(t.key)}">${escapeHtmlLocal(t.label)}</button>`).join('')}
      </div>
    </div>
  `;
}

/**
 * Bindet Öffnen/Schließen des Panels sowie die Auswahl eines Menüpunkts.
 * @param {ParentNode} root - Container, in dem sich die subnav-bar befindet.
 * @param {(key:string)=>void} onChange
 * @param {string} [selectId='subnav-select']
 */
export function bindSubnavSelect(root, onChange, selectId) {
  const id = selectId || 'subnav-select';
  const scope = root || document;
  const toggle = scope.querySelector(`#${id}-toggle`);
  const panel = scope.querySelector(`#${id}-panel`);
  if (!toggle || !panel) return;

  const closePanel = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openPanel = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (panel.hidden) openPanel();
    else closePanel();
  });

  const currentEl = toggle.querySelector('[data-subnav-current]');
  panel.querySelectorAll('.subnav-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Anzeige sofort aktualisieren (übernimmt, was beim nativen <select>
      // vorher der Browser automatisch erledigt hat) – die aufrufende Seite
      // muss dafür nicht extra setSubnavValue() aufrufen.
      panel.querySelectorAll('.subnav-item').forEach((b) => b.classList.toggle('active', b === btn));
      if (currentEl) currentEl.textContent = btn.textContent;
      closePanel();
      onChange(btn.dataset.key);
    });
  });

  // Klick außerhalb schließt das Panel (ein globaler Listener reicht, da
  // closePanel() idempotent ist und ein bereits geschlossenes Panel ignoriert).
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
      closePanel();
    }
  });

  // Escape-Taste schließt das Panel, wenn es offen ist.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
}

/**
 * Setzt den aktuell angezeigten Wert einer subnavSelectHtml()-Leiste, ohne
 * ein change-Event auszulösen – für programmatische Sprünge (z.B. nach dem
 * Speichern direkt zum Tab "Bestehende Pläne" springen).
 * @param {ParentNode} root
 * @param {string} key
 * @param {string} [selectId='subnav-select']
 */
export function setSubnavValue(root, key, selectId) {
  const id = selectId || 'subnav-select';
  const scope = root || document;
  const bar = scope.querySelector(`.subnav-bar[data-subnav-id="${id}"]`) || scope.querySelector('.subnav-bar');
  const panel = scope.querySelector(`#${id}-panel`);
  const toggle = scope.querySelector(`#${id}-toggle`);
  if (!toggle) return;
  const currentEl = toggle.querySelector('[data-subnav-current]');

  let matched = false;
  if (panel) {
    panel.querySelectorAll('.subnav-item').forEach((btn) => {
      const isActive = btn.dataset.key === key;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        matched = true;
        if (currentEl) currentEl.textContent = btn.textContent;
      }
    });
  }

  // Fallback für "hidden"-Einträge (z.B. 'start'), die nicht im Panel
  // erscheinen: Label aus den ursprünglich übergebenen tabs nachschlagen.
  if (!matched && bar && currentEl) {
    try {
      const tabs = JSON.parse(bar.dataset.subnavTabs || '[]');
      const tab = tabs.find((t) => t.key === key);
      if (tab) currentEl.textContent = tab.label;
    } catch (err) {
      // ignorieren – Anzeige bleibt unverändert, falls das Parsen fehlschlägt
    }
  }
}

function escapeHtmlLocal(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
