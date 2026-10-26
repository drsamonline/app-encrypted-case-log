'use strict';
/**
 * Encrypted Case Log — runs the app's own in-page self-test suite headlessly.
 *
 *   node tests/self-tests.js [path-to-index.html]
 *
 * WebCrypto comes from Node itself (>=18). There is no IndexedDB here, so the app
 * falls back to its in-memory store — which is the point: the vault, the AAD
 * binding and the export round-trip are tested without a browser.
 *
 * The DOM is stubbed to the minimum the app touches. If a test needs the UI it is
 * the wrong test.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const file = process.argv[2] || path.join(root, 'index.html');
const html = fs.readFileSync(file, 'utf8');

if (!globalThis.crypto || !globalThis.crypto.subtle) {
  console.error('no WebCrypto: this needs Node 18+ (run `node --version`)');
  process.exit(2);
}

/* ---- the smallest DOM the app touches ---- */
function stubEl() {
  const el = {
    value: '', textContent: '', innerHTML: '', disabled: false, checked: false,
    classList: { add() {}, remove() {} },
    querySelectorAll: () => [],
    addEventListener() {}, appendChild() {}, click() {}, remove() {}
  };
  return el;
}
const els = {};
globalThis.document = {
  getElementById: (id) => (els[id] = els[id] || stubEl()),
  querySelectorAll: () => [],
  createElement: () => stubEl(),
  addEventListener() {},
  body: stubEl()
};
globalThis.window = globalThis;
globalThis.navigator = globalThis.navigator || {};
globalThis.confirm = () => true;
globalThis.prompt = () => '';
globalThis.alert = () => {};
if (typeof globalThis.FileReader === 'undefined') globalThis.FileReader = function () {};

/* localStorage: the app PREFERS IndexedDB and falls back to an in-memory store when it is
 * absent - but it reads localStorage first to remember small preferences, and there is no
 * localStorage in Node. The suite therefore died with `localStorage is not defined` before
 * a single test ran, which is why this repository's CI has been red on every run. A Map
 * behind the standard four methods is enough; the app never depends on persistence here. */
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; }
  };
}

/* ---- load the kits the app composes, then the app ---- */
const dir = path.dirname(file);
for (const kit of ['crypto-kit.js', 'case-kit.js', 'search-kit.js', 'export-kit.js', 'web-kit.js']) {
  const p = path.join(dir, kit);
  if (!fs.existsSync(p)) { console.error('missing kit file: ' + kit + ' (the app must vendor it)'); process.exit(2); }
  // the kits attach to globalThis, exactly as a <script> would
  (0, eval)(fs.readFileSync(p, 'utf8'));
}
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!inline.length) { console.error('no inline script found in ' + file); process.exit(2); }
for (const s of inline) (0, eval)(s);

if (typeof globalThis.runSelfTests !== 'function') {
  console.error('runSelfTests() was not defined — did the app script fail to parse?');
  process.exit(2);
}

Promise.resolve(globalThis.runSelfTests()).then((out) => {
  const failed = out.filter((r) => r[0] !== 'pass');
  console.log('\n==== ENCRYPTED CASE LOG — SELF-TESTS ====');
  out.forEach(([st, n, m]) => console.log(`${st === 'pass' ? 'PASS' : 'FAIL'}  ${n}${m ? '  [' + m + ']' : ''}`));
  console.log(`\n${out.length - failed.length}/${out.length} passed`);
  process.exit(failed.length ? 1 : 0);
}).catch((e) => {
  console.error('the suite itself threw:', e && e.stack ? e.stack : e);
  process.exit(2);
});
