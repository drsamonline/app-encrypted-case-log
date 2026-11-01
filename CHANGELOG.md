# Changelog

Every release is built from the same commit that deploys the demo, so the page, the
portable EXE and the APK can never disagree. The app prints its own version and build stamp
in the footer; this file is the long form.

## 1.1.0 — 2026-11-01

### Notes that say how bad it is

- **Severity 1–4** on every note, chosen in the editor. The field existed in the record
  shape and was hardcoded to `1`; it is now real, and the patient view draws **severity over
  time** as inline SVG — no chart library, no network.

### Import no longer destroys the vault

- **Merge is the default.** Opening an `.ecl` shows a dry-run count — *new / newer /
  identical* — and merges by record id and timestamp. Replacing the vault is a second,
  explicit question. Previously an import called `Store.wipe()` first.

### Keys you can change

- **Change the passphrase** — the data key is re-wrapped, no record is re-encrypted.
- **Rotate the recovery code** — the old 24 words stop working immediately.
- **KDF upgrade on unlock** — a header written with fewer PBKDF2 rounds is re-wrapped at the
  current target the next time the passphrase is typed.
- **Decoy vault** — a second passphrase opens a separate, empty vault with its own key.

### Deleting is recoverable

- Delete is a **tombstone** with an **Undo** in the toast, purged when the vault locks.
- Every save keeps up to **five previous versions**, stored as the old ciphertexts, with a
  one-click restore. The self-tests prove the history holds no plaintext.

### Working faster

- The search index is built **once per data change** instead of once per keystroke, unlock
  decrypts in **batches of 250**, and there are **tag** and **date-range** filters.
- **CSV import** with a column preview, mirroring the CSV export.
- **Print** with a print stylesheet — the offline way to hand a record over on paper.
- Keyboard: `N`, `/`, `Ctrl`+`S`, `L`, `S`, `Esc`, `?`.
- **Settings**: auto-lock minutes, lock-on-tab-hide, text size, redaction curtain, storage
  quota, vault health, and the self-tests on demand.

### Language, icons and releases

- **i18n-kit.js**: English, हिन्दी, ગુજરાતી, मराठी, bundled — no translation service.
- **The icon is redrawn** in the app's own palette, and the PWA set (192, 512, maskable 512,
  apple-touch, favicon.ico) is rendered locally by `scripts/icons.py`.
- **Manifest finished**: `id`, `lang`, `categories`, `screenshots`, `shortcuts`,
  `display_override`, `file_handlers` for `.ecl`, corrected theme colours.
- **`SHA256SUMS.txt`** is attached to every release, so a download can be verified offline.
- Badges are drawn from this repository; nothing on the page fetches an image service.
- 6 new self-tests — **21 in total**.

## 1.0.0 — 2026-10-24

- Per-patient notes encrypted at rest with AES-256-GCM in IndexedDB.
- Passphrase wraps a random data key (PBKDF2-HMAC-SHA256, 600,000 iterations).
- 24-word recovery code, shown once.
- Fresh 96-bit IV per record, record id as AAD.
- Encrypted `.ecl` archive export, plaintext CSV export behind a warning.
- In-memory ranked search, thrown away on lock. Auto-lock after 5 minutes.
- Portable Windows build, Android APK, offline PWA.
