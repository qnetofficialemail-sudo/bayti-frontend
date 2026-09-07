const CACHE_NAME = "bayti-v4";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Never intercept: non-HTTPS, API calls, or cross-origin requests
  if (
    url.protocol !== "https:" ||
    url.hostname !== self.location.hostname ||
    url.pathname.includes("/api/")
  ) {
    return; // Let browser handle it directly
  }

  // Cache first only for static assets (images, fonts, scripts)
  if (
    event.request.destination === "image" ||
    event.request.destination === "font" ||
    event.request.destination === "script" ||
    event.request.destination === "style"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network only
  event.respondWith(fetch(event.request));
});
