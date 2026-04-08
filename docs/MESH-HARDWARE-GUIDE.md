# Meshtastic hardware for EMBER field tests

EMBER does **not** require you to solder a custom radio. You need **commercial LoRa boards that run [Meshtastic](https://meshtastic.org/) firmware** and expose the **standard Meshtastic BLE GATT service** (what EMBER’s `MeshRadioProvider` pairs with). See [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) for the app side.

---

## 1. What you need (minimum)

| Item | Why |
|------|-----|
| **2× smartphones** (iOS or Android) | EMBER dev/release build; BLE for phone ↔ radio |
| **2× Meshtastic-compatible LoRa devices** | One node per phone for a clean two-device over-the-air test |
| **USB cable** per device (usually USB-C) | Power + first-time **firmware flash** from a laptop |
| **Same LoRa region** on both nodes | e.g. US915 vs EU868 — **must** match your country; wrong region is illegal or useless |
| **Laptop** (any OS) | Flash firmware / configure channels via **Meshtastic Web Flasher** or desktop app |

**You do not** need to “make” a PCB. You **buy** a supported board, **flash** Meshtastic, **pair** BLE to EMBER, and align **channel settings** between nodes.

---

## 2. Good starter boards (examples)

The ecosystem changes; always verify on **[meshtastic.org/docs/hardware](https://meshtastic.org/docs/hardware)** before buying.

| Class | Examples (names only) | Notes |
|-------|----------------------|--------|
| **Popular all-in-one** | **Heltec WiFi LoRa 32 V3**, **T-Beam** variants | WiFi/BLE + LoRa; common in community |
| **Modular** | **RAK WisBlock** (Meshtastic-supported combos) | Flexible; pick a documented Meshtastic kit |
| **Compact** | **Seeed Xiao** + approved LoRa wing (if listed for Meshtastic) | Check current compatibility list |

Pick a device that explicitly lists **BLE** and **Meshtastic** support. Avoid random LoRa modules with no Meshtastic port — EMBER expects the **Meshtastic BLE API** ([client API](https://meshtastic.org/docs/development/device/client-api/)).

---

## 3. How to assemble the “kit” in practice

1. **Flash Meshtastic** on both devices (official docs / flasher). Set **region** to your legal band.
2. **Set the same RF channel** on both nodes (primary channel + modem preset). Mismatched LoRa = no delivery for EMBER’s portnum 270 payloads ([MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md)).
3. **Phone A:** install EMBER native build → **Config → Mesh Network** → scan → connect → handshake.
4. **Phone B:** same, with its own node, in **RF range** of the mesh (start **close**, then walk tests).
5. Run **[MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md)** procedure; use **Share mesh diagnostic** for logs.

**One radio only:** you can swap the phone between sends, but two radios is what the runbook assumes for realistic LoRa paths.

---

## 4. Where to buy (reputable starting points)

| Source | What to expect |
|--------|----------------|
| **[meshtastic.org](https://meshtastic.org/)** — **Docs, firmware, flasher** | Source of truth; often links to vendors |
| **Official / partner stores** (check Meshtastic site for current links) | Known-good hardware revisions |
| **RAK Wireless**, **Heltec** official shops | Manufacturer direct |
| **Crowd Supply**, **Mouser**, **DigiKey** | When they stock listed Meshtastic-compatible boards |
| **Amazon / AliExpress** | Possible; **verify exact SKU** against hardware docs — clones vary |

**Tips:** Buy **two identical or compatible** RF modules for your band; avoid mixing region presets. Prefer sellers with clear return policy for first purchase.

---

## 5. Legal / RF safety (short)

- Use only **approved power and frequencies** for your country. Meshtastic’s **region** setting exists for this reason.
- **Do not** rely on EMBER for RF compliance — compliance is **your** responsibility as operator.
- This guide is **not** legal advice.

---

## 6. Reference hardware (Tier 2 pilot): RAK WisMesh 1W (RAK10724)

For **EMBER field tests** where **range and RF headroom** matter more than minimizing per-board cost, the **RAK WisMesh 1W Booster Starter Kit (RAK10724)** is a strong single reference: **~1 W transmit** (vs typical ~100–160 mW community nodes), **nRF52840** BLE to the phone, **no Wi‑Fi** (smaller attack surface for fixed infrastructure), **Meshtastic‑supported** target, and **modular WisBlock** expansion (GPS, sensors). Verify current **SKU, band, and stock** on [RAKwireless](https://www.rakwireless.com/) and [Meshtastic hardware docs](https://meshtastic.org/docs/hardware/) before buying.

**Operator setup:** Use Meshtastic’s tools to set **region**, **firmware ≥ 2.5.0**, and a **private channel PSK** — see [MESHTASTIC-NODE-SECURITY.md](./MESHTASTIC-NODE-SECURITY.md). EMBER does not configure keys over BLE.

---

## 7. Affordability: Tier 2 vs Tier 3 with this hardware

| Tier | Role of this board | Cost impact |
|------|---------------------|-------------|
| **Tier 2 (node kits)** | **Infrastructure** repeaters on rooftops, hills, or staging areas | **Per-node** price is higher than budget 100 mW boards, but **coverage per node** can be higher in difficult terrain — you may need **fewer** nodes for the same geographic footprint. A **two-node** pilot is on the order of **~$100–130** total (two kits + batteries + optional GPS/enclosure), comparable to a single premium handheld but **not** the same product class. |
| **Tier 3 (communicator)** | **Not** a drop-in replacement | A **handheld communicator** (screen, keyboard, crisis UX) is a **different SKU**; it may reuse **LoRa/Meshtastic** stacks but **not** necessarily this same 1W board form factor. Choosing RAK10724 for Tier 2 **does not automatically** raise Tier 3 retail price — unless you deliberately **standardize** on one module family for supply-chain reasons. |

**Summary:** Tier 2 affordability is **fleet cost × coverage**; the 1W kit trades **unit cost** for **reach**. Tier 3 affordability is **mostly independent** unless you bind the communicator program to the same BOM.

---

## 8. First field test: deployment scenario (recommendation)

Use a **mix** in two phases:

1. **Stationary baseline** — two nodes **fixed** at known positions (LOS or light obstruction), run [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) until **pass criteria** are stable. Reduces variables (RF, BLE, app) while you validate pairing and snapshot merge.  
2. **Mobile / walk-away** — repeat with one or both **phones moved** or one node **relocated** to stress **RF** and **chunk assembly** timing.

Purely mobile first is harder to debug; purely stationary never proves **real-world** paths. **Field proof** should include at least one **logged** stationary success before expanding scope.

---

## 9. Related docs

- [MESH-FIELD-TEST.md](./MESH-FIELD-TEST.md) — step-by-step validation  
- [MESHTASTIC-BLE.md](./MESHTASTIC-BLE.md) — app integration  
- [MESHTASTIC-NODE-SECURITY.md](./MESHTASTIC-NODE-SECURITY.md) — PSK, firmware, rotation  
- [STORE-CRISIS-MESH-BAR.md](./STORE-CRISIS-MESH-BAR.md) — credibility vs store readiness  
- [PILOT-FIELD-SUMMARY.md](./PILOT-FIELD-SUMMARY.md) — pilot write-up + checklists  
- [MVP-DEPLOY.md](./MVP-DEPLOY.md) — how to install dev/release builds  
