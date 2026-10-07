// ============================================================================
// Service Worker – Grundgerüst für Offline-/Installierbarkeit der PWA
// Cached nur die statische App-Hülle (HTML/CSS/JS/Icons), keine Live-Daten.
// Bei jeder inhaltlichen Änderung CACHE_NAME hochzählen, damit Nutzer die
// neue Version bekommen.
// ============================================================================

const CACHE_NAME = 'dadi-plattform-v48';
const APP_SHELL = [
  './',
  'index.html',
  'dashboard.html',
  'reset-password.html',
  'training.html',
  'nutrition.html',
  'coaching.html',
  'betrieb.html',
  'messages.html',
  'erfolge.html',
  'css/styles.css',
  'js/config.js',
  'js/supabase-client.js',
  'js/auth.js',
  'js/training.js',
  'js/monthly-report.js',
  'js/prevention.js',
  'js/achievements.js',
  'js/offline-queue.js',
  'js/nutrition.js',
  'js/coaching.js',
  'js/betrieb.js',
  'js/messages.js',
  'js/section-info.js',
  'js/celebrate.js',
  'js/recommendations.js',
  'js/nav.js',
  'js/icons.js',
  'js/legal.js',
  'js/legal-content.js',
  'js/legal-links.js',
  'js/consent.js',
  'js/onboarding.js',
  'impressum.html',
  'datenschutz.html',
  'nutzungsbedingungen.html',
  'js/subnav.js',
  'js/collapsible.js',
  'js/subtab-access.js',
  'fonts/cinzel-latin-500-normal.woff2',
  'fonts/cinzel-latin-600-normal.woff2',
  'fonts/cinzel-latin-700-normal.woff2',
  'fonts/source-serif-4-latin-wght-normal.woff2',
  'fonts/source-serif-4-latin-wght-italic.woff2',
  'vendor/supabase-js-2.117.2.min.js',
  'vendor/jspdf-2.5.1.umd.min.js',
  'icons/nicholas-portrait.jpg',
  'icons/logo-mark.png',
  'icons/logo-mark-badge.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/logo-full.png',
  'icons/logo-full-darkbg.png',
  'manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase-Anfragen (Auth/Daten) NIE aus dem Cache bedienen – die müssen
  // immer live gehen, sonst arbeitet man mit veralteten Daten.
  if (url.hostname.endsWith('.supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
