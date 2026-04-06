# Meshtastic BLE integration (Tier 2 bring-up)

This document describes how EMBER talks to Meshtastic radios over Bluetooth Low Energy in **development builds** (not Expo Go). It complements the product vision in `docs/ARCHITECTURE.md` §10.

## What works today

- **Scan** for peripherals advertising the Meshtastic mesh service UUID (see [Meshtastic Client API](https://meshtastic.org/docs/development/device/client-api/)).
- **Connect**, discover services, request **MTU 512** when the stack allows it.
- **ToRadio / FromRadio** via `react-native-ble-plx`: framed writes (`0x94 0xc3` length prefix + protobuf body) and mailbox reads.
- **Protobufs** from **`@meshtastic/protobufs`** (GPL-3.0), encoded/decoded with **`@bufbuild/protobuf`** (Apache-2.0). Schema version is **pinned** in `package.json`; verify license compatibility for your distribution.
- **Client handshake**: `want_config` (`ToRadio`), drain `FromRadio` until empty, subscribe to **`FromNum`** notifications and drain again on each notify.
- **Settings → Mesh Network**: scan, connect, disconnect, live digest log (e.g. `MyNode`, `ConfigComplete`, packets). **Re-request config** repeats `want_config` without reconnecting.

## Source layout

| Path | Role |
|------|------|
| `src/mesh/constants.ts` | GATT UUIDs and recommended MTU |
| `src/mesh/streamFraming.ts` | Meshtastic stream framing helpers |
| `src/mesh/meshtasticBleBridge.ts` | BLE manager, scan, connect, read/write, `monitorFromNum` |
| `src/mesh/meshtasticCodec.ts` | Encode `ToRadio`, decode framed `FromRadio`, size guards |
| `src/mesh/meshtasticSession.ts` | `requestConfigAndDrainOnce`, `drainFromRadioMailbox` |
| `src/mesh/fromRadioSummary.ts` | Short UI-safe lines from decoded messages |
| `app/(tabs)/settings.tsx` | Mesh UI + session lifecycle |

## Native / Expo

- Dependency: **`react-native-ble-plx`** (see `app.json` plugins if you extend config).
- **Permissions**: Android location / Bluetooth permissions and iOS `NSBluetoothAlwaysUsageDescription` must be set for production; confirm against current Expo and platform docs when you ship.
- **`postinstall`**: `scripts/patch-meshtastic-protobufs-types.mjs` copies the shipped `mod-*.d.ts` to `mod.d.ts` because the published package’s `"types"` field points at a missing file. Re-run happens on every `npm install`.

## Tests

- Jest mocks `react-native-ble-plx` under `__mocks__/`.
- `jest.config.js` **extends** jest-expo’s `transformIgnorePatterns` so **`@meshtastic/protobufs`** and **`@bufbuild/protobuf`** (ESM) are transpiled.
- Unit tests cover framing, codec round-trips, and `digestFromRadioMessages`.

## Security and trust

- Radio and mesh payloads are **untrusted** for EMBER community crypto. They must **not** replace passphrase-derived keys, relay auth, or sync bundle verification.
- Parser limits (e.g. stream buffer cap, framed length cap) reduce malformed-packet DoS from the link layer; they do not authenticate peers.

## What is next (suggested)

1. **Application payloads** — Define an EMBER portnum or encapsulation for ciphertext blobs (members/check-ins summaries already use app-layer encryption elsewhere).
2. **Reliability** — Queued ToRadio writes, backoff on busy radio, explicit `disconnect` ToRadio on teardown.
3. **CI devices** — Optional hardware-in-the-loop or recorded byte fixtures for regression tests.
4. **Permissions UX** — Onboarding copy and Settings deep link when BLE is off or unauthorized.
