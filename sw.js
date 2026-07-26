// Service Worker für Doppelkopf Statistik (Offline-Fähigkeit)
const CACHE = "doko-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js"
];

// Beim Installieren: App-Dateien in den Cache legen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Anfragen beantworten: erst Netzwerk, bei Fehler aus dem Cache (network-first).
// So bekommt man Updates, funktioniert aber auch offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Aufrufe an den Daten-Worker NIEMALS cachen (immer live holen).
  if (event.request.url.includes("workers.dev")) return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match("./index.html")))
  );
});
