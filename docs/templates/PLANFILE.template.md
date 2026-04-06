# Plan: <short title>

| Field | Value |
|--------|--------|
| Author | |
| Date | YYYY-MM-DD |
| Branch / PR | |
| Status | Draft / In progress / Ready for review |

## 1. Problem

What user or operational need does this address?

## 2. Scope

**In scope**

- …

**Out of scope**

- …

## 3. Security and privacy boundaries

- **Data classification:** What data is created, stored, or transmitted?
- **Trust assumptions:** Who is honest? What is trusted (device, peer, server)?
- **Crypto touchpoints:** Keys, IVs/nonces, KDF, storage (`expo-secure-store`), sync ciphertext — list files and functions.
- **Permissions / platform:** BLE, notifications, background modes, etc.

## 4. Design summary

Bullets or a small diagram. Link to `docs/ARCHITECTURE.md` sections if relevant.

## 5. Acceptance criteria

Numbered, testable statements, e.g.:

1. Given … when … then …
2. …

## 6. Test plan

Map criteria to verification:

| Criterion | Test level | Location (file or manual step) |
|-----------|------------|--------------------------------|
| | unit / integration / manual | |

## 7. Rollout and rollback

Feature flags, migrations, compatibility with older app versions.

## 8. Open questions

- …

---

**PR checklist:** Link this file in the PR description. Do not merge until section 6 is satisfied or exceptions are documented under section 8 with owner and date.
