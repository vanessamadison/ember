# Meshtastic BLE integration (Tier 2 bring-up)

This document describes how EMBER talks to Meshtastic radios over Bluetooth Low Energy in **development builds** (not Expo Go). It complements `docs/ARCHITECTURE.md` section **5.2 Meshtastic Integration**.

## What works today

- **Scan** for peripherals advertising the Meshtastic mesh service UUID (see [Meshtastic Client API](https://meshtastic.org/docs/development/device/client-api/)).
- **Connect**, discover services, request **MTU 512** when the stack allows it.
- **ToRadio / FromRadio** via `react-native-ble-plx`: framed writes (`0x94 0xc3` length prefix + protobuf body) and mailbox reads.
- **Protobufs** from **`@meshtastic/protobufs`** (GPL-3.0), encoded/decoded with **`@bufbuild/protobuf`** (Apache-2.0). Schema version is **pinned** in `package.json`; verify license compatibility for your distribution.
- **Client handshake**: `want_config` (`ToRadio`), drain `FromRadio` until empty, subscribe to **`FromNum`** notifications and drain again on each notify.
- **App-wide radio stack** — `MeshRadioProvider` (`src/context/MeshRadioContext.tsx`) mounts in `app/_layout.tsx` and owns a single `MeshtasticBleBridge` + `MeshtasticSession`. UI reads connection and Bluetooth state via **`useMeshRadio()`** and **`useMeshRadioStore`** (`src/mesh/meshRadioStore.ts`) so Home and Settings stay consistent.
- **Home → Mesh Network** — Same labeling as above; **last mesh import** (success or error) from `meshInboundLast`. **Crisis mode** adds **Broadcast encrypted snapshot** on Home (same flow as Config) plus a link to **Config** for pairing (`/(tabs)/settings` even when the crisis tab bar hides Config).
- **Community / People tab** — Member roster and status only. In **crisis mode** the bottom tab for that screen is still **People** (aligned with peacetime) so users are not steered here for Meshtastic. A short in-screen note explains that **LoRa pairing**, **broadcast**, and **last import** live on **Home** and **Settings → Mesh Network**.
- **Settings → Mesh Network**: scan, connect, disconnect, live digest log (e.g. `MyNode`, `ConfigComplete`, packets). **Re-request config** repeats `want_config` without reconnecting. **Broadcast encrypted snapshot** sends the Phase B bundle over LoRa (v1 or chunked v2); **Last mesh import** shows the most recent merge result from `useMeshRadioStore.meshInboundLast`. BLE lifecycle is **not** screen-local; it follows the provider above.
- **Broadcast feedback** — After the radio path completes successfully, the UI shows **Mesh snapshot sent** (packet count and on-air bundle size; reception still depends on RF). **Cancel** on the multi-chunk confirmation does **not** show that alert. Failures use **Mesh broadcast failed** with the error detail.
- **EMBER mesh payloads (portnum 270)** — Wire bytes use **envelope v1** (single frame) or **v2** (chunked UTF-8 of the same base64 bundle string). **`MeshtasticSession.sendEmberMeshMessageUtf8`** picks v1 when the UTF-8 fits one frame, else v2 with **`EMBER_MESH_INTER_CHUNK_DELAY_MS`** between ATT writes. Receive path reassembles v2 in `emberMeshChunkReassembly.ts` before decrypt/merge. Dev: Settings → **Send full encrypted sync (chunked if needed)**.

## EMBER application envelope v1

Binary blob inside `Data.payload` when `portnum === 270`:

| Offset | Size | Content                                                        |
|--------|------|----------------------------------------------------------------|
| 0      | 4    | Magic **EMB1** (`45 4d 42 31`)                                 |
| 4      | 1    | Envelope version **1**                                         |
| 5      | 1    | Flags (0 for now)                                              |
| 6      | 2    | Reserved (0)                                                   |
| 8      | 16   | **Community fingerprint** (first 16 bytes of SHA-256 of `ember-mesh-v1:${communityId}`) — public, not secret |
| 24     | 2    | Ciphertext length, **big-endian**                              |
| 26     | N    | Ciphertext (max **211** bytes UTF-8; base64 NaCl bundle string) |

## EMBER application envelope v2 (chunked)

Same magic and fingerprint placement as v1; version byte **2**. Payload is a **slice** of the same UTF-8 sequence as v1’s ciphertext (concatenate all chunks in order to recover the base64 string for **`decryptMembersCheckInsBundleJson`**).

| Offset | Size | Content |
|--------|------|---------|
| 0      | 4    | Magic **EMB1** |
| 4      | 1    | Version **2** |
| 5      | 1    | Flags (0) |
| 6      | 2    | **Chunk index** (0-based), big-endian |
| 8      | 16   | Community fingerprint (same as v1) |
| 24     | 8    | **Transfer id** (u64 BE); one random id per multi-frame send |
| 32     | 2    | **Total chunks** (1…512), big-endian |
| 34     | 2    | **This chunk length** N, big-endian (≤ **201** with current budget) |
| 36     | N    | Chunk bytes |

Reassembly limits: **`EMBER_MESH_MAX_ASSEMBLED_BYTES`** (512 KiB), TTL **`EMBER_MESH_CHUNK_ASSEMBLY_TTL_MS`**, max **`EMBER_MESH_MAX_CHUNKS_PER_TRANSFER`** frames. Wrong **`total_chunks`** mid-transfer drops state for that transfer id.

Parsing is **best-effort**: bad magic, version, or length returns null / throws from builders only when limits are violated.

## Source layout

| Path | Role |
|------|------|
| `src/mesh/constants.ts` | GATT UUIDs and recommended MTU |
| `src/mesh/streamFraming.ts` | Meshtastic stream framing helpers |
| `src/mesh/meshtasticBleBridge.ts` | BLE manager, scan, connect, read/write, `monitorFromNum` |
| `src/mesh/meshtasticCodec.ts` | Encode `ToRadio`, decode framed `FromRadio`, size guards |
| `src/mesh/meshtasticSession.ts` | Handshake, drain, **`sendEmberMeshCiphertext`**, **`sendEmberMeshMessageUtf8`** |
| `src/mesh/emberMeshConstants.ts` | **Portnum 270**, envelope / chunk sizes, timing |
| `src/mesh/emberMeshEnvelope.ts` | Envelope v1 + v2 chunk build / **`tryParseEmberMeshWirePayload`** |
| `src/mesh/emberMeshChunkReassembly.ts` | v2 chunk buffers → logical v1-shaped message |
| `src/mesh/emberMeshPacket.ts` | `MeshPacket` + `ToRadio.packet` encoding |
| `src/mesh/emberMeshInbound.ts` | Extract EMBER frames from `FromRadio`, optional listener |
| `src/mesh/communityFingerprint.ts` | SHA-256 fingerprint for envelope |
| `src/mesh/meshRadioStore.ts` | Zustand store: BLE + session fields shared across screens |
| `src/mesh/meshInterChunkDelayPreference.ts` | AsyncStorage presets for pause between chunked mesh sends |
| `src/hooks/useMeshInterChunkDelay.ts` | Load/save chunk spacing for broadcast hook |
| `src/mesh/requestAndroidBleScanPermissions.ts` | Android runtime BLE scan/connect (or legacy location) before scan |
| `src/sync/meshInboundMerge.ts` | Fingerprint check → decrypt Phase B bundle → `mergeMembersCheckInsPayload` |
| `src/sync/MeshSyncInboundBridge.tsx` | Subscribes mesh envelopes into merge (mounted in `app/_layout.tsx`) |
| `src/mesh/bleUserStrings.ts` | Bluetooth state labels and Settings guidance (P2) |
| `src/mesh/fromRadioSummary.ts` | Short UI-safe lines from decoded messages |
| `src/context/MeshRadioContext.tsx` | `MeshRadioProvider`, `useMeshRadio()` |
| `app/_layout.tsx` | Mounts `MeshRadioProvider` under community root |
| `app/(tabs)/settings.tsx` | Mesh controls and diagnostics (consumes provider) |
| `app/(tabs)/index.tsx` | Home mesh status strip (store + honest copy) |
| `app/(tabs)/community.tsx` | Community roster; crisis banner clarifies mesh tools are elsewhere |
| `src/mesh/meshBroadcastSnapshot.ts` | Build bundle + send; returns **ok** / **cancelled** for UI (`MeshBroadcastSnapshotResult`) |
| `src/hooks/useMeshBroadcastSnapshot.ts` | Shared broadcast action: confirm multi-chunk, success/error alerts |
| `__tests__/mesh/fixtures/wireGolden.ts` | Committed framed **ToRadio** bytes (e.g. `want_config`, `disconnect`) |
| `__tests__/mesh/wireGolden.test.ts` | Encoder + `unframeMeshtasticStream` regression tests |
| `scripts/print-mesh-wire-golden.mjs` | Regenerate `wireGolden.ts` if protobuf/framing changes |

## Native / Expo

- Dependency: **`react-native-ble-plx`** (see `app.json` plugins if you extend config).
- **Permissions** (`app.json`): iOS Bluetooth usage strings and `bluetooth-central` background mode; Android `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE`, and location permissions used by many stacks for legacy scan behavior. Reconcile with Expo / target SDK release notes before store submission.
- **`postinstall`**: `scripts/patch-meshtastic-protobufs-types.mjs` copies the shipped `mod-*.d.ts` to `mod.d.ts` because the published package’s `"types"` field points at a missing file. Re-run happens on every `npm install`.

## Troubleshooting (P2)

- **Android: scan does nothing after install** — The first **Scan for Meshtastic radios** tap triggers **runtime** permission (Android 12+: Nearby devices / Bluetooth scan+connect; older: location for legacy scan policy). If denied, allow EMBER in **Settings → Apps → EMBER → Permissions**, then use Mesh Network **Refresh Bluetooth state**.
- **Settings shows “Permission needed”** — Open **System settings → EMBER → Bluetooth** (iOS) or app permissions (Android), enable Bluetooth, and cold-start the app if the adapter was off.
- **“Bluetooth Off”** — Enable system Bluetooth; the Mesh screen explains this inline and offers **Open system settings** when it may help.
- **Empty scan** — Radio must advertise the Meshtastic service UUID; put the device in a phone-Connectable / API mode per Meshtastic docs. Wrong LoRa region or firmware sleep can also hide the advertiser.
- **Writes failing after rapid taps** — ToRadio writes are **queued** in `MeshtasticBleBridge`; disconnect sets a short **closing** window so overlapping sends fail fast with a clear error.

## Tests

- Jest mocks `react-native-ble-plx` under `__mocks__/`.
- `jest.config.js` **extends** jest-expo’s `transformIgnorePatterns` so **`@meshtastic/protobufs`** and **`@bufbuild/protobuf`** (ESM) are transpiled.
- Unit tests cover framing, codec round-trips, envelope v1, `encodeEmberMeshDataPacketToRadio`, and `digestFromRadioMessages`.
- **Wire goldens (CI-friendly):** `wireGolden.test.ts` asserts current encoders match committed bytes in `fixtures/wireGolden.ts` (incl. **EMBER v2 single-chunk** ToRadio) and that each golden frame parses as a single packet via `unframeMeshtasticStream`. After intentional encoding changes, run `node scripts/print-mesh-wire-golden.mjs` and commit the updated fixture file.
- **Field testing:** [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) two-device runbook.

## Security and trust

- Radio and mesh payloads are **untrusted** for EMBER community crypto. They must **not** replace passphrase-derived keys, relay auth, or sync bundle verification.
- Parser limits (e.g. stream buffer cap, framed length cap) reduce malformed-packet DoS from the link layer; they do not authenticate peers.

## What is next (suggested)

1. **Adaptive airtime** — Tune **`EMBER_MESH_INTER_CHUNK_DELAY_MS`** and optional “minimal bundle” mesh export for congested RF.
2. **Reliability** — Backoff on busy radio; expand golden coverage (e.g. selected `FromRadio` shapes) when stable.
3. **Permissions UX** — Onboarding copy and Settings deep link when BLE is off or unauthorized.
4. **Optional HIL** — Serial/API captures for additional fixtures beyond `wireGolden.ts`; keep CI hermetic (no live radio).
