# Meshtastic BLE integration (Tier 2 bring-up)

This document describes how EMBER talks to Meshtastic radios over Bluetooth Low Energy in **development builds** (not Expo Go). It complements the product vision in `docs/ARCHITECTURE.md` §10.

## What works today

- **Scan** for peripherals advertising the Meshtastic mesh service UUID (see [Meshtastic Client API](https://meshtastic.org/docs/development/device/client-api/)).
- **Connect**, discover services, request **MTU 512** when the stack allows it.
- **ToRadio / FromRadio** via `react-native-ble-plx`: framed writes (`0x94 0xc3` length prefix + protobuf body) and mailbox reads.
- **Protobufs** from **`@meshtastic/protobufs`** (GPL-3.0), encoded/decoded with **`@bufbuild/protobuf`** (Apache-2.0). Schema version is **pinned** in `package.json`; verify license compatibility for your distribution.
- **Client handshake**: `want_config` (`ToRadio`), drain `FromRadio` until empty, subscribe to **`FromNum`** notifications and drain again on each notify.
- **Settings → Mesh Network**: scan, connect, disconnect, live digest log (e.g. `MyNode`, `ConfigComplete`, packets). **Re-request config** repeats `want_config` without reconnecting.
- **EMBER mesh payloads (v1)** — After handshake, the app can send `ToRadio.packet` with `MeshPacket` + `Data` using **portnum 270** (private / unregistered range 256–511; see `src/mesh/emberMeshConstants.ts`). Payload bytes use the **EMBER envelope v1** below. Dev builds expose a test send in Settings.

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
| 26     | N    | Ciphertext (max **200** bytes in v1; content is app-layer encrypted) |

Parsing is **best-effort**: bad magic, version, or length returns null / throws from builders only when limits are violated.

## Source layout

| Path | Role |
|------|------|
| `src/mesh/constants.ts` | GATT UUIDs and recommended MTU |
| `src/mesh/streamFraming.ts` | Meshtastic stream framing helpers |
| `src/mesh/meshtasticBleBridge.ts` | BLE manager, scan, connect, read/write, `monitorFromNum` |
| `src/mesh/meshtasticCodec.ts` | Encode `ToRadio`, decode framed `FromRadio`, size guards |
| `src/mesh/meshtasticSession.ts` | Handshake, drain, **`sendEmberMeshCiphertext`** |
| `src/mesh/emberMeshConstants.ts` | **Portnum 270**, envelope sizes |
| `src/mesh/emberMeshEnvelope.ts` | Build / parse envelope v1 |
| `src/mesh/emberMeshPacket.ts` | `MeshPacket` + `ToRadio.packet` encoding |
| `src/mesh/emberMeshInbound.ts` | Extract EMBER frames from `FromRadio`, optional listener |
| `src/mesh/communityFingerprint.ts` | SHA-256 fingerprint for envelope |
| `src/mesh/bleUserStrings.ts` | Bluetooth state labels and Settings guidance (P2) |
| `src/mesh/fromRadioSummary.ts` | Short UI-safe lines from decoded messages |
| `app/(tabs)/settings.tsx` | Mesh UI + session lifecycle |

## Native / Expo

- Dependency: **`react-native-ble-plx`** (see `app.json` plugins if you extend config).
- **Permissions** (`app.json`): iOS Bluetooth usage strings and `bluetooth-central` background mode; Android `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE`, and location permissions used by many stacks for legacy scan behavior. Reconcile with Expo / target SDK release notes before store submission.
- **`postinstall`**: `scripts/patch-meshtastic-protobufs-types.mjs` copies the shipped `mod-*.d.ts` to `mod.d.ts` because the published package’s `"types"` field points at a missing file. Re-run happens on every `npm install`.

## Troubleshooting (P2)

- **Settings shows “Permission needed”** — Open **System settings → EMBER → Bluetooth** (iOS) or app permissions (Android), enable Bluetooth, and cold-start the app if the adapter was off.
- **“Bluetooth Off”** — Enable system Bluetooth; the Mesh screen explains this inline and offers **Open system settings** when it may help.
- **Empty scan** — Radio must advertise the Meshtastic service UUID; put the device in a phone-Connectable / API mode per Meshtastic docs. Wrong LoRa region or firmware sleep can also hide the advertiser.
- **Writes failing after rapid taps** — ToRadio writes are **queued** in `MeshtasticBleBridge`; disconnect sets a short **closing** window so overlapping sends fail fast with a clear error.

## Tests

- Jest mocks `react-native-ble-plx` under `__mocks__/`.
- `jest.config.js` **extends** jest-expo’s `transformIgnorePatterns` so **`@meshtastic/protobufs`** and **`@bufbuild/protobuf`** (ESM) are transpiled.
- Unit tests cover framing, codec round-trips, envelope v1, `encodeEmberMeshDataPacketToRadio`, and `digestFromRadioMessages`.

## Security and trust

- Radio and mesh payloads are **untrusted** for EMBER community crypto. They must **not** replace passphrase-derived keys, relay auth, or sync bundle verification.
- Parser limits (e.g. stream buffer cap, framed length cap) reduce malformed-packet DoS from the link layer; they do not authenticate peers.

## What is next (suggested)

1. **Merge pipeline** — Wire `setEmberMeshInboundListener` to decrypt + merge with Phase B rules (v1 envelope and ciphertext format are ready).
2. **Reliability** — Queued ToRadio writes, backoff on busy radio, explicit `disconnect` ToRadio on teardown.
3. **CI devices** — Commit golden **ToRadio** byte fixtures from a serial capture; extend Jest beyond pure unit tests.
4. **Permissions UX** — Onboarding copy and Settings deep link when BLE is off or unauthorized.
