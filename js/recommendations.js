// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 21 / Q13: Interessen-Kategorien und Empfehlungen
//
// Ablauf: Sobald ein Kunde ein aktives GROW-Ziel hat, wird er gefragt, ob er
// noch mehr aus der Plattform für sich herausholen möchte. Er klickt
// Interessen-Kategorien an; daraus werden regelbasiert passende Rubriken-
// Funktionen und Leistungen von Nicholas empfohlen. Der Trainer sieht die
// gewählten Interessen und die Empfehlungen und kann Einzelne ausblenden oder
// eigene (mit persönlicher Notiz) ergänzen.
//
// Die Leistungen stehen in RECOMMENDATION_ITEMS (kind 'service', eine Stelle,
// leicht anpassbar). Grundlage (Runde 22, Abgleich mit www.dreamanddoit.de,
// Stand 07.10.2026): Personal Training, Mental Coaching, Gesundheits-
// diagnostik, Betriebliche Prävention, Führungskräfte-Coaching, Team-
// Workshops, Impulsvorträge; zusätzlich Online-Coaching (buchbar) und
// Präventionskurse nach § 20 SGB V (Zulassung erteilt) und Individuelle
// Trainingsplanerstellung (auf Wunsch von Nicholas wieder aufgenommen, 07.10.).
// ============================================================================

import { supabaseClient } from './supabase-client.js';
import { loadSectionCounts } from './section-info.js';

export const INTEREST_CATEGORIES = [
  { key: 'abnehmen', icon: '⚖️', label: 'Abnehmen & Körperzusammensetzung' },
  { key: 'muskelaufbau', icon: '💪', label: 'Muskelaufbau & Kraft' },
  { key: 'fitness_ausdauer', icon: '🏃', label: 'Fitness & Ausdauer' },
  { key: 'stress_schlaf', icon: '🌙', label: 'Stress, Schlaf & Wohlbefinden' },
  { key: 'gesundheit_praevention', icon: '🩺', label: 'Gesundheit & Prävention' },
  { key: 'mindset_gewohnheiten', icon: '🧠', label: 'Mindset & Gewohnheiten' },
];

const CAT_LABEL = Object.fromEntries(INTEREST_CATEGORIES.map((c) => [c.key, c.label]));

/**
 * Katalog der Empfehlungen. weights: Kategorie → Gewicht (1–3).
 * kind 'platform' = Funktion auf der Plattform (rubric = nötige Freigabe),
 * kind 'service' = Leistung von Nicholas (Kontakt über die Nachrichten).
 * meta(counts) liefert optional eine kurze Zahl-Zeile.
 */
export const RECOMMENDATION_ITEMS = [
  // --- Plattform ------------------------------------------------------------
  {
    key: 'p_training_plan', kind: 'platform', rubric: 'training', icon: '🏋️', title: 'Trainingsplan & Tagebuch',
    text: 'Plan abarbeiten, Sätze loggen, Rekorde und Wochen-Serien sammeln.',
    href: 'training.html?tab=plan', cta: 'Zum Trainingsplan',
    weights: { muskelaufbau: 3, fitness_ausdauer: 3, abnehmen: 2, mindset_gewohnheiten: 1 },
    meta: (c) => (c.exercises ? `${c.exercises} Übungen in der Bibliothek` : null),
  },
  {
    key: 'p_prevention', kind: 'platform', rubric: 'training', icon: '📋', title: 'Präventionscheck',
    text: 'Messen statt Raten: Kraft, Beweglichkeit, Ausdauer, Blutdruck und Ruhepuls mit Normwerten und Score.',
    href: 'training.html?tab=progress', cta: 'Check starten',
    weights: { gesundheit_praevention: 3, fitness_ausdauer: 2, muskelaufbau: 1, abnehmen: 1 },
    meta: (c) => (c.tests ? `${c.tests} Tests & Messungen` : null),
  },
  {
    key: 'p_report', kind: 'platform', rubric: 'training', icon: '📈', title: 'Monatsbericht & Rückblick',
    text: 'Dein Fortschritt schwarz auf weiß – als PDF, nach 6, 12 und 24 Monaten sogar als großer Rückblick.',
    href: 'training.html?tab=monatsbericht', cta: 'Zum Monatsbericht',
    weights: { gesundheit_praevention: 1, mindset_gewohnheiten: 2, abnehmen: 1, muskelaufbau: 1, fitness_ausdauer: 1 },
  },
  {
    key: 'p_achievements', kind: 'platform', rubric: null, icon: '🏆', title: 'Erfolge & Rekorde',
    text: 'Dranbleiben wird sichtbar: Serien, Rekorde und Erfolge, die du Stufe für Stufe freischaltest.',
    href: 'erfolge.html', cta: 'Erfolge ansehen',
    weights: { mindset_gewohnheiten: 3, fitness_ausdauer: 1, muskelaufbau: 1 },
    meta: (c) => (c.achievements ? `${c.achievements} Erfolge zum Freischalten` : null),
  },
  {
    key: 'p_pal', kind: 'platform', rubric: 'nutrition', icon: '🔥', title: 'PAL-Rechner',
    text: 'Dein Kalorienbedarf – die Grundlage für Abnehmen, Aufbau und Gewicht halten.',
    href: 'nutrition.html?tab=pal', cta: 'Bedarf berechnen',
    weights: { abnehmen: 3, muskelaufbau: 2 },
  },
  {
    key: 'p_bodyfat', kind: 'platform', rubric: 'nutrition', icon: '📏', title: 'Körperfett-Verlauf',
    text: 'Navy-Methode mit Trend: du siehst, was sich wirklich verändert, nicht nur die Waage.',
    href: 'nutrition.html?tab=bodyfat', cta: 'Verlauf ansehen',
    weights: { abnehmen: 3, muskelaufbau: 2, gesundheit_praevention: 1 },
  },
  {
    key: 'p_food_log', kind: 'platform', rubric: 'nutrition', icon: '📝', title: 'Ernährungsprotokoll',
    text: 'Mahlzeiten festhalten und mit deinem Bedarf vergleichen – inklusive Kommentar von mir.',
    href: 'nutrition.html?tab=protokoll', cta: 'Protokoll öffnen',
    weights: { abnehmen: 3, muskelaufbau: 2, mindset_gewohnheiten: 1, gesundheit_praevention: 1 },
    meta: (c) => (c.foodItems ? `${c.foodItems} Lebensmittel mit Nährwerten` : null),
  },
  {
    key: 'p_recipes', kind: 'platform', rubric: 'nutrition', icon: '🥗', title: 'Rezepte mit Makros',
    text: 'Alltagstaugliche Gerichte, filterbar nach Ernährungsform, Geschmack, Mahlzeit und Zeit.',
    href: 'nutrition.html?tab=recipes', cta: 'Rezepte entdecken',
    weights: { abnehmen: 2, muskelaufbau: 2, gesundheit_praevention: 2, stress_schlaf: 1 },
    meta: (c) => (c.recipes ? `${c.recipes} Rezepte` : null),
  },
  {
    key: 'p_breathing', kind: 'platform', rubric: 'coaching', icon: '🌬️', title: 'Atemübungen',
    text: 'Geführte Atemtechniken mit Animation – für Ruhe, Fokus und besseren Schlaf.',
    href: 'coaching.html?tab=atem', cta: 'Atemübung starten',
    weights: { stress_schlaf: 3, gesundheit_praevention: 1, mindset_gewohnheiten: 1, fitness_ausdauer: 1 },
    meta: (c) => (c.breathing ? `${c.breathing} Atemtechniken` : null),
  },
  {
    key: 'p_questionnaires', kind: 'platform', rubric: 'coaching', icon: '🧭', title: 'Fragebögen zur Standortbestimmung',
    text: 'Wohlbefinden, Stress, Selbstwirksamkeit und Motivation – ehrlich messen und im Verlauf vergleichen.',
    href: 'coaching.html?tab=fragebogen', cta: 'Fragebogen ausfüllen',
    weights: { stress_schlaf: 3, mindset_gewohnheiten: 3, gesundheit_praevention: 1 },
    meta: (c) => (c.questionnaires ? `${c.questionnaires} validierte Fragebögen` : null),
  },
  {
    key: 'p_content', kind: 'platform', rubric: 'coaching', icon: '📚', title: 'Coaching-Bibliothek',
    text: 'Impulse zu Gewohnheiten, Resilienz, Zielen und Kommunikation – zum Lesen, wann du magst.',
    href: 'coaching.html?tab=content', cta: 'Bibliothek öffnen',
    weights: { mindset_gewohnheiten: 3, stress_schlaf: 2, gesundheit_praevention: 2, abnehmen: 1 },
    meta: (c) => (c.coachingContent ? `${c.coachingContent} Dokumente` : null),
  },

  // --- Leistungen von Nicholas ----------------------------------------------
  {
    key: 's_online_coaching', kind: 'service', icon: '💻', title: 'Online-Coaching',
    text: 'Dein Plan, deine Daten und mein Feedback – flexibel von überall, mit klarer Struktur.',
    cta: 'Mit Nicholas besprechen', context: 'Coaching', ask: 'Online-Coaching',
    weights: { abnehmen: 3, muskelaufbau: 2, fitness_ausdauer: 2, mindset_gewohnheiten: 2, stress_schlaf: 1, gesundheit_praevention: 1 },
  },
  {
    key: 's_personal_training', kind: 'service', icon: '🤝', title: 'Personal Training (1:1)',
    text: 'Technik und Intensität unter meiner Anleitung – ideal, wenn du schneller und sicherer vorankommen willst.',
    cta: 'Mit Nicholas besprechen', context: 'Training', ask: 'Personal Training',
    weights: { muskelaufbau: 3, fitness_ausdauer: 3, abnehmen: 2, gesundheit_praevention: 2 },
  },
  {
    key: 's_diagnostik', kind: 'service', icon: '🔬', title: 'Gesundheitsdiagnostik – Messen statt Raten',
    text: 'Stressanalyse, Körperzusammensetzung und Beweglichkeit – eine fundierte Standortbestimmung als Basis für alles, was danach kommt.',
    cta: 'Mit Nicholas besprechen', context: 'Sonstiges', ask: 'die Gesundheitsdiagnostik',
    weights: { gesundheit_praevention: 3, fitness_ausdauer: 2, abnehmen: 1, muskelaufbau: 1, stress_schlaf: 1 },
  },
  {
    key: 's_mental_coaching', kind: 'service', icon: '🧩', title: 'Mental Coaching (GROW)',
    text: 'Gemeinsam an Ziel, Ist-Stand, Optionen und Umsetzung arbeiten – für Klarheit und Durchhaltevermögen.',
    cta: 'Mit Nicholas besprechen', context: 'Coaching', ask: 'Mental Coaching',
    weights: { mindset_gewohnheiten: 3, stress_schlaf: 3, abnehmen: 1 },
  },
  {
    key: 's_trainingsplan', kind: 'service', icon: '🗂️', title: 'Individuelle Trainingsplanerstellung',
    text: 'Ein Plan, der zu deinem Alltag, deinen Zielen und deinem Körper passt.',
    cta: 'Mit Nicholas besprechen', context: 'Training', ask: 'eine individuelle Trainingsplanerstellung',
    weights: { muskelaufbau: 2, fitness_ausdauer: 2, abnehmen: 1 },
  },
  {
    key: 's_praeventionskurse', kind: 'service', icon: '🏥', title: 'Präventionskurse (§ 20 SGB V)',
    text: 'Strukturierte Kurse für Bewegung und Gesundheit in der Gruppe – von der Krankenkasse bezuschussbar.',
    cta: 'Mit Nicholas besprechen', context: 'Sonstiges', ask: 'die Präventionskurse',
    weights: { gesundheit_praevention: 3, stress_schlaf: 2, fitness_ausdauer: 1, abnehmen: 1 },
  },
  {
    key: 's_betriebliche_praevention', kind: 'service', icon: '🏢', title: 'Betriebliche Prävention',
    text: 'Gesundheitsangebote für dein Team oder deinen Betrieb – ein Thema für deine Arbeitgeberin oder deinen Arbeitgeber.',
    cta: 'Mit Nicholas besprechen', context: 'Sonstiges', ask: 'die Betriebliche Prävention',
    weights: { gesundheit_praevention: 2, stress_schlaf: 1 },
  },
  {
    key: 's_fuehrungskraefte_coaching', kind: 'service', icon: '🎯', title: 'Führungskräfte-Coaching',
    text: 'Klarheit, Wirkung und Gesundheit in der Führungsrolle – im Einzelcoaching entwickelt.',
    cta: 'Mit Nicholas besprechen', context: 'Coaching', ask: 'das Führungskräfte-Coaching',
    weights: { mindset_gewohnheiten: 2, stress_schlaf: 2 },
  },
  {
    key: 's_team_workshops', kind: 'service', icon: '👥', title: 'Team-Workshops',
    text: 'Gemeinsam im Team an Zusammenarbeit, Energie und Gesundheit arbeiten.',
    cta: 'Mit Nicholas besprechen', context: 'Sonstiges', ask: 'Team-Workshops',
    weights: { mindset_gewohnheiten: 1, gesundheit_praevention: 1 },
  },
  {
    key: 's_impulsvortraege', kind: 'service', icon: '🎤', title: 'Impulsvorträge',
    text: 'Kurze, wissenschaftlich fundierte Impulse zu Gesundheit, Leistung und Mindset für Gruppen und Veranstaltungen.',
    cta: 'Mit Nicholas besprechen', context: 'Sonstiges', ask: 'Impulsvorträge',
    weights: { mindset_gewohnheiten: 1, stress_schlaf: 1 },
  },
];

const ITEM_BY_KEY = Object.fromEntries(RECOMMENDATION_ITEMS.map((i) => [i.key, i]));

/**
 * Regelbasierte Empfehlungen (reine Funktion, testbar).
 * @param {object} p
 * @param {string[]} p.categories gewählte Interessen
 * @param {Array} p.overrides [{ item_key, mode:'add'|'hide', note }]
 * @param {number} [p.maxPlatform=4] max. Plattform-Funktionen
 * @param {number} [p.maxServices=3] max. Leistungen
 * @returns {Array} [{ item, score, matched:[labels], manual:boolean, note }]
 */
export function computeRecommendations({ categories = [], overrides = [], maxPlatform = 4, maxServices = 3 } = {}) {
  const chosen = new Set(categories);
  const hidden = new Set(overrides.filter((o) => o.mode === 'hide').map((o) => o.item_key));
  const added = new Map(overrides.filter((o) => o.mode === 'add').map((o) => [o.item_key, o]));

  const scored = RECOMMENDATION_ITEMS.map((item) => {
    let score = 0;
    const matched = [];
    for (const [cat, w] of Object.entries(item.weights)) {
      if (chosen.has(cat)) { score += w; matched.push(CAT_LABEL[cat]); }
    }
    return { item, score, matched, manual: false, note: null };
  }).filter((r) => r.score > 0 && !hidden.has(r.item.key));

  const byScore = (a, b) => b.score - a.score || RECOMMENDATION_ITEMS.indexOf(a.item) - RECOMMENDATION_ITEMS.indexOf(b.item);
  const platform = scored.filter((r) => r.item.kind === 'platform').sort(byScore).slice(0, maxPlatform);
  const services = scored.filter((r) => r.item.kind === 'service').sort(byScore).slice(0, maxServices);
  let result = [...services, ...platform].sort(byScore);

  // Manuelle Empfehlungen des Trainers stehen immer ganz oben.
  const manual = [];
  for (const [key, ov] of added.entries()) {
    const item = ITEM_BY_KEY[key];
    if (!item) continue;
    result = result.filter((r) => r.item.key !== key);
    manual.push({ item, score: 99, matched: [], manual: true, note: ov.note || null });
  }
  // Notiz an bereits automatisch empfohlene Einträge hängen ist nicht nötig:
  // 'add' ersetzt den automatischen Eintrag durch die manuelle Variante.
  return [...manual, ...result];
}

// ---------------------------------------------------------------------------
// Datenzugriff
// ---------------------------------------------------------------------------

export async function listInterests(clientId) {
  const { data, error } = await supabaseClient.from('client_interests').select('category').eq('client_id', clientId);
  return { data: (data || []).map((r) => r.category), error };
}

export async function setInterest(clientId, category, on) {
  if (on) {
    return supabaseClient.from('client_interests').upsert({ client_id: clientId, category }, { onConflict: 'client_id,category', ignoreDuplicates: true });
  }
  return supabaseClient.from('client_interests').delete().eq('client_id', clientId).eq('category', category);
}

export async function listOverrides(clientId) {
  return supabaseClient.from('client_recommendation_overrides').select('id, item_key, mode, note').eq('client_id', clientId);
}

export async function saveOverride({ clientId, itemKey, mode, note, adminId }) {
  return supabaseClient.from('client_recommendation_overrides').upsert(
    { client_id: clientId, item_key: itemKey, mode, note: note || null, created_by: adminId || null },
    { onConflict: 'client_id,item_key' },
  );
}

export async function removeOverride(clientId, itemKey) {
  return supabaseClient.from('client_recommendation_overrides').delete().eq('client_id', clientId).eq('item_key', itemKey);
}

// ---------------------------------------------------------------------------
// Darstellung
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const RUBRIC_TITLE = { training: 'Training', nutrition: 'Ernährung', coaching: 'Coaching' };

export function messageLink(context, text) {
  const q = new URLSearchParams();
  if (context) q.set('context', context);
  if (text) q.set('text', text);
  return `messages.html?${q.toString()}`;
}

function isRubricOpen(profile, rubric) {
  if (!rubric) return true;
  if (profile.role === 'admin') return true;
  return !!profile[`${rubric}_enabled`];
}

function recoCardHtml(rec, counts, profile, { adminView, clientId }) {
  const { item } = rec;
  const open = item.kind === 'service' ? true : isRubricOpen(profile, item.rubric);
  const meta = item.meta ? item.meta(counts) : null;
  let action;
  if (item.kind === 'service') {
    action = adminView ? '' : `<a class="reco-cta" href="${esc(messageLink(item.context, `Hallo Nicholas, ich interessiere mich für ${item.ask}. Können wir dazu sprechen?`))}">${esc(item.cta)} →</a>`;
  } else if (open) {
    action = adminView ? '' : `<a class="reco-cta" href="${esc(item.href)}">${esc(item.cta)} →</a>`;
  } else {
    action = adminView ? '<span class="reco-lock">🔒 beim Kunden noch nicht freigeschaltet</span>'
      : `<a class="reco-cta" href="${esc(messageLink(RUBRIC_TITLE[item.rubric], `Hallo Nicholas, ich würde gern den Bereich ${RUBRIC_TITLE[item.rubric]} freigeschaltet bekommen. Was brauchst du dafür von mir?`))}">🔒 ${esc(RUBRIC_TITLE[item.rubric])} anfragen →</a>`;
  }
  const why = rec.manual
    ? '<span class="reco-why reco-manual">Persönlich für dich von Nicholas ausgewählt</span>'
    : `<span class="reco-why">Passt zu: ${esc(rec.matched.join(' · '))}</span>`;
  const adminTools = adminView ? `<div class="reco-admin"><button type="button" class="reco-hide" data-hide-key="${esc(item.key)}" data-manual="${rec.manual ? '1' : ''}">${rec.manual ? 'Entfernen' : 'Ausblenden'}</button></div>` : '';
  return `<div class="reco-card ${item.kind}${rec.manual ? ' manual' : ''}${open ? '' : ' locked'}" data-reco="${esc(item.key)}">
    <div class="reco-ico" aria-hidden="true">${item.icon}</div>
    <div class="reco-body">
      <div class="reco-kicker">${item.kind === 'service' ? 'Leistung von Nicholas' : `Plattform · ${esc(RUBRIC_TITLE[item.rubric] || 'Für alle')}`}</div>
      <h4>${esc(item.title)}</h4>
      <p>${esc(item.text)}</p>
      ${meta ? `<div class="reco-meta">${esc(meta)}</div>` : ''}
      ${rec.note ? `<div class="reco-note">„${esc(rec.note)}“ – Nicholas</div>` : ''}
      ${why}
      ${action}
      ${adminTools}
    </div>
  </div>`;
}

/**
 * Rendert die Interessen-Auswahl samt Empfehlungen in ein Element.
 * opts: { profile (der angezeigte Kunde bzw. bei Trainer-Ansicht das Kundenprofil),
 *         viewer (eingeloggtes Profil), adminView: boolean }
 * Zeigt nichts, solange kein aktives GROW-Ziel existiert (hasActiveGoal=false).
 */
export async function renderInterestsCard(el, { profile, viewer, adminView = false, hasActiveGoal = true }) {
  if (!el) return;
  if (!hasActiveGoal) { el.innerHTML = ''; return; }
  const clientId = profile.id;
  const [{ data: cats, error }, { data: overrides }, counts] = await Promise.all([
    listInterests(clientId), listOverrides(clientId), loadSectionCounts(),
  ]);
  if (error) { el.innerHTML = ''; return; } // Tabelle fehlt (Migration 054 noch offen) → Bereich bleibt unsichtbar
  const state = { cats: new Set(cats), overrides: overrides || [] };

  const paint = () => {
    const recs = computeRecommendations({ categories: Array.from(state.cats), overrides: state.overrides });
    const hiddenRows = state.overrides.filter((o) => o.mode === 'hide' && ITEM_BY_KEY[o.item_key]);
    const addable = RECOMMENDATION_ITEMS.filter((i) => !recs.some((r) => r.item.key === i.key));
    el.innerHTML = `
      <div class="reco-wrap">
        <h4 class="reco-title">${adminView ? 'Interessen &amp; Empfehlungen' : 'Mehr aus der Plattform für dich herausholen'}</h4>
        <p class="reco-lead">${adminView
          ? 'Das hat der Kunde als Interesse angeklickt. Daraus ergeben sich diese Empfehlungen – du kannst einzelne ausblenden oder eigene ergänzen.'
          : 'Du möchtest noch mehr Nutzen aus der Plattform für dich ziehen? Wähle Kategorien, die dich interessieren – ich zeige dir, was dazu passt.'}</p>
        <div class="reco-chips" role="group" aria-label="Interessen-Kategorien">
          ${INTEREST_CATEGORIES.map((c) => `<button type="button" class="reco-chip${state.cats.has(c.key) ? ' on' : ''}" data-cat="${c.key}" aria-pressed="${state.cats.has(c.key)}" ${adminView ? 'disabled' : ''}><span aria-hidden="true">${c.icon}</span> ${esc(c.label)}</button>`).join('')}
        </div>
        <div class="reco-list">
          ${recs.length ? recs.map((r) => recoCardHtml(r, counts, profile, { adminView, clientId })).join('') : (state.cats.size ? '<p class="reco-empty">Dazu fällt mir gerade nichts ein.</p>' : (adminView ? '<p class="reco-empty">Der Kunde hat noch keine Kategorien gewählt.</p>' : ''))}
        </div>
        ${adminView ? `
          <div class="reco-admin-panel">
            <h5>Eigene Empfehlung ergänzen</h5>
            <div class="reco-add-row">
              <select class="reco-add-item">${addable.map((i) => `<option value="${i.key}">${esc(i.kind === 'service' ? 'Leistung' : 'Plattform')}: ${esc(i.title)}</option>`).join('')}</select>
              <input class="reco-add-note" type="text" placeholder="Persönliche Notiz (optional)" maxlength="240" />
              <button type="button" class="btn small-btn reco-add-btn">Ergänzen</button>
            </div>
            ${hiddenRows.length ? `<p class="reco-hidden">Ausgeblendet: ${hiddenRows.map((o) => `${esc((ITEM_BY_KEY[o.item_key] || {}).title || o.item_key)} <button type="button" class="reco-unhide" data-unhide="${esc(o.item_key)}">wieder einblenden</button>`).join(' · ')}</p>` : ''}
          </div>` : ''}
      </div>`;

    if (!adminView) {
      el.querySelectorAll('.reco-chip').forEach((btn) => btn.addEventListener('click', async () => {
        const cat = btn.dataset.cat;
        const on = !state.cats.has(cat);
        if (on) state.cats.add(cat); else state.cats.delete(cat);
        paint();
        const { error: saveError } = await setInterest(clientId, cat, on);
        if (saveError) { // zurückrollen
          if (on) state.cats.delete(cat); else state.cats.add(cat);
          paint();
        }
      }));
    } else {
      const reload = async () => {
        const { data } = await listOverrides(clientId);
        state.overrides = data || [];
        paint();
      };
      el.querySelectorAll('.reco-hide').forEach((btn) => btn.addEventListener('click', async () => {
        const key = btn.dataset.hideKey;
        if (btn.dataset.manual) await removeOverride(clientId, key);
        else await saveOverride({ clientId, itemKey: key, mode: 'hide', adminId: viewer.id });
        await reload();
      }));
      el.querySelectorAll('.reco-unhide').forEach((btn) => btn.addEventListener('click', async () => {
        await removeOverride(clientId, btn.dataset.unhide);
        await reload();
      }));
      const addBtn = el.querySelector('.reco-add-btn');
      if (addBtn) addBtn.addEventListener('click', async () => {
        const key = el.querySelector('.reco-add-item').value;
        const note = el.querySelector('.reco-add-note').value.trim();
        if (!key) return;
        await saveOverride({ clientId, itemKey: key, mode: 'add', note, adminId: viewer.id });
        await reload();
      });
    }
  };
  paint();
}
