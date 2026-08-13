# Hermes Connect Next — Changelog

All notable changes to the Hermes Connect Next repository are documented in this file.

---

## [1.0.0] - 2026-08-12

### Added
- **Phase 0 Ingestion**: Created `docs/EXISTING_HERMES_MAP.md` mapping existing Hermes ecosystem, domain boundaries, APIs, and maturity levels.
- **Product Specifications**: Created `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `USER_FLOWS.md`, `SECURITY_MODEL.md`, `AI_ARCHITECTURE.md`, and `DECISIONS.md`.
- **Modular Operating Platform Core**: Implemented universal types (`src/core/types.ts`) and state management (`src/core/store.ts`).
- **Trainer Vertical & Synthetic Demo Data**: Implemented trainer types (`src/verticals/trainer/types.ts`) and rich seed dataset (`src/verticals/trainer/demoData.ts`) featuring coach `Alex Morgan` and multi-stage clients (`Marcus Vance`, `Elena Rostova`, `David Chen`).
- **Multi-Agent AI & Science Engine**: Implemented `src/ai/router.ts`, Trainer Copilot, Client Assistant, Science Research Agent with evidence confidence tagging, and Safety Guardrails.
- **Responsive UI Shell**: Implemented `src/ui/styles.css`, Trainer Command Center ("Who needs my attention today?"), Client Dashboard ("What do I do today?"), Workout Builder, and AI Drawer.
- **Testing & Handoff Package**: Added automated test suite (`tests/run-all.mjs`), `TEST_REPORT.md`, `INTEGRATION_PLAN.md`, `KNOWN_LIMITATIONS.md`, and `REVIEW_GUIDE.md`.
