/* Offline shell for the app.
 *
 * The one rule that matters: the HTML is served NETWORK-FIRST, with the cache only
 * as the offline fallback. A cache-first worker answers a returning reader from an
 * old cache and a shipped release becomes invisible — which is exactly how a green
 * deploy once looked like nothing had happened. Assets stay cache-first, but a
 * background refresh keeps them from going stale. Bump CACHE on every release. */
var CACHE = "ecl-v6";
var ASSETS = ["index.html", "crypto-kit.js", "case-kit.js", "search-kit.js", "export-kit.js", "web-kit.js", "manifest.webmanifest", "icon.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "icons/favicon.ico", "icons/favicon-32.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isHTML(req) {
  if (req.mode === "navigate") return true;
  var a = req.headers.get("accept") || "";
  return a.indexOf("text/html") !== -1;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (isHTML(req)) {
    /* network first: a new build is seen on the next visit, not the next cache name */
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match("index.html"); });
      })
    );
    return;
  }

  /* assets: cache first, refreshed in the background */
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
