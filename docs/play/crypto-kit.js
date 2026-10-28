/* crypto-kit — the shared crypto core for drsamonline apps.
 *
 * One file, no dependencies. Wraps the Web Crypto API so apps never hand-roll
 * cryptography:
 *
 *   - AES-256-GCM encryption (authenticated: tampering is detected);
 *   - passphrase keys via PBKDF2-SHA256;
 *   - a portable "sealed" envelope (salt + iv + ciphertext) as bytes or base64;
 *   - a one-time-view helper (seal with a random key, delete it after first open);
 *   - byte/text/base64 helpers.
 *
 * Requires a secure context (https or localhost) for Web Crypto. GitHub Pages is
 * https, so deployed apps are fine.
 *
 * PolyForm Noncommercial 1.0.0. (c) 2026 Dr Sohil Momin.
 */
(function (root) {
  "use strict";
  var CK = { version: "0.1.0" };
  var subtle = (root.crypto && root.crypto.subtle) || null;
  var DEFAULT_ITER = 250000;

  function assertSecure() {
    if (!subtle) throw new Error("crypto-kit needs a secure context (https or localhost) for Web Crypto");
  }
  CK.available = function () { return !!subtle; };

  /* ---------- bytes ---------- */
  var enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  var dec = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;
  CK.bytes = {
    fromText: function (s) { return enc ? enc.encode(s) : Uint8Array.from(unescape(encodeURIComponent(s)), function (c) { return c.charCodeAt(0); }); },
    toText: function (b) { return dec ? dec.decode(b) : decodeURIComponent(escape(String.fromCharCode.apply(null, b))); },
    toBase64: function (b) {
      var s = "", i;
      for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
      return (typeof btoa !== "undefined") ? btoa(s) : Buffer.from(b).toString("base64");
    },
    fromBase64: function (s) {
      if (typeof atob !== "undefined") { var bin = atob(s), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
      return new Uint8Array(Buffer.from(s, "base64"));
    }
  };

  CK.randomBytes = function (n) {
    var a = new Uint8Array(n);
    if (root.crypto && root.crypto.getRandomValues) root.crypto.getRandomValues(a);
    else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return a;
  };

  /* ---------- keys ---------- */
  CK.deriveKey = function (passphrase, salt, iterations) {
    assertSecure();
    var iters = iterations || DEFAULT_ITER;
    return subtle.importKey("raw", CK.bytes.fromText(passphrase), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: iters, hash: "SHA-256" },
          base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      });
  };
  CK.newKey = function () {
    assertSecure();
    return subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  };
  CK.exportKey = function (key) {
    assertSecure();
    return subtle.exportKey("raw", key).then(function (raw) { return new Uint8Array(raw); });
  };
  CK.importKey = function (raw) {
    assertSecure();
    return subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
  };

  /* ---------- encrypt / decrypt ---------- */
  CK.encrypt = function (key, plaintext, opts) {
    assertSecure();
    opts = opts || {};
    var iv = opts.iv || CK.randomBytes(12);
    var alg = { name: "AES-GCM", iv: iv };
    if (opts.aad) alg.additionalData = opts.aad;
    return subtle.encrypt(alg, key, plaintext).then(function (ct) {
      return { iv: iv, ct: new Uint8Array(ct) };
    });
  };
  CK.decrypt = function (key, box, opts) {
    assertSecure();
    opts = opts || {};
    var alg = { name: "AES-GCM", iv: box.iv };
    if (opts.aad) alg.additionalData = opts.aad;
    return subtle.decrypt(alg, key, box.ct).then(function (pt) { return new Uint8Array(pt); });
  };

  /* ---------- sealed envelope: ver(1) iter(4) salt(16) iv(12) ct(...) ---------- */
  var SALT = 16, IV = 12, HEAD = 1 + 4 + SALT + IV;
  CK.seal = function (plaintext, passphrase, opts) {
    assertSecure();
    opts = opts || {};
    var iters = opts.iterations || DEFAULT_ITER;
    var salt = CK.randomBytes(SALT), iv = CK.randomBytes(IV);
    return CK.deriveKey(passphrase, salt, iters).then(function (key) {
      return CK.encrypt(key, plaintext, { iv: iv, aad: opts.aad });
    }).then(function (box) {
      var out = new Uint8Array(HEAD + box.ct.length);
      var dv = new DataView(out.buffer);
      out[0] = 1; dv.setUint32(1, iters); out.set(salt, 5); out.set(iv, 5 + SALT); out.set(box.ct, HEAD);
      return out;
    });
  };
  CK.open = function (envelope, passphrase, opts) {
    assertSecure();
    opts = opts || {};
    if (envelope[0] !== 1) throw new Error("unknown envelope version");
    var dv = new DataView(envelope.buffer, envelope.byteOffset, envelope.byteLength);
    var iters = dv.getUint32(1);
    var salt = envelope.slice(5, 5 + SALT);
    var iv = envelope.slice(5 + SALT, HEAD);
    var ct = envelope.slice(HEAD);
    return CK.deriveKey(passphrase, salt, iters).then(function (key) {
      return CK.decrypt(key, { iv: iv, ct: ct }, opts);
    });
  };

  CK.sealString = function (text, passphrase, opts) {
    return CK.seal(CK.bytes.fromText(text), passphrase, opts).then(function (env) { return CK.bytes.toBase64(env); });
  };
  CK.openString = function (b64, passphrase, opts) {
    return CK.open(CK.bytes.fromBase64(b64), passphrase, opts).then(function (pt) { return CK.bytes.toText(pt); });
  };

  root.CryptoKit = CK;
})(typeof globalThis !== "undefined" ? globalThis : this);
