// Offline support for the installed app. When online it always loads the latest version (so
// updates show up on the very next launch), and falls back to the saved copy when offline.
// Bump VERSION when you add or rename files.
const VERSION = 'cluck-v3';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'js/audio.js', 'js/draw.js', 'js/game.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/fonts.css', 'fonts/rammetto-one-latin-400-normal.woff2',
  'fonts/barlow-semi-condensed-latin-500-normal.woff2', 'fonts/barlow-semi-condensed-latin-700-normal.woff2',
  'fonts/barlow-semi-condensed-latin-800-normal.woff2', 'privacy.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      try {
        // revalidate with the server instead of trusting the browser's HTTP cache
        const res = await fetch(e.request, { cache: 'no-cache' });
        if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(e.request, { ignoreSearch: true });
        if (cached) return cached;
        throw err;
      }
    }),
  );
});
