// ============================================================================
// Dream And Do It – Kundenplattform
// Runde 22: Einwilligungs-Abfrage für bestehende Kunden (und nach Änderung
// der Rechtstexte). Wird von requireAuth() (js/auth.js) aufgerufen.
//
// Neue Kunden erteilen die Einwilligung direkt bei der Registrierung
// (index.html). Wer sich vor Migration 055 registriert hat – oder wessen
// Einwilligung sich auf eine ältere Textversion bezieht – sieht einmalig diese
// Abfrage. Ohne Zustimmung geht es nicht weiter; "Abmelden" ist jederzeit
// möglich. Gespeichert wird serverseitig über record_my_consent().
// ============================================================================
import { supabaseClient } from './supabase-client.js';
import { LEGAL_VERSION, CONSENT_TEXTS } from './legal-content.js';

export function needsConsent(profile) {
  if (!profile || profile.role !== 'client') return false;
  // Spalten fehlen (Migration 055 noch nicht ausgeführt): nicht blockieren.
  if (!('consent_health_at' in profile)) return false;
  return !profile.consent_terms_at || !profile.consent_health_at || profile.consent_version !== LEGAL_VERSION;
}

/** Zeigt die Abfrage als Vollbild-Dialog. Gibt true zurück, wenn zugestimmt wurde, sonst false (abgemeldet). */
export function askConsent(profile) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'consent-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'consent-title');
    const first = !profile.consent_health_at;
    wrap.innerHTML = `
      <div class="consent-card">
        <h2 id="consent-title">${first ? 'Kurz vor dem Start' : 'Aktualisierte Datenschutzhinweise'}</h2>
        <p>${first
          ? 'Damit ich dich auf der Plattform begleiten kann, brauche ich zwei Bestätigungen von dir. Das dauert nur einen Moment.'
          : 'Die Texte haben sich geändert. Bitte bestätige sie noch einmal.'}</p>
        <label class="consent-row"><input type="checkbox" id="consent-terms" /><span>${CONSENT_TEXTS.terms}</span></label>
        <label class="consent-row"><input type="checkbox" id="consent-health" /><span>${CONSENT_TEXTS.health}</span></label>
        <div class="msg error hidden" id="consent-msg" role="alert"></div>
        <button type="button" class="btn" id="consent-ok" disabled>Bestätigen und weiter</button>
        <button type="button" class="btn link" id="consent-out">Abmelden</button>
      </div>`;
    document.body.appendChild(wrap);
    const t = wrap.querySelector('#consent-terms');
    const h = wrap.querySelector('#consent-health');
    const ok = wrap.querySelector('#consent-ok');
    const msg = wrap.querySelector('#consent-msg');
    const sync = () => { ok.disabled = !(t.checked && h.checked); };
    t.addEventListener('change', sync);
    h.addEventListener('change', sync);
    ok.addEventListener('click', async () => {
      ok.disabled = true;
      const { error } = await supabaseClient.rpc('record_my_consent', { p_version: LEGAL_VERSION });
      if (error) {
        msg.textContent = 'Das hat leider nicht geklappt. Bitte prüfe deine Verbindung und versuche es erneut.';
        msg.classList.remove('hidden');
        sync();
        return;
      }
      wrap.remove();
      resolve(true);
    });
    wrap.querySelector('#consent-out').addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
      resolve(false);
    });
  });
}
