# Plan: Field-test logs, BLE onboarding polish, mesh reliability

| Field | Value |
|--------|--------|
| Author | EMBER maintainers |
| Created | 2026-04-04 |
| Status | Active — checklist executed 2026-04-04 |

**Purpose:** Make **pilot runs reproducible** (written logs), **first pairing less confusing** (permissions + navigation copy), and **chunked sends slightly more robust** (spacing presets + ATT retry backoff). Canonical runbook: [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md). Stack reference: [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md).

---

## 1. Goals

1. **Field-test logs** — Operators can paste a single structured record per run (hardware, firmware, app build, chunk spacing, pass/fail) for issues and regression compares.
2. **BLE onboarding** — Welcome flow and **Config → Mesh Network** surface honest, platform-specific permission guidance before the first scan.
3. **Reliability tweak** — Document and ship: **longer inter-chunk presets** for noisy RF; **ToRadio ATT retries** with incremental backoff + small jitter to reduce correlated failures.

---

## 2. Execution checklist

- [x] **2.1** Add this plan file and link it from [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) + [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) + [README.md](../README.md).
- [x] **2.2** Extend [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) § *Record results* with a **copy-paste log template** (tables + free-text).
- [x] **2.3** Expand onboard **Tier 2** card + add **first-time mesh** hint on Settings mesh section (`app/onboard/index.tsx`, `app/(tabs)/settings.tsx`).
- [x] **2.4** Add chunk spacing presets **1000 ms** and **1200 ms** in `MESH_INTER_CHUNK_DELAY_CHOICES`.
- [x] **2.5** Increase `MeshtasticBleBridge` ToRadio retries to **4** attempts, **120 ms** base delay, **0–96 ms jitter** between retries; document in [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md).
- [x] **2.6** Run `npm run verify`.

---

## 3. Follow-ups — **done** (2026-04-04)

- [x] **Deep link** — `/(tabs)/settings?section=mesh` expands **Mesh Network**, collapses Phase B sync for focus, scrolls the section into view (`useLocalSearchParams` + `onLayout`). Home / crisis **Config** link uses this URL.
- [x] **Mesh diagnostic export** — **Copy mesh diagnostic report** on Mesh Network copies Bluetooth state, IDs, chunk spacing, last import, errors, and up to 400 FromRadio digest lines (clipboard for issues / field logs).
- [x] **Adaptive airtime (MVP)** — On **mesh broadcast** failure, chunk spacing bumps to the **next higher preset** (saved); alert explains the change. Inbound loss heuristics deferred.

Further ideas: optional **auto-lower** without prior failure bump (RF inference). **File share export** is implemented (`Share mesh diagnostic` + `expo-sharing`).

- [x] **BLE scan preflight** — Tapping **Scan for Meshtastic radios** when Bluetooth is not ready shows an **alert** with platform copy from `bleMeshGuidance` and optional **Open system settings** (`src/mesh/meshBleScanPreflight.ts`). The scan button stays tappable so users get feedback instead of a dead control.

---

## 4. References

- `src/mesh/meshtasticBleBridge.ts` — `writeToRadioProtobuf` retry loop.
- `src/mesh/meshInterChunkDelayPreference.ts` — user-selectable chunk pause presets.
- `src/mesh/requestAndroidBleScanPermissions.ts` — Android scan/connect gating.
