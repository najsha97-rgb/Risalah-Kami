/**
 * Service Worker: Risalah Kami PWA
 * Offline-First dengan Perlindungan Penuh Anti-Redirect Cloudflare Pages
 */

const CACHE_NAME = 'risalah-kami-v112';
const ASSETS_TO_CACHE = [
  './',
  './css/style.css',
  './js/app.js',
  './data/risalah_data.js',
  './data/risalah_data.json',
  './manifest.json',
  './icons/favicon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './docs/00_Peta_Indeks_Tetralogi.md',
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

// Buang flag redirected dengan selamat (elak status < 200 seperti opaqueredirect)
async function toCleanResponse(response) {
  if (!response || !response.redirected) return response;
  if (response.status < 200 || response.status > 599) return response;
  const buffer = await response.clone().arrayBuffer();
  const headers = new Headers(response.headers);
  return new Response(buffer, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Caching App Shell and Offline Assets (v111)');
      await Promise.allSettled(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const req = new Request(url, { cache: 'reload', redirect: 'follow' });
            const res = await fetch(req);
            if (res && res.ok) {
              const clean = await toCleanResponse(res);
              await cache.put(url, clean);
            }
          } catch (err) {
            console.warn('[ServiceWorker] Gagal cache aset:', url, err);
          }
        })
      );
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
  if (event.request.method !== 'GET') return;

  // 1. Permintaan navigasi halaman (/ atau /index.html):
  // Sentiasa fetch laluan kanonik './' secara terus (status 200, elak 308 redirect Pretty URLs)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('./', { cache: 'no-cache' })
        .then(async (networkResponse) => {
          const clean = await toCleanResponse(networkResponse);
          if (clean && clean.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('./', clean.clone());
          }
          return clean;
        })
        .catch(async () => {
          const cached = await caches.match('./');
          if (cached) return toCleanResponse(cached);
          const fallback = await caches.match(event.request, { ignoreSearch: true });
          return fallback ? toCleanResponse(fallback) : Response.error();
        })
    );
    return;
  }

  // 2. Aset statik & dokumen: Cache-first (ignoreSearch sokong ?v=110)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return toCleanResponse(cachedResponse);
      }
      return fetch(event.request).then(async (networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const clean = await toCleanResponse(networkResponse);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, clean.clone());
        return clean;
      }).catch(async () => {
        const acceptHeader = event.request.headers.get('accept') || '';
        if (acceptHeader.includes('text/html')) {
          const cached = await caches.match('./');
          if (cached) return toCleanResponse(cached);
        }
        return Response.error();
      });
    })
  );
});
