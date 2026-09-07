// Service worker: exists so the app is installable. Deliberately tiny — no
// push (nothing to remind about) and no caching/offline in v1 (SPEC scope).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
