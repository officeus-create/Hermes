# Hermes Connect Next — Known Limitations

**Version**: 1.0.0  
**Status**: OFFICIAL LIMITATIONS DECLARATION

---

## 1. Preserved Maturity Tiers
In strict accordance with Hermes Connect principles, this release distinguishes between live capabilities and future extensions:

- **Live / Prototype Demo State**: Full single-page web app execution, Trainer Command Center, Client Experience, Program Builder, AI Router, Trainer Copilot, Science Research Agent, and local state persistence.
- **Mocked / Development Adapters**: Live Cloudflare Worker production database connections, real-time push notification servers, external Stripe payment gateways, and wearable Bluetooth sync are currently mocked or run against local emulator abstractions.
- **Evidence-Required Boundary**: Commercial revenue figures displayed in demo mode are synthetic and clearly labeled as demo data.

---

## 2. Technical Limitations & Scope Exclusions
1. **No Load Board**: Freight load board, car-hauling dispatch, DAT load matching, and carrier marketplaces are explicitly excluded.
2. **Web-First Browser Boundary**: The application is optimized for desktop, tablet, and mobile browsers (Safari, Chrome, Firefox). Native App Store binaries (.ipa / .apk) are excluded per handoff specs.
3. **AI Vendor Sandbox**: When external API credentials (e.g. Gemini / OpenAI keys) are omitted, the AI Router automatically falls back to deterministic local mock engines to guarantee 100% test reliability.
