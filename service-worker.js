// ============================================================================
// Service Worker – Grundgerüst für Offline-/Installierbarkeit der PWA
// Cached nur die statische App-Hülle (HTML/CSS/JS/Icons), keine Live-Daten.
// Bei jeder inhaltlichen Änderung CACHE_NAME hochzählen, damit Nutzer die
// neue Version bekommen.
// ============================================================================

const CACHE_NAME = 'dadi-plattform-v3';
const APP_SHELL = [
  './',
  'index.html',
  'dashboard.html',
  'reset-password.html',
  'training.html',
  'css/styles.css',
  'js/config.js',
  'js/supabase-client.js',
  'js/auth.js',
  'js/training.js',
  'js/offline-queue.js',
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
