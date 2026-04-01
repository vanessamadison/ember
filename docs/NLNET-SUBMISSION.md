# NLnet NGI Zero Commons Fund — EMBER Submission

**Deadline: April 1, 2026, 12:00 CEST (noon) = 4:00 AM MDT**
**Form: https://nlnet.nl/propose/**
**Fund: NGI Zero Commons Fund**

---

## FIELD: Project name

EMBER — Encrypted Mesh Based Emergency Response

## FIELD: Website / wiki

https://github.com/nessakodo/ember

## FIELD: Abstract (2-10 sentences)

EMBER is a zero-knowledge, offline-first community resilience operating system. When disasters strike, existing emergency tools (FEMA, Citizen, Nextdoor) fail because they depend on centralized internet infrastructure that goes down first. EMBER solves this with end-to-end encrypted local-first architecture: communities coordinate resources, run preparedness drills, and store emergency plans on-device with zero server dependency. When connectivity fails, EMBER switches to mesh communication via LoRa radio (Meshtastic protocol), enabling encrypted peer-to-peer coordination across 1-5km with no internet required. All community data is encrypted using NaCl secretbox (XSalsa20-Poly1305) with keys derived from community passphrases via PBKDF2, ensuring zero-knowledge privacy even from the developers. EMBER is fully open source under AGPL v3, built with React Native and WatermelonDB, and designed to serve any community anywhere in the world.

## FIELD: Have you been involved with projects or organisations relevant to this project before? And describe any other relevant projects.

Yes. EMBER is developed by ILLAPEX LLC (illapex.com), a security-focused technology company, and Lirio Labs (liriolabs.com), a software and AI workflow studio. The project lead, Vanessa Madison, is a security engineer and creative technologist with experience in cryptographic systems, network security, and community resilience technology. This project grows from direct experience with communication failures during natural disasters and a deep understanding of the security requirements for protecting vulnerable communities during crises.

## FIELD: Requested amount (between 5000 and 50000 euros)

50000

## FIELD: Explain what the relevant advantages of the project are over existing comparable solutions

Current emergency communication tools have a critical architectural flaw: they require functioning internet infrastructure. FEMA apps, Citizen, Nextdoor, and Zello all route data through centralized cloud servers, making them useless precisely when communities need them most. Even Signal and Briar, while encrypted, still require internet or direct Bluetooth proximity.

EMBER's advantages:

1. Zero-knowledge encryption by default. All community data is encrypted on-device before touching any network. The server (when used for peacetime sync) never sees plaintext. This protects vulnerable communities (undocumented immigrants, domestic violence survivors, activists) whose emergency data could be weaponized.

2. True offline-first with mesh fallback. WatermelonDB on SQLite ensures all data is available without connectivity. When internet fails, EMBER bridges to LoRa mesh hardware (Meshtastic) via BLE, enabling encrypted communication across 1-5km per hop with multi-hop relay capability.

3. CRDT-based conflict resolution. Custom conflict-free replicated data types (GCounter, PNCounter, LWW registers with hybrid logical clocks) ensure data consistency across disconnected peers without any central authority.

4. Community-centric rather than individual-centric. EMBER treats the neighborhood as the unit of resilience, not the individual. Resource tracking, role assignment, preparedness gamification, and shared emergency plans build collective capacity before disaster strikes.

5. Three operational modes. Peacetime mode builds community preparedness through drills and resource coordination. Crisis mode strips the UI to essentials and prioritizes mesh communication. Recovery mode tracks community restoration progress.

6. Hardware-agnostic mesh integration. EMBER works on any smartphone without special hardware. Optional LoRa node kits and standalone communicators extend capability but are not required.

7. Fully open source (AGPL v3). No vendor lock-in, no data extraction, no surveillance capitalism. Communities own their resilience infrastructure.

## FIELD: Describe the technology, what you are going to work on, and what the expected result will look like

EMBER is a React Native mobile application (Expo SDK 52) with a three-tier architecture:

Core Technology Stack:
- React Native with Expo Router for cross-platform mobile (iOS, Android)
- WatermelonDB (SQLite native) for offline-first reactive database
- tweetnacl (NaCl secretbox / XSalsa20-Poly1305) for zero-knowledge encryption
- PBKDF2 key derivation (100K iterations) via expo-crypto
- Custom CRDT sync engine (GCounter, PNCounter, LWWRegister, Hybrid Logical Clocks)
- Zustand for state management
- BLE bridge to Meshtastic LoRa hardware for mesh networking

What we will work on with this grant:
1. Complete the mobile application from current MVP to production-ready release on iOS and Android app stores
2. Implement and audit the full zero-knowledge encryption pipeline (key derivation, secretbox encrypt/decrypt, secure key storage, key rotation)
3. Build the BLE-to-Meshtastic bridge for mesh communication with 237-byte payload optimization
4. Implement CRDT synchronization across mesh-connected peers
5. Build the preparedness gamification engine (drills, XP, achievements, readiness scores)
6. Conduct security audit of the encryption and sync architecture
7. Create documentation for community deployment and mesh network setup
8. Release on F-Droid and app stores

Expected result: A production-ready, security-audited mobile application that any community can download for free, create an encrypted local community network, coordinate emergency resources, and seamlessly fall back to mesh communication when infrastructure fails. All code released under AGPL v3.

## FIELD: Describe the ecosystem this project belongs to

EMBER sits at the intersection of several ecosystems:

Emergency Communication: Meshtastic (open source LoRa mesh), Briar (delay-tolerant P2P messaging), Disaster.Radio (community mesh networks). EMBER complements these by providing the application layer for community coordination that these mesh protocols lack.

Offline-First Software: WatermelonDB, CRDTs, local-first software movement (Ink & Switch research). EMBER applies these principles specifically to emergency resilience.

Privacy-Preserving Communication: Signal Protocol, NaCl/libsodium cryptography, zero-knowledge architectures. EMBER brings zero-knowledge principles to community emergency data.

Community Resilience: Mutual Aid networks, Community Emergency Response Teams (CERT), neighborhood preparedness programs. EMBER digitizes and encrypts the coordination these groups do on paper.

Open Hardware: Meshtastic-compatible LoRa devices (LILYGO T-Beam, Heltec, RAK WisBlock), solar charging systems. EMBER's Tier 2 node kits and Tier 3 communicators build on this ecosystem.

## FIELD: What is the existing state of the project?

EMBER is in active development with a functional MVP:
- Complete React Native project structure with Expo SDK 52 and Expo Router
- WatermelonDB schema and models for 8 data tables (communities, members, resources, check-ins, drills, emergency plans, messages, achievements)
- Zero-knowledge encryption module (NaCl secretbox with PBKDF2 key derivation)
- Custom CRDT sync engine (GCounter, PNCounter, LWWRegister, HLC)
- Peer sync manager with Meshtastic payload optimization (237-byte limit)
- Three-mode theme system (Peacetime, Crisis, Recovery)
- 12 reusable React Native UI components
- 13 Expo Router screens (splash, onboarding, dashboard, community, resources, drills, plans, settings)
- Interactive browser demo for testing and review
- Full technical architecture documentation
- CI/CD pipeline via GitHub Actions and EAS Build
- Repository: https://github.com/nessakodo/ember

The core architecture is complete. Grant funding will take this from MVP to production-ready, security-audited release.

## FIELD: Are there significant obstacles or dependencies you foresee?

1. Apple Developer Program approval is pending for iOS App Store distribution. Android distribution via Google Play and F-Droid has no blockers.

2. Security audit of the encryption pipeline should be conducted by an independent party before production release. We have budgeted for this in the grant.

3. Meshtastic BLE integration requires testing across multiple hardware variants (T-Beam, T-Deck, Heltec, RAK). We plan to acquire test hardware with grant funds.

4. CRDT sync across mesh networks with high latency and packet loss requires careful testing. Our current implementation handles this theoretically but needs field testing with real mesh hardware.

5. Community adoption requires partnerships with existing mutual aid networks and CERT teams. We have identified initial partner communities for pilot deployment.

No fundamental technical obstacles exist. The core cryptographic primitives (NaCl, PBKDF2) are well-established. The mesh protocol (Meshtastic) is mature and actively maintained. The primary work is integration, hardening, and user experience refinement.

## FIELD: Thematic topic (select from list)

Privacy and Trust enhancing technologies
Decentralised software infrastructures
Middleware and platform technologies (data and calculation)

---

## Contact Information

- **Name**: Vanessa Madison
- **Email**: thatcosmicbutterfly@gmail.com
- **Organization**: ILLAPEX LLC / Lirio Labs
- **Country**: United States
