# NLnet NGI Zero Commons Fund — EMBER Submission
## Copy/paste guide matching the exact form at nlnet.nl/propose

**Deadline: April 1, 2026, 12:00 CEST (noon) = 4:00 AM MDT**

---

### Please select a call
> **NGI Zero Commons Fund**

---

### Contact information

- **Your name**: Vanessa Madison
- **Email address**: thatcosmicbutterfly@gmail.com
- **Phone number**: [your phone]
- **Organisation**: ILLAPEX LLC / Lirio Labs
- **Country**: United States

---

### Proposal name
> EMBER — Encrypted Mesh Based Emergency Response

### Website / wiki
> https://github.com/vanessamadison/ember

---

### Abstract: Can you explain the whole project and its expected outcome(s).

EMBER is a zero-knowledge encrypted, offline-first mobile application that enables communities to coordinate emergency preparedness and response without relying on centralized internet infrastructure. When disasters strike, every mainstream emergency tool (FEMA apps, Citizen, Nextdoor) fails because they depend on cloud servers. EMBER stores all community data in an on-device encrypted database (WatermelonDB on SQLite) using NaCl secretbox encryption (XSalsa20-Poly1305) with keys derived from community passphrases via PBKDF2. No server ever sees plaintext data.

In peacetime, communities use EMBER to track supplies, assign roles, store emergency plans, run preparedness drills, and build readiness through gamification. When connectivity fails, EMBER switches to mesh communication via LoRa radio (Meshtastic protocol), enabling encrypted peer-to-peer messaging across 1-5km with multi-hop relay. A custom CRDT sync engine (GCounter, PNCounter, LWW registers with hybrid logical clocks) resolves conflicts across disconnected peers without central authority.

The expected outcome is a production-ready, security-audited mobile application (iOS, Android, F-Droid) that any community in the world can download for free, create an encrypted local resilience network, and seamlessly fall back to mesh communication when infrastructure fails. All code is released under AGPL v3.

---

### Have you been involved with projects or organisations relevant to this project before? And if so, can you tell us a bit about your contributions?

Yes. EMBER is developed through ILLAPEX LLC (illapex.com), a security-focused technology company, and Lirio Labs (liriolabs.com), a software and AI workflow studio, both founded by the project lead. Vanessa Madison is a security engineer and creative technologist with hands-on experience in cryptographic systems, network security architecture, and community-centered technology design. This project grows directly from witnessing communication failures during natural disasters and understanding the security requirements for protecting vulnerable community data during crises.

---

### Requested Amount (in Euro)
> 50000

### Explain what the requested budget will be used for? Does the project have other funding sources, both past and present?

Budget breakdown (€50,000 total):

Development — €28,000
- Production hardening of React Native app (€12,000, ~300 hrs at €40/hr)
- Meshtastic BLE bridge integration and mesh sync (€8,000, ~200 hrs)
- Security audit preparation and remediation (€4,000, ~100 hrs)
- App store submission, CI/CD, testing infrastructure (€4,000, ~100 hrs)

Security audit — €10,000
- Independent third-party audit of encryption pipeline, key management, and CRDT sync
- Penetration testing of mesh communication layer

Hardware and testing — €4,000
- LoRa test hardware (T-Beam, T-Deck, Heltec, RAK variants)
- Multi-device mesh network testing rigs
- Solar charging components for field testing

Community pilot — €5,000
- Partner community onboarding and documentation
- Field testing with 3-5 pilot communities
- Localization for initial target languages

Documentation and outreach — €3,000
- Technical documentation, deployment guides, mesh setup guides
- Community governance framework documentation
- Conference presentations and ecosystem engagement

No other funding sources at present. This is the initial grant application. A parallel concept note has been submitted to the Open Technology Fund Internet Freedom Fund.

---

### Compare your own project with existing or historical efforts.

Meshtastic: Open source LoRa mesh protocol. Provides raw mesh communication but no application-level community coordination, no encrypted database, no resource tracking, and requires technical expertise to operate. EMBER uses Meshtastic as its mesh transport layer and builds the accessible community coordination app on top.

Briar: Delay-tolerant P2P encrypted messenger. Limited to direct Bluetooth/WiFi proximity (10-50m range). No multi-hop mesh relay across kilometers, no community coordination features, no resource tracking, no offline database. EMBER extends the communication range to kilometers via LoRa and adds full community resilience features.

Signal: Excellent encrypted messaging but completely dependent on internet infrastructure. No offline capability, no mesh fallback, no community coordination tools. Useless when cell towers and internet fail.

Disaster.Radio: Community mesh network for text communication. No encryption, no community coordination, limited recent development activity.

FEMA App / Citizen / Nextdoor: Centralized, internet-dependent, no end-to-end encryption, user data harvested by third parties. All fail precisely when communities need them most.

EMBER is unique in combining zero-knowledge encryption + offline-first database + LoRa mesh networking + community coordination + preparedness gamification in a single open source mobile application.

---

### What are significant technical challenges you expect to solve during the project, if any?

1. BLE-to-Meshtastic bridge reliability: Maintaining stable BLE connections between the React Native app and Meshtastic LoRa hardware across diverse Android/iOS devices and firmware versions. We have designed a connection manager with automatic reconnection and message queueing, but real-world testing across hardware variants is needed.

2. CRDT sync over lossy mesh networks: Our CRDT engine handles conflict resolution mathematically, but mesh networks introduce high latency, packet loss, and 237-byte payload limits. We have implemented delta compression and message prioritization, but field testing with real mesh topologies will be critical.

3. Key management UX: Making zero-knowledge encryption accessible to non-technical users. Community passphrases must be strong enough for security but memorable enough for practical use. Key rotation during community membership changes needs to be seamless.

4. Power optimization in crisis mode: During emergencies, device battery is critical. The app must minimize BLE scanning, radio transmissions, and screen wake while maintaining communication responsiveness.

5. Cross-platform encryption consistency: Ensuring identical encryption output across iOS and Android with different native crypto implementations under expo-crypto.

---

### Describe the ecosystem of the project, and how you will engage with relevant actors and promote the outcomes?

EMBER sits at the intersection of four active ecosystems:

Open source mesh networking: Meshtastic community (200K+ devices deployed), Disaster.Radio, LoRa Alliance. We will contribute upstream improvements to Meshtastic BLE libraries and publish our mesh application protocol as an open specification.

Local-first / offline-first software: Ink & Switch research community, WatermelonDB, CRDT ecosystem (Automerge, Yjs). We will publish our domain-specific CRDT implementations and sync protocol documentation.

Privacy-preserving technology: NaCl/libsodium ecosystem, Signal Protocol community, NGI Zero privacy projects. We will engage with the NGI Zero community for security review and publish our zero-knowledge architecture as a reusable pattern.

Community resilience: Community Emergency Response Teams (CERT), mutual aid networks, preparedness organizations. We have identified initial partner communities for pilot deployment and will create deployment toolkits for community organizers.

Promotion: Conference presentations (FOSDEM, CCC, Meshtastic community events), blog posts documenting architecture decisions, GitHub Discussions for community input, and partnership with existing mutual aid networks for real-world adoption.

---

### GenAI Disclosure
> Claude (Anthropic, Opus 4.6) was used as a development assistant for code generation, documentation, and proposal drafting. All architectural decisions, security design, and project direction are human-led. AI-assisted git commits are tagged with Co-Authored-By. Full prompt provenance log: docs/GENAI-PROMPT-LOG.md in the repository.

### Attachments
> Upload: EMBER-Technical-Overview.pdf and GENAI-PROMPT-LOG.md
