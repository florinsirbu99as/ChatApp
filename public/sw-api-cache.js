/*const VERSION = 'v1';
const RUNTIME_CACHE = `rt-${VERSION}`;

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
      //Immer zuerst normalen Abruf mit frischen Daten versuchen
      const res = await fetch(req, { cache: 'no-store' });
      if (res.ok) {
        //Erfolgreiche Antwort cachen
        cache.put(req, res.clone());
      }
      return res;
    } catch {
      // Fallback letzte bekannte Antwort aus dem Cache
      const cached = await cache.match(req);
      if (cached) return cached;

      return new Response(JSON.stringify({ error: 'offline' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503,
      });
    }
  })());
});*/
