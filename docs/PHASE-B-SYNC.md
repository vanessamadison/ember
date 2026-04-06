# Phase B — Members, check-ins & resources sync

Two transports share the same **encrypted snapshot** format (NaCl secretbox via `CryptoManager`):

1. **Sneaker-net** — copy/paste a base64 ciphertext between devices (no server).
2. **HTTP relay** — `PUT`/`GET` latest ciphertext for an invite code; relay stores opaque blobs only.

## Data model

- **`members.public_id`** — stable UUID for cross-device correlation (Watermelon `id` stays local).
- **`members.removed_at`** — soft removal (tombstone); hidden in UI; included in bundles as optional **`removedAt`** on `MemberSyncDTO` so removals propagate.
- **`communities.invite_expires_at`** — optional join cutoff for new communities (legacy rows = open). Carried in bundles as optional **`communityInviteExpiresAt`**; merge uses **max()** so coordinators can extend the window and spread it via sync.
- **`check_ins.sync_id`** — deduplication key for historical check-in rows.
- **`resources.public_id`** — stable resource id for LWW merge by `last_updated`; `updated_by` is mapped as **`updatedByMemberPublicId`** in the bundle (member `public_id`).
- **`persistMemberCheckIn`** updates the member **and** appends a `check_ins` row.

## Merge rules (LWW + insert-only)

- **Members:** matched by `public_id` + local community resolved by **invite code**. New public IDs create rows. Existing rows update from remote only if `remote.lastCheckIn >= local.lastCheckIn`.
- **Check-ins:** matched by `sync_id`; unknown IDs are inserted if the referenced member exists locally.
- **Resources:** matched by `public_id`; insert or LWW on `lastUpdated`. Updater resolved from `updatedByMemberPublicId` when possible.

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
| `types.ts` | Payload `v1` DTOs |
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
- Bundles cap at **500** newest check-ins by timestamp (resources + members are full set for the community).
- Joining a community on device B still requires the existing **join** flow so local `communities` row + crypto line up; sync **merges** members/check-ins for matching invite codes.
