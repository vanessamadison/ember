# EMBER Tier 1 — Technical Architecture Specification

Version 1.0 · March 2026 · ILLAPEX LLC / Lirio Labs

This document describes the complete technical architecture for EMBER Tier 1 (the mobile application). It serves as both a development reference and a grant-supporting specification for NLnet NGI Zero Commons Fund, Open Technology Fund, and related funding bodies.

---

## 1. System Overview

EMBER Tier 1 is a React Native mobile application that enables neighborhood communities to coordinate before, during, and after emergencies without relying on centralized infrastructure, cellular networks, or cloud services.

The application operates in three modes:

**Peacetime** — Community coordination, resource tracking, preparedness drills, skill registry, emergency plan storage, and gamified readiness scoring. Data syncs optionally to encrypted cloud backup.

**Crisis** — Simplified interface focused on safety check-ins, resource visibility, and **Meshtastic-assisted** sync when a radio is paired (Phase B snapshots over LoRa; controls on **Status** and **Config**). Tier 1 does not require cloud. Optional cloud (peacetime) is orthogonal to crisis navigation.

**Recovery** — Post-crisis coordination for damage assessment, resource redistribution, and community status reporting. Gradual reconnection to cloud sync.

---

## 2. Data Architecture

### 2.1 Database Engine

EMBER uses WatermelonDB, which provides:

- SQLite storage on native platforms (iOS/Android) for production performance
- LokiJS in-memory adapter for web (development and progressive web app)
- Lazy loading: records are loaded only when accessed, not when queries run
- Observable queries: UI components re-render automatically when underlying data changes
- Decorator-based model definitions for clean TypeScript integration

### 2.2 Schema (8 Tables)

**communities** — Root entity. Contains name, passphrase hash (for verification only, never the passphrase itself), generated invite code, creation timestamp, member count, and active status.

**members** — Community participants. Stores name, assigned role, avatar, biography, current status (safe/help/unknown), last check-in timestamp, skills (JSON array), resources (JSON array), and a self-identification flag for the device owner.

**resources** — Community supply inventory. Categorized (Water, Food, Medical, Power, Comms) with quantity, unit, critical threshold, maximum capacity, and update tracking.

**check_ins** — Historical safety status records. Links to member and community with timestamp, encrypted location, and optional note.

**drills** — Preparedness exercises. Stores name, description, difficulty, time estimate, XP reward, completion status, and score.

**emergency_plans** — Offline-stored emergency protocols. Content is encrypted. Tracks plan type, size, review status, and last update.

**messages** — Communication records. Text is encrypted. Typed (system/resource/broadcast/social) with mesh delivery tracking.

**achievements** — Gamification milestones per member with earned status and timestamp.

### 2.3 Encrypted Field Strategy

Fields that contain personally identifiable or operationally sensitive information are encrypted at the application layer before database write:

| Table | Encrypted Fields | Reason |
|-------|-----------------|--------|
| members | location data (when stored) | Physical safety |
| check_ins | location_encrypted, note | Movement patterns |
| emergency_plans | content_encrypted | Operational security |
| messages | text_encrypted | Communication privacy |
| resources | notes (when present) | Supply vulnerability |

Fields that are NOT encrypted: schema metadata, timestamps (required for CRDT ordering), category labels (required for queries), status enums (required for UI rendering without decryption round-trip).

This is a deliberate trade-off. Encrypting everything would require decrypting the entire database to render any UI, destroying performance on resource-constrained devices during emergencies. The encrypted fields protect the data that matters most if a device is physically compromised.

---

## 3. Zero-Knowledge Encryption

### 3.1 Design Principle

No server, no operator, and no third party (including the developers) can read community data. The server (when used for optional cloud backup) stores only ciphertext it cannot decrypt. The encryption key exists only on community members' devices, derived from a shared passphrase that is never transmitted electronically.

### 3.2 Key Derivation

Algorithm: PBKDF2-SHA256
Iterations: 100,000
Salt: 16 bytes, cryptographically random, generated at community creation
Output: 256-bit symmetric key

The passphrase is chosen by the community creator and shared with members in person (or via any out-of-band channel the community trusts). The salt is embedded in the invite code so that members joining later derive the same key from the same passphrase.

### 3.3 Encryption Algorithm

Symmetric encryption: NaCl secretbox
Cipher: XSalsa20-Poly1305
Nonce: 24 bytes, randomly generated per encryption operation
Library: tweetnacl (JavaScript implementation, no native dependencies)

NaCl secretbox provides authenticated encryption. If ciphertext is tampered with, decryption fails rather than producing corrupted plaintext. The 24-byte random nonce ensures that encrypting the same plaintext twice produces different ciphertext.

### 3.4 Key Lifecycle

1. **Derivation** — User enters community passphrase. PBKDF2 derives 256-bit key using community salt.
2. **Memory** — Key is held in JavaScript memory (Uint8Array) for the duration of the session.
3. **Device storage** — Key is stored to expo-secure-store, which uses iOS Keychain or Android Keystore (hardware-backed encryption on supported devices).
4. **Session restore** — On app reopen, key is loaded from secure store. No passphrase re-entry needed unless secure store is cleared.
5. **Destruction** — On logout or community leave, key is zeroed from memory (all bytes set to 0) and deleted from secure store.

### 3.5 Invite System

When a community creator generates an invite code (format: EMBR-XXXX-XXXX), the code encodes:

- A community identifier
- The key derivation salt (encoded in the alphanumeric characters)
- A time-based validity window (TOTP-style, configurable, default 48 hours)

The invite code does NOT contain the passphrase or the derived key. A new member needs both the invite code (to identify the community and obtain the salt) and the passphrase (shared separately, in person) to join.

This two-factor join process (invite code + passphrase) ensures that intercepting either one alone is insufficient to access community data.

---

## 4. CRDT Sync Engine

### 4.1 Why CRDTs

When community members modify shared data (resource inventories, member statuses) while disconnected from each other, then reconnect (via mesh, BLE, or cloud), their changes may conflict. Traditional conflict resolution (last-write-wins with server timestamps) requires a central authority. CRDTs (Conflict-free Replicated Data Types) resolve conflicts deterministically on every device without coordination.

### 4.2 Hybrid Logical Clocks (HLC)

Every mutation event is timestamped with an HLC that combines:

- Physical time (milliseconds since epoch, from device clock)
- Logical counter (incremented when physical time has not advanced)
- Node ID (unique device identifier)

HLCs provide causal ordering: if event A caused event B, A's HLC is always less than B's. Concurrent events (no causal relationship) are ordered deterministically by node ID, ensuring all devices arrive at the same state.

### 4.3 CRDT Types Used

**GCounter** (grow-only counter) — Used for accumulative metrics like total check-ins, total drills completed. Each node maintains its own counter; the merged value is the sum across all nodes.

**PNCounter** (positive-negative counter) — Used for resource inventory. Two GCounters: one for additions, one for consumptions. Current quantity = additions - consumptions. This prevents the "lost update" problem where two members simultaneously logging resource use would lose one update.

**LWWRegister** (last-writer-wins register) — Used for member profiles, status updates, and any single-value field. The most recent write (by HLC) wins. Ties broken by node ID.

**LWWMap** (last-writer-wins map) — Used for community metadata, settings, and any key-value data. Each key is an independent LWWRegister with tombstone deletion support.

### 4.4 Conflict Resolution by Data Type

| Data Type | CRDT | Resolution Rule |
|-----------|------|----------------|
| Resource quantities | PNCounter | Additions and consumptions merge independently. Total is always accurate. |
| Member status | LWWRegister | Most recent status wins. A "help" status is never overwritten by an older "safe" status. |
| Member profiles | LWWMap | Each profile field merges independently. |
| Emergency plans | LWWRegister | Most recent version wins. Version history maintained locally. |
| Messages | Append-only log | No conflicts. Messages are immutable once created. Ordered by HLC. |
| Check-ins | Append-only log | No conflicts. Each check-in is a unique event. |

### 4.5 Sync Payload Format

Payloads are structured as:

```
{
  version: 1,
  senderId: string (node ID),
  timestamp: HLC,
  since: HLC (for delta sync),
  deltas: [
    {
      table: string,
      recordId: string,
      crdtType: "gcounter" | "pncounter" | "lww_register" | "lww_map",
      operation: serialized CRDT state,
      hlc: HLC
    }
  ]
}
```

The entire payload is encrypted with the community key before transmission.

---

## 5. Peer-to-Peer Sync

### 5.1 Transport Layers

EMBER supports three transport layers for peer sync, selected automatically based on availability:

**Cloud sync (peacetime only)** — Optional encrypted backup to a community-hosted server. The server receives and stores ciphertext. It facilitates sync between devices but cannot read any data. Implementation: HTTPS PUT/GET of encrypted blobs.

**Bluetooth Low Energy (BLE)** — Short-range wireless. In the current app, BLE is the **Meshtastic GATT client** (phone ↔ LoRa radio), not yet a separate EMBER-to-EMBER file channel. Peer sync for members/check-ins today uses **Phase B bundles** (sneaker-net, optional HTTP relay, or Meshtastic portnum 270 payloads).

**Meshtastic LoRa (crisis mode)** — Long-range mesh radio via BLE bridge to Meshtastic hardware. 1-5km range per node. Solar-powered relay nodes extend coverage indefinitely. The primary crisis communication channel.

### 5.2 Meshtastic integration (implemented)

The **Tier 1** client is documented in [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md). In summary:

- **Transport** — `react-native-ble-plx` GATT connection, `want_config` handshake, framed `ToRadio` / `FromRadio` / `FromNum` mailbox reads, optional MTU raise.
- **Application port** — **portnum 270** carries an EMBER envelope (**v1** single frame or **v2** chunked UTF-8) wrapping the same **Phase B encrypted bundle** (members + check-ins) used for sneaker-net and relay.
- **Send path** — User-initiated **Broadcast encrypted snapshot** queues framed packets on the BLE bridge (serialized writes, retry on transient errors for chunked sends). Large bundles use v2 with configurable inter-chunk delay.
- **Receive path** — Inbound frames are parsed, reassembled (v2), fingerprint-matched to the current community, decrypted, and merged via `mergeMembersCheckInsPayload`.
- **Privacy / trust** — Meshtastic RF encryption is independent of EMBER’s NaCl layer; treat mesh participants as untrusted for EMBER identity (see threat-model docs).

**Roadmap (not current code)** — Delta-sized CRDT packets, mesh-wide ACK scheduling, automatic exponential backoff reconnect with queued mail during BLE drops, and topology maps remain design targets.

### 5.3 Sync Flow

**Peacetime sync (data model):**
1. Local changes update WatermelonDB models (resources, drills, plans, members, check-ins, etc.).
2. **Members + check-ins** can sync cross-device via **Phase B**: encrypted bundle export/import (sneaker-net), optional **HTTP relay** when enabled, or Meshtastic **portnum 270** snapshot push/pull when radios are paired.
3. Optional **cloud** encrypted blob backup (when implemented per deployment) follows the same ciphertext-on-wire rule: server never receives keys.
4. Other domains (full resource CRDT over mesh, etc.) remain **product gaps** relative to this spec.

**Crisis / mesh snapshot path (when Meshtastic is connected):**
1. App builds the Phase B ciphertext bundle for the active community.
2. Bundle is sent to the paired radio over BLE as **portnum 270** (v1 or chunked v2).
3. Radio transmits over LoRa; peers running EMBER decrypt+merge when the **community fingerprint** matches.
4. **No application-layer ACK** in the prototype; reliability is RF-dependent. UX surfaces **Last mesh import** plus **Mesh snapshot sent** after a successful queued send.

---

## 6. Crisis Mode Architecture

### 6.1 Mode switching

**Implemented:** crisis vs peacetime is selected by the user via the app **mode toggle** (persisted in app state).

**Not implemented in this client yet:** automatic crisis entry on sustained loss of cellular/WiFi, or automatic crisis activation triggered by an inbound mesh message.

### 6.2 UI adaptation

**Implemented (current tab layout):**

- Navigation simplifies from **6 tabs** (Home, People, Supply, Drills, Plans, Config) to **4**: **Status**, **Supply**, **People**, **Plans**. **Config** is not in the crisis tab bar but remains reachable from **Status** (Home) via navigation to **`/(tabs)/settings`** for mesh pairing and diagnostics.
- Color system shifts toward alert styling (crisis theme).
- **Drills** and most **Config** chrome are hidden from the tab bar in crisis; core mesh controls live under **Config → Mesh Network**.
- **People** in crisis is the **member roster** (same screen concept as peacetime **People**), with copy clarifying that **LoRa / Meshtastic tools** are on **Status** + **Config**, not on the roster tab.
- **Status** (crisis Home) shows a **mesh** summary from `useMeshRadioStore`, optional **Broadcast encrypted snapshot**, and link to Config when needed.

**Design / mockup carryovers not fully mirrored in code:** a dedicated “mesh message feed” screen, always-on feed UI, and granular battery header widgets may lag the static architecture deck.

### 6.3 Power management (targets)

Long crisis runtime is a **design goal**. Items below are **not all implemented** in the current TypeScript client; treat as roadmap unless verified in source:

- **BLE duty cycling** — Reduce scan/connect churn when the radio is idle.
- **Background batching** — Batch DB/sync work.
- **Minimal rendering** — Reduce animation and overscroll cost on OLED.
- **Aggressive screen dim** — Shorter sleep timeout during crisis.
- **Merge throttling** — Defer heavy CRDT work when battery is low.

Target: 72+ hours of crisis operation remains an **engineering north star**, not a shipped guarantee.

---

## 7. Gamification Engine

### 7.1 XP System

Drills award XP based on difficulty and completion score:

| Difficulty | Base XP | Score Bonus |
|-----------|---------|-------------|
| Easy | 100 | +0-50 for score 60-100 |
| Medium | 175 | +0-75 for score 60-100 |
| Hard | 300 | +0-100 for score 60-100 |

### 7.2 Level Progression

| Level | XP Required | Title |
|-------|------------|-------|
| 1 | 0 | New Member |
| 2 | 500 | Active Participant |
| 3 | 1,500 | Prepared Neighbor |
| 4 | 3,500 | Community Pillar |
| 5 | 6,500 | Response Leader |
| 6 | 10,000 | Resilience Expert |
| 7 | 15,000 | Emergency Commander |
| 8 | 22,000 | Community Guardian |
| 9 | 32,000 | Master Responder |
| 10 | 50,000 | EMBER Legend |

### 7.3 Readiness Score

A weighted composite reflecting community preparedness:

- **40%** — Member safety (percentage of members with recent check-in)
- **30%** — Drill performance (average drill score)
- **30%** — Resource health (average resource level vs. maximum)

### 7.4 Achievements

9 milestone achievements with specific unlock criteria:

1. First Check-In — Complete your first safety check-in
2. 72hr Kit Ready — Personal emergency kit verified by community
3. Mesh Pioneer — Successfully connect to a mesh node
4. Water Secure — Community water supply above 80% capacity
5. Drill Sergeant — Complete all available community drills
6. Community Shield — Achieve 100% member check-in within 24 hours
7. Grid Independent — Pass a 24-hour off-grid power test
8. First Responder — Score 85+ on medical triage drill
9. Community Builder — Community reaches 20 active members

### 7.5 Streak System

Daily check-in tracking with escalating incentives:

- 3-day streak: +10% XP bonus on next drill
- 7-day streak: unlock streak achievement
- 30-day streak: "Dedicated" profile badge
- Streak resets at midnight local time if no check-in recorded

---

## 8. Security Model

### 8.1 Threat Model

**Who are we protecting against?**

- **Mass surveillance** — Government agencies collecting community data from servers. Mitigated by zero-knowledge encryption: servers store only ciphertext.
- **Targeted surveillance** — An adversary targeting a specific community. Mitigated by on-device encryption and in-person passphrase sharing.
- **Data breach** — Server compromise exposing user data. Mitigated by server having only ciphertext. No PII is stored unencrypted on any server.
- **Physical device seizure** — Law enforcement or adversary accessing a member's device. Mitigated by device encryption (OS-level) plus app-level encryption requiring passphrase.
- **Network interception** — MITM attacks on sync traffic. Mitigated by application-layer encryption (data is encrypted before transmission) plus transport-layer encryption (HTTPS/BLE/Meshtastic AES).

### 8.2 What We Cannot Protect Against

- A compromised community member who shares the passphrase with adversaries
- A device with malware that captures keystrokes or screen contents
- Rubber hose cryptanalysis (physical coercion to reveal passphrase)
- Timing analysis on cloud sync patterns (we know WHEN a community syncs, not WHAT they sync)

We are transparent about these limitations. EMBER provides strong technical protection but cannot protect against social engineering or physical coercion.

### 8.3 Key Management Without a Server

There is no central key server. Key distribution works as follows:

1. Community creator generates passphrase and invite code
2. Passphrase is shared in person (never digitally)
3. Invite code can be shared digitally (it contains the salt, not the key)
4. Each member derives the same key from passphrase + salt
5. Key rotation: creator generates new passphrase, shares in person, members re-derive

This requires in-person interaction for initial setup and key rotation. This is a feature, not a limitation. Communities that coordinate during emergencies need to know each other in person.

### 8.4 Open Source Transparency

AGPL v3 licensing ensures:

- Anyone can audit the encryption implementation
- Any modification to the server or app must be released as open source
- No hidden backdoors can be introduced without public visibility
- Communities can fork and self-host if they lose trust in the maintainers

---

## 9. Deployment Architecture

### 9.1 App Stores

- **iOS App Store** — Standard submission via EAS Submit. Age rating 4+.
- **Google Play Store** — Standard submission via EAS Submit.
- **F-Droid** — Open source Android app store. Requires reproducible builds (planned for v1.1).

### 9.2 Build Pipeline

EAS Build handles:

- Native compilation (WatermelonDB requires native SQLite bindings)
- Code signing (iOS provisioning profiles, Android keystores)
- Build variants: development (debug), preview (internal testing), production (store release)

### 9.3 No Required Backend

EMBER Tier 1 requires zero backend infrastructure. The app is fully functional with only local storage and peer-to-peer sync. The optional cloud sync server is:

- Community-hosted (anyone can run one)
- Receives only encrypted data
- Facilitates sync but is not required for any core functionality
- Documented in a separate deployment guide

---

## 10. Future Integration: Tier 2 and Tier 3

### 10.1 Tier 2: Node Kit Integration

EMBER Node Kits are pre-configured Meshtastic relay nodes. The app integrates via:

- BLE pairing protocol (standard Meshtastic BLE API)
- **Current app (Tier 1) Meshtastic client:** scan, connect, MTU negotiation, handshake, **portnum 270** send/recv with Phase B merge — see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md).
- Node status monitoring (battery level, solar charge, signal strength)
- Network topology visualization
- Remote firmware update (planned)

Hardware: Heltec ESP32 LoRa v3, 3W solar panel, 18650 LiPo, IP67 weatherproof enclosure.

### 10.2 Tier 3: Communicator Integration

EMBER Communicator is a standalone device based on T-Deck Plus. Integration points:

- Shared community encryption keys (synced via BLE from app)
- Compatible mesh protocol (same Meshtastic channel and EMBER application layer)
- Pre-loaded emergency plans (synced from app)
- Frequency charts and offline maps (bundled in firmware)

---

## Appendix A: Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| expo | ~52.0.0 | Framework | MIT |
| expo-router | ~4.0.0 | Navigation | MIT |
| @nozbe/watermelondb | ^0.27.1 | Database | MIT |
| tweetnacl | ^1.0.3 | Encryption | Unlicense |
| zustand | ^4.5.0 | State | MIT |
| react-native-reanimated | ~3.16.0 | Animation | MIT |
| react-native-svg | 15.8.0 | Graphics | MIT |
| expo-crypto | ~14.0.0 | PBKDF2/SHA256 | MIT |
| expo-secure-store | ~14.0.0 | Key storage | MIT |
| react-native-ble-plx | ^3.5.x | Meshtastic BLE GATT (dev client) | Apache-2.0 |
| @meshtastic/protobufs | pinned | Meshtastic `.proto` generated types | GPL-3.0 |
| @bufbuild/protobuf | ^2.x | Protobuf-ES runtime | (Apache-2.0 AND BSD-3-Clause) |

## Appendix B: Glossary

**BLE** — Bluetooth Low Energy. Short-range wireless protocol for device-to-device communication.
**CRDT** — Conflict-free Replicated Data Type. Data structure that can be merged without coordination.
**HLC** — Hybrid Logical Clock. Timestamp combining physical time and logical ordering.
**LoRa** — Long Range. Radio modulation technique for low-power, long-range communication.
**Meshtastic** — Open source firmware for LoRa mesh networking.
**NaCl** — Networking and Cryptography library by Daniel J. Bernstein.
**PBKDF2** — Password-Based Key Derivation Function 2.
**XSalsa20-Poly1305** — Stream cipher (XSalsa20) with authentication (Poly1305).
**Zero-knowledge** — Architecture where the service provider cannot access user data.