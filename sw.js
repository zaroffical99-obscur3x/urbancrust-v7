const CACHE_NAME = 'urban-crust-v8';
const urlsToCache = [
  './',
  'index.html',
  'urban-menu.html',
  'sweets.html',
  'manifest.json',
  'manifest-sip.json',
  'css/brand.css',
  'js/brand.js',
  'css/home.css',
  'css/fx.css',
  'css/sip.css',
  'js/home.js',
  'js/fx.js',
  'js/sip.js',
  'js/menu-fx.js',
  'js/track.js',
  'images/logo.png',
  'images/logo-sip.png',
  'images/loader-crust-badge.png',
  'images/loader-sip-badge.png',
  'images/icon-192.png',
  'images/icon-512.png',
  'images/icon-maskable-192.png',
  'images/icon-maskable-512.png',
  'images/icon-sip-192.png',
  'images/icon-sip-512.png',
  'images/icon-sip-maskable-192.png',
  'images/icon-sip-maskable-512.png',
  'images/apple-touch-icon.png',
  'images/apple-touch-icon-sip.png',
  'images/favicon-32.png',
  'images/favicon-16.png',
  'images/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network First, Cache Fallback
self.addEventListener('fetch', event => {
  // never touch analytics/API calls or non-GET requests
  if (event.request.method !== 'GET' || event.request.url.indexOf('api.powertree.site') !== -1) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});
