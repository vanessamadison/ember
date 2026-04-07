# Pilot field test — summary template & release checklist

Use this after you run [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) (or a shortened variant). Attach **Share mesh diagnostic** `.txt` files and photos of radio channel screens if helpful.

---

## 1. Pilot summary (copy for GitHub issue, partner email, or internal log)

```markdown
## EMBER mesh pilot — <YYYY-MM-DD> — <location / indoor / outdoor>

**Build:** EAS profile / git SHA: ______
**EMBER app:** version ______  **OS:** A: ______  B: ______

**Radios:** (model, Meshtastic firmware, region, primary channel / modem preset)
- A: ______
- B: ______

**Result:** PASS / PARTIAL / FAIL against [MESH-FIELD-TEST pass criteria](./MESH-FIELD-TEST.md#pass-criteria).

**What worked:** ______

**What failed or was flaky:** ______

**Attachments:** diagnostic `.txt` (A/B), optional RF notes (distance, obstacles).

**Consent:** Pilot participants understood this is prototype software; limitations: ______
```

---

## 2. Pre-field checklist (before you leave the lab)

| Step | Done |
|------|------|
| Native **dev or release** build installed (not Expo Go) | [ ] |
| Two **phones** charged; two **Meshtastic nodes** charged ([hardware guide](./MESH-HARDWARE-GUIDE.md)) | [ ] |
| Same **Meshtastic LoRa channel** on both nodes (primary channel + modem preset) | [ ] |
| Same **EMBER community** + passphrase on A and B; encryption unlocked | [ ] |
| **Bluetooth** permissions granted; Mesh Network shows adapter **On** after refresh | [ ] |
| Chunk spacing known (Settings → Mesh Network); note default vs raised value | [ ] |
| Decide test change on A only (check-in, member note) to verify on B | [ ] |

---

## 3. Post-field checklist (same day)

| Step | Done |
|------|------|
| Fill **§1 Pilot summary** (above) while memory is fresh | [ ] |
| Store **diagnostic exports** and label A vs B | [ ] |
| Note **firmware versions** if you upgrade radios mid-pilot | [ ] |
| File issues for **blocking** bugs with repro + diagnostics | [ ] |

---

## 4. “Release” readiness (internal bar — not app store legal review)

Use this only as a **team gate** for “we are comfortable demoing / small pilot expansion.”

| Criterion | Notes |
|-----------|--------|
| At least one **successful** two-device mesh snapshot round-trip logged | |
| No **data-loss** bug on merge without documented workaround | |
| **Permissions** path acceptable on one Android + one iPhone you care about | |
| **Limitations** stated to pilots (prototype mesh, Phase B scope) | |
| [MVP-DEPLOY.md](./MVP-DEPLOY.md) build channel matches what you installed | |

Store submission, legal, and threat-model sign-off are separate from this engineering checklist.
