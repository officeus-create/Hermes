# Release Manifest — Phase 1

Snapshot generated: 2026-08-03T19:18:24Z

## Decision summary

- Current main: 2a1004b92e5aeb5bd01317174d8d6e497b31e7cb.
- Current build: **104 HTML routes**, **95 indexable routes**, **7 sitemap files**.
- Production snapshot: **AVAILABLE**, 95 discovered route(s).
- Production comparison: 95 present, 9 absent current-build routes; all absent routes are noindex or 404 workspaces.
- Immutable release snapshot: **AVAILABLE**, 46 discovered route(s).
- Immutable comparison: 46 present, 58 absent current-build routes.
- PR #83 is a stale historical route-estimate reference and is not a current-main release candidate.
- PR #85 contains no public page route in its changed-file set.
- PR #86 is merged and its discovery/sitemap changes are already represented in current main.
- Phase 2 (Casablanca) is intentionally not included in this branch.

## Source inventory

| Source | State | Routes | Notes |
|---|---|---:|---|
| current_main | complete_build_inventory | 104 | Generated from current build output and committed sitemap files. |
| pr_83 | open_draft_stale | 1 | Changes the existing /load-board/ route and adds a non-public API endpoint. It is a historical reference, not a current-main release candidate. |
| pr_85 | open_draft_stale | 0 | Its changed-file set contains no public src/pages route, so no public URL is credited to this PR. |
| merged_pr_86 | merged_into_current_main | 5 | Discovery and sitemap changes are already represented in current main and are not pending release work. |
| production | AVAILABLE | 95 | Read-only snapshot completed. |
| immutable_release | AVAILABLE | 46 | Read-only snapshot completed. |

## Current-main sitemap ownership

| Sitemap | URL count |
|---|---:|
| sitemap-academy.xml | 5 |
| sitemap-cases.xml | 2 |
| sitemap-digital-services.xml | 9 |
| sitemap-local.xml | 16 |
| sitemap-services.xml | 13 |
| sitemap-trust.xml | 4 |
| sitemap.xml | 46 |

## Route reconciliation

| Route | Source | Indexability | Canonical | Sitemap owner | Status | Blocker / next action |
|---|---|---|---|---|---|---|
| / current_main indexable https://hermeslogisticsus.com/ public/sitemap.xml COMPLETE — |
| / immutable_release indexable https://hermeslogisticsus.com/ /sitemap.xml COMPLETE — |
| / merged_pr_86 indexable https://hermeslogisticsus.com/ public/sitemap.xml COMPLETE — |
| / production indexable https://hermeslogisticsus.com/ /sitemap.xml COMPLETE — |
| /404.html current_main noindex https://hermeslogisticsus.com/404/  COMPLETE — |
| /about/ current_main indexable https://hermeslogisticsus.com/about/ public/sitemap-trust.xml COMPLETE — |
| /about/ production indexable https://hermeslogisticsus.com/about/ /sitemap-trust.xml COMPLETE — |
| /academy/apply/ current_main indexable https://hermeslogisticsus.com/academy/apply/ public/sitemap-academy.xml COMPLETE — |
| /academy/apply/ production indexable https://hermeslogisticsus.com/academy/apply/ /sitemap-academy.xml COMPLETE — |
| /academy/how-training-works/ current_main indexable https://hermeslogisticsus.com/academy/how-training-works/ public/sitemap-academy.xml COMPLETE — |
| /academy/how-training-works/ production indexable https://hermeslogisticsus.com/academy/how-training-works/ /sitemap-academy.xml COMPLETE — |
| /academy/marketing/ current_main indexable https://hermeslogisticsus.com/academy/marketing/ public/sitemap-academy.xml COMPLETE — |
| /academy/marketing/ production indexable https://hermeslogisticsus.com/academy/marketing/ /sitemap-academy.xml COMPLETE — |
| /academy/resources/ current_main indexable https://hermeslogisticsus.com/academy/resources/ public/sitemap-academy.xml COMPLETE — |
| /academy/resources/ production indexable https://hermeslogisticsus.com/academy/resources/ /sitemap-academy.xml COMPLETE — |
| /academy/us-logistics-operations/ current_main indexable https://hermeslogisticsus.com/academy/us-logistics-operations/ public/sitemap-academy.xml COMPLETE — |
| /academy/us-logistics-operations/ production indexable https://hermeslogisticsus.com/academy/us-logistics-operations/ /sitemap-academy.xml COMPLETE — |
| /accessibility/ current_main indexable https://hermeslogisticsus.com/accessibility/ public/sitemap-trust.xml COMPLETE — |
| /accessibility/ production indexable https://hermeslogisticsus.com/accessibility/ /sitemap-trust.xml COMPLETE — |
| /case/ current_main indexable https://hermeslogisticsus.com/case/ public/sitemap-cases.xml COMPLETE — |
| /case/ production indexable https://hermeslogisticsus.com/case/ /sitemap-cases.xml COMPLETE — |
| /case/appleton-vehicle-transport-seo/ current_main indexable https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/ public/sitemap-cases.xml COMPLETE — |
| /case/appleton-vehicle-transport-seo/ production indexable https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/ /sitemap-cases.xml COMPLETE — |
| /case/it-development/ current_main indexable https://hermeslogisticsus.com/case/it-development/ public/sitemap.xml COMPLETE — |
| /case/it-development/ immutable_release indexable https://hermeslogisticsus.com/case/it-development/ /sitemap.xml COMPLETE — |
| /case/it-development/ production indexable https://hermeslogisticsus.com/case/it-development/ /sitemap.xml COMPLETE — |
| /contacts/ current_main indexable https://hermeslogisticsus.com/contacts/ public/sitemap.xml COMPLETE — |
| /contacts/ immutable_release indexable https://hermeslogisticsus.com/contacts/ /sitemap.xml COMPLETE — |
| /contacts/ production indexable https://hermeslogisticsus.com/contacts/ /sitemap.xml COMPLETE — |
| /demos/ai-visibility-scorecard/ current_main noindex https://hermeslogisticsus.com/demos/ai-visibility-scorecard/  COMPLETE — |
| /demos/content-pipeline/ current_main noindex https://hermeslogisticsus.com/demos/content-pipeline/  COMPLETE — |
| /demos/content-pipeline/insight-preview/ current_main noindex https://hermeslogisticsus.com/demos/content-pipeline/insight-preview/  COMPLETE — |
| /demos/crm-validation/ current_main noindex https://hermeslogisticsus.com/demos/crm-validation/  COMPLETE — |
| /demos/hermes-connect/ current_main noindex https://hermeslogisticsus.com/demos/hermes-connect/  COMPLETE — |
| /demos/lane-intelligence/ current_main noindex https://hermeslogisticsus.com/demos/lane-intelligence/  COMPLETE — |
| /demos/social-distribution/ current_main noindex https://hermeslogisticsus.com/demos/social-distribution/  COMPLETE — |
| /demos/website-audit/ current_main noindex https://hermeslogisticsus.com/demos/website-audit/  COMPLETE — |
| /editorial-policy/ current_main indexable https://hermeslogisticsus.com/editorial-policy/ public/sitemap-trust.xml COMPLETE — |
| /editorial-policy/ production indexable https://hermeslogisticsus.com/editorial-policy/ /sitemap-trust.xml COMPLETE — |
| /es/ current_main indexable https://hermeslogisticsus.com/es/ public/sitemap.xml COMPLETE — |
| /es/ immutable_release indexable https://hermeslogisticsus.com/es/ /sitemap.xml COMPLETE — |
| /es/ production indexable https://hermeslogisticsus.com/es/ /sitemap.xml COMPLETE — |
| /fr/ current_main indexable https://hermeslogisticsus.com/fr/ public/sitemap.xml COMPLETE — |
| /fr/ immutable_release indexable https://hermeslogisticsus.com/fr/ /sitemap.xml COMPLETE — |
| /fr/ production indexable https://hermeslogisticsus.com/fr/ /sitemap.xml COMPLETE — |
| /it/ current_main indexable https://hermeslogisticsus.com/it/ public/sitemap.xml COMPLETE — |
| /it/ immutable_release indexable https://hermeslogisticsus.com/it/ /sitemap.xml COMPLETE — |
| /it/ production indexable https://hermeslogisticsus.com/it/ /sitemap.xml COMPLETE — |
| /load-board/ current_main indexable https://hermeslogisticsus.com/load-board/ public/sitemap.xml COMPLETE — |
| /load-board/ immutable_release indexable https://hermeslogisticsus.com/load-board/ /sitemap.xml COMPLETE — |
| /load-board/ pr_83 indexable https://hermeslogisticsus.com/load-board/ public/sitemap.xml STALE PR #83 changes an existing route from a stale, non-mergeable branch and must be rebuilt from current main if prioritized. |
| /load-board/ production indexable https://hermeslogisticsus.com/load-board/ /sitemap.xml COMPLETE — |
| /logistics/agency/ current_main indexable https://hermeslogisticsus.com/logistics/agency/ public/sitemap.xml COMPLETE — |
| /logistics/agency/ immutable_release indexable https://hermeslogisticsus.com/logistics/agency/ /sitemap.xml COMPLETE — |
| /logistics/agency/ production indexable https://hermeslogisticsus.com/logistics/agency/ /sitemap.xml COMPLETE — |
| /logistics/appleton-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/ public/sitemap.xml COMPLETE — |
| /logistics/appleton-wi-vehicle-transport/ immutable_release indexable https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/ /sitemap.xml COMPLETE — |
| /logistics/appleton-wi-vehicle-transport/ merged_pr_86 indexable https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/ public/sitemap.xml COMPLETE — |
| /logistics/appleton-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/appleton-wi-vehicle-transport/ /sitemap.xml COMPLETE — |
| /logistics/apply/ current_main indexable https://hermeslogisticsus.com/logistics/apply/ public/sitemap.xml COMPLETE — |
| /logistics/apply/ immutable_release indexable https://hermeslogisticsus.com/logistics/apply/ /sitemap.xml COMPLETE — |
| /logistics/apply/ production indexable https://hermeslogisticsus.com/logistics/apply/ /sitemap.xml COMPLETE — |
| /logistics/auction-vehicle-pickup/ current_main indexable https://hermeslogisticsus.com/logistics/auction-vehicle-pickup/ public/sitemap-services.xml COMPLETE — |
| /logistics/auction-vehicle-pickup/ production indexable https://hermeslogisticsus.com/logistics/auction-vehicle-pickup/ /sitemap-services.xml COMPLETE — |
| /logistics/broker/ current_main indexable https://hermeslogisticsus.com/logistics/broker/ public/sitemap.xml COMPLETE — |
| /logistics/broker/ immutable_release indexable https://hermeslogisticsus.com/logistics/broker/ /sitemap.xml COMPLETE — |
| /logistics/broker/ production indexable https://hermeslogisticsus.com/logistics/broker/ /sitemap.xml COMPLETE — |
| /logistics/car-hauling-dispatch/ current_main indexable https://hermeslogisticsus.com/logistics/car-hauling-dispatch/ public/sitemap-services.xml COMPLETE — |
| /logistics/car-hauling-dispatch/ production indexable https://hermeslogisticsus.com/logistics/car-hauling-dispatch/ /sitemap-services.xml COMPLETE — |
| /logistics/careers/ current_main indexable https://hermeslogisticsus.com/logistics/careers/ public/sitemap.xml COMPLETE — |
| /logistics/careers/ immutable_release indexable https://hermeslogisticsus.com/logistics/careers/ /sitemap.xml COMPLETE — |
| /logistics/careers/ production indexable https://hermeslogisticsus.com/logistics/careers/ /sitemap.xml COMPLETE — |
| /logistics/carrier/ current_main indexable https://hermeslogisticsus.com/logistics/carrier/ public/sitemap.xml COMPLETE — |
| /logistics/carrier/ immutable_release indexable https://hermeslogisticsus.com/logistics/carrier/ /sitemap.xml COMPLETE — |
| /logistics/carrier/ production indexable https://hermeslogisticsus.com/logistics/carrier/ /sitemap.xml COMPLETE — |
| /logistics/dealer-vehicle-transportation/ current_main indexable https://hermeslogisticsus.com/logistics/dealer-vehicle-transportation/ public/sitemap-services.xml COMPLETE — |
| /logistics/dealer-vehicle-transportation/ production indexable https://hermeslogisticsus.com/logistics/dealer-vehicle-transportation/ /sitemap-services.xml COMPLETE — |
| /logistics/eau-claire-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/eau-claire-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/eau-claire-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/eau-claire-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/enclosed-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/enclosed-vehicle-transport/ public/sitemap-services.xml COMPLETE — |
| /logistics/enclosed-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/enclosed-vehicle-transport/ /sitemap-services.xml COMPLETE — |
| /logistics/fleet-owner-dispatch-support/ current_main indexable https://hermeslogisticsus.com/logistics/fleet-owner-dispatch-support/ public/sitemap-services.xml COMPLETE — |
| /logistics/fleet-owner-dispatch-support/ production indexable https://hermeslogisticsus.com/logistics/fleet-owner-dispatch-support/ /sitemap-services.xml COMPLETE — |
| /logistics/fond-du-lac-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/fond-du-lac-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/fond-du-lac-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/fond-du-lac-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/green-bay-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/green-bay-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/green-bay-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/green-bay-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/inoperable-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/inoperable-vehicle-transport/ public/sitemap-services.xml COMPLETE — |
| /logistics/inoperable-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/inoperable-vehicle-transport/ /sitemap-services.xml COMPLETE — |
| /logistics/kenosha-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/kenosha-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/kenosha-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/kenosha-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/la-crosse-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/la-crosse-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/la-crosse-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/la-crosse-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/madison-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/madison-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/madison-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/madison-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/milwaukee-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/milwaukee-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/milwaukee-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/milwaukee-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/multi-car-transport/ current_main indexable https://hermeslogisticsus.com/logistics/multi-car-transport/ public/sitemap-services.xml COMPLETE — |
| /logistics/multi-car-transport/ production indexable https://hermeslogisticsus.com/logistics/multi-car-transport/ /sitemap-services.xml COMPLETE — |
| /logistics/new-authority-car-hauler-support/ current_main indexable https://hermeslogisticsus.com/logistics/new-authority-car-hauler-support/ public/sitemap-services.xml COMPLETE — |
| /logistics/new-authority-car-hauler-support/ production indexable https://hermeslogisticsus.com/logistics/new-authority-car-hauler-support/ /sitemap-services.xml COMPLETE — |
| /logistics/open-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/open-vehicle-transport/ public/sitemap-services.xml COMPLETE — |
| /logistics/open-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/open-vehicle-transport/ /sitemap-services.xml COMPLETE — |
| /logistics/oshkosh-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/oshkosh-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/oshkosh-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/oshkosh-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/owner-operator-dispatch-support/ current_main indexable https://hermeslogisticsus.com/logistics/owner-operator-dispatch-support/ public/sitemap-services.xml COMPLETE — |
| /logistics/owner-operator-dispatch-support/ production indexable https://hermeslogisticsus.com/logistics/owner-operator-dispatch-support/ /sitemap-services.xml COMPLETE — |
| /logistics/racine-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/racine-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/racine-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/racine-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/resources/auction-vehicle-pickup-checklist/ current_main indexable https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/ public/sitemap.xml COMPLETE — |
| /logistics/resources/auction-vehicle-pickup-checklist/ immutable_release indexable https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/ /sitemap.xml COMPLETE — |
| /logistics/resources/auction-vehicle-pickup-checklist/ merged_pr_86 indexable https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/ public/sitemap.xml COMPLETE — |
| /logistics/resources/auction-vehicle-pickup-checklist/ production indexable https://hermeslogisticsus.com/logistics/resources/auction-vehicle-pickup-checklist/ /sitemap.xml COMPLETE — |
| /logistics/resources/broker-setup-packet-checklist/ current_main indexable https://hermeslogisticsus.com/logistics/resources/broker-setup-packet-checklist/ public/sitemap-services.xml COMPLETE — |
| /logistics/resources/broker-setup-packet-checklist/ production indexable https://hermeslogisticsus.com/logistics/resources/broker-setup-packet-checklist/ /sitemap-services.xml COMPLETE — |
| /logistics/resources/car-hauler-capacity-checklist/ current_main indexable https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/ public/sitemap.xml COMPLETE — |
| /logistics/resources/car-hauler-capacity-checklist/ immutable_release indexable https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/ /sitemap.xml COMPLETE — |
| /logistics/resources/car-hauler-capacity-checklist/ merged_pr_86 indexable https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/ public/sitemap.xml COMPLETE — |
| /logistics/resources/car-hauler-capacity-checklist/ production indexable https://hermeslogisticsus.com/logistics/resources/car-hauler-capacity-checklist/ /sitemap.xml COMPLETE — |
| /logistics/resources/dispatch-service-vs-self-dispatch/ current_main indexable https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/ public/sitemap-services.xml COMPLETE — |
| /logistics/resources/dispatch-service-vs-self-dispatch/ production indexable https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/ /sitemap-services.xml COMPLETE — |
| /logistics/resources/new-authority-car-hauler-readiness-checklist/ current_main indexable https://hermeslogisticsus.com/logistics/resources/new-authority-car-hauler-readiness-checklist/ public/sitemap-services.xml COMPLETE — |
| /logistics/resources/new-authority-car-hauler-readiness-checklist/ production indexable https://hermeslogisticsus.com/logistics/resources/new-authority-car-hauler-readiness-checklist/ /sitemap-services.xml COMPLETE — |
| /logistics/sheboygan-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/sheboygan-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/sheboygan-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/sheboygan-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/shipper-dealer/ current_main indexable https://hermeslogisticsus.com/logistics/shipper-dealer/ public/sitemap.xml COMPLETE — |
| /logistics/shipper-dealer/ immutable_release indexable https://hermeslogisticsus.com/logistics/shipper-dealer/ /sitemap.xml COMPLETE — |
| /logistics/shipper-dealer/ production indexable https://hermeslogisticsus.com/logistics/shipper-dealer/ /sitemap.xml COMPLETE — |
| /logistics/waukesha-wi-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/waukesha-wi-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/waukesha-wi-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/waukesha-wi-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-auction-vehicle-pickup/ current_main indexable https://hermeslogisticsus.com/logistics/wisconsin-auction-vehicle-pickup/ public/sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-auction-vehicle-pickup/ production indexable https://hermeslogisticsus.com/logistics/wisconsin-auction-vehicle-pickup/ /sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-dealer-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/wisconsin-dealer-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-dealer-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/wisconsin-dealer-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-enclosed-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/wisconsin-enclosed-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-enclosed-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/wisconsin-enclosed-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-multi-vehicle-dealer-transport/ current_main indexable https://hermeslogisticsus.com/logistics/wisconsin-multi-vehicle-dealer-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-multi-vehicle-dealer-transport/ production indexable https://hermeslogisticsus.com/logistics/wisconsin-multi-vehicle-dealer-transport/ /sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-vehicle-transport/ current_main indexable https://hermeslogisticsus.com/logistics/wisconsin-vehicle-transport/ public/sitemap-local.xml COMPLETE — |
| /logistics/wisconsin-vehicle-transport/ production indexable https://hermeslogisticsus.com/logistics/wisconsin-vehicle-transport/ /sitemap-local.xml COMPLETE — |
| /paths/academy/ current_main indexable https://hermeslogisticsus.com/paths/academy/ public/sitemap.xml COMPLETE — |
| /paths/academy/ immutable_release indexable https://hermeslogisticsus.com/paths/academy/ /sitemap.xml COMPLETE — |
| /paths/academy/ production indexable https://hermeslogisticsus.com/paths/academy/ /sitemap.xml COMPLETE — |
| /paths/logistics/ current_main indexable https://hermeslogisticsus.com/paths/logistics/ public/sitemap.xml COMPLETE — |
| /paths/logistics/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/ /sitemap.xml COMPLETE — |
| /paths/logistics/ merged_pr_86 indexable https://hermeslogisticsus.com/paths/logistics/ public/sitemap.xml COMPLETE — |
| /paths/logistics/ production indexable https://hermeslogisticsus.com/paths/logistics/ /sitemap.xml COMPLETE — |
| /paths/logistics/agency-partners/ current_main indexable https://hermeslogisticsus.com/paths/logistics/agency-partners/ public/sitemap.xml COMPLETE — |
| /paths/logistics/agency-partners/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/agency-partners/ /sitemap.xml COMPLETE — |
| /paths/logistics/agency-partners/ production indexable https://hermeslogisticsus.com/paths/logistics/agency-partners/ /sitemap.xml COMPLETE — |
| /paths/logistics/brokers/carrier-capacity/ current_main indexable https://hermeslogisticsus.com/paths/logistics/brokers/carrier-capacity/ public/sitemap.xml COMPLETE — |
| /paths/logistics/brokers/carrier-capacity/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/brokers/carrier-capacity/ /sitemap.xml COMPLETE — |
| /paths/logistics/brokers/carrier-capacity/ production indexable https://hermeslogisticsus.com/paths/logistics/brokers/carrier-capacity/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/box-truck/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/box-truck/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/box-truck/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/box-truck/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/box-truck/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/box-truck/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/car-hauling/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/car-hauling/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/car-hauling/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/car-hauling/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/car-hauling/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/car-hauling/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/cargo-van/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/cargo-van/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/cargo-van/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/cargo-van/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/cargo-van/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/cargo-van/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/direct-freight-development/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/direct-freight-development/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/direct-freight-development/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/direct-freight-development/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/direct-freight-development/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/direct-freight-development/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/dry-van/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/dry-van/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/dry-van/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/dry-van/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/dry-van/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/dry-van/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/flatbed/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/flatbed/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/flatbed/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/flatbed/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/flatbed/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/flatbed/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/fleet-owners/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/fleet-owners/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/fleet-owners/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/fleet-owners/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/fleet-owners/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/fleet-owners/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/hotshot/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/hotshot/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/hotshot/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/hotshot/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/hotshot/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/hotshot/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/new-authority/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/new-authority/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/new-authority/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/new-authority/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/new-authority/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/new-authority/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/owner-operators/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/owner-operators/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/owner-operators/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/owner-operators/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/owner-operators/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/owner-operators/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/power-only/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/power-only/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/power-only/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/power-only/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/power-only/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/power-only/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/reefer/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/reefer/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/reefer/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/reefer/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/reefer/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/reefer/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/step-deck/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/step-deck/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/step-deck/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/step-deck/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/step-deck/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/step-deck/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/trusted-carrier-network/ current_main indexable https://hermeslogisticsus.com/paths/logistics/carriers/trusted-carrier-network/ public/sitemap.xml COMPLETE — |
| /paths/logistics/carriers/trusted-carrier-network/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/carriers/trusted-carrier-network/ /sitemap.xml COMPLETE — |
| /paths/logistics/carriers/trusted-carrier-network/ production indexable https://hermeslogisticsus.com/paths/logistics/carriers/trusted-carrier-network/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/luxury-classic-vehicle/ current_main indexable https://hermeslogisticsus.com/paths/logistics/customers/luxury-classic-vehicle/ public/sitemap.xml COMPLETE — |
| /paths/logistics/customers/luxury-classic-vehicle/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/customers/luxury-classic-vehicle/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/luxury-classic-vehicle/ production indexable https://hermeslogisticsus.com/paths/logistics/customers/luxury-classic-vehicle/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/port-pickup/ current_main indexable https://hermeslogisticsus.com/paths/logistics/customers/port-pickup/ public/sitemap.xml COMPLETE — |
| /paths/logistics/customers/port-pickup/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/customers/port-pickup/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/port-pickup/ production indexable https://hermeslogisticsus.com/paths/logistics/customers/port-pickup/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/vehicle-transport/ current_main indexable https://hermeslogisticsus.com/paths/logistics/customers/vehicle-transport/ public/sitemap.xml COMPLETE — |
| /paths/logistics/customers/vehicle-transport/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/customers/vehicle-transport/ /sitemap.xml COMPLETE — |
| /paths/logistics/customers/vehicle-transport/ production indexable https://hermeslogisticsus.com/paths/logistics/customers/vehicle-transport/ /sitemap.xml COMPLETE — |
| /paths/logistics/drivers/ current_main indexable https://hermeslogisticsus.com/paths/logistics/drivers/ public/sitemap.xml COMPLETE — |
| /paths/logistics/drivers/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/drivers/ /sitemap.xml COMPLETE — |
| /paths/logistics/drivers/ production indexable https://hermeslogisticsus.com/paths/logistics/drivers/ /sitemap.xml COMPLETE — |
| /paths/logistics/find-your-path/ current_main indexable https://hermeslogisticsus.com/paths/logistics/find-your-path/ public/sitemap.xml COMPLETE — |
| /paths/logistics/find-your-path/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/find-your-path/ /sitemap.xml COMPLETE — |
| /paths/logistics/find-your-path/ production indexable https://hermeslogisticsus.com/paths/logistics/find-your-path/ /sitemap.xml COMPLETE — |
| /paths/logistics/guidance/ current_main indexable https://hermeslogisticsus.com/paths/logistics/guidance/ public/sitemap.xml COMPLETE — |
| /paths/logistics/guidance/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/guidance/ /sitemap.xml COMPLETE — |
| /paths/logistics/guidance/ production indexable https://hermeslogisticsus.com/paths/logistics/guidance/ /sitemap.xml COMPLETE — |
| /paths/logistics/shippers-dealers/ current_main indexable https://hermeslogisticsus.com/paths/logistics/shippers-dealers/ public/sitemap.xml COMPLETE — |
| /paths/logistics/shippers-dealers/ immutable_release indexable https://hermeslogisticsus.com/paths/logistics/shippers-dealers/ /sitemap.xml COMPLETE — |
| /paths/logistics/shippers-dealers/ production indexable https://hermeslogisticsus.com/paths/logistics/shippers-dealers/ /sitemap.xml COMPLETE — |
| /paths/marketing/ current_main indexable https://hermeslogisticsus.com/paths/marketing/ public/sitemap.xml COMPLETE — |
| /paths/marketing/ immutable_release indexable https://hermeslogisticsus.com/paths/marketing/ /sitemap.xml COMPLETE — |
| /paths/marketing/ production indexable https://hermeslogisticsus.com/paths/marketing/ /sitemap.xml COMPLETE — |
| /paths/technology/ current_main indexable https://hermeslogisticsus.com/paths/technology/ public/sitemap.xml COMPLETE — |
| /paths/technology/ immutable_release indexable https://hermeslogisticsus.com/paths/technology/ /sitemap.xml COMPLETE — |
| /paths/technology/ production indexable https://hermeslogisticsus.com/paths/technology/ /sitemap.xml COMPLETE — |
| /privacy/ current_main indexable https://hermeslogisticsus.com/privacy/ public/sitemap.xml COMPLETE — |
| /privacy/ immutable_release indexable https://hermeslogisticsus.com/privacy/ /sitemap.xml COMPLETE — |
| /privacy/ production indexable https://hermeslogisticsus.com/privacy/ /sitemap.xml COMPLETE — |
| /resources/search-to-inquiry-conversion-checklist/ current_main indexable https://hermeslogisticsus.com/resources/search-to-inquiry-conversion-checklist/ public/sitemap-digital-services.xml COMPLETE — |
| /resources/search-to-inquiry-conversion-checklist/ production indexable https://hermeslogisticsus.com/resources/search-to-inquiry-conversion-checklist/ /sitemap-digital-services.xml COMPLETE — |
| /resources/technical-seo-checklist/ current_main indexable https://hermeslogisticsus.com/resources/technical-seo-checklist/ public/sitemap-digital-services.xml COMPLETE — |
| /resources/technical-seo-checklist/ production indexable https://hermeslogisticsus.com/resources/technical-seo-checklist/ /sitemap-digital-services.xml COMPLETE — |
| /resources/website-project-brief-template/ current_main indexable https://hermeslogisticsus.com/resources/website-project-brief-template/ public/sitemap-digital-services.xml COMPLETE — |
| /resources/website-project-brief-template/ production indexable https://hermeslogisticsus.com/resources/website-project-brief-template/ /sitemap-digital-services.xml COMPLETE — |
| /ru/ current_main indexable https://hermeslogisticsus.com/ru/ public/sitemap.xml COMPLETE — |
| /ru/ immutable_release indexable https://hermeslogisticsus.com/ru/ /sitemap.xml COMPLETE — |
| /ru/ production indexable https://hermeslogisticsus.com/ru/ /sitemap.xml COMPLETE — |
| /services/local-seo/ current_main indexable https://hermeslogisticsus.com/services/local-seo/ public/sitemap-digital-services.xml COMPLETE — |
| /services/local-seo/ production indexable https://hermeslogisticsus.com/services/local-seo/ /sitemap-digital-services.xml COMPLETE — |
| /services/seo-for-independent-auto-dealers/ current_main indexable https://hermeslogisticsus.com/services/seo-for-independent-auto-dealers/ public/sitemap-digital-services.xml COMPLETE — |
| /services/seo-for-independent-auto-dealers/ production indexable https://hermeslogisticsus.com/services/seo-for-independent-auto-dealers/ /sitemap-digital-services.xml COMPLETE — |
| /services/seo-for-logistics-companies/ current_main indexable https://hermeslogisticsus.com/services/seo-for-logistics-companies/ public/sitemap-digital-services.xml COMPLETE — |
| /services/seo-for-logistics-companies/ production indexable https://hermeslogisticsus.com/services/seo-for-logistics-companies/ /sitemap-digital-services.xml COMPLETE — |
| /services/seo/ current_main indexable https://hermeslogisticsus.com/services/seo/ public/sitemap-digital-services.xml COMPLETE — |
| /services/seo/ production indexable https://hermeslogisticsus.com/services/seo/ /sitemap-digital-services.xml COMPLETE — |
| /services/website-development/ current_main indexable https://hermeslogisticsus.com/services/website-development/ public/sitemap-digital-services.xml COMPLETE — |
| /services/website-development/ production indexable https://hermeslogisticsus.com/services/website-development/ /sitemap-digital-services.xml COMPLETE — |
| /services/website-redesign/ current_main indexable https://hermeslogisticsus.com/services/website-redesign/ public/sitemap-digital-services.xml COMPLETE — |
| /services/website-redesign/ production indexable https://hermeslogisticsus.com/services/website-redesign/ /sitemap-digital-services.xml COMPLETE — |
| /terms/ current_main indexable https://hermeslogisticsus.com/terms/ public/sitemap-trust.xml COMPLETE — |
| /terms/ production indexable https://hermeslogisticsus.com/terms/ /sitemap-trust.xml COMPLETE — |
| /ua/ current_main indexable https://hermeslogisticsus.com/ua/ public/sitemap.xml COMPLETE — |
| /ua/ immutable_release indexable https://hermeslogisticsus.com/ua/ /sitemap.xml COMPLETE — |
| /ua/ production indexable https://hermeslogisticsus.com/ua/ /sitemap.xml COMPLETE — |

## External verification boundary

External URLs are read-only observations captured by the snapshot workflow. A failed fetch remains NOT_FOUND, NEEDS_REVIEW, or unavailable; it is never converted into a claim that production and current main are equivalent.

## Phase 2 gate

Casablanca implementation remains blocked until Phase 1 is reviewed and the owner supplies the required program, format, language, schedule, price, privacy, contact and publication facts from Issue #87.

