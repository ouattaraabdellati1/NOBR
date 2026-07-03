const CACHE_NAME = "suivi-v1";
const FICHIERS = ["index.html", "style.css", "script.js", "icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHIERS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((reponse) => reponse || fetch(event.request))
  );
});