// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22: Willkommens-Ablauf (3 Schritte) und Karte "Dein nächster Schritt"
// für die Kunden-Startseite.
//
// - computeNextStep(): reine Funktion, wählt aus dem Stand des Kunden den
//   einen sinnvollsten nächsten Schritt (oder null, wenn alles erledigt ist).
// - nextStepHtml(): Markup der Karte (oberhalb der Begrüßung).
// - maybeShowOnboarding(): einmaliger Willkommens-Ablauf nach der ersten
//   Anmeldung; jederzeit überspringbar. Gemerkt wird das in
//   profiles.onboarding_seen_at (sql/055) und zusätzlich im Browser.
// ============================================================================
import { supabaseClient } from './supabase-client.js';
import { icon } from './icons.js';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @param {object} profile Profil (training_enabled, nutrition_enabled, coaching_enabled)
 * @param {object} ctx { hasBasics:boolean, goalsCount:number, trainingLogs:number }
 * @returns {{key:string,icon:string,title:string,text:string,cta:string,href:string,action?:string}|null}
 */
export function computeNextStep(profile, ctx) {
  const c = ctx || {};
  const anyEnabled = !!(profile.training_enabled || profile.nutrition_enabled || profile.coaching_enabled);
  if (!anyEnabled) {
    return {
      key: 'waiting',
      icon: 'hourglass',
      title: 'Dein Zugang wird geprüft',
      text: 'Ich schalte dir deine Bereiche persönlich frei. Schau danach einfach wieder rein, dann stehen sie dir zur Verfügung. Wenn du magst, sag mir schon jetzt, was du dir vornimmst.',
      cta: 'Nachricht an Nicholas',
      href: 'messages.html?context=Sonstiges&text=' + encodeURIComponent('Hallo Nicholas, ich habe mich registriert und freue mich auf den Start. Mein Ziel: '),
    };
  }
  if (c.hasBasics === false) {
    return {
      key: 'profile',
      icon: 'user-round',
      title: 'Vervollständige dein Profil',
      text: 'Geburtsdatum, Größe und Geschlecht brauche ich, damit PAL-Rechner, Testwerte und Präventionscheck zu dir passen. Das dauert eine halbe Minute.',
      cta: 'Profil ergänzen',
      href: '#profile-strip',
      action: 'profile',
    };
  }
  if (profile.coaching_enabled && c.goalsCount === 0) {
    return {
      key: 'goal',
      icon: 'target',
      title: 'Setz dir dein erstes Ziel',
      text: 'Ein klares Ziel macht den Unterschied. Mit dem GROW-Modell formulierst du es in wenigen Minuten, ich begleite dich dabei.',
      cta: 'Ziel anlegen',
      href: 'coaching.html?tab=ziele',
    };
  }
  if (profile.training_enabled && c.trainingLogs === 0) {
    return {
      key: 'train',
      icon: 'dumbbell',
      title: 'Starte dein erstes Training',
      text: 'Öffne deinen Plan, wähle den ersten Trainingstag und trage deine Sätze ein. Nach der Einheit wartet eine kleine Belohnung auf dich.',
      cta: 'Zum Trainingsplan',
      href: 'training.html?tab=plan',
    };
  }
  return null;
}

export function nextStepHtml(step) {
  if (!step) return '';
  return `
    <div class="next-step next-step-${esc(step.key)}" role="region" aria-label="Dein nächster Schritt">
      <div class="next-step-icon">${icon(step.icon)}</div>
      <div class="next-step-body">
        <span class="next-step-kicker">Dein nächster Schritt</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </div>
      <a class="btn next-step-cta" href="${esc(step.href)}"${step.action ? ` data-next-action="${esc(step.action)}"` : ''}>${esc(step.cta)} ${icon('arrow-right')}</a>
    </div>`;
}

// ---------------------------------------------------------------------------
// Willkommens-Ablauf
// ---------------------------------------------------------------------------
const STEPS = [
  {
    icon: 'sparkles',
    title: 'Schön, dass du da bist',
    text: 'Das hier ist dein persönlicher Bereich bei Dream And Do It. Hier laufen Training, Ernährung und Coaching zusammen, damit du siehst, wie weit du schon gekommen bist.',
    items: [
      ['dumbbell', 'Training', 'Dein Plan, dein Tagebuch, deine Rekorde.'],
      ['salad', 'Ernährung', 'Rechner, Protokoll und Rezepte.'],
      ['brain', 'Coaching', 'Ziele, Atemübungen und Impulse für Kopf und Alltag.'],
    ],
  },
  {
    icon: 'shield-check',
    title: 'So läuft dein Start',
    text: 'Ich schalte dir die Bereiche nach und nach persönlich frei. Was noch gesperrt ist, kannst du dir schon ansehen. Deine Daten gehören dir: Nur du und ich sehen sie, und du kannst jederzeit nachfragen oder die Löschung verlangen.',
    items: [
      ['lock-open', 'Freischaltung', 'Ich prüfe deinen Zugang und aktiviere deine Bereiche.'],
      ['message-circle', 'Direkter Draht', 'Über Nachrichten erreichst du mich jederzeit.'],
      ['heart-pulse', 'Gesundheitsdaten', 'Werden nur für dein Coaching genutzt, nie für Werbung.'],
    ],
  },
  {
    icon: 'rocket',
    title: 'Dein erster Schritt',
    text: 'Zwei Dinge bringen dich am schnellsten voran: Ergänze dein Profil, damit alle Werte zu dir passen, und setz dir ein Ziel. Du findest beides auf deiner Startseite.',
    items: [
      ['user-round', 'Profil', 'Geburtsdatum, Größe, Geschlecht – eine halbe Minute.'],
      ['target', 'Ziel', 'Mit dem GROW-Modell formulierst du, was du erreichen willst.'],
    ],
  },
];

function localKey(profile) { return `dadi-onboarding-${profile.id}`; }

export function onboardingNeeded(profile) {
  if (!profile || profile.role !== 'client' || profile.access_locked) return false;
  if (profile.onboarding_seen_at) return false;
  try { if (localStorage.getItem(localKey(profile))) return false; } catch (e) { /* ignore */ }
  return true;
}

async function markSeen(profile) {
  try { localStorage.setItem(localKey(profile), '1'); } catch (e) { /* ignore */ }
  try {
    await supabaseClient.from('profiles').update({ onboarding_seen_at: new Date().toISOString() }).eq('id', profile.id);
  } catch (e) { /* Migration 055 evtl. noch nicht ausgeführt – lokal gemerkt */ }
}

export function maybeShowOnboarding(profile) {
  if (!onboardingNeeded(profile)) return;
  let i = 0;
  const wrap = document.createElement('div');
  wrap.className = 'onb-overlay';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'onb-title');
  document.body.appendChild(wrap);
  const prevFocus = document.activeElement;

  const finish = async () => {
    wrap.remove();
    document.removeEventListener('keydown', onKey);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    await markSeen(profile);
  };
  const onKey = (e) => { if (e.key === 'Escape') finish(); };
  document.addEventListener('keydown', onKey);

  function draw() {
    const s = STEPS[i];
    const last = i === STEPS.length - 1;
    wrap.innerHTML = `
      <div class="onb-card">
        <div class="onb-top">
          <span class="onb-count">Schritt ${i + 1} von ${STEPS.length}</span>
          <button type="button" class="onb-skip" id="onb-skip">Überspringen</button>
        </div>
        <div class="onb-icon">${icon(s.icon)}</div>
        <h2 id="onb-title">${esc(s.title)}</h2>
        <p class="onb-text">${esc(s.text)}</p>
        <ul class="onb-items">${s.items.map(([ic, h, t]) => `<li><span class="onb-item-icon">${icon(ic)}</span><span><b>${esc(h)}</b><br>${esc(t)}</span></li>`).join('')}</ul>
        <div class="onb-dots" aria-hidden="true">${STEPS.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="onb-actions">
          ${i > 0 ? '<button type="button" class="btn onb-back" id="onb-back">Zurück</button>' : ''}
          <button type="button" class="btn" id="onb-next">${last ? 'Los geht’s' : 'Weiter'}</button>
        </div>
      </div>`;
    wrap.querySelector('#onb-skip').addEventListener('click', finish);
    const back = wrap.querySelector('#onb-back');
    if (back) back.addEventListener('click', () => { i -= 1; draw(); });
    const next = wrap.querySelector('#onb-next');
    next.addEventListener('click', () => { if (last) finish(); else { i += 1; draw(); } });
    next.focus();
  }
  draw();
}
