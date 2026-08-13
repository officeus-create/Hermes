# Decision Log

Use this file only for decisions that have been explicitly approved by the authorized human owner or delegated lead.

| Decision ID | Date | Area | Decision | Status | Owner | Related proposals | KPI / validation |
|---|---|---|---|---|---|---|---|
| DEC-001 | 2026-08-06 | AI collaboration | Establish a shared GitHub-based AI collaboration and decision system for Hermes. | Approved | Vladimir / Hermes | System protocol and templates | Other AI assistants can onboard, identify themselves, review context and submit traceable proposals without overwriting prior work. |
| DEC-002 | 2026-08-06 | Hermes Connect product | Develop Hermes Connect iteratively: release small functions that solve concrete questions, observe use and failures, then expand the app, web version, site integration and promotion as one product system. | Approved | Vladimir / Hermes | Hermes Connect current state | Each release has a defined user problem, test, failure signal, next improvement and preserved product context. |
| DEC-003 | 2026-08-06 | Carrier sales and contracts | Use one short carrier sales path that leads from value and control boundaries to plans, agreement review, onboarding, signature and PDF retention; keep final legal execution blocked until the approved master and production gates are complete. | Implemented / legal activation pending | Vladimir / Hermes | PRs #284, #285, #287, #289; Issue #280 | Mobile flow and contract-engine tests remain green; live execution is not claimed before approval and synthetic verification. |
| DEC-004 | 2026-08-12 | Hermes Connect brand | Lock Hermes Connect Brand System V1 as the current base direction: AI Operating System for Business; Pearl + Anthracite/Obsidian environments; compact interconnected loop/intelligent-knot logo direction; elegant digital flow waves; restrained tactile 3D hero object; unified Hermes Intelligence; adaptive onboarding; controlled industry-specific editorial art direction. Future work should refine or extend this system rather than restart it without explicit approval. | Approved | Vladimir / Hermes | `01_DESIGN/hermes-connect/APPROVED_BRAND_SYSTEM_V1.md`; approved visual concept; Antigravity V2 as pending experiment | Brand remains recognizable across website, app, social, favicon and presentation; accessibility and small-size tests pass; new contributors preserve the approved identity unless a rebrand is explicitly approved. |
| DEC-005 | 2026-08-12 | Hermes Connect product / UX | Use a web-first productization sequence for the new Hermes Connect experience: first build and visually test the desktop/web version against Brand System V1; next derive and validate the mobile-web experience from the approved web system; only after those interaction and visual decisions are stable begin native phone-app implementation and iterative product improvement. | Approved / implementation started | Vladimir / Hermes | `/public/demos/hermes-connect-brand-v1/`; Brand System V1 | Web lab is visually reviewable and interactive; approved patterns survive responsive/mobile validation; native app work starts from validated components and workflows instead of redesigning from scratch. |

## Decision record template

### DEC-XXX — Title

- **Date:**
- **Owner:**
- **Area:**
- **Status:** Approved / Rejected / Deferred / Superseded / Deprecated / Implemented
- **Related proposal IDs:**
- **Decision:**
- **Why:**
- **Alternatives considered:**
- **Risks accepted:**
- **Implementation owner:**
- **Deadline:**
- **Validation KPI:**
- **Result:**
- **Supersedes / superseded by:**