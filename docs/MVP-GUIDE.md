# EMBER MVP guide — product state, gaps, deployment, and funding path

This document ties together **what you can ship today**, **what your three-tier plan requires**, and **what funders or deployers typically need to see** before backing deeper implementation. It assumes the architecture you described: **Tier 1 app** (broad adoption), **Tier 2 node kits** (fixed mesh infrastructure), **Tier 3 communicator** (standalone field device), each with different failure modes and attack surfaces.

For hands-on build and test steps, see [MVP-DEPLOY.md](./MVP-DEPLOY.md). For cross-device member/check-in sync mechanics, see [PHASE-B-SYNC.md](./PHASE-B-SYNC.md). For the tier-aware **threat model matrix** used with funders and pilots, see [THREAT-MODEL-MATRIX.md](./THREAT-MODEL-MATRIX.md).

---

## 1. One-page truth for funders and partners

**What EMBER is today (this repository):** a **Tier 1–focused, offline-first mobile app** with local encrypted storage, community onboarding, coordination UI (resources, drills, plans, etc.), and an **early cross-device path** for **members, check-ins, resources, emergency plans, messages, and drills** via encrypted bundles (sneaker-net or a minimal HTTP relay). **Meshtastic over BLE** is implemented as a **working prototype** (pairing, Phase B snapshot over LoRa with v1/v2 framing, merge on receive — see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md)); it is **not** store-grade mesh UX or field-certified reliability yet. **Tier 2/3 hardware SKUs** and fully proven crisis field workflows remain outside this repo.

**What “deployment” means at this stage:** internal or small-group distribution (TestFlight, Play internal track, EAS builds), plus **explicit pilot consent** and clear limitations (Phase B sync scope, Meshtastic path is **prototype** until field validation and UX hardening — see [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md)).

**What “funding for further implementation” usually requires beyond a demo app:** a **threat model and mitigation matrix**, evidence of **user or community pilots**, a **hardware and firmware roadmap** for tiers 2–3 (even if V1 is reseller + Meshtastic), and a plan for **metadata minimization, identity/abuse controls, and operational playbooks**—aligned with the layered hardening you outlined (crypto, system, radio, physical, operational, community).

---

## 2. Three tiers — plan vs current reality

The strongest version of EMBER is a **stack** where each tier compensates when others degrade. Below is an honest **where we are** vs **where we need to be** for that story to hold in market and security terms.

### Tier 1: EMBER App (phone software)

| Dimension | Your plan | Where we are (repo reality) | Gap to “deployment + funding-ready” |
|-----------|-----------|-----------------------------|-------------------------------------|
| Offline-first coordination | Core value | SQLite/Loki via WatermelonDB; core flows local | Harden **cold start**, corruption recovery, large DB perf, deterministic offline queues beyond current sync vertical |
| Encryption | NaCl secretbox, KDF, SecureStore | Implemented for app crypto path; community keys from passphrase | Move KDF story toward **audited parameters**, clarify distinction vs server “zero knowledge”; **no production pen test** yet documented |
| Peacetime features | Resources, drills, plans, check-ins, gamification | UI + much data modeled; Phase B **sync** includes **members, check-ins, resources, emergency plans, messages, and drills** (sneaker-net / relay / mesh; bundle **v2** — see [PHASE-B-SYNC.md](./PHASE-B-SYNC.md)) | **CRDT/merge testing** under ugly cases; **achievements** not in Phase B yet |
| Transport model | Optional cloud, BLE, Meshtastic via BLE in crisis | **Phase B:** sneaker-net + optional **dev relay**; **Meshtastic BLE client** + portnum 270 Phase B blobs ([MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md), [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md)) | **Production** hardening: permissions/onboarding polish, RF reliability, adaptive airtime, formal pilot evidence |
| Identity & invites | Strong invites, roles, abuse resistance | Invite + passphrase gate; coordinator role on create | **Invite expiry**, **revocation**, **role/permission model**, **moderation**, signed announcements |
| Metadata & OPSEC | Minimize traces | Relay sees invite + auth derivative; UI/logging not fully audited | Metadata minimization pass; **production logging policy**; notification privacy |
| Reliability | Works when network gone | Strong for single-device; multi-device improving | **Pull-merge-push** discipline; rate limits; backup education UX |

**Bottom line — Tier 1:** You can **pilot the app** and demonstrate **local-first encrypted coordination** plus **partial multi-device sync** for people/check-ins (sneaker-net, relay, **and** Meshtastic snapshot path in dev/native builds). Credibility for **fundraising or public “crisis-grade mesh” claims** still depends on **field validation**, **BLE UX hardening**, and **operational runbooks** — not only on prototype code.

### Tier 2: EMBER Node Kits (fixed infrastructure)

| Dimension | Your plan | Where we are | Gap |
|-----------|-----------|--------------|-----|
| Meshtastic relay, solar, enclosure | Product + ops | **Not in this repo** | BOM, vendor selection, enclosure design, solar/load budget, **signed firmware** policy, provisioning runbook |
| Security | BLE lockdown, channel hygiene, tamper awareness | N/A in app repo | Node identity, seizure response, **no silent re-trust** after theft |
| Reliability | Power + RF + environment | N/A | Test plan: undervoltage, UV, condensation, antenna redundancy |

**Bottom line — Tier 2:** Treat as **hardware + firmware program** with **pilot deployments** (even 3–5 nodes). Software team can provide **channel/key policy docs** and **app pairing UX**; the credibility gap is **physical and RF validation**.

### Tier 3: EMBER Communicator (standalone device)

| Dimension | Your plan | Where we are | Gap |
|-----------|-----------|--------------|-----|
| T-Deck (or similar), keyboard, screen, LoRa | Crisis-first device | **Not in this repo** | Firmware, secure boot/update story, encrypted local store, **crisis UX** (minimal jargon), ruggedness |
| Independence from phone | Key differentiator | N/A | End-to-end demo: plan delivery, messaging, without Tier 1 |

**Bottom line — Tier 3:** Highest **perceived** impact for funders who understand “last mile,” but also the **longest** lead time. For fundraising, a **clear V1 scope** (hardware kit + flash process + attestation checklist) often beats an undefined “communicator vision.”

---

## 3. Gap analysis — you vs “real deployment” vs “real funding”

These are different bars.

### 3.1 Technical deployment (get builds to real users)

**Close or met:** EAS paths, env config, internal tracks, dev relay for sync experiments.

**Still open:**

- [ ] Production **relay** (or explicit “no relay in prod” + sneaker-net only) with **minimal retention** and ops playbook.
- [ ] **Android/iOS** permissions and **data safety** narratives for store review (encryption export rules, backup warnings).
- [ ] **Crash reporting** choice that does not leak sensitive metadata (or ship with strict scrubbing).
- [ ] **Release checklist:** strip debug logs, verify `APP_ENV`, document recovery if DB migrates again.

See [MVP-DEPLOY.md](./MVP-DEPLOY.md).

### 3.2 Product deployment (trustworthy in a community)

**Open gaps (high impact):**

- [ ] **Invite abuse:** eviction, reporting, rate limits, optional expiry.
- [ ] **Resource/check-in sensitivity:** who can see what; crisis vs peacetime views; export controls.
- [ ] **Conflict resolution** beyond one vertical; tests for split-brain.
- [ ] **Human factors:** printed quick-start, drills, “forgot passphrase” policy.

### 3.3 Funding deployment (grants, angels, strategic, resilience buyers)

Funders typically want **evidence + a plan**, not only architecture prose.

| Asset | Why it matters | Status |
|--------|----------------|--------|
| **Threat model matrix** | Shows you know *what* you’re defending | **To produce** — asset, attacker, failure mode, likelihood, impact, mitigation × tier |
| **Pilot results** | De-risks adoption and field reality | **To run** — 1–3 communities, defined success metrics |
| **Third-party review** | Crypto/privacy credibility | Optional but powerful — scoped review or formal pen test for Tier 1 |
| **Tier 2/3 roadmap with milestones** | Shows hardware isn’t vapor | Deck + BOM band + partner (Meshtastic ecosystem, fab) |
| **Revenue / sustainability story** | Kits, support, training, enterprise | Even preliminary — avoids “grant-only forever” |
| **Legal / jurisdiction stance** | Relay operators, data handling | Short memo: minimal retention, no plaintext access |

Your pasted note is already the **right intellectual framing**; the **sharp next move** is literally: **turn it into the matrix** (even a 2–4 page living doc) and attach **one pilot plan**.

---

## 4. Layered hardening — map your six layers to work items

You defined reliability across **crypto, system, radio, physical, operational, community**. Here is how that maps to **actionable backlog** given today’s focus.

1. **Cryptographic:** Document KDF and bounds; plan for **message authenticity** (signatures / MAC policy) where needed; key rotation story for long-lived communities.
2. **System:** Panic wipe, re-auth, secure backups messaging, corruption recovery, production logging.
3. **Radio (Tier 2–3):** Channel plan, anti-flood behavior, BLE provisioning windows — **mostly outside app** until bridge ships.
4. **Physical (Tier 2–3):** Enclosure, tamper cues, power — **hardware program**.
5. **Operational:** Provisioning runbooks, seizure playbook, “what we log,” relay retention.
6. **Community:** Roles, moderation, signed advisories, drills — **product + training**.

---

## 5. Threats you listed — quick tier mapping (for the matrix)

Use this as **starter rows** in your matrix document:

- **Mass surveillance:** Tier 1 metadata/push/OS; Tier 2 RF mapping; Tier 3 seizure/traffic analysis.
- **Targeted surveillance:** Tier 1 compromised phone/insider; Tier 2 rogue relay/BLE; Tier 3 firmware tamper.
- **Resource targeting:** Tier 1 exposed inventories; Tier 2 placement inference; Tier 3 captured plans.
- **Infrastructure collapse:** Tier 1 battery/OS; Tier 2 power/antenna; Tier 3 charge path/ruggedness.
- **Insider misuse / misinformation / supply chain / DoS / legal pressure / human factors:** Cross-tier mitigations as you wrote — each becomes columns in the matrix.

---

## 6. Suggested sequencing (practical steps)

### Phase A — Make Tier 1 “pilot believable” (weeks)

1. Ship **internal builds** to a small cohort; collect failure stories (offline, sync, onboarding).
2. Publish **v0 threat model matrix** (can be ugly; must be concrete).
3. Tighten **OPSEC defaults:** notifications, logs, export copy.

### Phase B — Deepen Tier 1 software (months)

1. Extend sync or CRDT strategy to **additional entities** with tests.
2. **Meshtastic BLE bridge** spike → alpha → documented limitations.
3. **Identity & roles** v1 (expiry, revocation stub, coordinator actions).

### Phase C — Tier 2 pilot (parallel track)

1. **3–5 node** field test with solar; document RF and power.
2. **Firmware signing** and provisioning checklist.

### Phase D — Tier 3 (longer horizon)

1. Frozen **V1 communicator** scope; secure update path; crisis UX review with non-technical users.

---

## 7. How to use this doc internally

- **Engineering:** Prioritize Tier 1 gaps that unblock pilots and the threat matrix (they’re your funding multiplier).
- **Fundraising:** Lead with **stack story**, immediately follow with **honest tier status** + **matrix** + **pilot**.
- **Partners (meshtastic, OEM, NGOs):** Offer **Tier 1 as onboarding** and **Tier 2 as deployment**; avoid over-claiming mesh in the app until integrated.

---

## 8. Living documents to maintain

| Document | Purpose |
|----------|---------|
| `docs/MVP-GUIDE.md` (this file) | Product + funding narrative and gap summary |
| `docs/MVP-DEPLOY.md` | Build, store, env, testing |
| `docs/PHASE-B-SYNC.md` | Current sync vertical truth |
| [`docs/THREAT-MODEL-MATRIX.md`](./THREAT-MODEL-MATRIX.md) | Assets, threats, L/I, controls, target mitigations, owners; cross-tier rows; pilot metrics; review cadence |

Export the matrix to CSV or attach the markdown **as-is** for NLNet, investors, or municipal RFPs; update the **version history** table when assumptions change.
