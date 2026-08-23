// v1 -> v2: HTMLページのキャッシュ戦略を stale-while-revalidate から network-first に変更したため、
// バージョン名を変えて全ユーザーの古いキャッシュ（v1）を activate 時に確実に破棄させる。
// 【旧バグ】古い戦略では、デプロイ後にビルドのJSチャンクのファイル名が変わって古いチャンクが
// サーバー上から消えているにもかかわらず、キャッシュされた古いHTMLがまずそのまま表示され、
// 参照先の古いチャンクが読み込めず ChunkLoadError → 自動リロード、という「読み込んで
// すぐリロードされる」ような挙動を引き起こしていた。
const CACHE_NAME = 'kanji-quest-v2';
const STATIC_CACHE = 'kanji-quest-static-v2';

// Assets to cache immediately upon install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache failed for some assets', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-HTTP/HTTPS or Chrome extension requests
  if (!event.request.url.startsWith('http')) return;

  // Ignore Firestore / Firebase API calls
  if (url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // 1. Cache-First Strategy for Images, Videos, Fonts, and Next.js Static Chunks (Immutable)
  if (
    url.pathname.startsWith('/avatars/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/videos/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // 2. Network-First Strategy for HTML pages and other non-immutable requests.
  // ビルドごとにファイル名が変わるJSチャンクを参照するHTML/JSONは、常に最新を優先して取得する。
  // オフライン時などネットワーク取得に失敗した場合のみ、キャッシュがあればフォールバックとして使う。
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => caches.match(event.request))
  );
});
