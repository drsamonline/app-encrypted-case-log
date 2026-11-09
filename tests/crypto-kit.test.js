'use strict';
/**
 * crypto-kit — the two contracts the app depends on and nothing checked.
 *
 *   node tests/crypto-kit.test.js
 *
 * 1. Every function returns a promise, so an app writes
 *    `CK.open(env, pw).catch(showWrongPassphrase)`. A malformed envelope used to
 *    throw synchronously, which walked past that catch as an uncaught exception.
 * 2. `randomBytes` used to fall back to Math.random() when there was no CSPRNG.
 *    A salt or IV from Math.random() is a guess, not a secret.
 */
const path = require('path');
require(path.join(__dirname, '..', 'crypto-kit.js'));
const CK = globalThis.CryptoKit;

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (detail ? '  (' + detail + ')' : '')); }
}

(async () => {
  // A rejected promise, not a thrown exception.
  let rejected = false, threw = false;
  try {
    await CK.open(new Uint8Array([9, 0, 0, 0, 0]), 'pw');
  } catch (e) {
    if (e instanceof Error) rejected = true; else threw = true;
  }
  ok('a bad envelope version rejects', rejected && !threw);

  let rejectedShort = false;
  try { await CK.open(new Uint8Array(8), 'pw'); } catch (e) { rejectedShort = /envelope/.test(e.message); }
  ok('a truncated envelope rejects, and says so', rejectedShort);

  // The catch a caller actually writes must run.
  let caught = false;
  await CK.open(new Uint8Array(8), 'pw').catch(() => { caught = true; });
  ok('.catch() sees the failure', caught);

  // The round-trip still works, at a test-sized iteration count.
  const env = await CK.sealString('hello', 'pw', { iterations: 1000 });
  ok('seal -> open round-trips', (await CK.openString(env, 'pw')) === 'hello');
  let wrong = false;
  await CK.openString(env, 'other').catch(() => { wrong = true; });
  ok('a wrong passphrase rejects', wrong);

  // No CSPRNG: refuse, never guess.
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
  let refused = false;
  try { CK.randomBytes(4); } catch (e) { refused = /CSPRNG|secure context/.test(e.message); }
  Object.defineProperty(globalThis, 'crypto', saved);
  ok('randomBytes refuses without a CSPRNG', refused);

  console.log('\n' + (fail === 0 ? 'crypto-kit: OK' : fail + ' failed'));
  process.exit(fail === 0 ? 0 : 1);
})();
