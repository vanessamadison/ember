# EMBER threat model matrix (living document)

This matrix supports security design, pilot planning, and **funding conversations** by making threats and mitigations **explicit and tier-aware**. It is meant to be **versioned in git** and updated after pilots and reviews.

**Companion docs:** [MVP-GUIDE.md](./MVP-GUIDE.md) (product and funding narrative), [MVP-DEPLOY.md](./MVP-DEPLOY.md), [PHASE-B-SYNC.md](./PHASE-B-SYNC.md), [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md) (in-repo vs external gates).

---

## How to use this document

| Activity | Suggested use |
|----------|----------------|
| **Engineering backlog** | Map “Target mitigation” rows to issues/milestones; assign **Owner**. |
| **Pilot design** | Pick rows with **Impact H** and define **acceptance tests** (what must not happen). |
| **Investor / grant due diligence** | Show *awareness*: asset, attacker, control, *residual* risk, next step. |
| **Incident response** | Extend with “detect / respond / recover” once playbooks exist. |

### Scales (edit freely)

**Likelihood (L)** and **Impact (I)** use **H / M / L** (high, medium, low). Initial assignments are **team judgment** until you have incident data or a formal risk workshop. Mark **TBD** when unknown.

**Nominal risk** (optional): combine L×I for triage only—e.g. H/H = priority, L/L = backlog—without implying statistical accuracy.

**Owner** abbreviations:

| Code | Meaning |
|------|---------|
| **T1** | Tier 1 app (this repo and mobile roadmap) |
| **T2** | Tier 2 node kits (hardware, Meshtastic, enclosure, power) |
| **T3** | Tier 3 communicator (handheld firmware, UX, supply) |
| **Ops** | Operations: hosting, relay policy, legal, support, incident response |
| **Comm** | Community layer: training, governance, drills, local policy |

**Current control status** (suggested vocabulary):

- **Shipped** — implemented in a production-leaning build  
- **Partial** — some defense exists; gaps documented  
- **Planned** — on roadmap, not yet delivered  
- **N/A** — out of scope for current SKU  
- **TBD** — not yet assessed  

---

## 1. Tier 1 — EMBER App (phone)

| ID | Category | Asset | Threat / failure mode | L | I | Current controls | Target mitigations | Owner |
|----|----------|--------|------------------------|---|---|-------------------|---------------------|-------|
| T1-01 | Crypto | Community keys & payloads | Weak KDF params; implementation bugs | M | H | NaCl secretbox + KDF path in app; keys in SecureStore (device-backed) | Document parameter choices; optional NIST/AP alignment; **third-party crypto review** for releases | T1 |
| T1-02 | Crypto | Ciphertext at rest | Device unlocked; malware reads memory/DB | M | H | Local encryption for sensitive payloads; WMDB for structured data | **Re-auth** after timeout; reduce plaintext in RAM; OS hardening guidance in user docs | T1 + Comm |
| T1-03 | Metadata | Who syncs when | Relay or logs correlate invites, IPs, timing | M | M | Relay sees opaque blobs + derived auth token (Phase B) | **Minimal retention**; no CDN logging PII; sneaker-net path; **sync throttling** | Ops + T1 |
| T1-04 | Metadata | Notifications | OS push leaks topic/sender/text preview | M | M | (varies by build) | **Neutral previews off by default**; local-only alerts where possible | T1 |
| T1-05 | Identity | Invite & join | Guess/bruteforce invite; stolen invite code | M | M | Passphrase + invite; normalized codes | **Invite expiry**, rate limits, lockout UX, optional **out-of-band** confirm | T1 |
| T1-06 | Identity | Members | Malicious joiner; impersonation | M | H | Community + passphrase model | **Roles**, **revocation**, audit-friendly **reports** without mass surveillance | T1 + Comm |
| T1-07 | Abuse | Messages / plans | Spam, panic injection, misinformation | M | H | (product-dependent) | **Signed coordinator announcements**; moderation flows; crisis vs rumor UI | T1 + Comm |
| T1-08 | Supply chain | App binary | Malicious build, dependency hijack | L | H | npm lockfile; EAS builds | **Reproducible build** goals; dependency audit; release signing | T1 + Ops |
| T1-09 | Ops leak | Logs, crash reports | Sensitive data in telemetry | M | M | Dev logging | **Production log scrub**; PII-free crash policy; user opt-in | T1 |
| T1-10 | Availability | Local DB | Corruption; failed migration | M | H | Watermelon migrations | **Backup/export** UX; repair path; migration tests | T1 |
| T1-11 | Availability | Offline | Queues diverge; bad merges | M | H | Phase B LWW + insert-only for one vertical | **CRDT / tested merge** across entities; property tests | T1 |
| T1-12 | Human | Passphrase | Loss; weak passphrase; oversharing | H | M | User education in onboarding | **Recovery policy**; strength meter; **printed quick reference** | Comm + T1 |
| T1-13 | Physical | Lost phone | Data exposure | H | M | Screen lock (OS); SecureStore | **Panic wipe**; short crypto re-lock; **screenshot policy** where feasible | T1 |
| T1-14 | Transport | BLE / Meshtastic bridge | Malicious pairing; rogue radio | M | H | (not productized in app MVP) | **Short provisioning window**; authenticated pairing; channel policy docs | T1 + T2 |
| T1-15 | Legal | App operator | Coercive demand for user data | L | M | Local-first, minimal server | **No-plaintext** architecture doc; jurisdiction memo; **minimal retention** on relay | Ops |

---

## 2. Tier 2 — EMBER Node Kits (fixed mesh infrastructure)

| ID | Category | Asset | Threat / failure mode | L | I | Current controls | Target mitigations | Owner |
|----|----------|--------|------------------------|---|---|-------------------|---------------------|-------|
| T2-01 | Physical | Node hardware | Theft; tamper; swap for rogue device | M | H | (hardware program) | **Tamper-evident** seals; **node identity** + **re-provision** after theft; elevated placement guidance | T2 + Ops |
| T2-02 | Firmware | Meshtastic / stack | Malicious flash; brick; backdoor | M | H | (vendor baseline) | **Signed firmware**; locked update path; **reproducible** where possible | T2 |
| T2-03 | RF / link | LoRa channel | Jamming; flood; nibble RF map | M | H | Meshtastic defaults | Rate limits; **priority queues**; redundant topology; **emergency-only channels** | T2 + Comm |
| T2-04 | RF / privacy | Traffic analysis | Correlation of relays to locations | M | M | Community placement discipline | **Topology guidance**; avoid single choke-point to whole mesh | T2 + Comm |
| T2-05 | BLE | Provisioning | Open BLE; drive-by pairing | M | H | (deployment practice) | **Disable or time-box** setup BLE; **authenticated** pairing only | T2 |
| T2-06 | Power | Solar / battery | Brownout; overcharge; weather | H | H | (BOM + field test) | **UV/condensation** testing; undervoltage cutoff; **health telemetry** optional | T2 |
| T2-07 | Environment | Enclosure | Water ingress; UV crack; heat | M | H | (enclosure design) | IP rating goals; cable glands; **field burn-in** | T2 |
| T2-08 | Key mgmt | Channel / mesh keys | Forever keys; no rotation | M | M | Community policy | **Rotation runbook**; compartmented channels by function | T2 + Ops + Comm |
| T2-09 | Supply chain | Radio modules | Counterfeit parts | L | H | Trusted vendors | BOM attestations; incoming QC | T2 |
| T2-10 | Legal / seizure | Seized node | Key material extraction; silent rejoin | M | H | (ops) | **Seizure playbook**; **no automatic trust** after custody break | Ops + T2 |

---

## 3. Tier 3 — EMBER Communicator (standalone field device)

| ID | Category | Asset | Threat / failure mode | L | I | Current controls | Target mitigations | Owner |
|----|----------|--------|------------------------|---|---|-------------------|---------------------|-------|
| T3-01 | Boot / chain | Firmware | Untrusted image boots | M | H | (TBD per platform) | **Secure boot** where feasible; **signed** updates; user-verifiable hashes | T3 |
| T3-02 | Storage | Plans, maps, logs | Extraction after capture | M | H | (TBD) | **Encrypted local volume**; **quick wipe**; PIN duress policy (careful design) | T3 |
| T3-03 | UX / stress | Crisis operator | Wrong actions under panic | H | H | (TBD) | **Ultra-simple crisis mode**; large contrast; drills; **no jargon** defaults | T3 + Comm |
| T3-04 | Power | Battery | Dead device when needed | H | H | (hardware) | **Solar** option; honest **SoC** UX; spare battery discipline | T3 |
| T3-05 | Rugged | Enclosure / I/O | Drops; dust; water | M | M | (mechanical) | IP rating; strain relief; field repairability | T3 |
| T3-06 | Radio | LoRa | Same as T2 for handheld | M | H | Shared stack concerns | Align channel policy with Tier 2; **isolated** community modes | T3 + T2 |
| T3-07 | Supply chain | Full device | Preloaded malware | L | H | (process) | **Trusted flash** procedure; buyer verification | T3 + Ops |

---

## 4. Cross-tier threats (systemic)

| ID | Category | Asset | Threat / failure mode | Primary tiers | L | I | Current controls | Target mitigations | Owner |
|----|----------|--------|------------------------|---------------|---|---|-------------------|---------------------|-------|
| X-01 | Insider | Trust | Coordinator or trusted member abuses access | T1–T3 | M | H | Role hints in app | **Least privilege**; **revocation**; **quorum** for destructive actions; **signed** directives | T1 + Comm |
| X-02 | Misinformation | Attention | Weaponized alerts in crisis | T1–T3 | M | H | — | **Verification rituals**; official vs community channel separation | Comm + T1 |
| X-03 | DoS | Mesh + app | Jam, flood, battery drain | T1–T2 | M | H | Partial (local queues) | **Backoff**; **rate limits**; redundant paths; power budgeting | T1 + T2 |
| X-04 | Supply chain | Stack | Poisoned FW, app, or node | T1–T3 | L | H | Dependency lock (app) | End-to-end **attestation** roadmap; signed artifacts | T1 + T2 + T3 + Ops |
| X-05 | Legal / coercion | Operators | Data demand, device seizure | T1–T3 | L | M | Architecture favors minimal data | **Operator playbook**; legal memo; **wipe** training | Ops + Comm |
| X-06 | Human factors | Training | Misinstall, weak OPSEC | T1–T3 | H | M | Partial onboarding | **Drills**; **print** analog kit; mentor model | Comm |
| X-07 | Resource targeting | Intel | Adversary infers caches / muster points | T1–T2 | M | H | — | **Need-to-know** views; **role-based** resource visibility | T1 + Comm |
| X-08 | Surveillance | Metadata | Mass / targeted collection | T1–T2 | M | M | Partial | **Metadata minimization** program; radio hygiene | T1 + T2 + Ops |

---

## 5. Mapping to “six layers” of hardening

Use this checklist when reviewing a release or a pilot **readiness gate**.

| Layer | Example controls (indicative) | Primary owners |
|-------|-------------------------------|----------------|
| **Cryptographic** | KDF review, key rotation, authenticity (signatures/MACs), SecureStore | T1, T3 |
| **System** | Panic wipe, re-auth, corruption recovery, logging policy | T1, T3 |
| **Radio** | Channel plan, anti-flood, BLE provisioning window | T2, T3 |
| **Physical** | Enclosure, tamper cues, lightning/surge where relevant | T2, T3 |
| **Operational** | Relay retention, incident response, legal memo, firmware signing | Ops, T2, T3 |
| **Community** | Roles, drills, moderation, verification, printed guides | Comm |

---

## 6. Pilot-derived metrics (fill in after each pilot)

Template for turning the matrix into **evidence**:

| Metric | Definition | Target for pilot vN |
|--------|------------|---------------------|
| **Successful join rate** | % completed onboarding without support | |
| **Sync success** | % successful merge without data loss (audit sample) | |
| **Time-to-check-in** | Median seconds in crisis mode drill | |
| **Node uptime** | % Tier 2 nodes up through weather window | |
| **Communicator task completion** | % users completing scripted message without help | |
| **Incidents** | Security/UX failures mapped to matrix IDs | |

---

## 7. Review cadence (recommended)

| Event | Action |
|-------|--------|
| **Monthly** (pre-1.0) | Update L/I for rows touched by shipped code; mark controls Partial/Shipped. |
| **Per pilot** | Add incidents; adjust mitigations; fill §6 metrics and §8 results summary. |
| **Pre-funding deck** | Export summary: top 10 residual **H/H or H/M** risks + mitigations in flight. |
| **Major hardware rev** | Refresh Tier 2–3 rows; add BOM/firmware version references. |

---

## 8. Pilot results (append after each field run)

Paste or summarize from [PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md). Link diagnostics under version control or a private store; **do not** commit channel PSKs.

| Pilot ID | Date | Build (SHA / EAS) | Hardware (nodes) | Pass / partial / fail | Top incidents (matrix IDs) | Stated limits for external comms |
|----------|------|-------------------|------------------|------------------------|----------------------------|----------------------------------|
| (example) | | | | | | Mesh prototype; no store certification claimed |

**Stated limits** should match [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md) — e.g. Phase B entities synced, Meshtastic keying outside EMBER, no third-party pen test unless listed.

---

## 9. Version history

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-04-04 | Initial matrix scaffold: tiers 1–3, cross-tier, usage and pilot sections |
| 0.2 | 2026-04-04 | Added §8 pilot results template; companion link to store-credibility bar doc |

---

### Optional next artifacts (not required to use this doc)

1. **STRIDE or PASTA** workshop notes (link as PDF or `docs/security/workshop-YYYY-MM-DD.md`).  
2. **Data classification** table (what is public / community / sensitive / emergency-only).  
3. **DREAD** scores if investors request numeric ranking—keep method consistent once introduced.

When in doubt, **prefer fewer, honest rows** over exhaustive placeholder entries: an accurate “TBD” builds more trust than guessed likelihoods.
