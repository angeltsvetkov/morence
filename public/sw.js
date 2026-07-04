// Service worker for caching Firebase Storage images (cache-first strategy)
const CACHE_NAME = 'morence-images-v1';
const MAX_CACHE_ENTRIES = 200;

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    const isFirebaseImage =
        url.hostname === 'firebasestorage.googleapis.com' &&
        event.request.method === 'GET';

    if (!isFirebaseImage) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(event.request);
            if (cached) return cached;

            const response = await fetch(event.request);
            if (response.ok) {
                // Evict oldest entry if cache is full
                const keys = await cache.keys();
                if (keys.length >= MAX_CACHE_ENTRIES) {
                    await cache.delete(keys[0]);
                }
                cache.put(event.request, response.clone());
            }
            return response;
        }).catch(() => fetch(event.request))
    );
});
