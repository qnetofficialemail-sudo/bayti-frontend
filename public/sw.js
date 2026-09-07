const CACHE_NAME = "bayti-v3";

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

// Network first for everything - only use cache as fallback for images/fonts
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  // Skip non-HTTPS and extension requests
  if (url.protocol !== "https:") return;
  
  // Always network-first for HTML, API calls, and navigation
  if (
    event.request.mode === "navigate" ||
    url.pathname.includes("/api/") ||
    event.request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
    return;
  }
  
  // Cache first only for images and fonts
  if (
    event.request.destination === "image" ||
    event.request.destination === "font"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }
  
  // Network first for everything else
  event.respondWith(fetch(event.request));
});
