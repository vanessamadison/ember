# Next phase — priorities & public-repo hygiene

This document names **what “next phase” means** for EMBER (pilot → hardened Tier 1 → distribution), what to **keep out of git**, and how to stay **current** as a public repository.

---

## 1. Is a public repo OK?

**Yes**, for AGPL open source, as long as you **never commit**:

- Passphrases, API keys, relay auth tokens, Apple/Google signing secrets  
- Production `google-services.json` / `GoogleService-Info.plist` with real keys (Expo may generate; use EAS secrets for CI)  
- Service account JSON for Play upload (use path in `eas.json` pointing to a **local** file listed in `.gitignore`)  
- Personal LAN IPs in committed `.env` (use `.env.example` only with placeholders)

**Review occasionally:** `git log -p -- .env` (should be empty), search repo for `BEGIN PRIVATE KEY`, `AIza`, `sk-`.

---

## 2. What to keep ignored (see root `.gitignore`)

| Category | Examples |
|----------|----------|
| Env files | `.env`, `.env.*` (with `!.env.example` exception) |
| Mobile signing | `*.jks`, `*.p8`, `*.p12`, `*.mobileprovision`, `*.keystore` |
| Firebase client config | `google-services.json`, `GoogleService-Info.plist` (if they contain non-public keys — many teams commit client configs; treat as **policy**) |
| Play / EAS | `credentials.json`, `**/service-account*.json`, `eas-credentials/` |
| Relay dev | `relay/.env` |

Copy **`.env.example`** → `.env` locally; never commit `.env`.

---

## 3. What “next phase” means (recommended ordering)

**Phase A — Evidence (now)**  
- Run **[MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md)** and file **[PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md)**.  
- Update **[THREAT-MODEL-MATRIX.md](./THREAT-MODEL-MATRIX.md)** pilot table with results and **stated limits**.  
- Drill completion is **persisted** in SQLite and included in Phase B bundles (see `persistDrillCompletion`).

**Phase B — Hardening**  
- BLE/permissions pass on **real Android + iPhone** builds (preview/internal track).  
- Production logging / crash policy (no sensitive payloads).  
- Optional: **achievements** in Phase B sync (member-scoped IDs + merge rules) or explicitly defer.

**Phase C — Distribution (when ready)**  
- **[STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md)** — privacy questionnaire, encryption export, support expectations.  
- Replace **placeholder** `eas.json` submit Apple IDs; use **EAS secrets** for service account path.  
- Optional third-party **pen test** or crypto review for fundraising / enterprise.

### Hardware: is that the “next step”?

**Not necessarily custom hardware first.** The recommended order in this repo is:

1. **Commercial Meshtastic radios** (see **[MESH-HARDWARE-GUIDE.md](./MESH-HARDWARE-GUIDE.md)**) + **[MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md)** — validates the **app + BLE + LoRa** path with minimal supply-chain risk.  
2. **Tier 2 “node kits”** (enclosure, solar, BOM, provisioning) — **product/hardware program** *after* or *in parallel with* pilot evidence, not a blocker to your first field test.  
3. **Tier 3 communicator** — separate SKU; longest lead time.

So: **next operational step** is usually **field proof with COTS radios**; **designing or manufacturing** new hardware is a **later** milestone unless you explicitly prioritize supply-chain work now.

---

## 4. Keeping the project up to date

| Area | Suggestion |
|------|------------|
| Dependencies | `npm outdated`; bump Expo SDK on a branch when Expo documents a migration path. |
| Meshtastic | Pin `@meshtastic/protobufs` deliberately; upgrade with `npm run verify` + device smoke test. |
| Docs | After meaningful releases, touch **[CHANGELOG.md](./CHANGELOG.md)** and **[MVP-GUIDE.md](./MVP-GUIDE.md)** if product scope shifts. |
| CI | Run `npm run verify` before merge; add CI when you want PR gates. |

---

## 5. Related docs

- [MVP-GUIDE.md](./MVP-GUIDE.md) — product tiers and gaps  
- [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md) — store vs field-test bar  
- [PHASE-B-SYNC.md](./PHASE-B-SYNC.md) — sync bundle contents  
