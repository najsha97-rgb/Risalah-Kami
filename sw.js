/**
 * Service Worker: Risalah Kami PWA
 * Offline Cache First Strategy
 */

const CACHE_NAME = 'risalah-kami-v73';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './data/risalah_data.js',
  './data/risalah_data.json',
  './manifest.json',
  './icons/favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './docs/01_Risalah_Dawatuna.docx',
  './docs/01_Risalah_Dawatuna.md',
  './docs/02_Risalah_Ila_Ayyi_Syai_Nadun_Nas.docx',
  './docs/02_Risalah_Ila_Ayyi_Syai_Nadun_Nas.md',
  './docs/03_Risalah_Hal_Nahnu_Qaumun_Amaliyyun.docx',
  './docs/03_Risalah_Hal_Nahnu_Qaumun_Amaliyyun.md',
  './docs/04_Risalah_Muhimmatuna.docx',
  './docs/04_Risalah_Muhimmatuna.md',
  './docs/05_Sumbangan_Risalah_Kami_Dalam_Ummah_Fadhilah_Kuasa_Nasional_dan_PBI.docx',
  './docs/05_Sumbangan_Risalah_Kami_Dalam_Ummah_Fadhilah_Kuasa_Nasional_dan_PBI.md'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching App Shell and Offline Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya proses GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback jika offline dan request halaman html
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
