# Changelog

All notable changes to this repository are documented here. The format is loosely [Keep a Changelog](https://keepachangelog.com/).

## Unreleased

### Mesh (Meshtastic / Phase B)

- **Crisis UX** — Bottom tab for the community roster is **People** (not “Mesh”); in-crisis copy on the roster screen points mesh tooling to **Status** and **Config**.
- **Broadcast feedback** — Success **`Mesh snapshot sent`** alert with packet count and bundle size; cancel on multi-chunk confirm stays silent.
- **Adaptive chunk spacing** — On broadcast **failure**, spacing moves to the **next higher** preset; **walk-down** mode steps **down one preset** per **successful** send until back near default; manual chip selection clears walk-down (`meshInterChunkWalkdownPreference`, `nextLowerInterChunkPreset`).
- **Chunk presets** — Additional **1000 ms** and **1200 ms** options; preset math split into **`meshChunkDelayPresets.ts`** (pure helpers + tests).
- **ToRadio reliability** — ATT writes: **4** attempts, **120 ms** base backoff, **0–96 ms** jitter between retries (`meshtasticBleBridge`).
- **Deep link** — `/(tabs)/settings?section=mesh` expands **Mesh Network**, collapses Phase B sync, scrolls into view; **`navigateToMeshSettings()`** bumps a **focus token** (`meshSettingsNavStore`) so Mesh opens even when Config is already focused; clears `section` query after handling.
- **Diagnostics** — **`buildMeshDiagnosticText`**; **Copy mesh diagnostic report**; **Share mesh diagnostic** writes a UTF-8 **`.txt`** via **`expo-sharing`** with fallbacks (`meshDiagnosticExport`, `shareMeshDiagnostic`). Export includes **Last mesh send (outbound)** when present.
- **Outbound status** — **`meshLastBroadcastOutbound`** and **`meshBroadcastProgress`** in **`meshRadioStore`**; **Last mesh send** and **LoRa frames N / M** on Home and Config; chunk **`onChunkProgress`** through **`meshBroadcastSnapshotFlow`** / **`sendEmberMeshMessageUtf8`**.

### Documentation

- **`MESHTASTIC-BLE.md`**, **`MESH-FIELD-TEST.md`**, **`PLAN-FIELD-MESH-POLISH.md`**, **`PLAN-MESH-TIER2-ROLLOUT.md`**, **`MVP-GUIDE.md`**, **`ARCHITECTURE.md`**, **`README.md`** — Aligned with implementation (crisis tabs, mesh prototype truth, sync flows, onboarding, field log template).
- **`PILOT-FIELD-SUMMARY.md`**, **`MESH-HARDWARE-GUIDE.md`** — Pilot write-up template, pre/post checklists, Meshtastic hardware sourcing and testing (no custom PCB).
- **`docs/PLAN-FIELD-MESH-POLISH.md`** — Executed checklist + follow-ups (file share marked done).

### Dependencies

- **`expo-sharing`** — Native share sheet for mesh diagnostic `.txt` export.

---

*For commit messages, you can use the section titles above or cite this file. Rebuild native dev clients after pulling if you use new native modules (`expo-sharing`).*
