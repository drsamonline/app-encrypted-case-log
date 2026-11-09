# Privacy

Version: 1.0 (draft for review)
Effective: on publication
Owner: Dr Sohil Momin — sohilmomin2000@gmail.com
Changes: Initial version.

Encrypted Case Log keeps per-patient clinical notes on your own device, encrypted with a passphrase you choose. There is no account, no server and no sync.

## What is stored

Your case notes: the patient's name or identifier as you typed it, the case history, dated symptoms, follow-ups and whatever else you enter.

They are written to **this browser's local storage and IndexedDB**, as encrypted blobs. Nothing is stored in plain text.

## How it is protected

- Notes are encrypted with **AES-GCM**.
- The key is derived from your passphrase with **PBKDF2-SHA256** and a random salt per envelope. The salt and initialisation vector are stored with the ciphertext — they are not secret, and they are useless without your passphrase.
- **Your passphrase is never stored and never transmitted.** It exists only while you are typing it.
- The sealed envelope is a portable format: version, iteration count, salt, IV, ciphertext.

**If you lose the passphrase, the data cannot be recovered.** There is no reset, no recovery question and no backdoor, because any of those would defeat the encryption. This is a deliberate trade, and it is the most important sentence in this document.

## What leaves the device

**Nothing you typed.** No analytics, no telemetry, no crash reporting, no sync, no licence check.

The only network code in the app is its service worker (`sw.js`), which fetches the app's own files so it can run offline. It never sends a note, a passphrase or a patient's details anywhere. You can watch the network panel while you use it: the requests are for the app, and nothing else.

Two things sit outside that statement:

- **Exports.** Exporting a case writes a file to your device, through the browser's own download. From that moment the file is outside the app's protection: it is decrypted unless you sealed it, and it must be handled as clinical data.
- **Links you click.** Documentation links leave the app. Following one takes you to that site.

## Who can read your notes

Anyone who can unlock the app on that device, which means anyone who knows the passphrase. Practical consequences:

- Lock the app, or close the tab, when you step away.
- On a shared or clinic computer, use a separate browser profile and a screen lock.
- Do not reuse a passphrase you use elsewhere.

Encryption protects the data at rest. It does not protect an unlocked session.

## Erasing

Clearing this site's data in the browser removes the encrypted records. Exported files and browser backups are separate copies and must be deleted separately.

## Your patients, and the law

If you use this app for real patients, **you are the Data Fiduciary** under the Digital Personal Data Protection Act, 2023 — not the author of the app. The notes are personal data, and clinical notes are sensitive personal data under the SPDI Rules, 2011.

That means: a lawful basis for holding the notes, a retention period you can state, a way to answer a patient's request to see, correct or erase their record, and a plan for what happens if the device is lost or a note is disclosed. The app gives you encryption and an erase control; the obligations are yours.

## Backups

Backups are your responsibility. A backup of this browser profile is a copy of the encrypted records — still protected by the passphrase, but still a copy that must be controlled.

## Changes

This document is versioned in the repository and changes with the code. If a future version adds a sync or a network call, this file changes in the same commit.

Contact: Dr Sohil Momin — sohilmomin2000@gmail.com
