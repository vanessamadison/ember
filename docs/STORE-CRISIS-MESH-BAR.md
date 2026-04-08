# From “prototype mesh” to “store-credible crisis mesh”

**Honest framing:** App stores do not grant a “crisis mesh certification.” What reviewers and users need is **evidence**, **clear limits**, and **operational readiness** — plus policy narratives for encryption, Bluetooth, and data handling. This document separates **what the repo can ship** from **what only your team, pilots, and third parties can provide**.

---

## 1. What you are actually trying to prove

| Claim | Requires |
|--------|----------|
| **EMBER + Meshtastic BLE works** for a defined pilot | Field runs per [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md), notes per [PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md), diagnostics retained |
| **BLE/permissions are acceptable** on real Android + iPhone | Device matrix in pilot notes; issues filed with repro + diagnostics |
| **Security posture is understood** | [THREAT-MODEL-MATRIX.md](./THREAT-MODEL-MATRIX.md) updated with pilot incidents and **stated limits** |
| **Sync scope is honest** | [PHASE-B-SYNC.md](./PHASE-B-SYNC.md) + product copy: members, check-ins, resources in bundle; **plans and messages** not in Phase B mesh/relay yet |
| **Store submission** | Separate: privacy labels, export compliance, support channel, **not** provable from git alone |

---

## 2. In-repo deliverables (engineering + docs)

| Track | Done / maintained in repo | Owner |
|-------|-----------------------------|--------|
| **Field proof** | [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) runbook; [PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md) template; **Share mesh diagnostic** in app | Pilot operator fills templates |
| **Pilot hardening** | [PLAN-FIELD-MESH-POLISH.md](./PLAN-FIELD-MESH-POLISH.md); BLE permission flows; chunk spacing / walk-down | Engineering |
| **Node operator education** | [MESHTASTIC-NODE-SECURITY.md](./MESHTASTIC-NODE-SECURITY.md); **Settings → Mesh Network → Node security checklist** (guided taps; EMBER does not configure Meshtastic keys over BLE) | Engineering + ops |
| **Credibility pack** | [THREAT-MODEL-MATRIX.md](./THREAT-MODEL-MATRIX.md) § pilot metrics; [MVP-DEPLOY.md](./MVP-DEPLOY.md) build/test notes | Team |
| **Phase B scope** | Code + [PHASE-B-SYNC.md](./PHASE-B-SYNC.md); extending to **plans / messages** = product + schema + merge work | Product + engineering |

---

## 3. Out-of-repo (cannot be “built” in the repository alone)

| Item | Why it stays external |
|------|------------------------|
| **Store policy & review outcome** | Apple/Google decisions; legal interpretation |
| **Penetration test or crypto audit** | Third-party engagement, scope, report under NDA |
| **Signed / reproducible firmware for Tier 2–3 SKUs** | Hardware program, vendors, signing keys |
| **Pilot communities & consent** | IRB-style or community agreements; not code |
| **24/7 support SLA** | Operations contract |
| **RF regulatory compliance** | Operator responsibility; country-specific |

Document **limits** next to **claims** in decks and store text: e.g. “Meshtastic channel crypto is configured in the Meshtastic app; EMBER encrypts app bundles separately.”

---

## 4. Suggested order of operations

1. Run **MESH-FIELD-TEST** on a **two-node** setup ([MESH-HARDWARE-GUIDE.md](./MESH-HARDWARE-GUIDE.md)); file **PILOT-FIELD-SUMMARY** same day.  
2. **Harden** BLE paths on at least one Android and one iPhone build from your real EAS profile.  
3. Update **THREAT-MODEL-MATRIX** §6 (pilot metrics) and add a short “**pilot N results**” subsection with pass/fail and known bugs.  
4. **MVP-DEPLOY**: ensure testers install the build you actually piloted (git SHA / profile).  
5. Only when product/legal are ready: **store submission** checklist (privacy, export, support) — treat as a **gate**, not part of the field-test gate.

---

## 5. Related docs

- [MVP-GUIDE.md](./MVP-GUIDE.md) — tiers and funding narrative  
- [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) — app ↔ radio integration  
- [MESH-HARDWARE-GUIDE.md](./MESH-HARDWARE-GUIDE.md) — reference hardware and affordability  
