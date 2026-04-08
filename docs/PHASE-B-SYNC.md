# Phase B — Members, check-ins, resources, emergency plans, messages & drills

Two transports share the same **encrypted snapshot** format (NaCl secretbox via `CryptoManager`):

1. **Sneaker-net** — copy/paste a base64 ciphertext between devices (no server).
2. **HTTP relay** — `PUT`/`GET` latest ciphertext for an invite code; relay stores opaque blobs only.

**Meshtastic BLE** uses the same JSON payload inside the NaCl bundle (see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md)); mesh may trim large bundles to fit one LoRa frame.

## Bundle version

- **`v: 1`** — legacy: members, check-ins, optional resources (still accepted on import).
- **`v: 2`** — current: adds **`emergency_plans`** and **`messages`** (see `PHASE_B_BUNDLE_VERSION` in `src/sync/types.ts`). New exports always emit **v2**.

## Data model

- **`members.public_id`** — stable UUID for cross-device correlation (Watermelon `id` stays local).
- **`members.removed_at`** — soft removal (tombstone); hidden in UI; included in bundles as optional **`removedAt`** on `MemberSyncDTO` so removals propagate.
- **`communities.invite_expires_at`** — optional join cutoff for new communities (legacy rows = open). Carried in bundles as optional **`communityInviteExpiresAt`**; merge uses **max()** so coordinators can extend the window and spread it via sync.
- **`check_ins.sync_id`** — deduplication key for historical check-in rows.
- **`resources.public_id`** — stable resource id for LWW merge by `last_updated`; `updated_by` is mapped as **`updatedByMemberPublicId`** in the bundle (member `public_id`).
- **`emergency_plans.public_id`** — stable plan id; LWW merge on **`last_updated`**.
- **`messages.public_id`** — stable message id; **insert-only** merge (skip if `public_id` already exists locally).
- **`messages`** carry **`senderMemberPublicId`** (member `public_id`) so the receiver resolves the local Watermelon **`sender_id`**.
- **`drills.public_id`** — stable drill id; LWW merge on **`last_updated`** (completion and template fields).

## Merge rules (LWW + insert-only)

- **Members:** matched by `public_id` + local community resolved by **invite code**. New public IDs create rows. Existing rows update from remote only if `remote.lastCheckIn >= local.lastCheckIn`.
- **Check-ins:** matched by `sync_id`; unknown IDs are inserted if the referenced member exists locally.
- **Resources:** matched by `public_id`; insert or LWW on `lastUpdated`. Updater resolved from `updatedByMemberPublicId` when possible.
- **Emergency plans:** matched by `public_id`; insert or LWW on `lastUpdated`.
- **Messages:** insert-only by `public_id`; requires **`senderMemberPublicId`** to resolve to a local member (otherwise skipped).
- **Drills:** matched by `public_id`; insert or LWW on **`lastUpdated`**.

## Relay auth

Token = SHA-256 hex of `${passphraseHash}:${normalizedInviteCode}`. The client sends:

- `Authorization: Bearer <token>`
- `X-Ember-Passphrase-Hash: <community.passphrase_hash>`

The relay never receives the community passphrase.

## Dev relay

```bash
npm run relay:dev
```

Defaults to port **8765**. Point the app at your machine’s LAN IP:

```bash
# .env (Expo)
EXPO_PUBLIC_EMBER_RELAY_URL=http://192.168.1.42:8765
```

Android emulators often use `10.0.2.2` to reach the host; iOS simulator can use the host IP. Physical devices need the same Wi‑Fi and a non-loopback URL.

## Modules (`src/sync/`)

| File | Role |
|------|------|
| `types.ts` | Payload `v1` / `v2` DTOs |
| `ensureIds.ts` | Backfill `public_id` / `sync_id` |
| `snapshot.ts` | Build & decrypt encrypted JSON payload |
| `merge.ts` | Apply payload into WatermelonDB |
| `sneakerNet.ts` | Import/export base64 |
| `httpRelay.ts` | `relayPullBundle` / `relayPushBundle` |
| `runner.ts` | Pull → merge → push |
| `feed.ts` | `observeMembersCheckInsForCommunity` for future auto-sync |
| `refreshHub.ts` | Notifies `CommunityProvider` to re-hydrate after merge |

## Limitations (MVP)

- Last relay writer wins if two devices push without pulling first; prefer **pull then push** (`syncMembersCheckInsViaRelay`).
- Bundles cap at **500** newest check-ins and **500** newest messages by timestamp (resources, members, plans are full set for the community).
- Mesh path may drop messages/plans/drills/resources/check-ins in that order until the ciphertext fits one frame (see `buildEncryptedMembersCheckInsBundleForMesh`).
- Joining a community on device B still requires the existing **join** flow so local `communities` row + crypto line up; sync **merges** entities for matching invite codes.
