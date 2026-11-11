# Encrypted Case Log — user guide

**PolyForm Noncommercial 1.0.0**

Clinical notes on your own device, encrypted with a passphrase that never leaves it.

## The vault, and what it means for you

- You set a **passphrase**. A key-encryption key is derived from it with **PBKDF2-HMAC-SHA256,
  600,000 iterations, a random 16-byte salt**.
- A random **data-encryption key (DEK)** encrypts the records; the passphrase only **wraps** the DEK —
  so changing the passphrase never re-encrypts a record.
- A **verifier** makes a wrong passphrase fail cleanly instead of silently producing garbage.
- A **24-word recovery code** wraps the same DEK, so a forgotten passphrase is survivable. It is shown
  **once**; rotating it invalidates the old one immediately.

> **Without the passphrase or the recovery code, the data is unrecoverable.** There is no server to
> reset it, and that is the point — not an oversight.

A header written with fewer KDF rounds than the current target is re-wrapped at the higher count on
its next unlock — the only place the passphrase exists is the only place an upgrade can happen.

## The records

One record per blob, a **fresh 96-bit IV every time**, and the record id as **AAD**, so a record
cannot be swapped or replayed. The self-tests prove it: a swapped record fails to decrypt, no IV is
ever reused, and the ciphertext never contains the plaintext.

A patient carries a **short label — initials or a code, not a full name**. The device may be shared,
and the label is the field most likely to be seen over a shoulder.

Each note carries a **severity from 1 to 4**, drawn as a line in inline SVG. Deleting is a
**tombstone** you can undo until you lock; purging happens on lock. Every save keeps up to **five
previous versions** as the old ciphertexts themselves, so a restore is a decrypt and never a rewrite
of history.

## Search, and its ceiling

Search runs on decrypted content in memory, which is why the app asks for the passphrase at unlock
and holds the DEK for the session. It is fast for a personal case load and is not a database: the
README states the ceiling rather than implying there is none.

## If you lose the passphrase

Use the **24-word recovery code**. If you have neither, the records are gone. Export a backup
regularly, and keep the recovery code somewhere that is not the device holding the log.

## Licence

PolyForm Noncommercial 1.0.0. See [LICENSE](../LICENSE).
