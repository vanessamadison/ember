# PR security review rubric (AI-assisted, human-verified)

Use this on PRs that touch **`src/crypto/**`**, **`src/sync/**`**, **`src/db/**`**, **permissions**, or **native / mesh / BLE** code.

**Instructions for humans:** Complete each section. If you use an LLM, paste the diff summary + this rubric; **verify every “yes” in the actual code and tests**.

## A. Scope and data flow

1. What exact data crosses a trust boundary (network, disk, another app, JS ↔ native)?
2. Is anything logged (console, analytics, crash reporter) that could leak keys, passphrases, or plaintext?

## B. Cryptography

1. Are keys generated or derived using documented primitives and parameters (KDF iterations, salt length, key length)?
2. Are nonces/IVs **unique** per encryption under the same key?
3. Is authenticated encryption used for structured payloads (e.g. secretbox / AES-GCM), not “encrypt-only”?
4. Are comparisons that affect security done in **constant time** where timing matters? (If not applicable, say N/A.)

## C. Storage and lifecycle

1. Where do secrets live (memory, SecureStore, SQLite)? Any unintended persistence?
2. On logout / community leave / error paths, are keys and sensitive buffers **zeroed or discarded** as designed?

## D. Sync and peers

1. Could a malicious peer crash the app, cause bad merges, or downgrade protocol versions?
2. Are snapshot/delta code paths covered by tests or explicitly out of scope with justification?

## E. Permissions and platform

1. Do `Info.plist` / Android manifest strings **match** what the binary actually uses?
2. Are background modes / BLE usage justified for the features delivered in this PR?

## F. Tests and verification

1. Which automated tests were added or updated? List filenames.
2. What did `npm run verify` output? (pass / fail + which step)

## G. Residual risk

1. What is **not** covered by tests or review?
2. Recommended follow-up issues (numbered).

---

**Sign-off**

| Role | Name | Date |
|------|------|------|
| Author | | |
| Reviewer | | |
