# Prototype Adapter Audit Report (PROTOTYPE_ADAPTER_AUDIT.md)

**Audit Date**: 2026-08-13  
**Target Repo**: `Hermes` / `hermes-connect-next`  
**Purpose**: Honest status classification of all prototype adapters built during brand exploration in `feature/brand-exploration-v2`.

---

## 📊 Summary of Adapter Classifications

| Adapter File | Assigned Status | Rationale & Real Capabilities |
|:---|:---|:---|
| `calcomAdapter.ts` | `prototype_stub` | Uses mock keys and returns hardcoded slot arrays; no live Cal.com API connection. |
| `warpAdapter.ts` | `prototype_stub` | Synthetically determines carrier SAFER status; does not execute real FMCSA requests. |
| `agentSwarmAdapter.ts` | `pure_local_logic` | Client-side simulation of agent step state transitions; no live LangGraph / CrewAI runner. |
| `atlasMcpAdapter.ts` | `prototype_stub` | Simulates ATLAS MCP tool declarations and responses in memory; no live MCP transport connection. |
| `fleetbaseAdapter.ts` | `prototype_stub` | Returns hardcoded vehicles and orders; no live Fleetbase instance connection. |
| `salonBotAdapter.ts` | `pure_local_logic` | Mock locking function without active PostgreSQL advisory lock connection or live Telegram Bot API token. |
| `mafOrchestratorAdapter.ts` | `pure_local_logic` | Client-side state object generator for Microsoft Agent Framework graph workflow simulation. |
| `voiceAiAdapter.ts` | `prototype_stub` | Returns simulated 180ms latency and 88% trust score; no active WebRTC / WebSocket connection to Pipecat/Bolna. |
| `storefrontAdapter.ts` | `pure_local_logic` | Generates local catalog JSON objects for white-label storefront preview. |
| `dmsWmsAdapter.ts` | `pure_local_logic` | Returns simulated vehicle VINs and warehouse bin locations from local memory. |
| `multiCarrierShippingAdapter.ts` | `pure_local_logic` | Client-side rate comparison logic between USPS/FedEx/UPS without live shipping API keys. |
| `epodDriverAdapter.ts` | `pure_local_logic` | Returns mock ePOD JSON records with sign-on-glass Base64 placeholders. |
| `freightIngestionRadiusAdapter.ts` | `pure_local_logic` | Regex-based local string parser and Haversine distance calculator; no live IMAP/SMS gateway listeners. |

---

## 🔒 Verification & Compliance Directives
1. **UI Status Labels**: All UI components importing these adapters MUST display `Demo`, `Simulated`, or `Connector not configured` instead of `Live`, `Active`, or `Connected`.
2. **Backend Requirement**: Any transition from `prototype_stub` / `pure_local_logic` to `real_connector_candidate` requires server-side authentication secrets, permissions, idempotency, privacy boundaries, error handling, and end-to-end integration tests.
