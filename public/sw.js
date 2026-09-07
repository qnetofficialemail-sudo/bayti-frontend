const CACHE_NAME = "bayti-v5";

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

// No fetch handler — let all requests go directly to network

// Push notification handler
self.addEventListener("push", event => {
  let data = { title: "Bayti", body: "New notification", url: "/seller/dashboard" };
  try {
    data = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
      data: { url: data.url },
      actions: [
        { action: "open", title: "View Order" },
        { action: "close", title: "Dismiss" }
      ]
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "close") return;
  
  const url = event.notification.data?.url || "/seller/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
