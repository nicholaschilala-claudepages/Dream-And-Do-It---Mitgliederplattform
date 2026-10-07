// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 21 / Q10: Belohnungs-Effekte (rein visuell, ohne Ton)
//
//  - celebrateSessionComplete(): kurzes Vollbild-Overlay nach "Einheit beenden"
//    mit Konfetti, Kennzahlen der Einheit und Highlights (Rekord, Serie,
//    neuer Erfolg).
//  - miniSetDone() / miniRowDone() / miniPr(): kleine Effekte beim Abhaken
//    eines Satzes, einer ganzen Übung und bei einem neuen Rekord.
//
// Barrierefreiheit: Bei "Bewegung reduzieren" (prefers-reduced-motion) gibt es
// keine Animation – das Overlay blendet nur ruhig ein. Das Overlay ist
// antippbar/schließbar (Klick, Escape) und schließt nach ein paar Sekunden von
// selbst. Es gibt bewusst weder Ton noch Vibration.
// ============================================================================

const STYLE_ID = 'dadi-celebrate-style';
const COLORS = ['#FAC233', '#C87C00', '#0a4a63', '#4F9FD6', '#2f6f4f', '#f2efe9'];

export function prefersReducedMotion() {
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (_) { return false; }
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const st = document.createElement('style');
  st.id = STYLE_ID;
  st.textContent = `
.cel-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(5,52,70,0.82); opacity: 0; transition: opacity .25s ease; }
.cel-overlay.show { opacity: 1; }
.cel-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.cel-card { position: relative; z-index: 1; width: min(420px, 100%); background: var(--color-surface, #fff); color: var(--color-text, #0f2530); border-radius: 16px; padding: 26px 22px 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.4); border-top: 5px solid var(--color-gold-light, #FAC233); transform: translateY(14px) scale(.96); transition: transform .35s cubic-bezier(.2,1.3,.4,1); }
.cel-overlay.show .cel-card { transform: none; }
.cel-badge { width: 76px; height: 76px; margin: -62px auto 10px; border-radius: 50%; background: var(--color-navy, #053446); color: var(--color-gold-light, #FAC233); display: flex; align-items: center; justify-content: center; font-size: 2.3rem; box-shadow: 0 6px 18px rgba(0,0,0,0.3); border: 3px solid var(--color-gold-light, #FAC233); }
.cel-title { font-family: var(--font-heading, serif); font-size: 1.35rem; margin: 6px 0 4px; color: var(--color-navy, #053446); }
:root[data-theme="dark"] .cel-title { color: var(--color-gold-light, #FAC233); }
.cel-sub { margin: 0 0 14px; color: var(--color-text-muted, #4a6472); font-size: 0.9rem; }
.cel-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 8px; margin: 0 0 12px; }
.cel-stat { background: var(--color-bg, #FAFAF8); border: 1px solid var(--color-border, #e2e4e0); border-radius: 10px; padding: 8px 4px; }
.cel-stat b { display: block; font-size: 1.1rem; color: var(--color-navy, #053446); }
:root[data-theme="dark"] .cel-stat b { color: var(--color-gold-light, #FAC233); }
.cel-stat span { font-size: 0.7rem; color: var(--color-text-muted, #4a6472); text-transform: uppercase; letter-spacing: .04em; }
.cel-hl { list-style: none; margin: 0 0 12px; padding: 0; text-align: left; }
.cel-hl li { display: flex; gap: 8px; align-items: flex-start; padding: 7px 10px; margin-bottom: 6px; border-radius: 8px; background: rgba(250,194,51,0.16); font-size: 0.88rem; line-height: 1.35; }
.cel-hl li i { font-style: normal; flex-shrink: 0; }
.cel-close { margin-top: 4px; }
.cel-hint { font-size: 0.72rem; color: var(--color-text-muted, #4a6472); margin: 8px 0 0; }
.cel-overlay.cel-calm .cel-card { transform: none; transition: none; }
@keyframes cel-pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
@keyframes cel-glow { 0% { box-shadow: 0 0 0 0 rgba(250,194,51,0.75); } 100% { box-shadow: 0 0 0 16px rgba(250,194,51,0); } }
@keyframes cel-spark { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; } }
@keyframes cel-float { 0% { transform: translate(-50%, 0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(-50%, -34px); opacity: 0; } }
.cel-pop { animation: cel-pop .45s ease; }
.cel-glow { animation: cel-glow .8s ease-out; }
.cel-spark { position: fixed; width: 7px; height: 7px; border-radius: 50%; pointer-events: none; z-index: 1500; animation: cel-spark .7s ease-out forwards; }
.cel-float { position: fixed; z-index: 1500; pointer-events: none; font-size: 0.8rem; font-weight: 700; color: var(--color-gold, #C87C00); background: var(--color-surface, #fff); border: 1px solid var(--color-gold-light, #FAC233); padding: 2px 8px; border-radius: 999px; animation: cel-float 1.1s ease-out forwards; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .cel-overlay, .cel-card { transition: none !important; }
  .cel-pop, .cel-glow, .cel-spark, .cel-float { animation: none !important; }
  .cel-float { opacity: 1; }
}
`;
  document.head.appendChild(st);
}

// ---------------------------------------------------------------------------
// Konfetti (Canvas, ca. 70 Partikel, endet von selbst)
// ---------------------------------------------------------------------------
function launchConfetti(canvas, { durationMs = 2600 } = {}) {
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return () => {};
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  };
  resize();
  const W = () => canvas.width;
  const H = () => canvas.height;
  const N = 70;
  const parts = Array.from({ length: N }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: (fromLeft ? 0.1 : 0.9) * W(),
      y: H() * 0.55,
      vx: (fromLeft ? 1 : -1) * (2 + Math.random() * 6) * dpr,
      vy: -(6 + Math.random() * 9) * dpr,
      g: (0.22 + Math.random() * 0.08) * dpr,
      w: (6 + Math.random() * 6) * dpr,
      h: (4 + Math.random() * 5) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[i % COLORS.length],
    };
  });
  let raf = 0;
  let stopped = false;
  const t0 = performance.now();
  const frame = (now) => {
    if (stopped) return;
    const t = now - t0;
    ctx.clearRect(0, 0, W(), H());
    const fade = t > durationMs - 700 ? Math.max(0, (durationMs - t) / 700) : 1;
    ctx.globalAlpha = fade;
    for (const p of parts) {
      p.vy += p.g;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < durationMs) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W(), H());
  };
  raf = requestAnimationFrame(frame);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}

// ---------------------------------------------------------------------------
// Overlay nach Trainingsende
// ---------------------------------------------------------------------------

/**
 * @param {object} opts
 * @param {object} opts.stats       { durationMin, sets, volumeKg, exercises }
 * @param {Array}  opts.highlights  [{ icon, text }]
 * @param {number} [opts.autoCloseMs=4800]
 * @returns {Promise<void>} resolved, sobald das Overlay geschlossen ist
 */
export function celebrateSessionComplete({ stats = {}, highlights = [], autoCloseMs = 4800 } = {}) {
  return new Promise((resolve) => {
    try {
      ensureStyle();
      const reduce = prefersReducedMotion();
      const statItems = [
        stats.durationMin != null ? { v: `${stats.durationMin} Min.`, l: 'Dauer' } : null,
        stats.exercises ? { v: String(stats.exercises), l: stats.exercises === 1 ? 'Übung' : 'Übungen' } : null,
        stats.sets ? { v: String(stats.sets), l: stats.sets === 1 ? 'Satz' : 'Sätze' } : null,
        stats.volumeKg ? { v: `${Math.round(stats.volumeKg).toLocaleString('de-DE')} kg`, l: 'Volumen' } : null,
      ].filter(Boolean);

      const overlay = document.createElement('div');
      overlay.className = 'cel-overlay' + (reduce ? ' cel-calm' : '');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Trainingseinheit abgeschlossen');
      overlay.innerHTML = `
        ${reduce ? '' : '<canvas class="cel-canvas" aria-hidden="true"></canvas>'}
        <div class="cel-card">
          <div class="cel-badge" aria-hidden="true">🏆</div>
          <h2 class="cel-title">Einheit geschafft!</h2>
          <p class="cel-sub">Stark – du bist drangeblieben. Genau das macht den Unterschied.</p>
          ${statItems.length ? `<div class="cel-stats">${statItems.map((s) => `<div class="cel-stat"><b>${escapeHtml(s.v)}</b><span>${escapeHtml(s.l)}</span></div>`).join('')}</div>` : ''}
          ${highlights.length ? `<ul class="cel-hl">${highlights.map((h) => `<li><i aria-hidden="true">${escapeHtml(h.icon || '⭐')}</i><span>${escapeHtml(h.text)}</span></li>`).join('')}</ul>` : ''}
          <button type="button" class="btn cel-close">Weiter</button>
          <p class="cel-hint">Tippe irgendwo, um zu schließen.</p>
        </div>`;
      document.body.appendChild(overlay);

      let stopConfetti = () => {};
      let closed = false;
      let timer = null;
      const close = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        stopConfetti();
        document.removeEventListener('keydown', onKey);
        overlay.classList.remove('show');
        setTimeout(() => { overlay.remove(); resolve(); }, reduce ? 0 : 250);
      };
      const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); };
      document.addEventListener('keydown', onKey);
      overlay.addEventListener('click', close);

      requestAnimationFrame(() => {
        overlay.classList.add('show');
        const cv = overlay.querySelector('.cel-canvas');
        if (cv) stopConfetti = launchConfetti(cv);
        const btn = overlay.querySelector('.cel-close');
        if (btn) btn.focus({ preventScroll: true });
      });
      timer = setTimeout(close, autoCloseMs + (highlights.length * 700));
    } catch (e) {
      // Der Effekt darf den Ablauf nie blockieren.
      console.warn('celebrate failed', e);
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Mini-Effekte
// ---------------------------------------------------------------------------

function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function sparkBurst(el, count = 8) {
  if (prefersReducedMotion() || !el) return;
  const { x, y } = center(el);
  for (let i = 0; i < count; i += 1) {
    const s = document.createElement('span');
    s.className = 'cel-spark';
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 26 + Math.random() * 18;
    s.style.left = `${x - 3}px`;
    s.style.top = `${y - 3}px`;
    s.style.background = COLORS[i % COLORS.length];
    s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function restart(el, cls, ms) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // Reflow, damit die Animation neu startet
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

/** Ein Satz wurde abgehakt. */
export function miniSetDone(okBtn) {
  try { ensureStyle(); restart(okBtn, 'cel-pop', 500); } catch (_) { /* ignore */ }
}

/** Eine Übung ist komplett (alle Sätze). */
export function miniRowDone(rowEl) {
  try {
    ensureStyle();
    const ok = rowEl && rowEl.querySelector('.row-ok');
    restart(ok, 'cel-glow', 900);
    restart(ok, 'cel-pop', 500);
    sparkBurst(ok, 10);
  } catch (_) { /* ignore */ }
}

/** Neuer persönlicher Rekord bei einem Satz. */
export function miniPr(anchorEl, label = 'Neuer Rekord!') {
  try {
    ensureStyle();
    if (!anchorEl) return;
    sparkBurst(anchorEl, 12);
    const { x, y } = center(anchorEl);
    const f = document.createElement('div');
    f.className = 'cel-float';
    f.textContent = `🏅 ${label}`;
    f.style.left = `${x}px`;
    f.style.top = `${y - 24}px`;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  } catch (_) { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Reine Berechnung der Einheits-Kennzahlen (testbar, ohne DOM)
// ---------------------------------------------------------------------------

/**
 * @param {Array} sessionLogs Logs der Einheit (reps, weight_kg, duration_seconds, exercise_id)
 * @param {string} startedAt  ISO-Zeitstempel Start
 * @param {string|Date} [endedAt]
 */
export function computeSessionStats(sessionLogs, startedAt, endedAt = new Date()) {
  const logs = Array.isArray(sessionLogs) ? sessionLogs : [];
  const exercises = new Set(logs.map((l) => l.exercise_id).filter(Boolean)).size;
  let volumeKg = 0;
  for (const l of logs) {
    const w = Number(l.weight_kg) || 0;
    const r = Number(l.reps) || 0;
    if (w > 0 && r > 0) volumeKg += w * r;
  }
  let durationMin = null;
  if (startedAt) {
    const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (Number.isFinite(ms) && ms >= 0) durationMin = Math.max(1, Math.round(ms / 60000));
  }
  return { sets: logs.length, exercises, volumeKg, durationMin };
}

/**
 * Baut die Highlight-Zeilen aus den Ergebnissen.
 * @param {object} p { prEvents (in dieser Einheit), streak, newAchievements:[{icon,title}] }
 */
export function buildHighlights({ prEvents = [], streak = null, newAchievements = [] } = {}) {
  const out = [];
  // Je Übung nur den stärksten Rekord nennen (Gewichts-PR vor 1RM vor Wdh.).
  const rank = { weight: 3, e1rm: 2, reps: 1 };
  const best = new Map();
  for (const e of prEvents) {
    const cur = best.get(e.exerciseId);
    if (!cur || (rank[e.type] || 0) > (rank[cur.type] || 0)) best.set(e.exerciseId, e);
  }
  const prs = Array.from(best.values());
  prs.slice(0, 3).forEach((e) => {
    const detail = e.type === 'reps' ? `${e.reps} Wdh.` : `${String(e.weightKg).replace('.', ',')} kg × ${e.reps}`;
    out.push({ icon: '🏅', text: `Neuer Rekord: ${e.exerciseName} (${detail})` });
  });
  if (prs.length > 3) out.push({ icon: '🏅', text: `… und ${prs.length - 3} weitere Rekorde` });
  if (streak && streak.currentStreak >= 2) {
    out.push({ icon: '🔥', text: `${streak.currentStreak} Wochen in Folge trainiert – bleib dran!` });
  } else if (streak && streak.currentStreak === 1 && streak.longestStreak <= 1) {
    out.push({ icon: '🌱', text: 'Der Start einer neuen Serie – die erste Woche läuft.' });
  }
  newAchievements.slice(0, 3).forEach((a) => out.push({ icon: a.icon || '🎉', text: `Neuer Erfolg: ${a.title}` }));
  // Das Overlay soll kurz und feierlich bleiben: höchstens fünf Zeilen.
  return out.slice(0, 5);
}
