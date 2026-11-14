/**
 * sw.js - Service Worker para PWA (Progressive Web App)
 * Permite que Caça aos Porcos funcione como um App Mobile instalável e offline.
 */

const CACHE_NAME = 'caca-porcos-v2.5.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './src/styles/style.css',
  './src/styles/icon.svg',
  './src/audio/audio.js',
  './src/systems/weapons.js',
  './src/entities/pig.js',
  './src/entities/sniper_horizon.js',
  './src/systems/particles.js',
  './src/systems/environment.js',
  './src/systems/gun_render.js',
  './src/core/game.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
