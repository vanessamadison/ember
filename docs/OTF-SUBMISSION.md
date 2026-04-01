# OTF Internet Freedom Fund — EMBER Concept Note

**Form: https://apply.opentech.fund/internet-freedom-fund-concept-note/**
**Rolling deadline (reviewed monthly)**
**Funding: $50,000 – $200,000 ideal range, up to $900,000**

---

## FIELD: Project name

EMBER — Encrypted Mesh Based Emergency Response

## FIELD: Project summary / What is your project idea?

Our project idea is to build EMBER, a zero-knowledge encrypted, offline-first mobile application for community emergency coordination, in order to address the critical gap in secure communication tools that function when internet infrastructure fails. The main beneficiaries are communities in disaster-prone regions and people living under repressive regimes where emergency communication is surveilled, censored, or deliberately disrupted.

EMBER enables communities to coordinate emergency resources, run preparedness drills, store encrypted emergency plans, and communicate via mesh radio networks — all with zero server dependency and zero-knowledge encryption that protects community data even from the developers. When cell towers go down or governments shut off internet access, EMBER switches to LoRa mesh communication (Meshtastic protocol), enabling encrypted peer-to-peer coordination across kilometers with no internet required.

## FIELD: What problem does this project address?

When disasters strike or governments impose internet shutdowns, the communication infrastructure communities depend on fails. Every mainstream emergency tool (FEMA apps, Citizen, Nextdoor, even WhatsApp and Telegram) requires functioning internet and routes data through centralized servers. This creates two critical failures:

1. Complete communication blackout during disasters. Cell towers have limited battery backup (4-8 hours). Internet service is among the first infrastructure to fail. The communities that need coordination most urgently are left completely disconnected.

2. Surveillance vulnerability in repressive contexts. During political crises, internet shutdowns are deliberate tools of repression. When governments restore connectivity, centralized communication records become evidence for persecution. Communities coordinating mutual aid, protest safety, or evacuation become targets.

Existing encrypted tools (Signal, Briar) require internet or direct Bluetooth proximity. Mesh networking tools (Meshtastic) provide raw communication but lack application-level coordination features. No existing tool combines zero-knowledge encryption, offline-first data persistence, community coordination features, and mesh network fallback in a single, accessible mobile application.

## FIELD: Who are the intended users or beneficiaries?

Primary beneficiaries include:

Communities in disaster-prone regions who need resilient communication when infrastructure fails. This includes hurricane, earthquake, wildfire, and flood zones worldwide where internet outages during emergencies are routine.

Communities under repressive regimes where internet shutdowns are used as tools of political control. EMBER's zero-knowledge architecture means no server ever holds decryptable community data, and mesh communication bypasses internet infrastructure entirely.

Vulnerable populations whose emergency coordination data could be weaponized: undocumented immigrants, domestic violence survivor networks, political activists, journalists, and indigenous communities.

Community Emergency Response Teams (CERT), mutual aid networks, and neighborhood preparedness groups who currently coordinate on paper, unencrypted group chats, or centralized platforms.

Communities in infrastructure-poor regions (rural areas, developing nations) where internet connectivity is unreliable even outside emergencies.

## FIELD: How is this relevant to internet freedom?

EMBER directly addresses internet freedom by providing communication resilience that is independent of centralized internet infrastructure and immune to surveillance:

Censorship circumvention: EMBER's mesh communication via LoRa radio bypasses internet infrastructure entirely. During government-imposed internet shutdowns, communities can still coordinate encrypted emergency response across kilometers.

Privacy preservation: Zero-knowledge encryption means community data (member lists, resource inventories, emergency plans, check-in locations) is encrypted on-device with keys that never touch any server. Even if devices are seized, data is protected by NaCl secretbox (XSalsa20-Poly1305) encryption.

Decentralization: No central server, no single point of failure, no data broker. CRDT-based sync ensures communities can operate as fully autonomous, decentralized networks.

Open source freedom: AGPL v3 licensing ensures the tool cannot be captured, closed, or weaponized. Any community can audit, modify, and deploy their own instance.

## FIELD: What is the geographic focus?

Global, with initial deployment targeting:

United States — disaster-prone communities (Gulf Coast hurricanes, West Coast wildfires, Tornado Alley, earthquake zones). Partner communities identified for pilot deployment.

Global South — regions with unreliable internet infrastructure and frequent natural disasters (Caribbean, Southeast Asia, Sub-Saharan Africa, Central America).

Regions experiencing internet shutdowns — EMBER's architecture is specifically designed for contexts where internet access is deliberately disrupted (documented in over 40 countries in recent years).

## FIELD: Similar or related efforts

Meshtastic: Open source LoRa mesh networking protocol. EMBER builds on Meshtastic as its mesh transport layer but adds the critical missing pieces: application-level community coordination, zero-knowledge encryption, offline database, and accessible mobile UI.

Briar: Delay-tolerant P2P encrypted messaging. Limited to direct Bluetooth/WiFi proximity (10-50m). No multi-hop mesh relay, no community coordination features, no resource tracking.

Signal: Gold standard for encrypted messaging but requires internet infrastructure. No offline capability, no mesh fallback, no community coordination tools.

Disaster.Radio: Community mesh network project focused on text communication. No encryption, no community coordination features, limited development activity.

FEMA App / Citizen / Nextdoor: Centralized, internet-dependent, no encryption, data harvested by third parties.

EMBER is unique in combining zero-knowledge encryption + offline-first database + mesh networking + community coordination in a single, open source mobile application.

## FIELD: Requested funding amount

$100,000 USD

## FIELD: Project duration

12 months

## FIELD: Objectives and deliverables

Month 1-3: Production-ready mobile application release on iOS App Store, Google Play, and F-Droid. Security audit of encryption pipeline by independent auditor.

Month 4-6: Meshtastic BLE bridge integration with multi-hop relay support. Field testing across multiple LoRa hardware variants. CRDT sync testing over mesh networks with real-world latency and packet loss.

Month 7-9: Pilot deployment with 3-5 partner communities. User research and iteration based on real-world community feedback. Localization for initial target languages.

Month 10-12: Community deployment toolkit (documentation, training materials, mesh network setup guides). Hardware recommendations and node kit assembly documentation. Sustainability planning and community governance framework.

## FIELD: How will the project be sustained beyond OTF support?

EMBER's sustainability model has three components:

1. The core app is free and open source forever (AGPL v3). It requires no server infrastructure to operate, so ongoing costs are minimal (app store fees only).

2. Optional hardware (mesh node kits $99-149, standalone communicators $89-129) provides revenue to fund continued development. These are margin-positive physical products.

3. Institutional partnerships with emergency management agencies, municipal governments, and NGOs for customized deployment and training.

The architecture is intentionally designed for zero recurring infrastructure costs. Once deployed, a community's EMBER network operates indefinitely on local devices and solar-powered mesh nodes.

---

## Contact Information

- **Name**: Vanessa Madison
- **Email**: thatcosmicbutterfly@gmail.com
- **Organization**: ILLAPEX LLC / Lirio Labs
- **Website**: https://github.com/nessakodo/ember
- **Country**: United States
