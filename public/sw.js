// sw.js — Robust Service Worker (safe install + stale-while-revalidate + background sync)
// Place this file in your public/ and register it from the client.

const CACHE_NAME = "school-mis-cache-v1";
const OFFLINE_URLS = ["/", "/offline.html", "/favicon.ico", "/manifest.json"];

// Install: attempt to cache important assets but never fail the install if a resource is missing
self.addEventListener("install", (event) => {
  console.log("[SW] Install");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of OFFLINE_URLS) {
        try {
          // Use network fetch to ensure we get the real asset; don't fail the whole install if one URL fails
          const res = await fetch(url, { cache: "no-cache" });
          if (res && res.ok) {
            await cache.put(url, res.clone());
            console.log("[SW] Cached:", url);
          } else {
            console.warn("[SW] Skip caching (non-OK):", url);
          }
        } catch (err) {
          console.warn("[SW] Skip caching (error):", url, err && err.message);
        }
      }
      // skipWaiting so the new SW can activate quickly (optional)
      self.skipWaiting();
    })()
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      // Take control of uncontrolled clients
      await self.clients.claim();
    })()
  );
});

// Fetch: stale-while-revalidate strategy for GET requests (works for APIs & assets)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);

      // Try network in background and update cache
      const networkFetch = fetch(req)
        .then(async (networkRes) => {
          // only cache valid responses
          if (networkRes && networkRes.ok) {
            try {
              await cache.put(req, networkRes.clone());
            } catch (e) {
              // ignore cache put errors
              console.warn("[SW] cache.put failed", e);
            }
          }
          return networkRes;
        })
        .catch(() => {
          // on network failure, we will fallback to cache
          return null;
        });

      // Return cached if available, otherwise wait for networkFetch
      return (
        cached || (await networkFetch) || (await cache.match("/offline.html"))
      );
    })()
  );
});

// Background sync: trigger client-side sync (service worker cannot access IndexedDB reliably)
// Use registration.sync.register('sync-school-data') from client, or postMessage to client to perform sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-school-data") {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  console.log("[SW] Background sync triggered");
  // Notify clients to perform sync (clients can access IndexedDB)
  const clientsList = await self.clients.matchAll({
    includeUncontrolled: true,
  });
  for (const client of clientsList) {
    client.postMessage({ type: "perform-sync" });
  }
}

// Message handler: allow client to trigger background sync or skip waiting
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data && data.type === "trigger-sync") {
    console.log("[SW] Received trigger-sync from client");
    if (self.registration && self.registration.sync) {
      self.registration.sync.register("sync-school-data").catch((err) => {
        console.warn("[SW] sync.register failed:", err && err.message);
      });
    } else {
      // fallback: tell clients to run sync immediately
      self.clients.matchAll().then((clientsList) => {
        for (const c of clientsList) c.postMessage({ type: "perform-sync" });
      });
    }
  } else if (data && data.type === "skip-waiting") {
    self.skipWaiting();
  }
});
