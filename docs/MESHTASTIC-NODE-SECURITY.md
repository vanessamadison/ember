# Meshtastic node security — operator responsibilities

EMBER talks to Meshtastic devices over **standard BLE GATT** ([MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md)). **Channel keys, firmware version, and RF region** are configured with **Meshtastic** tools (app, web flasher, or CLI) — not inside EMBER. This document is the **operator runbook** that hardware guides often skip.

---

## 1. Why this matters

- Default Meshtastic **Primary** channel settings are **not** a private mesh for your community until you set a **shared secret** (PSK) known only to your group.  
- **Firmware 2.5.0+** introduced stronger options for direct messages and admin flows; run current firmware on every node you depend on.  
- **Physical access** to a node that stores your private channel key can defeat over-the-air confidentiality for that channel — treat unattended infrastructure accordingly.

---

## 2. First-time checklist (every node)

| Step | Action |
|------|--------|
| **Region** | Set **legal LoRa region** for your country (power and duty cycle rules). Wrong region is non-compliant or useless. |
| **Firmware** | Flash **Meshtastic ≥ 2.5.0** (or current stable recommended by [meshtastic.org](https://meshtastic.org/)). |
| **Private channel** | Create or edit the **Primary** (or dedicated) channel: use a **random PSK** (Meshtastic “random” key generation), not the well-known default. **Every** node in the mesh must use the **same** channel name + PSK + modem preset. |
| **BLE** | Leave BLE available only during provisioning; for fixed routers, follow Meshtastic guidance for **Bluetooth off** or **limited windows** when not pairing. |
| **Documentation** | Record firmware version and channel **name** (never paste PSK into public tickets). |

---

## 3. Operational rules

- **Unattended routers:** Avoid storing **high-sensitivity** channel keys on devices in public places if loss or theft is plausible; attackers with physical access may extract keys depending on firmware and hardware. Prefer **separate** channels for public relay vs sensitive coordination where feasible.  
- **Lost or stolen node:** **Rotate** the channel PSK and re-provision remaining devices; treat past ciphertext on that channel as potentially compromised for confidentiality.  
- **EMBER app crypto** (community passphrase, NaCl bundles) is **independent** of Meshtastic channel encryption. You need **both** aligned: same EMBER community on phones **and** compatible LoRa settings so portnum 270 payloads can flow.

---

## 4. What EMBER does *not* do (today)

- **Read or set** Meshtastic PSK / channel name over BLE from EMBER.  
- **Verify** firmware version automatically (operator confirms in Meshtastic UI or flasher).  
- **Replace** Meshtastic’s crypto with app-side keys for LoRa payloads — the radio stack still uses Meshtastic channel semantics for mesh traffic.

The in-app **Node security checklist** under **Settings → Mesh Network** is a **memory aid** only. A **web/React copy** for documentation sites lives at [docs/artifacts/mesh-security-checklist/MeshSecurityChecklist.web.tsx](./artifacts/mesh-security-checklist/MeshSecurityChecklist.web.tsx).

---

## 5. References

- [Meshtastic security documentation](https://meshtastic.org/docs/overview/security/) — upstream source of truth; versions and features change.  
- [MESH-HARDWARE-GUIDE.md](./MESH-HARDWARE-GUIDE.md) — hardware selection.  
- [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md) — credibility and store-adjacent gates.
