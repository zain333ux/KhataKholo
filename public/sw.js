const CACHE_NAME = "khatakholo-v2";
const OFFLINE_URL = "/offline";

// App shell resources to pre-cache
const PRECACHE_URLS = [
  "/offline",
  "/login",
  "/create-room",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

// ── Message: SKIP_WAITING sent by PwaRegister on update ─────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Install: pre-cache app shell ─────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[SW] Pre-cache partial failure:", err);
      }),
    ),
  );
  // Don't skip waiting here — let the message handler do it on update
});

// ── Activate: clean old caches ───────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// ── Fetch: network-first with offline fallback ───────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip non-same-origin requests (Supabase, Cloudinary, Google Fonts)
  if (url.origin !== self.location.origin) return;

  // Skip Next.js internal HMR / build requests
  if (url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets & offline page
        if (
          response.ok &&
          (url.pathname.startsWith("/icons/") ||
            url.pathname.startsWith("/manifest") ||
            url.pathname === "/offline" ||
            url.pathname === "/login")
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Try cache first on network failure
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // For page navigations, show the offline fallback page
        if (event.request.mode === "navigate") {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }

        // Generic offline response for other requests
        return new Response("Offline – reconnect to use KhataKholo.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
  );
});
