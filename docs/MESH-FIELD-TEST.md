# Mesh field test runbook

Hands-on validation for **Meshtastic BLE + EMBER Phase B sync** over the air. Use a **native dev or release build** (not Expo Go). See [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) for architecture.

**Hardware:** [MESH-HARDWARE-GUIDE.md](./MESH-HARDWARE-GUIDE.md) (what to buy, no custom PCB). **After the run:** [PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md) (template + checklists). **How this fits store/credibility gates:** [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md).

**Improvement plan (logs, onboarding, reliability):** [PLAN-FIELD-MESH-POLISH.md](./PLAN-FIELD-MESH-POLISH.md).

## Roles

| Role | Hardware | App |
|------|----------|-----|
| **Sender (A)** | Phone + Meshtastic radio (USB/BLE paired) | EMBER, community unlocked |
| **Receiver (B)** | Phone + Meshtastic radio | EMBER, **same community** (passphrase), encryption unlocked |

You can use **one** radio tethered to A and B in range over LoRa only if you mechanically swap phones (not ideal). Prefer **two radios** on the same Meshtastic channel so A and B stay connected to their own nodes.

## Preconditions

1. **Same Meshtastic RF channel** on both radios (primary + modem preset match firmware docs). Mesh carries the protobuf **portnum 270** EMBER payloads inside the LoRa stack; mismatched LoRa settings = no packet delivery.
2. **EMBER**: Same community on A and B (join + passphrase). **Settings → Mesh Network** shows Bluetooth **On** after permissions (Android: allow scan/connect when prompted).
3. **Data to observe**: Make a visible change on A only (e.g. check-in or member note) so B can confirm merge.

## Procedure

### A — Sender

1. Open **Settings → Mesh Network**.
2. **Scan for Meshtastic radios** → tap your node → wait for **Connected** and handshake (digest log updates; **Radio node num** if present).
3. Tap **Broadcast encrypted snapshot over mesh**.
   - If the app warns about **multiple LoRa packets**, confirm after reading the estimate.
4. Wait until **Broadcasting snapshot…** finishes. Expect a **Mesh snapshot sent** alert (packet count and bundle size). **Mesh broadcast failed** means the send path errored; dismissing the multi-chunk confirm shows **no** success alert.

### B — Receiver

1. Same mesh section: connect and complete handshake to **your** radio (in RF range of A’s mesh).
2. Leave the app foreground or return within **~2 minutes** (chunk assembly TTL is limited; see `EMBER_MESH_CHUNK_ASSEMBLY_TTL_MS`).
3. When B receives a valid bundle for **this** community fingerprint, **Last mesh import** shows success counts (green), and community data should match A after UI refresh (open the **People** roster tab — crisis mode uses the same label — or foreground the app).

### Negative checks (optional)

- **Wrong community on B**: No **Last mesh import** success line for foreign sends (fingerprint mismatch is ignored silently).
- **Crypto locked on B**: Should surface **decrypt_failed** / merge error in **Last mesh import** (red).

## Pass criteria

| Step | Expected |
|------|----------|
| Pairing | Both devices **Connected** to a radio with stable digests / node num |
| Broadcast | Sender sees **Mesh snapshot sent** after a successful send; no **Mesh broadcast failed** alert |
| Receive | Receiver **Last mesh import**: `+N members`, `+M check-ins` or zero if already in sync |
| Data | Receiver shows A’s test change after merge |

## Failure triage

| Symptom | Checks |
|---------|--------|
| Empty scan | Radio in **phone / API** mode, Bluetooth on, Android permissions; see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) troubleshooting |
| Broadcast fails fast | **Unlock encryption**; valid `currentCommunityId`; MTU/connect stability |
| B never imports | LoRa channel mismatch; B not in mesh RF range; assembly TTL expired between chunks |
| Import red line | Passphrase mismatch, corrupted payload, or DB constraints (see message detail) |
| Drops mid-broadcast | Config → Mesh: try higher **chunk spacing** (e.g. 300→750→1000–1200 ms presets); each ToRadio write retries up to **4×** with backoff + jitter (see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md)) |

## Regression (CI)

Wire byte stability: `__tests__/mesh/wireGolden.test.ts` (includes **v2 single-chunk** ToRadio golden). Regenerate fixtures:

```bash
node scripts/print-mesh-wire-golden.mjs
```

Copy printed arrays into `__tests__/mesh/fixtures/wireGolden.ts` when protobufs change.

## Record results

Paste one block per run (copy below into an issue, pilot spreadsheet, or `docs/field-logs/`). See also [PLAN-FIELD-MESH-POLISH.md](./PLAN-FIELD-MESH-POLISH.md).

### Run log template (copy-paste)

```
### EMBER mesh field run — <YYYY-MM-DD> — <pilot name or id>

**Build:** (e.g. EAS profile, git sha, platform)
**EMBER app:** version / commit
**Radio A:** model, Meshtastic FW version, region, modem preset / channel name
**Radio B:** (same fields)
**Phone A:** OS version, model
**Phone B:** OS version, model

**Chunk spacing (sender):** ___ ms  (Settings → Mesh Network chips)

**Procedure:** (brief: single vs multi-chunk send, distance, obstacles)

| Criterion        | Pass? | Notes |
|------------------|-------|-------|
| Pairing A/B      | Y/N   |       |
| Broadcast send   | Y/N   | Mesh snapshot sent? Alerts/errors text |
| Receive / merge  | Y/N   | Last mesh import line (paste) |
| Data visible on B| Y/N   | What changed verified |

**Last mesh import (B):** (paste exact line or “none”)

**Alerts / errors:** (Mesh broadcast failed, permission, etc.)

**Diagnostics:** Paste **Copy mesh diagnostic report** or attach the **Share mesh diagnostic** `.txt` from Config → Mesh Network (both phones if relevant).

**Free text:** what helped (e.g. raised spacing to 750 ms; retries observed; adaptive auto-bump after failed send)
```

### Minimum viable log

If the full table is too much, capture at least: **date**, **both FW versions**, **chunk spacing**, **pass/fail** for broadcast + receive, and **verbatim** Last mesh import or error strings. Attach photos of radio screens only if needed for channel proofs.
