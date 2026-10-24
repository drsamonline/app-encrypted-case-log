/* Offline shell. The app is one file plus five vendored kits; cache them all, and
   never touch the network for anything else (the page's CSP forbids it anyway). */
var CACHE = "ecl-v1";
var ASSETS = ["index.html", "crypto-kit.js", "case-kit.js", "search-kit.js", "export-kit.js", "web-kit.js", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
