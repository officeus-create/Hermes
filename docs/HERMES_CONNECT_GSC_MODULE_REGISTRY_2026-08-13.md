# Hermes Connect — GSC demand → canonical owner → module registry

Status: Wave 1 production registry  
Evidence source: authenticated owner-supplied Google Search Console export tracked under #206 / #461–#465  
Production verification: Wave 1 smoke run `31668926104`

## Operating rule

Public Hermes pages own indexable search intent. Hermes Connect tools are interactive `noindex,nofollow` workflows. A search signal never justifies a duplicate indexable app page, a doorway-page batch, a fabricated live-data claim, or an automatic publication decision.

| Demand / operating cluster | Public canonical owner | Hermes Connect workflow | Production state | Commercial next action | Measurement owner |
|---|---|---|---|---|---|
| Car-hauler / auto-transport load-board demand | `https://hermeslogisticsus.com/load-board/` | `https://connect.hermeslogisticsus.com/load-analyzer/` | `PRODUCTION_VERIFIED` | Analyze entered load economics, then use the approved carrier/customer handoff appropriate to the situation | #206 / #464 |
| Load economics / RPM / deadhead / route-quality decision | Existing Logistics resource + Load Board discovery paths; no new duplicate SEO owner | `https://connect.hermeslogisticsus.com/load-analyzer/` | `PRODUCTION_VERIFIED` | Complete analysis with assumptions visible; no live-load, market-rate, or profit guarantee | #206 / #380 / #29 |
| Multi-car transport demand | `https://hermeslogisticsus.com/logistics/multi-car-transport/` | `https://connect.hermeslogisticsus.com/multi-car-planner/` | `PRODUCTION_VERIFIED` | Prepare movement/readiness facts and hand off to the existing vehicle-transport intake | #206 / #461 / #473 |
| Logistics / trucking SEO demand | `https://hermeslogisticsus.com/services/seo-for-logistics-companies/` | `https://connect.hermeslogisticsus.com/logistics-seo-analyzer/` | `PRODUCTION_VERIFIED` | Produce a guided evidence-based P0/P1/P2/MEASURE/HOLD roadmap, then hand off to Marketing/IT qualification | #206 / #462 |
| Search query/page opportunity triage | Existing indexed owner determined row-by-row; no universal new landing page | `https://connect.hermeslogisticsus.com/search-opportunity-radar/` | `PRODUCTION_VERIFIED` | Classify owner/CTR/position/mismatch/content-gap evidence and route the decision back to the correct indexed owner | #206 / #461–#465 |
| Search → delivered inquiry → qualification → opportunity → revenue evidence | Indexed acquisition owners remain separate; this is an operating/measurement workflow | `https://connect.hermeslogisticsus.com/revenue-dashboard/` | `PRODUCTION_VERIFIED` | Keep missing stages `DATA_PENDING`; import only aggregate evidence with the allowed evidence class | #206 / #366 |

## Wave 1 boundaries

- No Connect tool is an indexable SEO substitute for its public canonical owner.
- No module creates a booking, carrier assignment, guaranteed rate, guaranteed ranking, guaranteed lead, or guaranteed revenue.
- Load/route inputs stay local unless the user explicitly enters an approved downstream intake.
- Search Opportunity Radar accepts sanitized aggregate search evidence only; it does not connect accounts or auto-publish pages.
- Revenue Dashboard accepts aggregate evidence only; raw private lead/customer/carrier rows do not belong in the public repository or public analytics.
- Vehicle Transport Rate / Quote Calculator remains deferred until a trustworthy methodology/data source can support an estimate without presenting fabricated market pricing.
- Programmatic city/state/equipment/lane scale remains gated by #206 qualified-action evidence and unique utility.

## Wave 1 acceptance map

- Module registry maps current GSC clusters to modules + canonical owners: **complete — this registry**.
- Load Board search-owner + app workflow boundary: **complete**.
- Load Analyzer MVP: **complete / production verified**.
- Logistics SEO Analyzer MVP: **complete / production verified**.
- Search Opportunity Radar: **complete / production verified**.
- SEO → Lead → Revenue evidence contract: **complete / production verified as a tool; real operating data remains evidence-gated under #206**.
- No duplicate indexable app surfaces: **complete — Connect routes remain `noindex,nofollow`**.
- Each live module has a measurable commercial next action: **complete at repository/product-contract level; authenticated GA4 receipt remains a separate #206 platform-verification step**.

## Next phase

Wave 2 is intentionally a separate product backlog: dealer portal, shipper/dealer finder + CRM, negotiation assistant, carrier readiness, lane/backhaul tools, onboarding wizard, permissioned case-study workflows, entity consistency, reputation center, and Academy simulator. Wave 2 should be prioritized by measured usage, qualified handoffs, operating pain, and revenue evidence rather than by feature count.
