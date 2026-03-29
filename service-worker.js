/**
 * Service Worker - PWA Gov.br
 * Cache offline e carregamento instantâneo
 */
const CACHE_NAME = 'govbr-pwa-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/app.js',
  '/images/index.png',
  '/images/banner.png',
  '/images/card.png',
  '/images/cpf1.png',
  '/images/cpf2.png',
  'https://cdn.jsdelivr.net/npm/@govbr-ds/core@3.7.0/dist/core.min.css',
  'https://cdn.jsdelivr.net/npm/@govbr-ds/core@3.7.0/dist/core.min.js',
  'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap'
];

// Instalação: cache dos recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('SW install: alguns recursos não foram cacheados', err))
  );
});

// Ativação: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia: Network First, fallback para cache (permite atualização com offline)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.startsWith('chrome-extension') || request.mode === 'navigate' && request.method !== 'GET') {
    return;
  }
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        if (response.status === 200 && request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  );
});
