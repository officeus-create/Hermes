# Hermes Connect full branch inventory — 2026-09-08

Generated against `origin/main` at `1dfb4e297398b9c40ba8d8349d23f5e7ca9c8eb9`.

This is a forensic inventory, not an instruction to merge branches wholesale. A branch with unique commits is a donor candidate until its current product scope is reconciled with One Brain / Master Vision and current main.

## Summary

- Relevant Hermes Connect branch lineages found: **463**
- Branches with unique commits vs main: **354**
- ACTIVE_PR: **2**
- RECOVER_REVIEW: **2**
- CLOSED_UNMERGED_REVIEW: **142**
- POST_MERGE_OR_SUPERSEDED: **184**
- HOLD_REVIEW: **0**
- STALE_DONOR_REVIEW: **16**
- EVIDENCE_OR_REPLAY_REVIEW: **8**
- MERGED_OR_CONTAINED: **109**

## Inventory

| Status | Branch | Ahead | Behind | PR | Last commit | Connect files changed | Rationale |
|---|---|---:|---:|---|---|---:|---|
| ACTIVE_PR | `fix/repair-company-nav-label-20260908` | 2 | 2 | #1161 open | 2026-09-08 · fix(repair): label company workspace consistently | 2 | Open PR #1161. |
| ACTIVE_PR | `fix/hc-locale-persistence-ru-20260908` | 10 | 0 | #1163 open | 2026-09-08 · chore: remove accidental audit placeholder | 4 | Open PR #1163. |
| RECOVER_REVIEW | `fix/repair-company-localization-parity-20260908` | 6 | 2 | — | 2026-09-08 · fix(repair): complete Company localization parity | 3 | Recent unique code with no open PR; candidate for semantic recovery. |
| RECOVER_REVIEW | `fix/hermes-connect-live-ru-20260908` | 2 | 51 | — | 2026-09-08 · test(hc): lock Russian Product Hub after shared runtime settles | 2 | Recent unique code with no open PR; candidate for semantic recovery. |
| CLOSED_UNMERGED_REVIEW | `hc/repair-proof-shared-state-lock-20260907` | 5 | 59 | #1145 closed | 2026-09-07 · Repair P0 proof: replace stale v2 verifier on current main | 4 | PR #1145 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `hc/repair-p0-proof-v2-heading-fix-replay-20260907` | 1 | 65 | #1143 closed | 2026-09-07 · HC: replay Repair Shop P0 v2 dashboard proof fix | 1 | PR #1143 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `hc/repair-p0-proof-v2-heading-fix-20260907` | 1 | 67 | #1141 closed | 2026-09-07 · Fix Repair Shop P0 v2 dashboard proof heading | 1 | PR #1141 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/repair-registration-ga4-post-body-proof-20260907` | 1 | 69 | #1139 closed | 2026-09-07 · SEO: verify GA4 completion in GET or POST collect payload | 1 | PR #1139 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `hc/repair-p0-browser-redirect-proof-fix-20260907` | 4 | 81 | #1136 closed | 2026-09-07 · HC: add PR gate for Repair Shop P0 proof v2 | 4 | PR #1136 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/repair-shops-product-polish-2026-09-06` | 1 | 135 | #1123 closed | 2026-09-06 · Polish Repair Shop owner signup and QA flow | 2 | PR #1123 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/logistics-menu-load-board-rotation-2026-09-06` | 1 | 135 | #1122 closed | 2026-09-06 · feat: clarify logistics navigation and rotate load board demos | 0 | PR #1122 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/direction-order-academy-tracks-20260906` | 6 | 210 | #1114 closed | 2026-09-06 · test(academy): assert decoded visible track labels | 1 | PR #1114 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `repair/settings-workspace-v1` | 16 | 230 | #1108 closed | 2026-09-05 · Repair CRM: expand Settings gate paths | 8 | PR #1108 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `chatgpt/web-hl10-nav-fresh-main-20260905` | 9 | 231 | #1103 closed | 2026-09-05 · Merge current main QA gate into WEB HL 10 navigation | 3 | PR #1103 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/unified-direction-nav-order` | 39 | 256 | #1086 closed | 2026-09-05 · test(header): lock department dropdown order and mobile accordions | 2 | PR #1086 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/load-board-carrier-operating-path-20260905` | 18 | 252 | #1093 closed | 2026-09-05 · Document Load Board runtime source ingestion gate | 4 | PR #1093 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/load-board-hegelmann-live-capacity` | 5 | 256 | #1088 closed | 2026-09-04 · docs(load-board): record Hegelmann approved capacity pilot | 1 | PR #1088 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/repair-shop-crm-shell` | 1 | 257 | #1084 closed | 2026-09-04 · feat: make Repair Shop a simple web CRM | 4 | PR #1084 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/hc-repair-context-shell-20260904` | 4 | 265 | #1071 closed | 2026-09-04 · test(connect): lock Russian shared shell localization | 2 | PR #1071 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo-geo/ga4-production-host-guard-2026-09-04` | 5 | 266 | #1070 closed | 2026-09-04 · test: keep Connect analytics local on non-production hosts | 1 | PR #1070 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/logistics-career-hr-intake-2026-09-04` | 6 | 266 | #1069 closed | 2026-09-04 · fix(hr): use native browser UUID generator | 0 | PR #1069 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/hc-owner-registrations-1053` | 13 | 274 | #1054 closed | 2026-09-03 · test(connect): require phone-first profile alert semantics | 4 | PR #1054 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/social-distribution-final-fcc-main-2026-09-03` | 1 | 347 | #1039 closed | 2026-09-03 · feat(social): replay LinkedIn attribution bridge on final FCC main | 0 | PR #1039 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/social-distribution-final-main-2026-09-03` | 1 | 349 | #1038 closed | 2026-09-03 · feat(social): replay LinkedIn attribution bridge on final current main | 0 | PR #1038 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/social-distribution-current-main-2026-09-03` | 1 | 357 | #1035 closed | 2026-09-03 · feat(social): replay LinkedIn attribution bridge on current main | 0 | PR #1035 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/fcc-ollama-current-main-2026-09-03` | 1 | 357 | #1034 closed | 2026-09-03 · fix(ai): replay FCC Ollama capability patch on current main | 1 | PR #1034 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-hr-pilot-v1` | 50 | 423 | #1016 closed | 2026-09-03 · feat(hr): make selected interview language functional for RU and UK | 9 | PR #1016 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/hermes-fcc-ollama-thinking` | 11 | 420 | #1030 closed | 2026-09-03 · fix(ai): keep 3B Ollama out of interactive Codex agent mode | 1 | PR #1030 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/social-distribution-linkedin-attribution` | 7 | 423 | #1019 closed | 2026-09-02 · fix(social): keep attributed X drafts within post limit | 0 | PR #1019 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/connect-global-account-replay4-2026-09-02` | 1 | 423 | #1008 closed | 2026-09-02 · design(connect): replay global Hermes account on current main | 3 | PR #1008 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/connect-global-account-replay3-2026-09-02` | 1 | 424 | #1005 closed | 2026-09-02 · design(connect): replay global Hermes account after direction color merge | 3 | PR #1005 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/connect-global-account-replay2-2026-09-02` | 1 | 425 | #1004 closed | 2026-09-02 · design(connect): replay global Hermes account on latest main | 3 | PR #1004 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/connect-design-current-state-2026-09-02` | 1 | 426 | #1002 closed | 2026-09-02 · docs(design): align Hermes Connect current state with approved division colors | 0 | PR #1002 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/connect-global-account-replay-2026-09-02` | 3 | 426 | #1001 closed | 2026-09-02 · test(connect): verify global signed-in portfolio across desktop and mobile | 3 | PR #1001 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/connect-internal-ai-control-center-2026-09-01` | 18 | 487 | #940 closed | 2026-09-01 · test(ai): lock prompt exposure to runner-only DTO | 11 | PR #940 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/connect-internal-owner-bootstrap-2026-09-01` | 15 | 487 | #942 closed | 2026-09-01 · test(connect): keep activity security proof locale-neutral in bootstrap stack | 10 | PR #942 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/connect-global-account-presence-2026-09-01` | 14 | 482 | #956 closed | 2026-09-01 · test(connect): verify both global account roots fail closed | 3 | PR #956 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/connect-website-factory-b1-2026-09-01` | 14 | 482 | #955 closed | 2026-09-01 · test(factory): protect durable handoff notification | 1 | PR #955 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/systematic-visual-cleanup-2026-09-01` | 55 | 486 | #944 closed | 2026-09-01 · fix(release): register Option 02 QA route | 8 | PR #944 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/connect-beauty-product-truth-2026-09-01` | 5 | 485 | #948 closed | 2026-09-01 · test(connect): protect truthful Beauty status on Product Hub | 5 | PR #948 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/connect-beauty-account-integration-2026-09-01` | 10 | 486 | #945 closed | 2026-09-01 · test(connect): cover Beauty in shared account portfolio | 8 | PR #945 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/academy-public-learner-workspace-handoff-2026-08-31` | 2 | 490 | #935 closed | 2026-08-31 · test(academy): protect public-to-learner workspace handoff | 1 | PR #935 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/repair-private-pearl-shell-2026-08-30` | 1 | 522 | #911 closed | 2026-08-30 · fix(connect): apply Pearl Design OS to private Repair Shop workspaces | 2 | PR #911 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/hermes-vertical-design-tokens-2026-08-30` | 1 | 530 | #908 closed | 2026-08-30 · feat(brand): add canonical vertical accent tokens | 0 | PR #908 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/ai-connect-cabinet-ux-ru` | 4 | 574 | #885 closed | 2026-08-28 · replay(connect): restack internal AI cabinet UX on clean project workspace | 9 | PR #885 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/ai-connect-project-workspace` | 3 | 574 | #882 closed | 2026-08-28 · replay(test): restore AI Connect project browser contract on current main | 3 | PR #882 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/ai-connect-activity` | 28 | 575 | #887 closed | 2026-08-28 · test(connect): cover internal AI activity history | 14 | PR #887 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/ai-connect-projects-list` | 23 | 575 | #886 closed | 2026-08-28 · chore(connect): sync cabinet browser evidence from base | 11 | PR #886 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/hermes-connect-ai-cabinet-decision-2026-08-26` | 1 | 577 | #877 closed | 2026-08-26 · docs(ai): record embedded assistant cabinet decision | 0 | PR #877 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/connect-ru-and-performance-handoff-2026-08-25` | 2 | 581 | #872 closed | 2026-08-25 · docs: add redacted Connect credential rotation manifest | 0 | PR #872 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/restore-agent-readable-llms-2026-08-25` | 4 | 581 | #868 closed | 2026-08-25 · test(agentic): enforce Markdown link discovery | 0 | PR #868 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/owner-hermes-codex-control-center-2026-08-25` | 37 | 581 | #865 closed | 2026-08-25 · ci(owner): compile-check the local runner | 1 | PR #865 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/hermes-fcc-intel-macos-bootstrap` | 1 | 581 | #861 closed | 2026-08-25 · fix: harden Hermes FCC bootstrap on Intel macOS | 0 | PR #861 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/beauty-b1-owner-preview-final-v2-2026-08-22` | 3 | 591 | #788 closed | 2026-08-24 · feat(connect): replay Beauty B1 owner preview on current main | 3 | PR #788 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `geo/public-entity-hierarchy-current-main-v2` | 1 | 638 | #845 closed | 2026-08-23 · geo: canonicalize public Four Directions entities on current main | 1 | PR #845 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `geo/public-entity-hierarchy-current-main` | 10 | 640 | #837 closed | 2026-08-23 · docs(geo): record merged bounded releases | 1 | PR #837 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `geo/restore-current-state-entrypoint-2026-08-23` | 1 | 640 | #839 closed | 2026-08-23 · docs(geo): restore canonical current-state entrypoint | 0 | PR #839 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `finish/password-reset-timing-current-main` | 5 | 698 | #806 closed | 2026-08-23 · test(auth): run password recovery contract with TS stripping | 1 | PR #806 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/public-geo-design-inventory-2026-08-22` | 90 | 707 | #785 closed | 2026-08-22 · merge main: adopt public UX friction baseline | 15 | PR #785 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/gsc-owner-recovery-2026-08-22` | 5 | 715 | #786 closed | 2026-08-22 · test(seo): cover Connect and resource winner owner mappings | 1 | PR #786 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/password-reset-timing-787` | 1 | 709 | #796 closed | 2026-08-22 · fix(auth): remove password reset timing side channel | 1 | PR #796 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shops-monetizable-revenue-2026-08-22` | 4 | 713 | #790 closed | 2026-08-22 · docs: update AI handoff log with Repair Shop Revenue OS and CI fix | 30 | PR #790 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/public-geo-design-inventory-2026-08-20` | 36 | 725 | #774 closed | 2026-08-21 · fix(geo): align Academy direction copy with canonical brand | 2 | PR #774 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/beauty-b1-owner-preview-final-2026-08-21` | 1 | 717 | #782 closed | 2026-08-21 · feat(connect): replay Beauty B1 owner workspace preview on current main | 3 | PR #782 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-3-current-main-2026-08-19` | 40 | 736 | #765 closed | 2026-08-20 · docs: update AI_HANDOFF.md with 100% green build and e2e test verification | 39 | PR #765 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-beauty-b1-owner-preview-2026-08-20` | 5 | 736 | #767 closed | 2026-08-20 · fix(connect): align Beauty preview manifest with release contract | 3 | PR #767 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-academy-journey-integration-2026-08-20` | 2 | 736 | #768 closed | 2026-08-20 · test(connect): cover Academy evidence progression handoff | 2 | PR #768 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/academy-uk-marketing-owner-2026-08-19` | 14 | 757 | #721 closed | 2026-08-19 · chore(academy): remove temporary preview artifact workflow | 1 | PR #721 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-owner-workspace-ceo-preview` | 34 | 780 | #724 closed | 2026-08-19 · test(connect): align experience regression with approved Owner OS | 18 | PR #724 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-beauty-b1-current-main-2026-08-19` | 14 | 752 | #742 closed | 2026-08-19 · test(connect): guard Beauty B1 backend boundaries | 3 | PR #742 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/hermes-connect-repair-p0-first-screen` | 5 | 780 | #681 closed | 2026-08-19 · test(connect): verify booking error hero geometry end to end | 9 | PR #681 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/repair-first5-scorecard-v2` | 2 | 757 | #722 closed | 2026-08-19 · docs(connect): align first-5 cohort state gate | 0 | PR #722 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/academy-reciprocal-hreflang-2026-08-19` | 2 | 779 | #716 closed | 2026-08-19 · test(academy): enforce reciprocal EN-UK hreflang | 1 | PR #716 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-beauty-b1-backend` | 2 | 781 | #711 closed | 2026-08-18 · feat(connect): add Beauty B1 owner backend foundation | 3 | PR #711 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-service-context` | 1 | 781 | #710 closed | 2026-08-18 · feat(connect): scope shared services by business context | 2 | PR #710 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-academy-a3-1-support-questions` | 1 | 781 | #664 closed | 2026-08-18 · feat(academy): add private learner questions and support A3.1 | 8 | PR #664 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/academy-language-compliance-eligibility-2026-08-18` | 9 | 786 | #690 closed | 2026-08-18 · docs(academy): record language and compliance eligibility policy | 2 | PR #690 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-canonical-links-2026-08-18` | 9 | 820 | #669 closed | 2026-08-18 · seo: inherit approved homepage thin-page policy | 0 | PR #669 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-canonical-geo-2026-08-18` | 7 | 820 | #668 closed | 2026-08-18 · seo: inherit approved homepage thin-page policy | 0 | PR #668 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-canonical-p0-2026-08-18` | 4 | 820 | #667 closed | 2026-08-18 · seo: respect approved focused homepage in thin-page gate | 0 | PR #667 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-commercial-link-gate-2026-08-18` | 9 | 824 | #661 closed | 2026-08-18 · test(geo): validate llms verification date generically | 0 | PR #661 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-geo-evidence-2026-08-18` | 7 | 824 | #660 closed | 2026-08-18 · test(geo): validate llms verification date generically | 0 | PR #660 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo/hermes-framework-p0-gate-2026-08-18` | 3 | 824 | #658 closed | 2026-08-18 · docs(seo): establish canonical Hermes SEO Framework | 0 | PR #658 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/repair-shop-quickstart-597` | 4 | 851 | #648 closed | 2026-08-18 · test(connect): cover repair shop quick-start flow | 3 | PR #648 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-academy-beauty-prep` | 14 | 870 | #643 closed | 2026-08-18 · test(connect): assert preparation verticals in site bridge | 9 | PR #643 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-home-first-visit-main` | 32 | 870 | #641 closed | 2026-08-18 · design(home): remove blocking first-visit intro | 0 | PR #641 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-home-commercial-hierarchy-main` | 31 | 870 | #640 closed | 2026-08-18 · test(home): align legacy browser contract with commercial hero | 0 | PR #640 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-carrier-calculators-main` | 19 | 870 | #639 closed | 2026-08-18 · test(calculators): align visual contract with responsive focus behavior | 0 | PR #639 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-shared-resource-main` | 17 | 870 | #638 closed | 2026-08-17 · design(resources): converge shared public resource shell | 0 | PR #638 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-case-studies-main` | 16 | 870 | #637 closed | 2026-08-17 · design(case): converge case studies on Hermes public system | 0 | PR #637 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-localized-overviews-main` | 15 | 870 | #636 closed | 2026-08-17 · design(localized): converge multilingual overview pages on Hermes system | 0 | PR #636 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-digital-services-main` | 14 | 870 | #635 closed | 2026-08-17 · design(services): converge shared digital services on Hermes system | 0 | PR #635 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-carrier-entry-main` | 13 | 870 | #634 closed | 2026-08-17 · fix(carrier): align responsive radii with visual contract | 0 | PR #634 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-contact-public-main` | 8 | 870 | #633 closed | 2026-08-17 · test(contact): restore shared contact visual coverage | 0 | PR #633 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-trust-public-main` | 5 | 870 | #632 closed | 2026-08-17 · test(trust): restore policy visual coverage | 0 | PR #632 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-logistics-commercial-main` | 3 | 870 | #630 closed | 2026-08-17 · test(logistics): restore commercial visual coverage | 0 | PR #630 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-contact-public-refresh` | 12 | 894 | #629 closed | 2026-08-17 · test(contact): guard refreshed shared public CTA | 0 | PR #629 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-trust-public-refresh` | 9 | 894 | #628 closed | 2026-08-17 · test(trust): guard refreshed public trust system | 0 | PR #628 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-logistics-commercial-refresh` | 7 | 894 | #627 closed | 2026-08-17 · test(logistics): guard refreshed commercial visual layer | 0 | PR #627 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-contact-public-system` | 3 | 896 | #625 closed | 2026-08-17 · test(contact): guard shared public contact primitive | 0 | PR #625 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-logistics-commercial-polish` | 8 | 896 | #623 closed | 2026-08-17 · fix(logistics): scope commercial sibling to live route | 0 | PR #623 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-trust-public-system` | 3 | 896 | #624 closed | 2026-08-17 · test(trust): assert responsive contact radius directly | 0 | PR #624 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-technology-public-system` | 6 | 897 | #622 closed | 2026-08-17 · fix(technology): load explicit surface ownership | 0 | PR #622 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-retention-share-v1` | 10 | 1013 | #602 closed | 2026-08-16 · test(connect): follow extracted activation style contract | 7 | PR #602 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-quickstart-v1` | 7 | 1013 | #601 closed | 2026-08-16 · test(connect): follow extracted activation style contract | 5 | PR #601 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/repair-booking-customer-focus` | 2 | 1035 | #599 closed | 2026-08-16 · test(connect): prevent booking-success business upsell | 1 | PR #599 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-free-launch-promo` | 9 | 1036 | #595 closed | 2026-08-16 · test(connect): verify truthful launch-window wording | 3 | PR #595 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/repair-shop-activation` | 3 | 1037 | #590 closed | 2026-08-16 · feat(connect): centralize repair shop founding offer | 2 | PR #590 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-connect-vertical-os` | 6 | 1037 | #589 closed | 2026-08-16 · test(connect): measure consent against adaptive hub primary CTA | 5 | PR #589 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `design/hermes-intelligence-core-lab` | 2 | 1076 | #574 closed | 2026-08-16 · docs(connect): declare noindex intelligence core design lab | 0 | PR #574 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/connect-header-launcher-polish-alias` | 2 | 1076 | #575 closed | 2026-08-16 · test(connect): lock header polish selector contract | 2 | PR #575 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-host-canonical-redirect` | 2 | 1079 | #564 closed | 2026-08-16 · test(connect): enforce canonical compatibility redirects | 0 | PR #564 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/hermes-connect-sitewide-launcher-current` | 14 | 1083 | #561 closed | 2026-08-16 · fix(connect): retain build compatibility marker without legacy routing | 5 | PR #561 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/hermes-connect-launch-ready` | 27 | 1088 | #556 closed | 2026-08-16 · fix(connect): keep STO account links motionless | 6 | PR #556 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-live-partner-offer` | 10 | 1089 | #554 closed | 2026-08-16 · fix(repair-shops): clarify public offer privacy boundary | 2 | PR #554 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/repair-shop-cancel-rebook` | 2 | 1102 | #539 closed | 2026-08-15 · test(connect): verify cancelled repair slot can be rebooked | 1 | PR #539 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo14-authority-registry` | 2 | 1178 | #516 closed | 2026-08-14 · SEO14: refresh authority eligibility from primary sources | 0 | PR #516 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/hermes-connect-brand-funnel-unification` | 24 | 1181 | #509 closed | 2026-08-14 · seo(command-center): shorten title length to resolve technical warning | 15 | PR #509 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-launcher-current` | 1 | 1181 | #508 closed | 2026-08-13 · Update Connect launcher on current main | 0 | PR #508 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-knot-after-access` | 5 | 1182 | #507 closed | 2026-08-13 · Update Connect launcher | 0 | PR #507 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-access-fix` | 3 | 1183 | #505 closed | 2026-08-13 · Hermes Connect: redirect legacy apply fragment into request-access flow | 0 | PR #505 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-brand-launcher` | 3 | 1185 | #504 closed | 2026-08-13 · Hermes Connect: inject knot launcher into canonical intelligence shell | 0 | PR #504 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-v2-knot-launch` | 2 | 1187 | #502 closed | 2026-08-13 · test: launch V2 workspace with Hermes knot identity | 2 | PR #502 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `agent/connect-site-shell-entry` | 2 | 1187 | #501 closed | 2026-08-13 · test: lock persistent Hermes Connect site-shell entry | 1 | PR #501 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `chatgpt/hermes-connect-brand-funnel-v1` | 6 | 1189 | #500 closed | 2026-08-13 · test: point Connect root contract at Brand V1 workspace | 2 | PR #500 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feat/hermes-connect-visual-motion-v1` | 22 | 1196 | #497 closed | 2026-08-13 · release: trigger canonical Hermes Connect launch gate | 4 | PR #497 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo13/load-board-canonical-owner-v2` | 2 | 1194 | #492 closed | 2026-08-13 · docs: record Load Board canonical owner with role-state preservation | 1 | PR #492 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo13/load-board-canonical-owner-v1` | 4 | 1195 | #490 closed | 2026-08-13 · docs: record Load Board canonical owner decision | 1 | PR #490 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `preview/hermes-connect-visual-review` | 2 | 1203 | #485 closed | 2026-08-13 · chore: trigger Hermes Connect Pages visual preview | 0 | PR #485 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo12/authority-registry` | 1 | 1308 | #434 closed | 2026-08-12 · SEO12: add public-safe authority opportunity registry | 0 | PR #434 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `human-copy/load-board-dual-entry` | 6 | 1313 | #423 closed | 2026-08-12 · test: match accessible carrier entry label | 1 | PR #423 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo11/proof-candidate-selection-status` | 2 | 1324 | #413 closed | 2026-08-12 · SEO11: sync proof candidate selection CSV | 0 | PR #413 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `feature/route-demand-development-story` | 4 | 1328 | #405 closed | 2026-08-12 · docs: clarify direct freight route-demand development for AI | 0 | PR #405 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/connect-agent-readiness-2026-08-11` | 4 | 1334 | #395 closed | 2026-08-12 · Docs: classify existing APIs for Agent Readiness | 0 | PR #395 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo11/authority-registry-v1` | 1 | 1332 | #398 closed | 2026-08-12 · Add public-safe authority opportunity registry | 0 | PR #398 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/hermes-ai-collaboration-system` | 8 | 1522 | #288 closed | 2026-08-06 · docs: add universal AI onboarding prompt | 0 | PR #288 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `docs/reconcile-hermes-connect-readme` | 1 | 1612 | #248 closed | 2026-08-04 · Docs: reconcile Hermes Connect repository release status | 0 | PR #248 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `fix/connect-post-release-verification` | 7 | 1629 | #237 closed | 2026-08-04 · Ops: add controlled Cloudflare Pages production deploy | 0 | PR #237 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `ops/connect-live-recheck-2026-08-05` | 2 | 1628 | #238 closed | 2026-08-04 · ops(connect): include main-site overview in live recheck | 0 | PR #238 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `seo5/hermes-connect-conversion-refresh` | 7 | 1638 | #231 closed | 2026-08-04 · Keep Codex workspace sync from overwriting Connect landing | 1 | PR #231 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `marketing/carrier-qualification-funnel` | 8 | 1742 | #114 closed | 2026-08-01 · Test carrier readiness qualification path | 1 | PR #114 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/shipment-history-booked-status-2026-08-01` | 35 | 1755 | #85 closed | 2026-08-01 · test: run Playwright with current date fixture | 0 | PR #85 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/phase-stack-main-reconciliation-2026-08-01` | 20 | 1782 | #78 closed | 2026-08-01 · test: register load-board adapter checks | 1 | PR #78 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/load-board-adapter-registry` | 4 | 1965 | #40 closed | 2026-07-31 · Fix adapter transport typing | 1 | PR #40 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/load-board-integration-research` | 1 | 1965 | #39 closed | 2026-07-31 · Document official load-board integration discovery | 0 | PR #39 closed without merge; inspect unique code before recovery. |
| CLOSED_UNMERGED_REVIEW | `codex/shipment-history-preview-phase2` | 3 | 1965 | #36 closed | 2026-07-31 · Run import-preview quarantine checks in CI | 0 | PR #36 closed without merge; inspect unique code before recovery. |
| POST_MERGE_OR_SUPERSEDED | `hc/repair-shops-finish-and-light-design-20260907` | 9 | 132 | #1126 merged | 2026-09-07 · Fit Repair Shop Pearl polish within site budget | 6 | PR #1126 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `hc/vadym-prefilled-prospects-20260907` | 6 | 134 | #1125 merged | 2026-09-07 · chore: register private repair shop prospect route | 3 | PR #1125 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `codex/repair-shop-crm-demo-polish-2026-09-06` | 3 | 135 | #1124 merged | 2026-09-07 · test: keep carrier dedupe click geometry-safe | 8 | PR #1124 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hr-intake-current-main-20260906` | 4 | 137 | #1121 merged | 2026-09-06 · feat(hr): persist logistics career applications from current main | 0 | PR #1121 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/academy-five-track-trust-badge-20260906` | 1 | 144 | #1120 merged | 2026-09-06 · fix(academy): align homepage trust badge with five tracks | 0 | PR #1120 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `repair/services-workspace-v1` | 20 | 232 | #1105 merged | 2026-09-05 · test: normalize Services visual evidence capture | 7 | PR #1105 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `repair/crm-office-demo-staff-schedule` | 25 | 249 | #1097 merged | 2026-09-05 · Repair CRM: scope locale assertion to customer list | 13 | PR #1097 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-product-hub-current-order` | 7 | 250 | #1096 merged | 2026-09-05 · test(hc): align Repair family nav with current product contract | 4 | PR #1096 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `repair/crm-shell-current-main` | 9 | 251 | #1092 merged | 2026-09-05 · fix(repair): hydrate CRM shell locale from runtime URL | 5 | PR #1092 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/load-board-email-contract-clock-20260905` | 1 | 252 | #1095 merged | 2026-09-05 · test(load-board): remove wall-clock expiry from email bridge fixture | 1 | PR #1095 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-context-fresh-main-20260904` | 2 | 253 | #1091 merged | 2026-09-04 · test(connect): align Repair context regression with focused shell | 3 | PR #1091 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/carrier-ga4-bridge-72h` | 3 | 254 | #1090 merged | 2026-09-04 · fix(analytics): keep CI and preview traffic out of GA4 | 1 | PR #1090 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/load-board-owner-query-fit-72h` | 5 | 255 | #1089 merged | 2026-09-04 · chore(seo): reconcile load board patch with current main | 0 | PR #1089 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/p0-car-hauling-repair-72h` | 18 | 256 | #1087 merged | 2026-09-04 · docs(seo): record verified page-query owner split | 0 | PR #1087 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/loadboard-approved-email-bridge` | 8 | 257 | #1085 merged | 2026-09-04 · ci(cloudflare): dry-run composed Worker in PR ownership gate | 2 | PR #1085 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/loadboard-general-freight-intake-hold` | 1 | 258 | #1083 merged | 2026-09-04 · fix(load-board): enforce general freight intake while Car Hauling is on hold | 1 | PR #1083 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hc-mobile-language-default-scroll` | 7 | 260 | #1081 merged | 2026-09-04 · test: keep explicit RU while clean Connect entry returns English | 3 | PR #1081 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/loadboard-product-ui-1074` | 2 | 260 | #1082 merged | 2026-09-04 · test(load-board): make product coverage responsive-safe | 1 | PR #1082 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/repair-shop-driver-discount-20260904` | 8 | 262 | #1080 merged | 2026-09-04 · test(repair): gate Hermes driver discount contract in CI | 4 | PR #1080 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/loadboard-intake-api-1074` | 6 | 262 | #1079 merged | 2026-09-04 · Fix Load Board visibility type gate | 1 | PR #1079 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/realtime-mailbox-intake-1074` | 4 | 263 | #1075 merged | 2026-09-04 · test(load-board): register live pilot route in release manifest | 0 | PR #1075 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo-geo/revenue-100-2026-09-04` | 24 | 267 | #1059 merged | 2026-09-04 · fix(seo): remove false sameAs regex collision | 1 | PR #1059 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hc-auth-source-truth-2026-09-04` | 1 | 270 | #1064 merged | 2026-09-03 · fix(connect): align repair owner auth source truth | 1 | PR #1064 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/hc-owner-registrations-clean-main-2026-09-04` | 1 | 270 | #1062 merged | 2026-09-03 · feat(connect): replay owner registration ledger on current main | 4 | PR #1062 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-analytics-verifier-current-routing-2026-09-04` | 1 | 271 | #1060 merged | 2026-09-03 · fix(ci): align Connect analytics verifier with current routing | 0 | PR #1060 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/p4-repair-resilience-states-2026-09-03` | 6 | 274 | #1052 merged | 2026-09-03 · test(design): model Repair service outage through retry | 1 | PR #1052 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/p4-public-account-affordance-2026-09-03` | 5 | 295 | #1048 merged | 2026-09-03 · test(design): scope public account SSR privacy assertions to anchors | 3 | PR #1048 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-production-verifier-current-routing-2026-09-03` | 1 | 297 | #1047 merged | 2026-09-03 · fix(ci): align Connect production verifier with current routing | 0 | PR #1047 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/design-state-post-hr-2026-09-03` | 2 | 305 | #1045 merged | 2026-09-03 · docs(design): close HR rework lane in master backlog | 0 | PR #1045 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/restore-approved-color-systems-2026-09-02` | 10 | 432 | #989 merged | 2026-09-02 · test(design): align public path contract with approved division colors | 4 | PR #989 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `hardening/internal-ai-readonly-doctor-2026-09-02` | 3 | 432 | #990 merged | 2026-09-02 · docs(ai): require read-only doctor before runner proof | 1 | PR #990 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `hardening/internal-ai-evidence-redaction-2026-09-01` | 10 | 433 | #988 merged | 2026-09-02 · fix(ai): assert canonical bypass prohibition correctly | 1 | PR #988 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `replay/connect-internal-owner-bootstrap-2026-09-01` | 1 | 434 | #987 merged | 2026-09-02 · replay(connect): one-time internal owner activation on merged Control Center | 4 | PR #987 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `replay/connect-internal-ai-control-center-2026-09-01` | 9 | 435 | #984 merged | 2026-09-02 · replay(ai): stage reviewed Control Center surface for conflict reconciliation | 11 | PR #984 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-paid-intent-post-deploy-trigger-2026-09-01` | 1 | 449 | #980 merged | 2026-09-01 · ci(repair): run paid-intent proof after successful deploy | 1 | PR #980 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-paid-intent-direct-fallback-2026-09-01` | 2 | 450 | #979 merged | 2026-09-01 · test(repair): verify direct paid-intent fallback | 2 | PR #979 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `test/repair-paid-intent-diagnostic-2026-09-01` | 1 | 451 | #978 merged | 2026-09-01 · test(repair): classify paid-intent receiver failures | 1 | PR #978 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `test/repair-paid-intent-production-smoke-2026-09-01` | 1 | 452 | #977 merged | 2026-09-01 · test(repair): add paid-intent production smoke | 1 | PR #977 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `test/connect-repair-booking-timezone-regression-2026-09-01` | 1 | 455 | #973 merged | 2026-09-01 · test(connect): lock Repair Shop booking to shop-calendar date | 1 | PR #973 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `test/connect-repair-booking-concurrency-production-2026-09-01` | 1 | 462 | #971 merged | 2026-09-01 · test(connect): add production D1 booking concurrency proof | 2 | PR #971 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-availability-mobile-ergonomics-2026-09-01` | 1 | 462 | #967 merged | 2026-09-01 · rebase(connect): replay availability mobile hardening on current main | 2 | PR #967 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-capability-slot-a11y-2026-09-01` | 2 | 463 | #970 merged | 2026-09-01 · test(connect): lock Repair Shop mobile accessibility contracts | 2 | PR #970 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-paid-activation-idempotency-2026-09-01` | 3 | 464 | #969 merged | 2026-09-01 · fix(connect): load paid activation retry guard in canonical repair shell | 3 | PR #969 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/final-design-integration-2026-09-01` | 12 | 478 | #959 merged | 2026-09-01 · docs(design): define final release completion gate | 6 | PR #959 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-reminder-oidc-production-2026-09-01` | 6 | 483 | #953 merged | 2026-09-01 · test(connect): protect reminder OIDC trust boundary | 3 | PR #953 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-beauty-product-truth-v2-2026-09-01` | 3 | 484 | #951 merged | 2026-09-01 · test(connect): protect private Beauty product truth | 7 | PR #951 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-beauty-b11-owner-controls-2026-09-01` | 3 | 484 | #952 merged | 2026-09-01 · test(connect): cover Beauty B1.1 owner controls | 1 | PR #952 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-owner-signin-inactivity-reminders-2026-09-01` | 13 | 485 | #950 merged | 2026-09-01 · test(connect): cover weekly reminder window across midnight | 5 | PR #950 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-beauty-account-integration-v2-2026-09-01` | 5 | 485 | #946 merged | 2026-09-01 · feat(connect): mount Beauty in shared private account shell | 5 | PR #946 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-beauty-b1-live-workspace-2026-09-01` | 4 | 486 | #943 merged | 2026-09-01 · test(beauty): scope B1 profile locators | 3 | PR #943 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-repair-registration-feedback-2026-09-01` | 9 | 490 | #936 merged | 2026-09-01 · fix(connect): strengthen equipment selection touch targets | 2 | PR #936 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-repair-owner-context-nav-2026-08-31` | 3 | 490 | #934 merged | 2026-08-31 · test(connect): protect Repair Shop owner context nav | 3 | PR #934 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-private-pearl-shell-fresh-2026-08-31` | 6 | 490 | #930 merged | 2026-08-31 · test(connect): lock Pearl base and Obsidian decision hierarchy | 3 | PR #930 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-account-switcher-unified-api-2026-08-30` | 2 | 490 | #910 merged | 2026-08-31 · test(connect): mock unified account portfolio in browser flows | 4 | PR #910 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-sep15-browser-contract-2026-08-31` | 1 | 491 | #931 merged | 2026-08-31 · test(connect): align Sep15 Repair Shop browser policy with current offer | 1 | PR #931 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/london-uk-growth-cluster` | 79 | 522 | #913 merged | 2026-08-31 · test(connect): align free launch e2e with post-deadline billing policy | 1 | PR #913 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-account-api-2026-08-30` | 1 | 524 | #907 merged | 2026-08-30 · feat(connect): add unified authenticated account portfolio API | 3 | PR #907 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/academy-russian-private-current-main-2026-08-30` | 8 | 529 | #909 merged | 2026-08-30 · test(academy): prove single canonical RU runtime mount | 2 | PR #909 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/hermes-vertical-design-tokens-current-main-2026-08-30` | 1 | 530 | #906 merged | 2026-08-30 · feat(brand): restore canonical Hermes vertical accent tokens | 0 | PR #906 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-account-portfolio-2026-08-30` | 4 | 534 | #902 merged | 2026-08-30 · fix(connect): localize account portfolio from runtime query locale | 2 | PR #902 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/russian-route-integrity-2026-08-30` | 25 | 533 | #898 merged | 2026-08-30 · merge current main into Russian route integrity after Intel bootstrap | 1 | PR #898 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-public-truth-2026-08-30` | 2 | 534 | #901 merged | 2026-08-30 · test(connect): align current Technology validator with live pilot truth | 0 | PR #901 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-fcc-intel-macos-bootstrap-v2` | 7 | 535 | #900 merged | 2026-08-30 · test(ai): accept Markdown formatting around pinned OpenSSL version | 1 | PR #900 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-ai-ru-account-shell-2026-08-30` | 3 | 536 | #899 merged | 2026-08-30 · fix(connect): localize AI Assistant and align private workspace theme | 3 | PR #899 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/ai-connect-v1-shell` | 3 | 575 | #880 merged | 2026-08-28 · feat(connect): wire AI Connect owner navigation | 5 | PR #880 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/hermes-connect-ai-pilot-audit-2026-08-27` | 1 | 576 | #879 merged | 2026-08-27 · docs(ai): record post-merge pilot blocker | 0 | PR #879 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/gmail-signature-rollout-2026-08-26` | 1 | 579 | #875 merged | 2026-08-26 · docs: add Gmail signature rollout package | 1 | PR #875 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/hermes-autonomy-policy-2026-08-26` | 1 | 580 | #874 merged | 2026-08-26 · docs(ai): define Hermes autonomy policy | 0 | PR #874 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-shops-ru-audit-2026-08-26` | 1 | 581 | #873 merged | 2026-08-26 · fix(connect): localize Russian owner dashboard states | 3 | PR #873 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `chore/codex-hermes-fcc-router-2026-08-25` | 3 | 582 | #860 merged | 2026-08-25 · docs(ai): record Hermes Codex routed runtime decision | 1 | PR #860 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-connect-russian-full-2026-08-24` | 4 | 621 | #854 merged | 2026-08-24 · test: align Connect language switch contract with Russian content | 4 | PR #854 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/ceo-refresh-academy-readback-2026-08-23` | 1 | 643 | #829 merged | 2026-08-23 · fix(connect): verify Academy learner readback shape | 0 | PR #829 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/ceo-refresh-artifact-recovery-2026-08-23` | 2 | 648 | #826 merged | 2026-08-23 · test(connect): require bounded CEO QA recovery | 1 | PR #826 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/ceo-profile-refresh-via-production-api-2026-08-23` | 2 | 649 | #825 merged | 2026-08-23 · test(connect): require API-based CEO profile refresh | 1 | PR #825 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-connect-russian-hub-2026-08-23` | 10 | 682 | #818 merged | 2026-08-23 · test(connect): preserve RU into Academy entry | 4 | PR #818 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/home-mobile-connect-ru-2026-08-23` | 5 | 696 | #811 merged | 2026-08-23 · fix(home): preserve gradient contact-shell contract | 0 | PR #811 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `finish/password-reset-timing-current-main-v2` | 3 | 697 | #807 merged | 2026-08-23 · test(auth): run password recovery contract with TS stripping | 1 | PR #807 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-first5-plan-attribution-2026-08-22` | 3 | 699 | #803 merged | 2026-08-23 · test: fix First-5 attribution payload typing | 2 | PR #803 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-secondary-alert-locales-2026-08-22` | 3 | 700 | #802 merged | 2026-08-22 · test(repair): use DOM-safe class mutation | 2 | PR #802 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-owner-locale-parity-2026-08-22` | 9 | 701 | #801 merged | 2026-08-22 · fix(repair): make secondary locale observer idempotent | 3 | PR #801 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-academy-a3-1-support-final-2026-08-19` | 11 | 745 | #759 merged | 2026-08-19 · feat(academy): expose private support entry points | 8 | PR #759 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/academy-uk-marketing-final-2026-08-19` | 7 | 745 | #758 merged | 2026-08-19 · seo(academy): add Ukrainian Marketing sitemap owner | 1 | PR #758 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-connect-beauty-b1-final-2026-08-19` | 6 | 748 | #757 merged | 2026-08-19 · test(connect): guard Beauty B1 backend boundaries | 1 | PR #757 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/academy-application-analytics-2026-08-19` | 4 | 752 | #747 merged | 2026-08-19 · test(analytics): guard Academy funnel attribution privacy | 1 | PR #747 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-connect-service-context-current-main-2026-08-19` | 8 | 752 | #740 merged | 2026-08-19 · test(connect): guard shared service context compatibility | 2 | PR #740 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/repair-first5-scorecard-current-main-2026-08-19` | 1 | 752 | #733 merged | 2026-08-19 · docs(connect): strengthen first-5 Repair Shop operating scorecard | 0 | PR #733 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/academy-uk-application-surface-2026-08-19` | 5 | 752 | #732 merged | 2026-08-19 · test(academy): guard Ukrainian application funnel | 1 | PR #732 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/connect-repair-plan-attribution-2026-08-19` | 2 | 757 | #726 merged | 2026-08-19 · test(connect): guard repair plan product attribution | 0 | PR #726 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/academy-uk-application-shell-main-2026-08-19` | 2 | 768 | #719 merged | 2026-08-19 · test(academy): guard Ukrainian application shell localization | 1 | PR #719 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/academy-reciprocal-hreflang-main-2026-08-19` | 2 | 768 | #718 merged | 2026-08-19 · test(seo): guard reciprocal Academy hreflang | 1 | PR #718 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/100-task-batch-2026-08-18` | 13 | 781 | #692 merged | 2026-08-18 · seo(logistics): register Texas Florida California research only | 2 | PR #692 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/hermes-framework-canonical-llms-short-2026-08-18` | 15 | 820 | #670 merged | 2026-08-18 · test(geo): distinguish negative from affirmative guarantees | 0 | PR #670 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/hermes-connect-owner-qa-cleanup` | 2 | 817 | #675 merged | 2026-08-18 · ops(connect): remove one-time CEO owner QA workflow | 2 | PR #675 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/hermes-connect-owner-qa-secure-handoff` | 1 | 818 | #674 merged | 2026-08-18 · ops(connect): add encrypted CEO credential handoff | 1 | PR #674 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/hermes-connect-owner-qa-provision-fix` | 1 | 819 | #673 merged | 2026-08-18 · fix(connect): complete persistent owner QA provisioning | 1 | PR #673 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/hermes-connect-owner-qa-provision` | 2 | 820 | #672 merged | 2026-08-18 · ops(connect): add gated CEO owner QA provision workflow | 2 | PR #672 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-design-recovery-main` | 2 | 824 | #647 merged | 2026-08-18 · test(home): align final polish animation contract | 4 | PR #647 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-academy-a4-discoverability` | 2 | 822 | #662 merged | 2026-08-18 · test(academy): lock A4 workspace discovery paths | 2 | PR #662 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-academy-a4-progression-completion` | 1 | 823 | #656 merged | 2026-08-18 · feat(academy): add human-controlled A4 progression evidence | 7 | PR #656 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-academy-a3-submission-review` | 19 | 824 | #654 merged | 2026-08-18 · test(academy): use unique reviewer name selector | 9 | PR #654 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-technology-public-refresh` | 4 | 894 | #626 merged | 2026-08-17 · test(technology): guard refreshed public system | 0 | PR #626 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-academy-public-system` | 4 | 897 | #621 merged | 2026-08-17 · test(academy): respect responsive learning radii | 0 | PR #621 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-marketing-public-system` | 4 | 897 | #620 merged | 2026-08-17 · test(marketing): respect responsive growth radius | 0 | PR #620 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-logistics-public-system` | 4 | 897 | #619 merged | 2026-08-17 · test(logistics): respect responsive workspace radii | 0 | PR #619 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-public-path-shell` | 8 | 898 | #618 merged | 2026-08-17 · test(paths): respect responsive media radius | 0 | PR #618 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-site-system-01` | 8 | 1037 | #588 merged | 2026-08-16 · test(design): guard compact single-DOM mobile footer | 0 | PR #588 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo14/repair-shop-search-entry-v1` | 1 | 1038 | #583 merged | 2026-08-16 · seo(repair-shops): align fresh redesign with U.S. search intent | 1 | PR #583 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-knot-core-production` | 5 | 1075 | #576 merged | 2026-08-16 · test(connect): lock header polish compatibility selector | 3 | PR #576 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-host-canonical-compat-current-main` | 5 | 1076 | #573 merged | 2026-08-16 · merge main into compatibility routing branch | 2 | PR #573 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `design/hermes-connect-safe-polish-01` | 14 | 1077 | #570 merged | 2026-08-16 · design(connect): align product header with pearl surfaces | 4 | PR #570 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-multilingual-onboarding` | 2 | 1078 | #571 merged | 2026-08-16 · test(connect): cover multilingual repair shop onboarding | 2 | PR #571 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/hermes-connect-runtime-status-2026-08-16` | 1 | 1079 | #565 merged | 2026-08-16 · docs(connect): record canonical runtime status | 0 | PR #565 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/repair-auth-mode-cleanup` | 2 | 1080 | #563 merged | 2026-08-16 · test(connect): cover direct repair auth mode | 2 | PR #563 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/hermes-connect-product-family-hardening` | 36 | 1081 | #562 merged | 2026-08-16 · fix(connect): remove stale beta wording from shared header launcher | 21 | PR #562 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/hermes-connect-ux-i18n-stabilization` | 13 | 1084 | #560 merged | 2026-08-16 · test(connect): align product overview with canonical Repair Shop entry | 5 | PR #560 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-connect-pilot-ready` | 4 | 1088 | #557 merged | 2026-08-16 · test(connect): expect Repair Shop pilot as canonical site entry | 2 | PR #557 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-shop-live-offer-rebased` | 5 | 1087 | #558 merged | 2026-08-16 · test(repair-shops): verify live partner offer delivery in browser | 2 | PR #558 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/connect-entry-ci-hotfix` | 1 | 1085 | #559 merged | 2026-08-16 · test(connect): align entry assertion with accessible label | 1 | PR #559 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-private-sales-attribution` | 8 | 1089 | #555 merged | 2026-08-16 · test(repair-shops): keep owner signup alive when attribution write fails | 3 | PR #555 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-booking-growth-lead` | 14 | 1089 | #553 merged | 2026-08-16 · test(repair-shops): capture growth request id explicitly | 2 | PR #553 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-private-beta-feedback` | 2 | 1090 | #552 merged | 2026-08-16 · test(repair-shops): cover private feedback flow | 6 | PR #552 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/android-release-boundary` | 3 | 1092 | #550 merged | 2026-08-15 · docs(connect): link Android release cleanup PR | 2 | PR #550 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/connect-current-state-2026-08-15` | 1 | 1093 | #549 merged | 2026-08-15 · docs(connect): reconcile canonical production state | 0 | PR #549 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `cleanup/connect-retired-runtime-labels` | 1 | 1094 | #548 merged | 2026-08-15 · chore(connect): remove retired runtime labels | 1 | PR #548 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-customer-crm-next-appointment` | 2 | 1097 | #545 merged | 2026-08-15 · test(connect): always clean CRM production smoke data | 2 | PR #545 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-customer-crm` | 26 | 1098 | #544 merged | 2026-08-15 · test(connect): gate customer CRM on desktop and mobile browsers | 9 | PR #544 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-booking-vehicle-data` | 12 | 1099 | #543 merged | 2026-08-15 · test(connect): align real booking browser contract with vehicle capture | 10 | PR #543 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-cancel-rebook-smoke-isolation` | 2 | 1100 | #542 merged | 2026-08-15 · test(connect): isolate cancel-rebook production smoke identity | 2 | PR #542 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-cancel-rebook-v2` | 2 | 1101 | #541 merged | 2026-08-15 · test(connect): verify cancelled slot rebooking behind exact Pages gate | 1 | PR #541 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-booking-smoke-runtime-gate` | 2 | 1102 | #540 merged | 2026-08-15 · fix(connect): gate production booking smoke on exact Pages deploy | 2 | PR #540 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-booking-status-history` | 8 | 1103 | #538 merged | 2026-08-15 · test(connect): cover owner booking status and history browser flow | 7 | PR #538 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-real-booking-loop` | 17 | 1104 | #537 merged | 2026-08-15 · test(connect): verify public busy feed exposes intervals only | 8 | PR #537 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `cleanup/connect-canonical-doc-links` | 1 | 1095 | #547 merged | 2026-08-15 · docs(connect): point active guidance to canonical runtime | 0 | PR #547 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-owner-availability` | 7 | 1105 | #536 merged | 2026-08-15 · chore(connect): register repair availability route in release manifest | 5 | PR #536 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-shop-profile-d1-schema-init` | 1 | 1112 | #535 merged | 2026-08-15 · fix(connect): initialize repair shop D1 schema with prepared statements | 0 | PR #535 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-profile-runtime` | 4 | 1114 | #534 merged | 2026-08-15 · feat(connect): add real shop profile and public link to owner workspace | 2 | PR #534 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/repair-shop-services-runtime` | 5 | 1121 | #533 merged | 2026-08-15 · fix(connect): route authenticated shop owners to real workspace | 3 | PR #533 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/repair-shop-auth-db-guard` | 8 | 1130 | #532 merged | 2026-08-15 · chore(release): register repair shop owner auth route | 2 | PR #532 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo14-job-apply-compliance` | 8 | 1174 | #519 merged | 2026-08-14 · SEO14: test real JobPosting submission governance | 2 | PR #519 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo14-authority-registry-refresh` | 3 | 1174 | #517 merged | 2026-08-14 · Cleanup accidental placeholder on refresh branch | 0 | PR #517 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `recruiting-growth-loop-phase1` | 14 | 1179 | #514 merged | 2026-08-14 · Fix careers Playwright locator strictness | 2 | PR #514 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/connect-access-route-final` | 4 | 1182 | #506 merged | 2026-08-13 · Add Connect request access routing test | 0 | PR #506 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/connect-site-shell-entry-current` | 2 | 1185 | #503 merged | 2026-08-13 · test: lock persistent Hermes Connect site-shell entry | 1 | PR #503 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/seo13-load-board-connect-handoff` | 1 | 1189 | #499 merged | 2026-08-13 · SEO13: connect Load Board to Load Analyzer | 0 | PR #499 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `release/hermes-connect-app-launch-v1` | 8 | 1190 | #498 merged | 2026-08-13 · fix: preserve two Web App access CTAs while exposing workspace | 2 | PR #498 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-connect-mobile-web-v2` | 2 | 1192 | #495 merged | 2026-08-13 · test: guard Hermes Connect Mobile V2 visual contract | 1 | PR #495 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo13/load-board-canonical-owner-v3` | 2 | 1193 | #493 merged | 2026-08-13 · docs: record Load Board canonical owner on current main | 1 | PR #493 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-connect-web-product-v1` | 14 | 1196 | #487 merged | 2026-08-13 · fix: register animated workspace V2 in release manifest delta | 3 | PR #487 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feature/hermes-sales-roleplay-web-spike` | 3 | 1208 | #484 merged | 2026-08-13 · docs: add founder outreach and 15-minute audit playbook | 0 | PR #484 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/hermes-connect-brand-prompts-v1` | 3 | 1225 | #481 merged | 2026-08-13 · docs: record Antigravity prototype integration status | 0 | PR #481 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/hermes-connect-brand-approved-v1` | 3 | 1226 | #479 merged | 2026-08-13 · docs: record approved Hermes Connect brand direction | 0 | PR #479 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo12/load-board-dual-entry-v2` | 2 | 1312 | #429 merged | 2026-08-12 · SEO12: keep carrier role accessible name static | 1 | PR #429 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `human-copy/academy-learning-method` | 3 | 1315 | #425 merged | 2026-08-12 · Test: cover Academy levels and practice loop | 1 | PR #425 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo11/customer-proof-eligibility` | 2 | 1318 | #420 merged | 2026-08-12 · SEO11: align customer proof registry CSV | 0 | PR #420 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo11/proof-candidate-selection-status-v2` | 4 | 1323 | #416 merged | 2026-08-12 · SEO11: sync verified historic carrier relationship | 0 | PR #416 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/connect-agent-readiness-current-main` | 2 | 1327 | #406 merged | 2026-08-12 · Docs: add Hermes Connect API inventory on current main | 0 | PR #406 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo11/authority-registry-v2` | 1 | 1331 | #400 merged | 2026-08-12 · Add public-safe authority opportunity registry | 0 | PR #400 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/connect-markdown-negotiation` | 2 | 1334 | #396 merged | 2026-08-12 · Connect: negotiate Markdown for AI agents | 0 | PR #396 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo11/proof-registry-362` | 2 | 1352 | #363 merged | 2026-08-11 · SEO11: add machine-readable proof registry | 0 | PR #363 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `conversion/marketing-academy-cta-copy` | 2 | 1372 | #337 merged | 2026-08-11 · Add regression coverage for path CTA copy | 0 | PR #337 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/finish-hermes-connect` | 12 | 1525 | #283 merged | 2026-08-05 · Hermes Connect: align site bridge browser contract with ten categories | 4 | PR #283 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/connect-production-verifier-command` | 1 | 1605 | #255 merged | 2026-08-05 · Add issue-command production verifier for Hermes Connect | 0 | PR #255 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/connect-host-routing` | 4 | 1606 | #254 merged | 2026-08-05 · ci: verify Connect host routing after merge | 0 | PR #254 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `docs/reconcile-hermes-connect-readme-v2` | 1 | 1610 | #249 merged | 2026-08-04 · Docs: reconcile Hermes Connect repository release status | 0 | PR #249 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/load-board-evergreen-demo-labels` | 8 | 1612 | #246 merged | 2026-08-04 · Tests: gate crawler-visible evergreen Load Board HTML | 1 | PR #246 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/hermes-connect-conversion-accessibility` | 3 | 1617 | #242 merged | 2026-08-04 · Tests: use explicit Playwright Page type | 1 | PR #242 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `ops/connect-post-merge-verification` | 4 | 1629 | #236 merged | 2026-08-04 · Ops: use release-pending verification before merge | 0 | PR #236 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/hermes-connect-download-funnel` | 42 | 1636 | #234 merged | 2026-08-04 · test(connect): verify visible mobile site bridge | 4 | PR #234 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/customer-recommendations-direct-intake` | 2 | 1638 | #227 merged | 2026-08-04 · Tests: keep customer recommendations on direct intake | 0 | PR #227 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo5/live-custom-domain-reconciliation` | 6 | 1641 | #224 merged | 2026-08-04 · fix: require current release marker without hiding live lag | 0 | PR #224 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo5/production-analytics-event-registry` | 1 | 1648 | #212 merged | 2026-08-04 · docs: inventory production analytics events and verification gaps | 0 | PR #212 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo5/hermes-commercial-rebuild-case-draft` | 1 | 1655 | #209 merged | 2026-08-04 · docs: draft evidence-gated Hermes commercial rebuild case | 0 | PR #209 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `feat/academy-application-review-clarity` | 2 | 1656 | #207 merged | 2026-08-04 · Tests: lock Academy application review clarity | 1 | PR #207 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `agent/seo4-customer-transport-intake` | 16 | 1689 | #179 merged | 2026-08-04 · SEO-4: avoid repeating carrier demo in final CTA | 0 | PR #179 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `content/website-social-crm-system` | 2 | 1708 | #170 merged | 2026-08-03 · Test connected growth system expansion | 0 | PR #170 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/academy-home-contract` | 7 | 1710 | #168 merged | 2026-08-03 · Correct lead delivery architecture finding | 1 | PR #168 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `seo/entity-split-hermes-progressopro` | 6 | 1714 | #148 merged | 2026-08-03 · Run public entity registry checks in CI | 0 | PR #148 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `distribution/social-preview-release-a` | 8 | 1715 | #147 merged | 2026-08-03 · Block formatted authority identifiers in UTM variants | 0 | PR #147 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `content/social-to-site-pipeline-release-a` | 19 | 1716 | #146 merged | 2026-08-03 · Use semantic entity selectors in content pipeline tests | 0 | PR #146 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `academy/public-subsite-phase-1` | 17 | 1717 | #145 merged | 2026-08-03 · Include Academy qualification in preview handoff | 1 | PR #145 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `marketing/carrier-qualification-current-main` | 4 | 1741 | #115 merged | 2026-08-01 · Align zero-delivery assertion with qualified preview | 1 | PR #115 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `marketing/outreach-crm-foundation` | 2 | 1746 | #108 merged | 2026-08-01 · Marketing: add outreach operating playbook | 0 | PR #108 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `hotfix/dynamic-load-board-test-dates` | 3 | 1754 | #95 merged | 2026-08-01 · chore: keep Load Board date hotfix scoped | 1 | PR #95 merged, but branch still has unique commits. |
| POST_MERGE_OR_SUPERSEDED | `fix/restore-journey-anchor` | 2 | 2041 | #7 merged | 2026-07-30 · docs: log #journey anchor fix in AI_HANDOFF.mdRestore #journey anchor in AI Handoff Log | 0 | PR #7 merged, but branch still has unique commits. |
| STALE_DONOR_REVIEW | `repair/crm-routes-appointments-customer` | 3 | 250 | — | 2026-09-05 · feat(repair): turn Customers into routed CRM customer detail | 3 | Unique code exists but branch is 250 main commits behind. |
| STALE_DONOR_REVIEW | `car-hauling/allow-ingest-hold-outreach` | 3 | 252 | — | 2026-09-04 · feat(load-board): allow car-hauling ingestion while outreach stays held | 5 | Unique code exists but branch is 252 main commits behind. |
| STALE_DONOR_REVIEW | `feature/loadboard-email-forwarding-1074` | 9 | 261 | — | 2026-09-04 · Cover IT header label and Load Board product UX | 1 | Unique code exists but branch is 261 main commits behind. |
| STALE_DONOR_REVIEW | `feat/academy-russian-public-funnel-2026-08-31` | 4 | 490 | — | 2026-08-31 · feat(academy): add Russian Marketing program | 0 | Unique code exists but branch is 490 main commits behind. |
| STALE_DONOR_REVIEW | `fix/repair-private-pearl-shell-fresh-2026-08-31-copy` | 5 | 491 | — | 2026-08-31 · docs(connect): record fresh Pearl replay provenance | 2 | Unique code exists but branch is 491 main commits behind. |
| STALE_DONOR_REVIEW | `tmp-noop-check` | 3 | 491 | — | 2026-08-31 · test(connect): preserve Sep15 gate while adding Pearl private UI contract | 2 | Unique code exists but branch is 491 main commits behind. |
| STALE_DONOR_REVIEW | `design/hermes-connect-option02-launch` | 11 | 521 | — | 2026-08-31 · docs(design): add iteration quality learning loop | 1 | Unique code exists but branch is 521 main commits behind. |
| STALE_DONOR_REVIEW | `fix/academy-russian-private-2026-08-30` | 2 | 531 | — | 2026-08-30 · test(academy): guard Russian private workspace locale boundaries | 1 | Unique code exists but branch is 531 main commits behind. |
| STALE_DONOR_REVIEW | `seo/academy-uk-application-shell-2026-08-19` | 4 | 779 | — | 2026-08-19 · test(academy): guard Ukrainian application shell labels and payload | 2 | Unique code exists but branch is 779 main commits behind. |
| STALE_DONOR_REVIEW | `qa/hermes-design-screenshots-c550d2a` | 18 | 947 | — | 2026-08-17 · qa(design): capture screenshots for current visual fixes | 3 | Unique code exists but branch is 947 main commits behind. |
| STALE_DONOR_REVIEW | `qa/hermes-design-screenshots-860ff51` | 13 | 947 | — | 2026-08-17 · qa(design): capture screenshot evidence for current design head | 3 | Unique code exists but branch is 947 main commits behind. |
| STALE_DONOR_REVIEW | `feature/repair-shop-web-v1-complete` | 10 | 1025 | — | 2026-08-17 · fix(test): use explicit weekday time locators | 4 | Unique code exists but branch is 1025 main commits behind. |
| STALE_DONOR_REVIEW | `docs/hermes-connect-runtime-state-2026-08-16` | 1 | 1079 | — | 2026-08-16 · docs(connect): record canonical runtime and legacy boundary | 0 | Unique code exists but branch is 1079 main commits behind. |
| STALE_DONOR_REVIEW | `feature/repair-shop-availability-runtime-v2` | 3 | 1112 | — | 2026-08-15 · feat(connect): add authenticated weekly availability API | 1 | Unique code exists but branch is 1112 main commits behind. |
| STALE_DONOR_REVIEW | `agent/connect-access-fix-current` | 2 | 1182 | — | 2026-08-13 · Hermes Connect: keep request-access route minimal | 0 | Unique code exists but branch is 1182 main commits behind. |
| STALE_DONOR_REVIEW | `seo/academy-audience-roadmap` | 37 | 2042 | — | 2026-07-30 · fix localized partnership labels and hero loading hints | 0 | Unique code exists but branch is 2042 main commits behind. |
| EVIDENCE_OR_REPLAY_REVIEW | `fix/repair-company-schedule-layout-20260908-replay` | 1 | 14 | — | 2026-09-08 · style(repair): replay readable Company schedules on current main | 0 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `feat/connect-website-factory-design4-replay` | 3 | 420 | — | 2026-09-03 · feat(connect): add immutable Website Factory draft lifecycle and handoff | 0 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `proof/repair-paid-activation-production-2026-09-01` | 1 | 453 | — | 2026-09-01 · test(connect): add bounded paid activation production proof | 1 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `replay/pr-882-main-2026-08-28` | 3 | 574 | — | 2026-08-28 · replay(test): restore AI Connect project browser contract on current main | 3 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `backup/pr-885-pre-clean-replay-2026-08-28` | 35 | 575 | — | 2026-08-28 · chore(connect): settle cabinet after foundation merge | 10 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `backup/pr-887-pre-clean-replay-2026-08-28` | 28 | 575 | — | 2026-08-28 · test(connect): cover internal AI activity history | 14 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `backup/pr-886-pre-clean-replay-2026-08-28` | 23 | 575 | — | 2026-08-28 · chore(connect): sync cabinet browser evidence from base | 11 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| EVIDENCE_OR_REPLAY_REVIEW | `backup/pr-882-pre-main-replay-2026-08-28` | 6 | 575 | — | 2026-08-28 · test(connect): disambiguate AI project runtime locators | 5 | Name indicates evidence/replay/archive lineage; never merge wholesale. |
| MERGED_OR_CONTAINED | `fix/repair-synthetic-first-load-hydration-20260908` | 0 | 17 | #1160 merged | 2026-09-08 · test(repair): lock synthetic first-load hydration | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/repair-synthetic-owner-hydration-20260908` | 0 | 15 | #1159 merged | 2026-09-08 · test(repair): follow normalized hydration result | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/repair-company-schedule-layout-20260908` | 0 | 13 | #1158 merged | 2026-09-08 · Merge current main into Company schedule polish | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/repair-synthetic-loadtest-20260908` | 0 | 21 | #1156 merged | 2026-09-08 · fix(repair): honor verified synthetic flags before demo hydration | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/repair-company-team-schedule-20260908` | 0 | 36 | #1155 merged | 2026-09-08 · test(repair): preserve no-show capacity semantics with staff booking | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/repair-register-entry-mode` | 0 | 57 | #1146 merged | 2026-09-07 · Test Repair register entry mode | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-p0-booking-option-proof-20260907` | 0 | 60 | #1144 merged | 2026-09-07 · Repair P0 proof: verify Booking options by service identity | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-p0-proof-current-ux-20260907` | 0 | 63 | #1142 merged | 2026-09-07 · HC: align Repair P0 v2 proof with current workspace copy | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/repair-registration-ga4-post-body-proof-replay-20260907` | 0 | 66 | #1140 merged | 2026-09-07 · SEO: replay GA4 POST collect verifier on current main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-p0-proof-v2-replay-20260907` | 0 | 68 | #1138 merged | 2026-09-07 · HC: rebase Repair Shop P0 proof v2 onto exact current main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/repair-registration-ga4-production-proof-20260907` | 0 | 70 | #1137 merged | 2026-09-07 · SEO: prove Repair registration completion reaches GA4 | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/repair-registration-complete-20260907` | 0 | 72 | #1135 merged | 2026-09-07 · SEO: verify Repair completion across auth navigation | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-three-services-proof-20260907` | 0 | 81 | — | 2026-09-07 · Merge pull request #1133 from officeus-create/seo/load-board-live-demo-truth-20260907 | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/load-board-live-demo-truth-20260907` | 0 | 89 | #1133 merged | 2026-09-07 · SEO: align car hauling browser title with Load Board truth | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-p0-live-proof-closure-20260907` | 0 | 91 | #1134 merged | 2026-09-07 · test(hc): add command-gated repair P0 production closure proof | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/repair-access-proof-argv-20260907` | 0 | 95 | #1132 merged | 2026-09-07 · HC: replay access-proof workflow after GA4 merge | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/repair-arkansas-first5-geo-20260907` | 0 | 102 | #1131 merged | 2026-09-07 · SEO: separate Repair pilot GEO from automotive P0 | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-booking-founding-plan-20260907` | 0 | 108 | #1129 merged | 2026-09-07 · fix(hc): preserve booking English receipt contracts | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hc/repair-shops-localization-wave-20260907` | 0 | 115 | #1128 merged | 2026-09-07 · test(hermes-connect): gate Design OS ownership across every built route | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `web10/academy-five-track-copy-cleanup-20260906` | 0 | 145 | #1119 merged | 2026-09-06 · WEB 10: reject retired two-program Academy copy | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `web10/site-plan-structure-academy-20260906` | 0 | 156 | #1116 merged | 2026-09-06 · Preserve department accent in lazy mobile submenu | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `repair/settings-workspace-fresh-main` | 0 | 214 | #1109 merged | 2026-09-05 · Repair CRM: fresh-main Settings workspace | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `brand/hermes-connect-option02-pwa-icon` | 0 | 230 | — | 2026-09-05 · Repair CRM: add owner Services workspace (#1105) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `repair/vehicles-workspace-v1` | 0 | 233 | #1102 merged | 2026-09-05 · chore(release): register private Vehicles workspace | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/load-board-carrier-current-main-20260905` | 0 | 248 | — | 2026-09-05 · test(analytics): make consent smoke host-aware (#1099) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-connect-social-card-p4` | 0 | 279 | #1049 merged | 2026-09-03 · fix(design): make social card generator Node ESM-resolvable | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/hermes-connect-pwa-cache-safety-2026-09-03` | 0 | 300 | #1043 merged | 2026-09-03 · chore: sync current main into PWA cache-safety fix | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `rework/hr-design4-current-main-2026-09-03` | 0 | 306 | #1042 merged | 2026-09-03 · ci(hr): add independent backend security gate | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `replay/hermes-connect-hr-design4-2026-09-03` | 0 | 324 | — | 2026-09-03 · Merge PR #1040: reconcile Hermes Design source of truth | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `rework/connect-website-factory-design4-2026-09-03` | 0 | 330 | #1033 merged | 2026-09-03 · fix(factory): make Russian runtime normalization idempotent | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/repair-public-private-navigation` | 0 | 366 | #1028 merged | 2026-09-03 · design(repair): final replay public/private IA after London QA merge | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/connect-capability-geo-entity-clarity` | 0 | 370 | #1026 merged | 2026-09-03 · fix(geo): replay capability hierarchy after Academy handoff merge | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/academy-learner-handoff-seo-safe` | 0 | 372 | #1025 merged | 2026-09-03 · design(academy): replay learner handoff after RU Academy merge | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/academy-ru-lesson-content-2026-09-01` | 0 | 461 | #954 merged | 2026-09-03 · fix(academy): localize platform distribution summaries | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `test/repair-access-state-production-proof-2026-09-01` | 0 | 436 | #981 merged | 2026-09-01 · test(repair): guard access transition against main races | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-mobile-nav-contrast-2026-09-01` | 0 | 456 | #972 merged | 2026-09-01 · test(connect): target canonical mobile navigation link | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-customers-safe-mobile-2026-09-01` | 0 | 460 | #968 merged | 2026-09-01 · rebase(connect): replay Customers hardening on current main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-repair-owner-signin-entry-2026-09-01` | 0 | 469 | #958 merged | 2026-09-01 · test(connect): disambiguate canonical repair shop register link | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/connect-beauty-b11-owner-controls-v2-2026-09-01` | 0 | 483 | — | 2026-09-01 · feat(connect): expose owner sign-in and add weekly inactivity reminders | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-option02-global-launcher-2026-08-31` | 0 | 490 | — | 2026-08-31 · test(connect): make Sep15 Repair Shop browser contract time-stable | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-repair-a11y-touch-targets-2026-09-01` | 0 | 490 | — | 2026-08-31 · test(connect): make Sep15 Repair Shop browser contract time-stable | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-repair-audit-verified-ux-2026-09-01` | 0 | 490 | — | 2026-08-31 · test(connect): make Sep15 Repair Shop browser contract time-stable | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-repair-verified-gemini-quickwins-2026-09-01` | 0 | 490 | — | 2026-08-31 · test(connect): make Sep15 Repair Shop browser contract time-stable | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/hermes-connect-option02-fresh-main` | 0 | 499 | #929 merged | 2026-08-31 · test(connect): fail visual evidence on body-level mobile overflow | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/connect-free-registration-sep15-2026` | 0 | 514 | #928 merged | 2026-08-31 · test(connect): protect Sep 15 registration gate at shop creation | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/academy-russian-private-main-2026-08-30` | 0 | 530 | — | 2026-08-30 · feat(connect): expose shared account portfolio across private workspaces | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/connect-account-portfolio-main-2026-08-30` | 0 | 531 | — | 2026-08-30 · fix(i18n): preserve Russian across site routes and Hermes Connect | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feat/hermes-ai-benchmark` | 0 | 560 | #862 merged | 2026-08-29 · fix(ai): classify Linux benchmark scope | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `test/academy-production-readonly-smoke-2026-08-24` | 0 | 590 | #858 merged | 2026-08-24 · test(academy): add read-only production smoke | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/academy-marketing-first-lesson-2026-08-24` | 0 | 592 | #857 merged | 2026-08-24 · test(academy): cover both complete learner courses | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `docs/academy-asset-reconciliation-2026-08-24` | 0 | 610 | #855 merged | 2026-08-24 · test(academy): cover enrolled lesson and evidence handoff | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-derived-overview-resume-2026-08-23` | 0 | 622 | #851 merged | 2026-08-24 · fix(connect): derive Today status from current booking state | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/academy-applied-state-copy-2026-08-23` | 0 | 637 | — | 2026-08-23 · geo: preserve governed AI observation protocol and ledger | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-profile-pearl-polish-2026-08-23` | 0 | 653 | #822 merged | 2026-08-23 · test(connect): assert Pearl-first private workspace | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `chore/repair-production-smoke-evidence-2026-08-23` | 0 | 673 | #820 merged | 2026-08-23 · ci(connect): publish sanitized Repair Shop production smoke result | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `chore/hermes-connect-launch-gates-cleanup-2026-08-23` | 0 | 675 | #819 merged | 2026-08-23 · ci(connect): allow owner-triggered Repair Shop production smoke | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-owner-p0-current-main-2026-08-22` | 0 | 702 | #800 merged | 2026-08-22 · fix(repair): avoid owner P0 href mutation loop | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/academy-journey-final-2026-08-21` | 0 | 718 | #781 merged | 2026-08-21 · fix(connect): connect Academy course to live evidence progression flow on current main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-connect-beauty-b1-final-v2-2026-08-19` | 0 | 745 | — | 2026-08-19 · feat(connect): finalize Beauty B1 backend on current main (#757) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/academy-market-wave-2-2026-08-19` | 0 | 757 | #720 merged | 2026-08-19 · docs(seo): add Academy 7/28-day measurement owner | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/academy-ukraine-preview-2026-08-18` | 0 | 787 | #684 merged | 2026-08-18 · ci(academy): remove one-off visual artifact upload after QA | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/hermes-reviewed-thin-exceptions-2026-08-18` | 0 | 802 | #679 merged | 2026-08-18 · seo: classify reviewed utility thin-page exceptions | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/hermes-contextual-link-gate-2026-08-18` | 0 | 804 | #678 merged | 2026-08-18 · seo: require contextual inbound links to money pages | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/hermes-performance-image-hygiene-2026-08-18` | 0 | 805 | — | 2026-08-18 · seo(hermes): protect measurement privacy boundary | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/hermes-measurement-privacy-contract-2026-08-18` | 0 | 806 | #677 merged | 2026-08-18 · ci(seo): surface analytics privacy regression early | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo/hermes-framework-fast-hygiene-2026-08-18` | 0 | 809 | #676 merged | 2026-08-18 · test(geo): protect extended entity disambiguation | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-academy-a2-curriculum-progress` | 0 | 825 | #652 merged | 2026-08-18 · fix(academy): scope static course paths inside prerender function | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-academy-a1-identity-enrollment` | 0 | 837 | #650 merged | 2026-08-18 · fix(academy): type enrollment test state | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-connect-academy-beauty-v1` | 0 | 852 | #642 merged | 2026-08-18 · test(connect): use Playwright Page type in module flow spec | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-operating-statuses` | 0 | 917 | #617 merged | 2026-08-17 · test(connect): cover persisted no-show localization | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/hermes-home-public-shell` | 0 | 899 | #612 merged | 2026-08-17 · design(home): converge Hermes homepage on Pearl public shell | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/hermes-repair-obsidian-workspace` | 0 | 901 | #609 merged | 2026-08-17 · design(repair): unify owner operations on Obsidian workspace system | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `design/hermes-unified-brand-system` | 0 | 942 | #607 merged | 2026-08-17 · test(design): assert founding plan hero isolation semantically | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-capacity-aware-booking` | 0 | 937 | #616 merged | 2026-08-17 · test(connect): gate Repair Shop capacity on production D1 | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-capabilities` | 0 | 943 | #615 merged | 2026-08-17 · feat(connect): rebase Repair Shop capabilities onto current main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/repair-shop-recovery-support-fallback` | 0 | 945 | #610 merged | 2026-08-17 · test(connect): cover recovery support fallback | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-password-recovery` | 0 | 948 | #608 merged | 2026-08-17 · fix(connect): localize reset password at runtime | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-web-v1-final` | 0 | 976 | #605 merged | 2026-08-17 · fix(test): distinguish page overflow from intentional nav scrolling | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-activation-v1` | 0 | 1010 | #584 merged | 2026-08-17 · fix(connect): keep free launch offer readable in auth card | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-access-state-v1` | 0 | 1028 | #594 merged | 2026-08-16 · test(connect): anchor trial start to shop creation | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-revenue-v1` | 0 | 1039 | #581 merged | 2026-08-16 · test(connect): align Repair Shop locale flow with revenue-first heading | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `docs/connect-runtime-status-reconcile` | 0 | 1065 | #580 merged | 2026-08-16 · docs(connect): redact legacy control-plane identifiers | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/connect-mobile-consent-cta` | 0 | 1068 | #578 merged | 2026-08-16 · test(connect): lock accessible consent touch targets | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/repair-shop-language-session-continuity` | 0 | 1077 | — | 2026-08-16 · feat(connect): multilingual Repair Shop owner onboarding (#571) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `agent/connect-auth-mode-direct` | 0 | 1080 | — | 2026-08-16 · refactor(connect): harden Hermes Connect product family (#562) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/repair-shop-availability-runtime` | 0 | 1113 | — | 2026-08-15 · feat(connect): real repair shop profile and public shop link | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `seo14-authority-registry-v2` | 0 | 1163 | — | 2026-08-14 · Fix carrier contract delivery to main Hermes mailbox (#526) | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-connect-runtime-unification` | 0 | 1131 | #529 merged | 2026-08-14 · chore: skip failing repair booking loop test | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `feature/hermes-connect-repair-shop-partner-beta` | 0 | 1162 | — | 2026-08-14 · feat(connect): deploy hermes-connect mobile and repair shop beta suite with full semantic schemas an | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `fix/hermes-connect-single-brand-v1` | 0 | 1186 | — | 2026-08-13 · fix: unify Hermes Connect on one Brand V1 shell | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `release/hermes-connect-mobile-v2-current-main` | 0 | 1191 | — | 2026-08-13 · SEO13: ship Logistics SEO existing-demand owner pass | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `release/connect-wave1-manifest-reconcile` | 0 | 1200 | #482 merged | 2026-08-13 · Release: reconcile Wave 1 registry on latest main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `release/connect-consent-analytics` | 0 | 1200 | #480 merged | 2026-08-13 · Hermes Connect: consent-gated GA4 measurement on latest main | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `release/connect-wave1-discovery-links` | 0 | 1219 | #478 merged | 2026-08-13 · Connect: update access regression for Live Tools hub | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `release/connect-wave1-production-smoke` | 0 | 1227 | #477 merged | 2026-08-13 · release: add Hermes Connect Wave 1 production smoke | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hermes-connect/logistics-seo-analyzer-mvp` | 0 | 1265 | #476 merged | 2026-08-13 · Hermes Connect: register Logistics SEO Analyzer noindex route | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hermes-connect/multi-car-planner-mvp` | 0 | 1265 | #474 merged | 2026-08-13 · Hermes Connect: register Multi-Car Planner noindex route | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hermes-connect/revenue-dashboard-mvp` | 0 | 1263 | #472 merged | 2026-08-13 · Hermes Connect: point Revenue Dashboard to canonical contacts route | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hermes-connect/search-opportunity-radar-mvp` | 0 | 1262 | #470 merged | 2026-08-13 · Hermes Connect: run Search Radar contract in repository tests | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `hermes-connect/load-analyzer-mvp` | 0 | 1263 | #468 merged | 2026-08-13 · Hermes Connect: register Load Analyzer noindex route | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `docs/carrier-contract-analytics-registry-delta` | 0 | 1495 | #294 merged | 2026-08-06 · Test: require carrier analytics registry delta | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `docs/hermes-ai-collaboration-system-v2` | 0 | 1510 | #290 merged | 2026-08-06 · Docs: add SEO current state and execution order | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `revenue/customer-transport-cta` | 0 | 1553 | #276 merged | 2026-08-05 · Revenue: add direct mobile actions to transport intake | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `academy/phase-1-subsite` | 0 | 1717 | — | 2026-08-03 · Research: gate Illinois and Texas logistics SEO pilots | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `reconcile/load-board-provider-boundaries` | 0 | 1761 | #81 merged | 2026-08-01 · Wire load-board boundary tests into CI | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `reconcile/shipment-history-lane-intelligence` | 0 | 1812 | #70 merged | 2026-08-01 · test: wire Shipment History and Lane Intelligence checks | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `growth/carrier-research-registry-128-138` | 0 | 1831 | #60 merged | 2026-08-01 · Merge PR #61: carrier language research queue | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `growth/transport-demand-registry-151-160` | 0 | 1834 | #63 merged | 2026-08-01 · Merge PR #64: transport demand publication gates | 0 | No commits unique versus current main. |
| MERGED_OR_CONTAINED | `growth/academy-careers-governance-191-200` | 0 | 1842 | #68 merged | 2026-08-01 · test: scope Academy FAQ assertions | 0 | No commits unique versus current main. |

## Unique-commit details (non-contained branches)

### fix/repair-company-nav-label-20260908

- Status: **ACTIVE_PR**; ahead 2, behind 2; PR #1161 open.
- Relevant files: `src/components/RepairShopOwnerNavEnhancer.astro`, `tests/repair-shop-settings.spec.ts`
- Latest unique commits:
  - ae1c35e3 2026-09-08T12:27:41Z fix(repair): label company workspace consistently
  - 0494a1a2 2026-09-08T07:27:31-05:00 chore(repair): stage one-shot Company nav patch

### fix/hc-locale-persistence-ru-20260908

- Status: **ACTIVE_PR**; ahead 10, behind 0; PR #1163 open.
- Relevant files: `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/settings.astro`, `tests/hermes-connect-mobile-nav-contrast.spec.ts`, `tests/repair-shop-settings.spec.ts`
- Latest unique commits:
  - 25027860 2026-09-08T08:38:54-05:00 chore: remove accidental audit placeholder
  - 9c4c0d6c 2026-09-08T08:38:23-05:00 chore: placeholder
  - ae84e882 2026-09-08T08:38:05-05:00 chore: remove accidental audit placeholder
  - 61ad561d 2026-09-08T08:37:42-05:00 chore: placeholder
  - a4accdc6 2026-09-08T08:37:27-05:00 chore: remove accidental audit placeholder

### fix/repair-company-localization-parity-20260908

- Status: **RECOVER_REVIEW**; ahead 6, behind 2; PR —.
- Relevant files: `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/settings.astro`, `tests/repair-shop-settings.spec.ts`
- Latest unique commits:
  - cd5a523e 2026-09-08T12:33:38Z fix(repair): complete Company localization parity
  - 2002ac51 2026-09-08T07:33:17-05:00 fix(repair): simplify localization one-shot runner
  - 028ada1b 2026-09-08T07:32:57-05:00 chore(repair): add localization patch script
  - 407d45a8 2026-09-08T07:30:58-05:00 chore(repair): stage one-shot Company localization patch
  - ae1c35e3 2026-09-08T12:27:41Z fix(repair): label company workspace consistently

### fix/hermes-connect-live-ru-20260908

- Status: **RECOVER_REVIEW**; ahead 2, behind 51; PR —.
- Relevant files: `public/hermes-connect-product-priority.js`, `tests/hermes-connect-hub-russian-runtime.spec.ts`
- Latest unique commits:
  - 482bf091 2026-09-08T03:57:36-05:00 test(hc): lock Russian Product Hub after shared runtime settles
  - 91538cf0 2026-09-08T03:57:09-05:00 fix(hc): keep Russian Product Hub stable on live runtime

### hc/repair-proof-shared-state-lock-20260907

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 59; PR #1145 closed.
- Relevant files: `.github/workflows/repair-p0-production-closure-command.yml`, `.github/workflows/repair-p0-production-proof-v2-command.yml`, `scripts/repair-owner-browser-production-smoke.mjs`, `scripts/repair-p0-production-proof-v2.mjs`
- Latest unique commits:
  - 75567434 2026-09-07T15:13:45-05:00 Repair P0 proof: replace stale v2 verifier on current main
  - 75a4a8b8 2026-09-07T15:13:32-05:00 Repair P0 proof: serialize and guard v2 state
  - 7a2974a1 2026-09-07T15:13:19-05:00 Repair P0 proof: serialize and guard closure state
  - 1e1fadb3 2026-09-07T15:13:04-05:00 Repair P0 proof: guard shared synthetic booking state
  - fbcdbf8a 2026-09-07T15:12:51-05:00 Repair P0 proof: follow current owner auth UX

### hc/repair-p0-proof-v2-heading-fix-replay-20260907

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 65; PR #1143 closed.
- Relevant files: `scripts/repair-p0-production-proof-v2.mjs`
- Latest unique commits:
  - 07c9e3e7 2026-09-07T14:12:49-05:00 HC: replay Repair Shop P0 v2 dashboard proof fix

### hc/repair-p0-proof-v2-heading-fix-20260907

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 67; PR #1141 closed.
- Relevant files: `scripts/repair-p0-production-proof-v2.mjs`
- Latest unique commits:
  - 9cf7db28 2026-09-07T12:11:00-05:00 Fix Repair Shop P0 v2 dashboard proof heading

### seo/repair-registration-ga4-post-body-proof-20260907

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 69; PR #1139 closed.
- Relevant files: `scripts/repair-owner-browser-production-smoke.mjs`
- Latest unique commits:
  - 5cf0e745 2026-09-07T11:47:34-05:00 SEO: verify GA4 completion in GET or POST collect payload

### hc/repair-p0-browser-redirect-proof-fix-20260907

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 81; PR #1136 closed.
- Relevant files: `.github/workflows/repair-p0-production-proof-v2-command.yml`, `.github/workflows/repair-p0-production-proof-v2-contract.yml`, `scripts/repair-p0-production-proof-v2-contract.test.mjs`, `scripts/repair-p0-production-proof-v2.mjs`
- Latest unique commits:
  - 08d3ace8 2026-09-07T11:03:35-05:00 HC: add PR gate for Repair Shop P0 proof v2
  - 06ea62db 2026-09-07T11:03:22-05:00 HC: add owner command for Repair Shop P0 production proof v2
  - 1824b388 2026-09-07T11:03:07-05:00 HC: add contract for Repair Shop P0 production proof v2
  - cad7290e 2026-09-07T11:02:32-05:00 HC: add bounded Repair Shop P0 production proof v2

### codex/repair-shops-product-polish-2026-09-06

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 135; PR #1123 closed.
- Relevant files: `src/pages/services/hermes-connect/repair-shops/auth.astro`, `tests/hermes-connect-repair-auth-mode.spec.ts`
- Latest unique commits:
  - e91633c2 2026-09-06T16:24:20-05:00 Polish Repair Shop owner signup and QA flow

### codex/logistics-menu-load-board-rotation-2026-09-06

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 135; PR #1122 closed.
- Latest unique commits:
  - c2c856c0 2026-09-06T15:54:28-05:00 feat: clarify logistics navigation and rotate load board demos

### fix/direction-order-academy-tracks-20260906

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 210; PR #1114 closed.
- Relevant files: `scripts/academy-public-contract.test.mjs`
- Latest unique commits:
  - b2be39ce 2026-09-06T04:21:23-05:00 test(academy): assert decoded visible track labels
  - d3424ab5 2026-09-06T04:18:56-05:00 test(academy): update public contract for five learning tracks
  - 8e6c9a47 2026-09-06T04:15:40-05:00 test(nav): lock direction order and Academy five-track truth
  - 59b09e43 2026-09-06T04:14:32-05:00 fix(nav): keep IT before Academy in shared header
  - cce8a30a 2026-09-06T04:12:26-05:00 feat(academy): expose five learning tracks with gated enrollment

### repair/settings-workspace-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 16, behind 230; PR #1108 closed.
- Relevant files: `.github/workflows/repair-shop-settings-contract.yml`, `docs/release-manifest-deltas/2026-09-06-hermes-connect-repair-settings.json`, `functions/api/repair-shop/profile.ts`, `scripts/repair-shop-settings-contract.test.mjs`, `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/settings.astro`, `tests/repair-shop-crm-shell.spec.ts`, `tests/repair-shop-settings.spec.ts`
- Latest unique commits:
  - 3875d35b 2026-09-05T20:49:44-05:00 Repair CRM: expand Settings gate paths
  - 90ddb843 2026-09-05T20:49:31-05:00 Repair CRM: lock global Settings contract
  - 7b005dee 2026-09-05T20:48:59-05:00 Repair CRM: cover global Settings profile
  - 9fcf8b47 2026-09-05T20:48:33-05:00 Repair CRM: make Settings global-ready
  - 9c5ab100 2026-09-05T20:47:41-05:00 Repair CRM: expose global shop location fields

### chatgpt/web-hl10-nav-fresh-main-20260905

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 231; PR #1103 closed.
- Relevant files: `tests/academy-subsite.spec.ts`, `tests/hermes-connect-mobile-nav-contrast.spec.ts`, `tests/load-board-product.spec.ts`
- Latest unique commits:
  - 1887b612 2026-09-05T16:20:05-05:00 Merge current main QA gate into WEB HL 10 navigation
  - ff24d883 2026-09-05T16:13:37-05:00 test: align mobile nav contrast contract with department accordions
  - 02f58b54 2026-09-05T13:21:02-05:00 test(nav): prevent first-visit consent overlap on mobile
  - e137be20 2026-09-05T13:20:44-05:00 fix(nav): keep mobile consent below department subnav
  - f68e4c09 2026-09-05T13:13:03-05:00 test(nav): target shared direction product navigation

### feature/unified-direction-nav-order

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 39, behind 256; PR #1086 closed.
- Relevant files: `scripts/academy-public-contract.test.mjs`, `scripts/load-board-email-bridge-contract.test.mjs`
- Latest unique commits:
  - ad0dbd86 2026-09-05T09:11:10-05:00 test(header): lock department dropdown order and mobile accordions
  - 269dc364 2026-09-05T09:10:20-05:00 feat(header): mount shared department menu enhancer
  - 479bce2c 2026-09-05T09:09:22-05:00 feat(header): add department dropdown and mobile accordion menus
  - 42ce75b0 2026-09-05T05:41:05-05:00 noop5
  - e7dfbd7d 2026-09-05T05:40:52-05:00 noop4

### fix/load-board-carrier-operating-path-20260905

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 18, behind 252; PR #1093 closed.
- Relevant files: `scripts/load-board-email-bridge-contract.test.mjs`, `scripts/load-board-intake-api-contract.test.mjs`, `tests/load-board-carrier-operating-path.spec.ts`, `tests/load-board-product.spec.ts`
- Latest unique commits:
  - 3c4d80ac 2026-09-05T04:13:19-05:00 Document Load Board runtime source ingestion gate
  - 6bbf2249 2026-09-05T04:09:26-05:00 Test canonical live Load Board operating path
  - d8c0d911 2026-09-05T04:08:52-05:00 Test canonical Load Board product routes and live feed
  - d8754c1f 2026-09-05T04:08:28-05:00 Point product spotlight to canonical Load Board
  - b62dd85d 2026-09-05T04:07:54-05:00 Route Logistics nav to canonical Load Board

### feat/load-board-hegelmann-live-capacity

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 256; PR #1088 closed.
- Relevant files: `scripts/load-board-intake-api-contract.test.mjs`
- Latest unique commits:
  - 0e584631 2026-09-04T11:25:37-05:00 docs(load-board): record Hegelmann approved capacity pilot
  - ddd78af9 2026-09-04T11:25:11-05:00 test(load-board): align car hauling ingestion scope
  - 89fe7b14 2026-09-04T11:23:27-05:00 fix(load-board): allow car hauling ingestion while outreach stays held
  - 147deaa5 2026-09-04T11:22:45-05:00 feat(load-board): mount live capacity enhancer
  - 72a69ea9 2026-09-04T11:21:50-05:00 feat(load-board): add approved live capacity surface

### feat/repair-shop-crm-shell

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 257; PR #1084 closed.
- Relevant files: `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopOwnerNavEnhancer.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/repair-shop-crm-shell.spec.ts`
- Latest unique commits:
  - 048e7445 2026-09-04T09:58:36-05:00 feat: make Repair Shop a simple web CRM

### fix/hc-repair-context-shell-20260904

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 265; PR #1071 closed.
- Relevant files: `src/components/HermesConnectExperience.astro`, `tests/hermes-connect-russian-complete.spec.ts`
- Latest unique commits:
  - 7af8d860 2026-09-04T05:25:51-05:00 test(connect): lock Russian shared shell localization
  - 6f77e794 2026-09-04T05:25:27-05:00 fix(connect): localize shared product-family shell
  - 35178dec 2026-09-04T05:14:22-05:00 test(connect): lock contextual Repair Shop shell
  - 1db63bdf 2026-09-04T05:14:08-05:00 fix(connect): scope Repair Shop product navigation

### seo-geo/ga4-production-host-guard-2026-09-04

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 266; PR #1070 closed.
- Relevant files: `tests/hermes-connect-analytics-consent.spec.ts`
- Latest unique commits:
  - a565ef74 2026-09-04T05:04:01-05:00 test: keep Connect analytics local on non-production hosts
  - daa8a7a5 2026-09-04T04:38:44-05:00 test(analytics): enforce production-host GA4 gate
  - 27bf5774 2026-09-04T04:38:26-05:00 test(analytics): prove localhost never sends production GA4
  - a802df1e 2026-09-04T04:37:58-05:00 fix(analytics): block Connect GA4 off production hosts
  - d187e1ad 2026-09-04T04:37:29-05:00 fix(analytics): block GA4 delivery off production hosts

### feat/logistics-career-hr-intake-2026-09-04

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 266; PR #1069 closed.
- Latest unique commits:
  - 52c1cfea 2026-09-04T02:57:14-05:00 fix(hr): use native browser UUID generator
  - 2c323c1a 2026-09-04T02:53:59-05:00 test(hr): preserve agency preview contract
  - 4cbdcf6f 2026-09-04T02:53:34-05:00 fix(hr): preserve agency preview compatibility
  - a681aa64 2026-09-04T02:44:34-05:00 test(hr): cover logistics career persistence handoff
  - 998f65ea 2026-09-04T02:44:07-05:00 fix(hr): keep short language evidence valid

### feat/hc-owner-registrations-1053

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 13, behind 274; PR #1054 closed.
- Relevant files: `docs/release-manifest-deltas/2026-09-03-hermes-connect-registration-ops.json`, `functions/api/repair-shop/profile.ts`, `scripts/hermes-connect-registration-ops-contract.test.mjs`, `src/pages/services/hermes-connect/internal/registrations/index.astro`
- Latest unique commits:
  - fc10b9cc 2026-09-03T16:22:27-05:00 test(connect): require phone-first profile alert semantics
  - d3dbdf63 2026-09-03T16:22:09-05:00 fix(connect): alert only when shop phone becomes available
  - b2dbbbb5 2026-09-03T16:21:25-05:00 test(connect): cover safe activity and commercial state in owner ledger
  - e71cb4bc 2026-09-03T16:21:06-05:00 feat(connect): surface profile, activity and access state in registrations UI
  - a67348c3 2026-09-03T16:20:03-05:00 feat(connect): expose safe activity and access state in owner ledger

### feature/social-distribution-final-fcc-main-2026-09-03

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 347; PR #1039 closed.
- Latest unique commits:
  - 781189ca 2026-09-03T07:50:55-05:00 feat(social): replay LinkedIn attribution bridge on final FCC main

### feature/social-distribution-final-main-2026-09-03

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 349; PR #1038 closed.
- Latest unique commits:
  - 0998732e 2026-09-03T07:34:08-05:00 feat(social): replay LinkedIn attribution bridge on final current main

### feature/social-distribution-current-main-2026-09-03

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 357; PR #1035 closed.
- Latest unique commits:
  - 79ad8196 2026-09-03T05:40:01-05:00 feat(social): replay LinkedIn attribution bridge on current main

### fix/fcc-ollama-current-main-2026-09-03

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 357; PR #1034 closed.
- Relevant files: `.github/workflows/codex-hermes-router.yml`
- Latest unique commits:
  - 3d4b3a4c 2026-09-03T05:38:10-05:00 fix(ai): replay FCC Ollama capability patch on current main

### feature/hermes-connect-hr-pilot-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 50, behind 423; PR #1016 closed.
- Relevant files: `docs/release-manifest-deltas/2026-09-02-hermes-connect-hr-pilot.json`, `functions/api/hermes-connect/account.ts`, `functions/api/hr/candidate.ts`, `functions/api/hr/claim.ts`, `functions/api/hr/reviewer/candidates.ts`, `scripts/hermes-connect-account-switcher-contract.test.mjs`, `scripts/hermes-connect-hr-api-integration.test.mjs`, `scripts/hermes-connect-hr-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`
- Latest unique commits:
  - 4f9bdbd4 2026-09-03T04:08:41-05:00 feat(hr): make selected interview language functional for RU and UK
  - 3989ba5e 2026-09-03T04:00:52-05:00 test(hr): enforce candidate reviewer separation and production-local privacy
  - 151c7960 2026-09-03T04:00:17-05:00 design(hr): separate candidate flow from reviewer workspace
  - d23bfcfd 2026-09-03T03:59:36-05:00 fix(hr): keep preview review queue out of production candidate browsers
  - bd388466 2026-09-02T13:58:49+03:00 test(hr): guard reviewer evidence lineage and honest local reset copy

### fix/hermes-fcc-ollama-thinking

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 11, behind 420; PR #1030 closed.
- Relevant files: `.github/workflows/codex-hermes-router.yml`
- Latest unique commits:
  - 6351b81a 2026-09-03T04:08:23-05:00 fix(ai): keep 3B Ollama out of interactive Codex agent mode
  - 24b53f18 2026-09-03T03:56:56-05:00 feat(ai): add explicit local fast and deep Codex modes
  - d5ac817c 2026-09-03T03:54:28-05:00 feat(ai): add one-command local Codex mode
  - 250428f0 2026-09-03T03:53:13-05:00 fix(ai): backport Codex catalog slug selection for non-thinking models
  - f486916f 2026-09-03T03:17:52-05:00 test(ai): fix FCC patch fixture indentation

### feature/social-distribution-linkedin-attribution

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 423; PR #1019 closed.
- Latest unique commits:
  - 88b03227 2026-09-02T13:06:05+03:00 fix(social): keep attributed X drafts within post limit
  - 2e3d1d17 2026-09-02T13:00:34+03:00 test(social): cover LinkedIn and attributed preview
  - 6c148d57 2026-09-02T13:00:07+03:00 fix(social): derive preview channel count from drafts
  - 24b8a896 2026-09-02T12:59:24+03:00 feat(social): surface LinkedIn and growth attribution preview
  - db86a603 2026-09-02T12:58:47+03:00 test(social): protect LinkedIn recruiting attribution

### design/connect-global-account-replay4-2026-09-02

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 423; PR #1008 closed.
- Relevant files: `src/components/HermesConnectGlobalAccount.astro`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-global-account.spec.ts`
- Latest unique commits:
  - 8b110ae5 2026-09-02T11:00:16+03:00 design(connect): replay global Hermes account on current main

### design/connect-global-account-replay3-2026-09-02

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 424; PR #1005 closed.
- Relevant files: `src/components/HermesConnectGlobalAccount.astro`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-global-account.spec.ts`
- Latest unique commits:
  - 20ea157d 2026-09-02T09:40:43+03:00 design(connect): replay global Hermes account after direction color merge

### design/connect-global-account-replay2-2026-09-02

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 425; PR #1004 closed.
- Relevant files: `src/components/HermesConnectGlobalAccount.astro`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-global-account.spec.ts`
- Latest unique commits:
  - aa29e68e 2026-09-02T09:28:27+03:00 design(connect): replay global Hermes account on latest main

### docs/connect-design-current-state-2026-09-02

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 426; PR #1002 closed.
- Latest unique commits:
  - 23e44c15 2026-09-02T09:25:51+03:00 docs(design): align Hermes Connect current state with approved division colors

### design/connect-global-account-replay-2026-09-02

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 426; PR #1001 closed.
- Relevant files: `src/components/HermesConnectGlobalAccount.astro`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-global-account.spec.ts`
- Latest unique commits:
  - ae524e37 2026-09-02T09:18:38+03:00 test(connect): verify global signed-in portfolio across desktop and mobile
  - e710957b 2026-09-02T09:18:16+03:00 design(connect): surface signed-in Hermes portfolio beside launcher
  - cc8f7b88 2026-09-02T09:17:46+03:00 design(connect): add compact authenticated global account portfolio

### feat/connect-internal-ai-control-center-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 18, behind 487; PR #940 closed.
- Relevant files: `docs/release-manifest-deltas/2026-09-01-hermes-connect-ai-control-center.json`, `functions/api/internal-ai/runner/claim.ts`, `functions/api/internal-ai/runner/task.ts`, `scripts/internal-ai-assistant-contract.test.mjs`, `src/components/HermesConnectInternalAiNav.astro`, `src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-ai-control-center.spec.ts`
- Latest unique commits:
  - c69620c7 2026-09-01T15:57:46+03:00 test(ai): lock prompt exposure to runner-only DTO
  - 8f0489b7 2026-09-01T15:57:22+03:00 fix(ai): preserve prompt only on runner task endpoint
  - 7e07fc7b 2026-09-01T15:57:14+03:00 fix(ai): expose task prompt only to authenticated runner
  - 099277b3 2026-09-01T15:56:59+03:00 fix(ai): keep stored prompts off owner browser APIs
  - c1690c29 2026-09-01T15:55:09+03:00 test(ai): enforce Codex secret-boundary scrubbing

### feat/connect-internal-owner-bootstrap-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 15, behind 487; PR #942 closed.
- Relevant files: `docs/release-manifest-deltas/2026-09-01-hermes-connect-ai-control-center.json`, `functions/api/internal-ai/bootstrap-owner.ts`, `scripts/internal-ai-assistant-contract.test.mjs`, `src/components/HermesConnectInternalAiNav.astro`, `src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-ai-control-center.spec.ts`
- Latest unique commits:
  - 26214ddd 2026-09-01T15:41:50+03:00 test(connect): keep activity security proof locale-neutral in bootstrap stack
  - 3a6997df 2026-09-01T15:41:19+03:00 test(connect): carry control center e2e alignment into owner bootstrap
  - 42b5e118 2026-09-01T12:43:48+03:00 docs(connect): define one-time internal owner activation
  - 3ebe59ff 2026-09-01T12:43:20+03:00 test(connect): cover first-owner AI activation
  - 05947f6c 2026-09-01T12:42:40+03:00 test(connect): lock one-time internal owner bootstrap

### feat/connect-global-account-presence-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 482; PR #956 closed.
- Relevant files: `src/components/HermesConnectGlobalAccount.astro`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-global-account.spec.ts`
- Latest unique commits:
  - 942462e6 2026-09-01T15:31:15+03:00 test(connect): verify both global account roots fail closed
  - 58224f62 2026-09-01T15:08:17+03:00 chore: remove temporary marker
  - 88ca41d5 2026-09-01T15:08:04+03:00 docs(connect): temporary marker
  - 9a6f1e9f 2026-09-01T15:07:54+03:00 chore: remove accidental noop
  - 59d25e5a 2026-09-01T15:07:37+03:00 noop

### feat/connect-website-factory-b1-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 482; PR #955 closed.
- Relevant files: `src/pages/services/hermes-connect/website-factory/index.astro`
- Latest unique commits:
  - 370c64c3 2026-09-01T15:11:10+03:00 test(factory): protect durable handoff notification
  - a0ec94d5 2026-09-01T15:10:34+03:00 feat(factory): notify Hermes team on brief handoff
  - 40db54cc 2026-09-01T15:09:49+03:00 feat(factory): persist team handoff delivery state
  - a95303c4 2026-09-01T15:07:05+03:00 test(factory): lock visual route coverage
  - 6b69e048 2026-09-01T15:06:40+03:00 test(factory): add Website Factory visual route

### design/systematic-visual-cleanup-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 55, behind 486; PR #944 closed.
- Relevant files: `.github/workflows/hermes-connect-visual-evidence.yml`, `docs/release-manifest-deltas/2026-09-01-hermes-connect-option02-qa.json`, `scripts/hermes-connect-mark-contract.test.mjs`, `scripts/internal-ai-assistant-contract.test.mjs`, `scripts/repair-russian-private-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/styles/hermes-connect-division-context.css`
- Latest unique commits:
  - 2932f86b 2026-09-01T14:52:25+03:00 fix(release): register Option 02 QA route
  - 905380f7 2026-09-01T14:49:29+03:00 fix(compliance): register Option 02 derivative assets
  - 92a84f76 2026-09-01T14:44:17+03:00 test(visual): lock Option 02 QA route coverage
  - 6ab24693 2026-09-01T14:43:50+03:00 test(visual): capture Option 02 QA stand
  - a3455442 2026-09-01T14:43:23+03:00 feat(brand): add noindex Option 02 visual QA stand

### fix/connect-beauty-product-truth-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 485; PR #948 closed.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-product.test.mjs`, `src/components/HermesConnectExperience.astro`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-beauty-live-workspace.spec.ts`
- Latest unique commits:
  - 0ef699db 2026-09-01T14:18:13+03:00 test(connect): protect truthful Beauty status on Product Hub
  - 0409afae 2026-09-01T14:17:36+03:00 fix(connect): publish truthful Beauty B1 status on Product Hub
  - 25293050 2026-09-01T14:14:22+03:00 test(connect): protect private Beauty product context truth
  - 7f0e14de 2026-09-01T14:13:21+03:00 test(connect): verify localized private Beauty product context
  - 9f462e63 2026-09-01T14:12:51+03:00 fix(connect): classify Beauty as private foundation in product context

### feat/connect-beauty-account-integration-2026-09-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 10, behind 486; PR #945 closed.
- Relevant files: `docs/release-manifest-deltas/2026-09-01-hermes-connect-beauty-b1-live-workspace.json`, `functions/api/hermes-connect/account.ts`, `scripts/hermes-connect-account-contract.test.mjs`, `scripts/hermes-connect-account-switcher-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`, `src/pages/services/hermes-connect/beauty/workspace/index.astro`, `tests/hermes-connect-account-portfolio.spec.ts`, `tests/hermes-connect-beauty-live-workspace.spec.ts`
- Latest unique commits:
  - 334ccd46 2026-09-01T14:03:39+03:00 test(connect): cover Beauty in shared account portfolio
  - 88933797 2026-09-01T14:03:07+03:00 feat(connect): mount account portfolio in Beauty workspace
  - 4999cb1d 2026-09-01T14:02:06+03:00 test(connect): protect switchable Beauty workspace
  - 6255c59c 2026-09-01T14:01:51+03:00 feat(connect): make owned Beauty switchable
  - 0023a7f2 2026-09-01T14:00:45+03:00 test(connect): protect canonical Beauty account route

### feat/academy-public-learner-workspace-handoff-2026-08-31

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 490; PR #935 closed.
- Relevant files: `scripts/academy-public-contract.test.mjs`
- Latest unique commits:
  - d977bcb6 2026-08-31T22:05:49+03:00 test(academy): protect public-to-learner workspace handoff
  - 28a3f002 2026-08-31T22:05:20+03:00 feat(academy): connect public programs to existing learner workspace

### fix/repair-private-pearl-shell-2026-08-30

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 522; PR #911 closed.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `scripts/repair-shop-private-design-contract.test.mjs`
- Latest unique commits:
  - c4b0fa7c 2026-08-30T13:26:18+03:00 fix(connect): apply Pearl Design OS to private Repair Shop workspaces

### feat/hermes-vertical-design-tokens-2026-08-30

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 530; PR #908 closed.
- Latest unique commits:
  - e3d1c18e 2026-08-30T12:35:12+03:00 feat(brand): add canonical vertical accent tokens

### feat/ai-connect-cabinet-ux-ru

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 574; PR #885 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-project.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-internal-ai-assistant.spec.ts`
- Latest unique commits:
  - a9c6995d 2026-08-28T15:55:51+03:00 replay(connect): restack internal AI cabinet UX on clean project workspace
  - 18d07649 2026-08-28T15:44:47+03:00 replay(test): restore AI Connect project browser contract on current main
  - 396063e2 2026-08-28T15:44:29+03:00 replay(connect): restore AI Connect project workspace on current main
  - a129bf43 2026-08-28T15:43:58+03:00 replay(connect): restore AI Connect project manifest on current main

### feat/ai-connect-project-workspace

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 574; PR #882 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-project.json`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `tests/hermes-connect-ai-connect-project.spec.ts`
- Latest unique commits:
  - 18d07649 2026-08-28T15:44:47+03:00 replay(test): restore AI Connect project browser contract on current main
  - 396063e2 2026-08-28T15:44:29+03:00 replay(connect): restore AI Connect project workspace on current main
  - a129bf43 2026-08-28T15:43:58+03:00 replay(connect): restore AI Connect project manifest on current main

### feat/ai-connect-activity

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 28, behind 575; PR #887 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-activity.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-internal.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-projects-list.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-activity.spec.ts`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect-projects-list.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`
- Latest unique commits:
  - 574bd57a 2026-08-28T13:44:56+03:00 test(connect): cover internal AI activity history
  - ba183f90 2026-08-28T13:44:30+03:00 docs(connect): register internal AI activity route
  - acafaa06 2026-08-28T13:44:17+03:00 fix(connect): preserve localized cabinet aria labels
  - 541a7d67 2026-08-28T13:43:37+03:00 feat(connect): add Activity to internal cabinet navigation
  - b8f4b864 2026-08-28T13:43:03+03:00 feat(connect): add internal AI activity history

### feat/ai-connect-projects-list

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 23, behind 575; PR #886 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-internal.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-projects-list.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect-projects-list.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`
- Latest unique commits:
  - a46e8eae 2026-08-28T13:41:15+03:00 chore(connect): sync cabinet browser evidence from base
  - c461fd88 2026-08-28T13:17:42+03:00 test(connect): stabilize verified-owner project navigation
  - f539affa 2026-08-28T12:43:56+03:00 fix(connect): type cabinet navigation items
  - 2d46fcad 2026-08-28T12:27:22+03:00 chore(release): register internal AI Connect projects list
  - 1e00fb3a 2026-08-28T12:27:08+03:00 test(connect): cover familiar AI Connect projects list

### docs/hermes-connect-ai-cabinet-decision-2026-08-26

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 577; PR #877 closed.
- Latest unique commits:
  - d99fe15a 2026-08-26T08:26:15-05:00 docs(ai): record embedded assistant cabinet decision

### fix/connect-ru-and-performance-handoff-2026-08-25

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 581; PR #872 closed.
- Latest unique commits:
  - 2e0d390a 2026-08-25T23:57:17-05:00 docs: add redacted Connect credential rotation manifest
  - 497376d9 2026-08-25T23:42:56-05:00 docs: add Hermes Connect consolidation review

### seo/restore-agent-readable-llms-2026-08-25

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 581; PR #868 closed.
- Latest unique commits:
  - 97d5696d 2026-08-25T14:51:24+03:00 test(agentic): enforce Markdown link discovery
  - 62ae1359 2026-08-25T14:42:58+03:00 test(agentic): preserve phone privacy guard
  - db6c051a 2026-08-25T14:42:40+03:00 test(agentic): protect Markdown llms links
  - aa5a01e5 2026-08-25T14:42:24+03:00 seo(agentic): restore Markdown links in llms.txt

### feature/owner-hermes-codex-control-center-2026-08-25

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 37, behind 581; PR #865 closed.
- Relevant files: `src/pages/services/hermes-connect/owner/index.astro`
- Latest unique commits:
  - c90f7dae 2026-08-25T13:10:57+03:00 ci(owner): compile-check the local runner
  - 8d65ec9c 2026-08-25T13:10:42+03:00 docs(owner): document isolated task branch boundary
  - 9c04c2a3 2026-08-25T13:10:13+03:00 test(owner): enforce isolated browser task branch
  - e05438cc 2026-08-25T13:09:45+03:00 fix(owner): isolate every browser task on a safe branch
  - 3a974ec6 2026-08-25T12:59:56+03:00 test(owner): scope tab locators to owner navigation

### fix/hermes-fcc-intel-macos-bootstrap

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 581; PR #861 closed.
- Latest unique commits:
  - 200d8640 2026-08-25T02:53:52-05:00 fix: harden Hermes FCC bootstrap on Intel macOS

### feature/beauty-b1-owner-preview-final-v2-2026-08-22

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 591; PR #788 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-20-hermes-connect-beauty-b1-owner-preview.json`, `src/pages/services/hermes-connect/beauty/workspace-preview.astro`, `tests/hermes-connect-beauty-owner-preview.spec.ts`
- Latest unique commits:
  - 016cfdda 2026-08-24T14:27:34+03:00 feat(connect): replay Beauty B1 owner preview on current main
  - 2e5e7195 2026-08-22T11:22:51+03:00 feat(connect): replay Beauty B1 owner preview on current main
  - 3e1797d6 2026-08-22T11:21:56+03:00 feat(connect): replay Beauty B1 preview manifest

### geo/public-entity-hierarchy-current-main-v2

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 638; PR #845 closed.
- Relevant files: `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 1403e2bb 2026-08-23T19:19:02+03:00 geo: canonicalize public Four Directions entities on current main

### geo/public-entity-hierarchy-current-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 10, behind 640; PR #837 closed.
- Relevant files: `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 0ecc2443 2026-08-23T19:16:31+03:00 docs(geo): record merged bounded releases
  - b65fae8a 2026-08-23T19:13:22+03:00 test(geo): align homepage Technology accessible name
  - 07b8044a 2026-08-23T19:13:02+03:00 test(geo): align homepage Technology entity expectation
  - 5dca9a5b 2026-08-23T19:12:40+03:00 test(geo): expect canonical Technology direction
  - 67dc569f 2026-08-23T19:08:41+03:00 docs(geo): point semantic release to current PR

### geo/restore-current-state-entrypoint-2026-08-23

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 640; PR #839 closed.
- Latest unique commits:
  - b5e5b165 2026-08-23T19:05:16+03:00 docs(geo): restore canonical current-state entrypoint

### finish/password-reset-timing-current-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 698; PR #806 closed.
- Relevant files: `scripts/repair-shop-password-recovery-contract.test.mjs`
- Latest unique commits:
  - d1a17963 2026-08-23T01:27:22+03:00 test(auth): run password recovery contract with TS stripping
  - cb1af7af 2026-08-23T01:26:58+03:00 test(auth): prove reset response does not await delivery
  - 777d30f3 2026-08-23T01:26:33+03:00 fix(auth): remove reset timing side channel
  - 9227fe62 2026-08-23T01:20:22+03:00 test(seo): wire resource winner guard into CI
  - 75f14054 2026-08-23T01:20:02+03:00 test(seo): protect proven resource commercial handoffs

### feature/public-geo-design-inventory-2026-08-22

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 90, behind 707; PR #785 closed.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-product.test.mjs`, `src/components/HermesConnectCapabilityPage.astro`, `src/components/HermesConnectExperience.astro`, `src/components/HermesConnectLauncher.astro`, `src/pages/services/hermes-connect/ai-command-center.astro`, `src/pages/services/hermes-connect/business-automation.astro`, `src/pages/services/hermes-connect/index.astro`, `src/pages/services/hermes-connect/load-analyzer.astro`, `src/pages/services/hermes-connect/rate-negotiator.astro`, `src/pages/services/hermes-connect/unified-inbox.astro`, `tests/academy-public-brand.spec.ts`, `tests/academy-subsite.spec.ts`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 8efba80e 2026-08-22T17:05:11+03:00 merge main: adopt public UX friction baseline
  - 46712517 2026-08-22T16:56:54+03:00 merge main: preserve carrier contract containment
  - 47fae721 2026-08-22T16:53:20+03:00 test(connect): match evidence-bounded Repair Shops CTA
  - c5a4528b 2026-08-22T16:41:47+03:00 docs(ai): restore explicit demo evidence boundary
  - f472f226 2026-08-22T16:41:46+03:00 test(consent): scope primary Repair Shops CTA

### seo/gsc-owner-recovery-2026-08-22

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 715; PR #786 closed.
- Relevant files: `scripts/hermes-connect-search-radar.test.mjs`
- Latest unique commits:
  - eb89501b 2026-08-22T11:04:52+03:00 test(seo): cover Connect and resource winner owner mappings
  - feef7640 2026-08-22T11:04:15+03:00 seo(radar): map Connect and proven resource owners
  - 70b2caa3 2026-08-22T11:01:05+03:00 docs(seo): record Logistics SEO owner recovery experiment
  - 80c6e1d2 2026-08-22T10:58:54+03:00 test(seo): protect marketing to logistics SEO owner handoff
  - 91168565 2026-08-22T10:58:05+03:00 seo(marketing): link logistics SEO canonical owner from marketing hub

### fix/password-reset-timing-787

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 709; PR #796 closed.
- Relevant files: `scripts/repair-shop-password-recovery-contract.test.mjs`
- Latest unique commits:
  - 68b16b8e 2026-08-22T06:13:28-05:00 fix(auth): remove password reset timing side channel

### feature/repair-shops-monetizable-revenue-2026-08-22

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 713; PR #790 closed.
- Relevant files: `functions/api/repair-shop/cleanup-feedback-smoke.ts`, `functions/api/repair-shop/cleanup-owner-auth-smoke.ts`, `public/hermes-connect-repair-owner-error-guard.js`, `public/hermes-connect-repair-owner-operational-i18n.js`, `public/hermes-connect-repair-owner-workspace-bridge.js`, `public/hermes-connect-repair-owner-workspace-insights.js`, `public/hermes-connect-repair-owner-workspace-live.css`, `public/hermes-connect-repair-owner-workspace-live.js`, `public/hermes-connect-repair-owner-workspace-operational.css`, `public/hermes-connect-repair-p0.css`, `public/hermes-connect-repair-p0.js`, `public/repair-shop-activation-retention.js`, `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopFreeLaunchOffer.astro`, `src/pages/services/hermes-connect/repair-shops/availability.astro`, `src/pages/services/hermes-connect/repair-shops/customers.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `src/pages/services/hermes-connect/repair-shops/workspace-preview.astro`, `tests/hermes-connect-repair-activation-retention.spec.ts`, `tests/hermes-connect-repair-availability-locales.spec.ts` … +10
- Latest unique commits:
  - 0c672053 2026-08-22T04:32:13-05:00 docs: update AI handoff log with Repair Shop Revenue OS and CI fix
  - 5a5368bf 2026-08-22T04:31:20-05:00 fix(connect): include hermes-connect-repair scripts in activation enhancer and restore audit script
  - 497a5f85 2026-08-22T04:06:14-05:00 fix(tests): allow localized service count pill matching in repair-shop-web-v1 spec
  - 4dff2e19 2026-08-22T03:59:29-05:00 feat(connect): reconcile repair shop revenue OS and pilot contract onto current main

### feature/public-geo-design-inventory-2026-08-20

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 36, behind 725; PR #774 closed.
- Relevant files: `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 1a204649 2026-08-21T21:58:46+03:00 fix(geo): align Academy direction copy with canonical brand
  - ca09b4e3 2026-08-21T21:58:24+03:00 fix(geo): normalize public Academy master-brand naming
  - 94d9aead 2026-08-21T21:55:25+03:00 feat(public): add source signals to GEO design inventory
  - b9575bf2 2026-08-21T21:54:11+03:00 fix(geo): align technology case with master-brand hierarchy
  - adf71ad7 2026-08-21T21:51:14+03:00 feat(geo): align public AI context with canonical Hermes hierarchy

### feature/beauty-b1-owner-preview-final-2026-08-21

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 717; PR #782 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-20-hermes-connect-beauty-b1-owner-preview.json`, `src/pages/services/hermes-connect/beauty/workspace-preview.astro`, `tests/hermes-connect-beauty-owner-preview.spec.ts`
- Latest unique commits:
  - 4c91f426 2026-08-21T21:51:29+03:00 feat(connect): replay Beauty B1 owner workspace preview on current main

### feature/hermes-connect-3-current-main-2026-08-19

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 40, behind 736; PR #765 closed.
- Relevant files: `.github/workflows/repair-feedback-production-smoke.yml`, `.github/workflows/repair-owner-auth-production-smoke.yml`, `functions/api/repair-shop/cleanup-feedback-smoke.ts`, `functions/api/repair-shop/cleanup-owner-auth-smoke.ts`, `public/hermes-connect-repair-owner-error-guard.js`, `public/hermes-connect-repair-owner-operational-i18n.js`, `public/hermes-connect-repair-owner-workspace-bridge.js`, `public/hermes-connect-repair-owner-workspace-insights.js`, `public/hermes-connect-repair-owner-workspace-live.css`, `public/hermes-connect-repair-owner-workspace-live.js`, `public/hermes-connect-repair-owner-workspace-operational.css`, `public/hermes-connect-repair-p0.css`, `public/hermes-connect-repair-p0.js`, `public/repair-shop-activation-retention.js`, `scripts/repair-feedback-production-smoke.sh`, `scripts/repair-owner-auth-production-smoke.sh`, `scripts/repair-shop-feedback-contract.test.mjs`, `src/components/HermesConnectDomReady.astro`, `src/components/HermesConnectLauncher.astro`, `src/components/RepairShopActivationEnhancer.astro` … +19
- Latest unique commits:
  - b9c29d22 2026-08-20T10:18:28-05:00 docs: update AI_HANDOFF.md with 100% green build and e2e test verification
  - ea476086 2026-08-20T05:57:13-05:00 fix(connect): align availability error text and localize dashboard public status
  - ac2fbb1f 2026-08-20T04:23:27-05:00 fix(connect): align RU and UK customer init error message in customers.astro
  - 833ed07d 2026-08-20T04:19:58-05:00 docs(handoff): add Antigravity handoff entry for PR #765 reconciliation
  - 13c84abf 2026-08-20T04:18:07-05:00 fix(connect): reconcile PR #765 with main, fix PWA app icon dimensions, and add RU/UK cardinal plural rules

### feature/hermes-connect-beauty-b1-owner-preview-2026-08-20

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 736; PR #767 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-20-hermes-connect-beauty-b1-owner-preview.json`, `src/pages/services/hermes-connect/beauty/workspace-preview.astro`, `tests/hermes-connect-beauty-owner-preview.spec.ts`
- Latest unique commits:
  - 6649e659 2026-08-20T09:14:19+03:00 fix(connect): align Beauty preview manifest with release contract
  - f49e40ae 2026-08-20T09:11:12+03:00 fix(connect): satisfy Beauty preview release reconciliation gate
  - 394a3fe8 2026-08-20T09:08:03+03:00 docs(connect): register Beauty B1 owner preview route
  - 7bf485ed 2026-08-20T09:07:53+03:00 test(connect): cover Beauty B1 owner preview
  - dc7ba889 2026-08-20T09:07:41+03:00 feat(connect): add Beauty B1 owner workspace preview

### feature/hermes-connect-academy-journey-integration-2026-08-20

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 736; PR #768 closed.
- Relevant files: `src/pages/services/hermes-connect/academy/program/[program].astro`, `tests/academy-journey-integration.spec.ts`
- Latest unique commits:
  - f5f56aaa 2026-08-20T09:10:17+03:00 test(connect): cover Academy evidence progression handoff
  - 5e7d41cc 2026-08-20T09:10:07+03:00 fix(connect): connect Academy curriculum to live evidence journey

### seo/academy-uk-marketing-owner-2026-08-19

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 757; PR #721 closed.
- Relevant files: `tests/academy-ukrainian-marketing.spec.ts`
- Latest unique commits:
  - 0abc38f9 2026-08-19T16:06:52+03:00 chore(academy): remove temporary preview artifact workflow
  - f58c8eb8 2026-08-19T16:06:21+03:00 test(academy): expect localized Ukrainian application route
  - f5fe9ddf 2026-08-19T16:05:15+03:00 fix(academy): route Ukrainian Marketing to localized application
  - 18048141 2026-08-19T11:00:41+03:00 fix(academy): contain Ukrainian marketing mobile copy
  - 88eb7ae2 2026-08-19T09:10:42+03:00 ci(preview): trigger Ukrainian Marketing screenshot capture

### feature/repair-shop-owner-workspace-ceo-preview

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 34, behind 780; PR #724 closed.
- Relevant files: `public/hermes-connect-repair-owner-error-guard.js`, `public/hermes-connect-repair-owner-workspace-bridge.js`, `public/hermes-connect-repair-owner-workspace-insights.js`, `public/hermes-connect-repair-owner-workspace-live.css`, `public/hermes-connect-repair-owner-workspace-live.js`, `public/hermes-connect-repair-owner-workspace-operational.css`, `public/hermes-connect-repair-p0.css`, `public/hermes-connect-repair-p0.js`, `src/components/HermesConnectLauncher.astro`, `src/components/RepairShopFreeLaunchOffer.astro`, `src/pages/services/hermes-connect/repair-shops/workspace-preview.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-repair-owner-error-guard.spec.ts`, `tests/hermes-connect-repair-owner-workspace-insights.spec.ts`, `tests/hermes-connect-repair-owner-workspace-live.spec.ts`, `tests/hermes-connect-repair-owner-workspace-preview.spec.ts`, `tests/hermes-connect-repair-p0.spec.ts`, `tests/repair-shop-free-launch.spec.ts`
- Latest unique commits:
  - 9aeca771 2026-08-19T16:04:56+03:00 test(connect): align experience regression with approved Owner OS
  - 2512aa36 2026-08-19T16:04:11+03:00 fix(connect): preserve owner growth data hooks
  - 3b14d3cd 2026-08-19T11:47:55+03:00 test(connect): verify active-only schedule stays XSS-safe
  - 501dca97 2026-08-19T11:47:23+03:00 fix(connect): keep upcoming schedule limited to active bookings
  - 35cda7a6 2026-08-19T11:42:54+03:00 test(connect): keep booking-derived Owner OS insights XSS-safe

### feature/hermes-connect-beauty-b1-current-main-2026-08-19

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 752; PR #742 closed.
- Relevant files: `functions/api/public/repair-booking.ts`, `tests/hermes-connect-beauty-b1-backend.spec.ts`, `tests/hermes-connect-service-context.spec.ts`
- Latest unique commits:
  - 60e993e6 2026-08-19T12:26:40+03:00 test(connect): guard Beauty B1 backend boundaries
  - e8e005d1 2026-08-19T12:26:22+03:00 feat(connect): add Beauty team member update API
  - 029017bd 2026-08-19T12:26:02+03:00 feat(connect): add Beauty team API
  - 9bf79931 2026-08-19T12:25:39+03:00 feat(connect): add Beauty owner profile API
  - 7e8e5b1b 2026-08-19T12:25:15+03:00 feat(connect): add Beauty owner schema

### fix/hermes-connect-repair-p0-first-screen

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 780; PR #681 closed.
- Relevant files: `public/hermes-connect-repair-owner-error-guard.js`, `public/hermes-connect-repair-p0.css`, `public/hermes-connect-repair-p0.js`, `src/components/HermesConnectLauncher.astro`, `src/components/RepairShopFreeLaunchOffer.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-repair-owner-error-guard.spec.ts`, `tests/hermes-connect-repair-p0.spec.ts`, `tests/repair-shop-free-launch.spec.ts`
- Latest unique commits:
  - 49cd4337 2026-08-19T10:08:17+03:00 test(connect): verify booking error hero geometry end to end
  - 62d64556 2026-08-19T10:07:40+03:00 fix(connect): force booking error hero into normal block flow
  - a636396b 2026-08-19T09:45:39+03:00 test(connect): guard booking error hero against label overlap
  - 4ed3c222 2026-08-19T09:45:03+03:00 fix(connect): keep booking error eyebrow in normal flow
  - ddd0db35 2026-08-19T08:50:44+03:00 fix(connect): repair owner entry and booking first screen

### docs/repair-first5-scorecard-v2

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 757; PR #722 closed.
- Latest unique commits:
  - c5f12185 2026-08-19T09:18:02+03:00 docs(connect): align first-5 cohort state gate
  - f1738895 2026-08-19T09:14:11+03:00 docs(connect): strengthen first-5 repair shop evidence scorecard

### seo/academy-reciprocal-hreflang-2026-08-19

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 779; PR #716 closed.
- Relevant files: `tests/academy-ukraine-preview.spec.ts`
- Latest unique commits:
  - 51712b91 2026-08-19T08:27:41+03:00 test(academy): enforce reciprocal EN-UK hreflang
  - 970e678f 2026-08-19T08:27:23+03:00 seo(academy): add reciprocal Ukrainian hreflang

### feature/hermes-connect-beauty-b1-backend

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 781; PR #711 closed.
- Relevant files: `functions/api/public/repair-booking.ts`, `tests/hermes-connect-beauty-b1-backend.spec.ts`, `tests/hermes-connect-service-context.spec.ts`
- Latest unique commits:
  - 5969ffc1 2026-08-18T23:40:09+03:00 feat(connect): add Beauty B1 owner backend foundation
  - d5bfa0ab 2026-08-18T23:32:00+03:00 feat(connect): scope shared services by business context

### feature/hermes-connect-service-context

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 781; PR #710 closed.
- Relevant files: `functions/api/public/repair-booking.ts`, `tests/hermes-connect-service-context.spec.ts`
- Latest unique commits:
  - d5bfa0ab 2026-08-18T23:32:00+03:00 feat(connect): scope shared services by business context

### feature/hermes-academy-a3-1-support-questions

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 781; PR #664 closed.
- Relevant files: `functions/api/academy/reviewer/support.ts`, `functions/api/academy/support.ts`, `scripts/academy-support-contract.test.mjs`, `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `src/pages/services/hermes-connect/academy/index.astro`, `src/pages/services/hermes-connect/academy/reviewer/support/index.astro`, `src/pages/services/hermes-connect/academy/support/index.astro`, `tests/academy-support.spec.ts`
- Latest unique commits:
  - 58ac3205 2026-08-18T23:00:27+03:00 feat(academy): add private learner questions and support A3.1

### seo/academy-language-compliance-eligibility-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 786; PR #690 closed.
- Relevant files: `scripts/academy-public-contract.test.mjs`, `tests/academy-eligibility-preview.spec.ts`
- Latest unique commits:
  - fe22b45d 2026-08-18T18:46:05+03:00 docs(academy): record language and compliance eligibility policy
  - 58037ae8 2026-08-18T18:42:04+03:00 ci(academy): capture eligibility visual QA
  - 82dc39e3 2026-08-18T18:41:39+03:00 test(academy): capture eligibility desktop and mobile preview
  - 1a4c795d 2026-08-18T18:40:42+03:00 test(academy): recognize multilingual sanctions wording
  - 1a84f42b 2026-08-18T18:31:59+03:00 seo(academy): make current marketing language baseline explicit

### seo/hermes-framework-canonical-links-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 820; PR #669 closed.
- Latest unique commits:
  - 123c8086 2026-08-18T13:31:13+03:00 seo: inherit approved homepage thin-page policy
  - 2e1a0d5e 2026-08-18T13:28:04+03:00 ci: protect commercial owner internal paths
  - e67f2aeb 2026-08-18T13:27:52+03:00 seo: add commercial owner internal-link gate
  - b994a03a 2026-08-18T13:27:09+03:00 ci: enforce Hermes GEO evidence contract
  - 4ec37b0d 2026-08-18T13:26:59+03:00 geo: add llms evidence contract

### seo/hermes-framework-canonical-geo-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 820; PR #668 closed.
- Latest unique commits:
  - 45641c32 2026-08-18T13:30:44+03:00 seo: inherit approved homepage thin-page policy
  - b994a03a 2026-08-18T13:27:09+03:00 ci: enforce Hermes GEO evidence contract
  - 4ec37b0d 2026-08-18T13:26:59+03:00 geo: add llms evidence contract
  - 434e07bc 2026-08-18T13:26:44+03:00 geo: make AI context evidence-bounded
  - a1446494 2026-08-18T13:25:24+03:00 ci: enforce Hermes SEO Framework P0 gate

### seo/hermes-framework-canonical-p0-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 820; PR #667 closed.
- Latest unique commits:
  - c862b2bb 2026-08-18T13:29:58+03:00 seo: respect approved focused homepage in thin-page gate
  - a1446494 2026-08-18T13:25:24+03:00 ci: enforce Hermes SEO Framework P0 gate
  - b450b050 2026-08-18T13:25:12+03:00 docs: align SEO Framework with canonical Design OS approval gate
  - 5a5be380 2026-08-18T13:24:47+03:00 seo: add canonical P0 page quality gate

### seo/hermes-framework-commercial-link-gate-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 824; PR #661 closed.
- Latest unique commits:
  - 96c756bb 2026-08-18T12:03:32+03:00 test(geo): validate llms verification date generically
  - 982ae19d 2026-08-18T11:58:13+03:00 ci(seo): enforce commercial owner link paths
  - c0570e46 2026-08-18T11:57:58+03:00 test(seo): enforce commercial owner internal paths
  - b4531904 2026-08-18T11:55:22+03:00 ci(geo): enforce llms-full evidence contract
  - f5995e12 2026-08-18T11:55:07+03:00 test(geo): enforce evidence-bounded llms-full context

### seo/hermes-framework-geo-evidence-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 824; PR #660 closed.
- Latest unique commits:
  - 9c733215 2026-08-18T12:02:06+03:00 test(geo): validate llms verification date generically
  - b4531904 2026-08-18T11:55:22+03:00 ci(geo): enforce llms-full evidence contract
  - f5995e12 2026-08-18T11:55:07+03:00 test(geo): enforce evidence-bounded llms-full context
  - e1245995 2026-08-18T11:54:47+03:00 fix(geo): make llms-full evidence bounded
  - 81d0be4f 2026-08-18T11:49:58+03:00 docs(seo): establish canonical Hermes SEO Framework

### seo/hermes-framework-p0-gate-2026-08-18

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 824; PR #658 closed.
- Latest unique commits:
  - 81d0be4f 2026-08-18T11:49:58+03:00 docs(seo): establish canonical Hermes SEO Framework
  - b512ec7c 2026-08-18T11:48:59+03:00 ci(seo): enforce Hermes framework P0 gate
  - 4fd5fd11 2026-08-18T11:48:48+03:00 test(seo): add Hermes framework P0 release gate

### agent/repair-shop-quickstart-597

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 851; PR #648 closed.
- Relevant files: `public/repair-shop-quickstart.js`, `src/components/RepairShopQuickStartEnhancer.astro`, `tests/repair-shop-quickstart.spec.ts`
- Latest unique commits:
  - 9c283c0c 2026-08-18T06:21:23+03:00 test(connect): cover repair shop quick-start flow
  - 65b7cf0d 2026-08-18T06:21:02+03:00 feat(connect): wire repair shop quick-start enhancer
  - 4cca2a12 2026-08-18T06:20:34+03:00 feat(connect): add repair shop quick-start controls
  - 4bafaeb1 2026-08-18T06:20:03+03:00 feat(connect): add repair shop quick-start enhancer

### feature/hermes-connect-academy-beauty-prep

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 870; PR #643 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-18-hermes-connect-academy-beauty.json`, `scripts/hermes-connect-product.test.mjs`, `src/components/HermesConnectLauncher.astro`, `src/components/HermesConnectVerticalPreview.astro`, `src/pages/services/hermes-connect/academy/index.astro`, `src/pages/services/hermes-connect/beauty-salons/index.astro`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - f026b592 2026-08-18T05:42:26+03:00 test(connect): assert preparation verticals in site bridge
  - b62c45a2 2026-08-18T05:41:20+03:00 test(connect): distinguish preparation from preview verticals
  - c9f12bd7 2026-08-18T05:30:08+03:00 fix(connect): preserve canonical launcher default
  - 2dd7d48a 2026-08-18T05:26:55+03:00 fix(connect): add breadcrumbs to vertical preparation pages
  - 5bfc5922 2026-08-18T05:24:43+03:00 chore(seo): add Academy and Beauty Connect routes to sitemap

### design/hermes-home-first-visit-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 32, behind 870; PR #641 closed.
- Latest unique commits:
  - ee3b8957 2026-08-18T05:08:01+03:00 design(home): remove blocking first-visit intro
  - c77fe6e5 2026-08-18T00:51:14+03:00 test(home): align legacy browser contract with commercial hero
  - c6882eab 2026-08-18T00:34:00+03:00 design(home): make Academy structure explicit and trustworthy
  - b6992c2e 2026-08-18T00:31:47+03:00 test(home): align hero contract with action-led message
  - a066d06b 2026-08-18T00:31:27+03:00 test(home): preserve frozen hero slogan for validation

### design/hermes-home-commercial-hierarchy-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 31, behind 870; PR #640 closed.
- Latest unique commits:
  - c77fe6e5 2026-08-18T00:51:14+03:00 test(home): align legacy browser contract with commercial hero
  - c6882eab 2026-08-18T00:34:00+03:00 design(home): make Academy structure explicit and trustworthy
  - b6992c2e 2026-08-18T00:31:47+03:00 test(home): align hero contract with action-led message
  - a066d06b 2026-08-18T00:31:27+03:00 test(home): preserve frozen hero slogan for validation
  - f4cd32b9 2026-08-18T00:31:08+03:00 design(home): make hero explain the work Hermes does

### design/hermes-carrier-calculators-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 19, behind 870; PR #639 closed.
- Latest unique commits:
  - e4c20f88 2026-08-18T00:01:52+03:00 test(calculators): align visual contract with responsive focus behavior
  - cc417168 2026-08-17T23:48:05+03:00 design(calculators): share Hermes carrier calculator presentation
  - 7737ccab 2026-08-17T23:39:07+03:00 design(resources): converge shared public resource shell
  - e90d8f6f 2026-08-17T23:26:59+03:00 design(case): converge case studies on Hermes public system
  - 0faf9500 2026-08-17T22:20:40+03:00 design(localized): converge multilingual overview pages on Hermes system

### design/hermes-shared-resource-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 17, behind 870; PR #638 closed.
- Latest unique commits:
  - 7737ccab 2026-08-17T23:39:07+03:00 design(resources): converge shared public resource shell
  - e90d8f6f 2026-08-17T23:26:59+03:00 design(case): converge case studies on Hermes public system
  - 0faf9500 2026-08-17T22:20:40+03:00 design(localized): converge multilingual overview pages on Hermes system
  - ff965640 2026-08-17T22:08:00+03:00 design(services): converge shared digital services on Hermes system
  - 4a661d87 2026-08-17T21:51:01+03:00 fix(carrier): align responsive radii with visual contract

### design/hermes-case-studies-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 16, behind 870; PR #637 closed.
- Latest unique commits:
  - e90d8f6f 2026-08-17T23:26:59+03:00 design(case): converge case studies on Hermes public system
  - 0faf9500 2026-08-17T22:20:40+03:00 design(localized): converge multilingual overview pages on Hermes system
  - ff965640 2026-08-17T22:08:00+03:00 design(services): converge shared digital services on Hermes system
  - 4a661d87 2026-08-17T21:51:01+03:00 fix(carrier): align responsive radii with visual contract
  - 5dbc4ff6 2026-08-17T21:17:43+03:00 fix(carrier): outrank scoped legacy styles and prevent mobile overflow

### design/hermes-localized-overviews-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 15, behind 870; PR #636 closed.
- Latest unique commits:
  - 0faf9500 2026-08-17T22:20:40+03:00 design(localized): converge multilingual overview pages on Hermes system
  - ff965640 2026-08-17T22:08:00+03:00 design(services): converge shared digital services on Hermes system
  - 4a661d87 2026-08-17T21:51:01+03:00 fix(carrier): align responsive radii with visual contract
  - 5dbc4ff6 2026-08-17T21:17:43+03:00 fix(carrier): outrank scoped legacy styles and prevent mobile overflow
  - 30765224 2026-08-17T21:05:36+03:00 test(carrier): restore entry visual coverage

### design/hermes-digital-services-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 870; PR #635 closed.
- Latest unique commits:
  - ff965640 2026-08-17T22:08:00+03:00 design(services): converge shared digital services on Hermes system
  - 4a661d87 2026-08-17T21:51:01+03:00 fix(carrier): align responsive radii with visual contract
  - 5dbc4ff6 2026-08-17T21:17:43+03:00 fix(carrier): outrank scoped legacy styles and prevent mobile overflow
  - 30765224 2026-08-17T21:05:36+03:00 test(carrier): restore entry visual coverage
  - 2d01f623 2026-08-17T21:05:23+03:00 design(carrier): restore scoped carrier entry visual layer

### design/hermes-carrier-entry-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 13, behind 870; PR #634 closed.
- Latest unique commits:
  - 4a661d87 2026-08-17T21:51:01+03:00 fix(carrier): align responsive radii with visual contract
  - 5dbc4ff6 2026-08-17T21:17:43+03:00 fix(carrier): outrank scoped legacy styles and prevent mobile overflow
  - 30765224 2026-08-17T21:05:36+03:00 test(carrier): restore entry visual coverage
  - 2d01f623 2026-08-17T21:05:23+03:00 design(carrier): restore scoped carrier entry visual layer
  - 8ebb5951 2026-08-17T21:04:24+03:00 design(carrier): rebase carrier import on fresh Contact head

### design/hermes-contact-public-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 8, behind 870; PR #633 closed.
- Latest unique commits:
  - b32d6fa8 2026-08-17T21:02:56+03:00 test(contact): restore shared contact visual coverage
  - 6ebf67ac 2026-08-17T21:02:42+03:00 design(contact): restore shared public contact styles
  - 1bf53df8 2026-08-17T21:02:13+03:00 design(contact): rebase shared contact import on fresh Trust head
  - d66f75c4 2026-08-17T21:01:04+03:00 test(trust): restore policy visual coverage
  - a6cf3eec 2026-08-17T21:00:50+03:00 design(trust): rebase policy pages on fresh Logistics head

### design/hermes-trust-public-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 870; PR #632 closed.
- Latest unique commits:
  - d66f75c4 2026-08-17T21:01:04+03:00 test(trust): restore policy visual coverage
  - a6cf3eec 2026-08-17T21:00:50+03:00 design(trust): rebase policy pages on fresh Logistics head
  - 2cee2946 2026-08-17T20:59:12+03:00 test(logistics): restore commercial visual coverage
  - 74240537 2026-08-17T20:58:57+03:00 design(logistics): restore canonical commercial polish
  - c7bdd54d 2026-08-17T20:58:36+03:00 design(logistics): rebase commercial component on current main

### design/hermes-logistics-commercial-main

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 870; PR #630 closed.
- Latest unique commits:
  - 2cee2946 2026-08-17T20:59:12+03:00 test(logistics): restore commercial visual coverage
  - 74240537 2026-08-17T20:58:57+03:00 design(logistics): restore canonical commercial polish
  - c7bdd54d 2026-08-17T20:58:36+03:00 design(logistics): rebase commercial component on current main

### design/hermes-contact-public-refresh

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 12, behind 894; PR #629 closed.
- Latest unique commits:
  - 17c638dc 2026-08-17T19:11:34+03:00 test(contact): guard refreshed shared public CTA
  - bb9d47d9 2026-08-17T19:11:13+03:00 design(contact): add shared public contact visual layer
  - af85ba58 2026-08-17T19:10:56+03:00 design(contact): load shared public contact system
  - 60833c69 2026-08-17T19:09:32+03:00 test(trust): guard refreshed public trust system
  - ec4c626b 2026-08-17T19:09:16+03:00 design(trust): refresh shared policy template

### design/hermes-trust-public-refresh

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 894; PR #628 closed.
- Latest unique commits:
  - 60833c69 2026-08-17T19:09:32+03:00 test(trust): guard refreshed public trust system
  - ec4c626b 2026-08-17T19:09:16+03:00 design(trust): refresh shared policy template
  - 39baf160 2026-08-17T19:06:32+03:00 test(logistics): guard refreshed commercial visual layer
  - eee69a25 2026-08-17T19:06:13+03:00 design(logistics): add refreshed commercial visual layer
  - 25281ba0 2026-08-17T19:05:44+03:00 design(logistics): refresh commercial links on stacked Hermes system

### design/hermes-logistics-commercial-refresh

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 894; PR #627 closed.
- Latest unique commits:
  - 39baf160 2026-08-17T19:06:32+03:00 test(logistics): guard refreshed commercial visual layer
  - eee69a25 2026-08-17T19:06:13+03:00 design(logistics): add refreshed commercial visual layer
  - 25281ba0 2026-08-17T19:05:44+03:00 design(logistics): refresh commercial links on stacked Hermes system
  - 2612ab34 2026-08-17T18:59:50+03:00 test(technology): guard refreshed public system
  - 40a62341 2026-08-17T18:59:30+03:00 fix(technology): make public surface ownership explicit

### design/hermes-contact-public-system

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 896; PR #625 closed.
- Latest unique commits:
  - e56eee73 2026-08-17T16:39:56+03:00 test(contact): guard shared public contact primitive
  - 3ad24a15 2026-08-17T16:39:35+03:00 design(contact): load shared contact primitive
  - c5a3ec89 2026-08-17T16:39:13+03:00 design(contact): add unified public contact system

### design/hermes-logistics-commercial-polish

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 8, behind 896; PR #623 closed.
- Latest unique commits:
  - d4e7e001 2026-08-17T16:33:19+03:00 fix(logistics): scope commercial sibling to live route
  - beedd4b2 2026-08-17T16:32:42+03:00 test(logistics): target live sibling commercial module
  - a55512d2 2026-08-17T16:16:18+03:00 refactor(logistics): remove obsolete compatibility importance
  - a397e656 2026-08-17T16:15:32+03:00 refactor(logistics): keep commercial styles component-owned
  - 21940d6f 2026-08-17T16:15:03+03:00 refactor(logistics): remove legacy commercial inline palette

### design/hermes-trust-public-system

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 896; PR #624 closed.
- Latest unique commits:
  - 9d6fcc20 2026-08-17T16:26:35+03:00 test(trust): assert responsive contact radius directly
  - 05f314af 2026-08-17T16:26:02+03:00 test(trust): guard unified policy family
  - faa3139d 2026-08-17T16:25:40+03:00 design(trust): converge policy pages on Hermes system

### design/hermes-technology-public-system

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 897; PR #622 closed.
- Latest unique commits:
  - 627ef939 2026-08-17T16:23:47+03:00 fix(technology): load explicit surface ownership
  - de8a3c54 2026-08-17T16:23:22+03:00 fix(technology): make public surface ownership explicit
  - b137eafd 2026-08-17T16:07:08+03:00 test(technology): verify contained Obsidian mockups
  - eda56c5d 2026-08-17T16:02:26+03:00 test(technology): guard unified public system
  - 6c1070bd 2026-08-17T16:02:01+03:00 design(technology): add unified public system

### feature/repair-shop-retention-share-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 10, behind 1013; PR #602 closed.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopAuthLocaleEnhancer.astro`, `src/components/RepairShopQuickStartEnhancer.astro`, `src/components/RepairShopRetentionShareEnhancer.astro`, `tests/repair-shop-quickstart.spec.ts`, `tests/repair-shop-retention-share.spec.ts`
- Latest unique commits:
  - aeff15a7 2026-08-16T23:55:09+03:00 test(connect): follow extracted activation style contract
  - a6ef53fe 2026-08-16T23:52:50+03:00 test(connect): cover native share and first-completion feedback
  - 5143a97e 2026-08-16T23:52:31+03:00 feat(connect): add retention and native share to shop activation stack
  - 9646be56 2026-08-16T23:52:16+03:00 feat(connect): add owner share and first-completion feedback nudge
  - 59217474 2026-08-16T23:50:51+03:00 test(connect): fix quick start browser selectors

### feature/repair-shop-quickstart-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 1013; PR #601 closed.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopAuthLocaleEnhancer.astro`, `src/components/RepairShopQuickStartEnhancer.astro`, `tests/repair-shop-quickstart.spec.ts`
- Latest unique commits:
  - 62bfc2d0 2026-08-16T23:54:47+03:00 test(connect): follow extracted activation style contract
  - 59217474 2026-08-16T23:50:51+03:00 test(connect): fix quick start browser selectors
  - 96ffd7fe 2026-08-16T23:50:26+03:00 test(connect): cover one-click repair shop quick start
  - 0a3646c3 2026-08-16T23:50:01+03:00 feat(connect): stack quick start on canonical shop activation
  - 84132145 2026-08-16T23:49:52+03:00 refactor(connect): isolate repair shop activation styles

### fix/repair-booking-customer-focus

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1035; PR #599 closed.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`
- Latest unique commits:
  - e1696b82 2026-08-16T23:41:03+03:00 test(connect): prevent booking-success business upsell
  - eafcbf1a 2026-08-16T23:40:51+03:00 fix(connect): keep booking confirmation customer-focused

### feature/repair-shop-free-launch-promo

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 9, behind 1036; PR #595 closed.
- Relevant files: `src/components/RepairShopAuthEntryEnhancer.astro`, `src/components/RepairShopFreeLaunchOffer.astro`, `tests/repair-shop-free-launch.spec.ts`
- Latest unique commits:
  - 68515f68 2026-08-16T23:38:25+03:00 test(connect): verify truthful launch-window wording
  - 3d2ceaf4 2026-08-16T23:38:09+03:00 fix(connect): keep free launch countdown copy truthful
  - c77bef4a 2026-08-16T23:33:55+03:00 test(connect): cover free launch registration countdown
  - 43e72de7 2026-08-16T23:33:37+03:00 fix(connect): open direct registration links in register mode
  - 4319d0cb 2026-08-16T23:33:09+03:00 fix(connect): honor direct repair shop registration links

### agent/repair-shop-activation

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 1037; PR #590 closed.
- Relevant files: `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-activation.spec.ts`
- Latest unique commits:
  - cb258cf0 2026-08-16T23:12:56+03:00 feat(connect): centralize repair shop founding offer
  - ca7eb2dc 2026-08-16T23:12:18+03:00 test(connect): cover repair shop activation guide
  - 37f0ba2e 2026-08-16T23:11:55+03:00 feat(connect): add repair shop activation guide

### design/hermes-connect-vertical-os

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 1037; PR #589 closed.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-product.test.mjs`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 08fb8b38 2026-08-16T22:05:12+03:00 test(connect): measure consent against adaptive hub primary CTA
  - 080905fe 2026-08-16T22:04:54+03:00 test(connect): verify adaptive hub bridge and product truth
  - 65df479a 2026-08-16T22:04:37+03:00 test(connect): verify adaptive vertical OS hub in browser
  - 28844cac 2026-08-16T21:53:20+03:00 test(connect): align brand funnel with adaptive vertical OS
  - b3760312 2026-08-16T21:51:54+03:00 test(connect): lock adaptive vertical OS product truth

### design/hermes-intelligence-core-lab

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1076; PR #574 closed.
- Latest unique commits:
  - 1d7ab277 2026-08-16T17:29:27+03:00 docs(connect): declare noindex intelligence core design lab
  - 08599ed2 2026-08-16T17:25:57+03:00 design(connect): add intelligence core comparison lab

### fix/connect-header-launcher-polish-alias

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1076; PR #575 closed.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `src/components/HermesConnectLauncher.astro`
- Latest unique commits:
  - 2cffd52b 2026-08-16T17:29:21+03:00 test(connect): lock header polish selector contract
  - 554a918b 2026-08-16T17:29:02+03:00 fix(connect): align header launcher polish selector

### agent/connect-host-canonical-redirect

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1079; PR #564 closed.
- Latest unique commits:
  - 89cde49f 2026-08-16T15:28:33+03:00 test(connect): enforce canonical compatibility redirects
  - 057144df 2026-08-16T15:28:12+03:00 fix(connect): redirect compatibility host to canonical product

### agent/hermes-connect-sitewide-launcher-current

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 14, behind 1083; PR #561 closed.
- Relevant files: `src/components/HermesConnectLauncher.astro`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-download-release.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`, `tests/hermes-connect-sitewide-launcher-current.spec.ts`
- Latest unique commits:
  - 9d7a5f0b 2026-08-16T13:25:58+03:00 fix(connect): retain build compatibility marker without legacy routing
  - ed9152a6 2026-08-16T13:20:59+03:00 fix(connect): preserve exact workspace compatibility signal
  - df7e3ed8 2026-08-16T13:17:17+03:00 fix(connect): preserve truthful mobile release boundary
  - 3fc5cf11 2026-08-16T13:16:14+03:00 fix(connect): preserve technology safety and workspace signals
  - 13115e5c 2026-08-16T13:13:31+03:00 fix(connect): preserve future-category product contract

### agent/hermes-connect-launch-ready

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 27, behind 1088; PR #556 closed.
- Relevant files: `public/hermes-connect-launch.js`, `scripts/hermes-connect-launch-readiness.test.mjs`, `scripts/repair-shop-growth-cta-contract.test.mjs`, `scripts/repair-shop-partner-offer-contract.test.mjs`, `src/components/HermesConnectLaunchEnhancer.astro`, `tests/hermes-connect-launch-readiness.spec.ts`
- Latest unique commits:
  - 989c12e3 2026-08-16T11:19:11+03:00 fix(connect): keep STO account links motionless
  - 5dc9e90b 2026-08-16T11:09:17+03:00 fix(connect): pin STO account actions above animations
  - 65cc1525 2026-08-16T11:09:08+03:00 fix(connect): stabilize repair launch panel
  - c1220883 2026-08-16T10:59:05+03:00 test(connect): use stable STO launch actions
  - 1378d28e 2026-08-16T10:58:50+03:00 test(connect): require stable desktop and mobile STO CTAs

### feature/repair-shop-live-partner-offer

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 10, behind 1089; PR #554 closed.
- Relevant files: `scripts/repair-shop-partner-offer-contract.test.mjs`, `tests/hermes-connect-repair-partner-offer.spec.ts`
- Latest unique commits:
  - ae85012b 2026-08-16T01:00:56+03:00 fix(repair-shops): clarify public offer privacy boundary
  - ba0bd8ad 2026-08-16T01:00:39+03:00 test(repair-shops): forbid public salesperson attribution
  - 0a0990f9 2026-08-16T01:00:30+03:00 test(repair-shops): enforce server-only attribution boundary
  - 38a72892 2026-08-16T01:00:15+03:00 fix(repair-shops): keep sales attribution out of public runtime
  - a0016d9b 2026-08-16T00:53:10+03:00 test(repair-shops): run partner offer contract in CI

### feature/repair-shop-cancel-rebook

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1102; PR #539 closed.
- Relevant files: `.github/workflows/repair-cancel-rebook-production-smoke.yml`
- Latest unique commits:
  - bffe30ca 2026-08-15T10:22:08+03:00 test(connect): verify cancelled repair slot can be rebooked
  - e4f40342 2026-08-15T10:21:23+03:00 fix(connect): allow cancelled repair slots to be rebooked

### seo14-authority-registry

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1178; PR #516 closed.
- Latest unique commits:
  - b36f00bc 2026-08-14T15:28:28+03:00 SEO14: refresh authority eligibility from primary sources
  - 22c12714 2026-08-14T15:24:03+03:00 SEO14: add evidence-gated authority opportunity registry

### feature/hermes-connect-brand-funnel-unification

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 24, behind 1181; PR #509 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-14-hermes-connect-promo-pages.json`, `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-pwa-contract.test.mjs`, `src/components/HermesConnectLauncher.astro`, `src/pages/services/hermes-connect/ai-command-center.astro`, `src/pages/services/hermes-connect/business-automation.astro`, `src/pages/services/hermes-connect/index.astro`, `src/pages/services/hermes-connect/load-analyzer.astro`, `src/pages/services/hermes-connect/proposal-builder.astro`, `src/pages/services/hermes-connect/rate-negotiator.astro`, `src/pages/services/hermes-connect/roi-calculator.astro`, `src/pages/services/hermes-connect/unified-inbox.astro`, `tests/hermes-connect-app-launch-v1.spec.ts`, `tests/hermes-connect-onboarding.spec.ts`, `tests/hermes-connect-web-product-v1.spec.ts`
- Latest unique commits:
  - 9bc37095 2026-08-14T03:43:05-05:00 seo(command-center): shorten title length to resolve technical warning
  - 63ba62e4 2026-08-14T03:41:28-05:00 docs(repair-beta): create canonical [HC-REPAIR-BETA] pilot playbook and territory schemas
  - de02dc88 2026-08-14T03:31:13-05:00 docs: document onboarding flow restoration and remote CI success in AI_HANDOFF.md
  - fab64e3b 2026-08-14T03:22:26-05:00 Fix onboarding startup logic and align E2E test suites with correct vertical contexts
  - 74499103 2026-08-14T02:33:34-05:00 fix(connect): bypass premium onboarding selectors during Playwright/automated test executions

### agent/connect-launcher-current

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 1181; PR #508 closed.
- Latest unique commits:
  - 2b2d3038 2026-08-13T17:15:38+03:00 Update Connect launcher on current main

### agent/connect-knot-after-access

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 5, behind 1182; PR #507 closed.
- Latest unique commits:
  - 8e82f55d 2026-08-13T17:03:20+03:00 Update Connect launcher
  - 1675cf9a 2026-08-13T17:00:38+03:00 Add Connect request access routing test
  - 6c388156 2026-08-13T16:55:58+03:00 Update Connect access routing
  - 5e71b957 2026-08-13T16:51:09+03:00 Hermes Connect: keep request-access route minimal
  - e504c090 2026-08-13T16:49:14+03:00 Hermes Connect: restore request-access route on current main

### agent/connect-access-fix

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 1183; PR #505 closed.
- Latest unique commits:
  - f6bc21ea 2026-08-13T16:36:02+03:00 Hermes Connect: redirect legacy apply fragment into request-access flow
  - 7b10d3e0 2026-08-13T16:35:10+03:00 Hermes Connect: preserve legacy apply deep link
  - e0d56d5b 2026-08-13T16:33:45+03:00 Hermes Connect: preserve request-access route after Brand V1 shell switch

### agent/connect-brand-launcher

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 1185; PR #504 closed.
- Latest unique commits:
  - 32b24642 2026-08-13T16:23:37+03:00 Hermes Connect: inject knot launcher into canonical intelligence shell
  - f5e832b7 2026-08-13T16:22:56+03:00 Hermes Connect: attach approved V2 style to knot launcher
  - db29e995 2026-08-13T16:19:46+03:00 Hermes Connect: add canonical knot launcher enhancer

### agent/connect-v2-knot-launch

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1187; PR #502 closed.
- Relevant files: `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-app-launch-v1.spec.ts`
- Latest unique commits:
  - 3d91bed6 2026-08-13T16:12:04+03:00 test: launch V2 workspace with Hermes knot identity
  - 521eca0f 2026-08-13T16:11:39+03:00 Hermes Connect: launch approved V2 workspace

### agent/connect-site-shell-entry

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1187; PR #501 closed.
- Relevant files: `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - bacd324d 2026-08-13T16:04:51+03:00 test: lock persistent Hermes Connect site-shell entry
  - 9f9bbb3c 2026-08-13T16:02:28+03:00 Hermes Connect: add persistent site-shell app entry

### chatgpt/hermes-connect-brand-funnel-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 1189; PR #500 closed.
- Relevant files: `scripts/hermes-connect-brand-routing.test.mjs`, `src/components/HermesConnectEntry.astro`
- Latest unique commits:
  - 5f1c772e 2026-08-13T16:01:25+03:00 test: point Connect root contract at Brand V1 workspace
  - b5b2048f 2026-08-13T16:00:53+03:00 test: add Hermes Connect Brand V1 routing contract
  - 7368c666 2026-08-13T16:00:07+03:00 style: unify legacy Connect tools with Brand V1 shell
  - 94fd9b59 2026-08-13T15:59:37+03:00 fix: unify Hermes Connect host on Brand V1 workspace
  - 7be4491b 2026-08-13T15:52:39+03:00 feat: add reusable Hermes Connect entry component

### feat/hermes-connect-visual-motion-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 22, behind 1196; PR #497 closed.
- Relevant files: `docs/release-manifest-deltas/2026-08-13-hermes-connect-web-product-v1.json`, `scripts/hermes-connect-web-product-v1.test.mjs`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-web-product-v1.spec.ts`
- Latest unique commits:
  - a0ce62a5 2026-08-13T10:41:54+03:00 release: trigger canonical Hermes Connect launch gate
  - 653c6ff9 2026-08-13T02:07:50-05:00 docs(handoff): update handoff record for open source solutions synth commit a50e8f6
  - a50e8f6f 2026-08-13T02:07:38-05:00 feat(docs): synthesize concrete open-source solutions from 10 GitHub alternatives
  - dc4337f5 2026-08-13T02:05:32-05:00 docs(handoff): update handoff record for open source forges commit ba5338b
  - ba5338b5 2026-08-13T02:05:21-05:00 feat(docs): register 10 open-source GitHub alternatives and code discovery platforms

### seo13/load-board-canonical-owner-v2

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1194; PR #492 closed.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - ee301513 2026-08-13T10:02:58+03:00 docs: record Load Board canonical owner with role-state preservation
  - 0085dd92 2026-08-13T10:02:39+03:00 test: lock Load Board canonical owner without breaking role-state UX

### seo13/load-board-canonical-owner-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 1195; PR #490 closed.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - 901343ce 2026-08-13T09:51:47+03:00 docs: record Load Board canonical owner decision
  - 1201ed1b 2026-08-13T09:51:32+03:00 test: lock Load Board canonical search owner
  - 6e1dbf88 2026-08-13T09:50:57+03:00 seo: link car-hauling support to canonical Load Board URL
  - d6cb8945 2026-08-13T09:50:30+03:00 seo: keep Load Board role states out of internal crawl URLs

### preview/hermes-connect-visual-review

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1203; PR #485 closed.
- Latest unique commits:
  - 08e8ba39 2026-08-13T08:38:40+03:00 chore: trigger Hermes Connect Pages visual preview
  - 9ed98342 2026-08-13T08:33:27+03:00 docs: trigger Hermes Connect visual preview build

### seo12/authority-registry

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 1308; PR #434 closed.
- Latest unique commits:
  - d6afa00f 2026-08-12T14:08:49+03:00 SEO12: add public-safe authority opportunity registry

### human-copy/load-board-dual-entry

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 6, behind 1313; PR #423 closed.
- Relevant files: `tests/load-board-dual-entry.spec.ts`
- Latest unique commits:
  - fb8e1306 2026-08-12T04:29:11-05:00 test: match accessible carrier entry label
  - fab46950 2026-08-12T12:07:37+03:00 Accessibility: load Load Board role enhancer
  - bed1bf67 2026-08-12T12:06:48+03:00 Accessibility: clarify carrier Load Board entry name
  - a63ee756 2026-08-12T04:00:19-05:00 test: align Load Board carrier entry label
  - 63987080 2026-08-12T04:00:19-05:00 Copy: make Load Board customer/carrier dual entry explicit

### seo11/proof-candidate-selection-status

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1324; PR #413 closed.
- Latest unique commits:
  - 791da873 2026-08-12T02:40:04+03:00 SEO11: sync proof candidate selection CSV
  - 7d715f7a 2026-08-12T02:39:53+03:00 SEO11: record private proof candidate selection status

### feature/route-demand-development-story

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 1328; PR #405 closed.
- Latest unique commits:
  - 27502eb2 2026-08-12T02:06:05+03:00 docs: clarify direct freight route-demand development for AI
  - 641b903d 2026-08-12T02:05:11+03:00 docs: add route-demand release communications runbook
  - 735c0e8d 2026-08-12T02:04:36+03:00 feat: surface route-demand development on carrier path
  - f94ee411 2026-08-12T02:03:58+03:00 feat: add carrier route-demand development explainer

### docs/connect-agent-readiness-2026-08-11

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 1334; PR #395 closed.
- Latest unique commits:
  - f60daf09 2026-08-12T01:23:51+03:00 Docs: classify existing APIs for Agent Readiness
  - 0b5fb5e3 2026-08-12T01:22:29+03:00 Docs: record Connect 4/5 rescan and AEO model divergence
  - 70d3cc55 2026-08-12T01:12:31+03:00 Docs: add authenticated connect Agent Readiness rescan
  - f815eb81 2026-08-12T01:02:57+03:00 Docs: record Hermes Connect Agent Readiness baseline

### seo11/authority-registry-v1

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 1332; PR #398 closed.
- Latest unique commits:
  - bbd33760 2026-08-12T01:11:30+03:00 Add public-safe authority opportunity registry

### docs/hermes-ai-collaboration-system

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 8, behind 1522; PR #288 closed.
- Latest unique commits:
  - e6b90a98 2026-08-06T02:20:30-05:00 docs: add universal AI onboarding prompt
  - 35734f10 2026-08-06T02:20:13-05:00 docs: capture Hermes Connect design state
  - 6f1307ce 2026-08-06T02:19:57-05:00 docs: add proposal template
  - 979df2d5 2026-08-06T02:19:42-05:00 docs: add AI identity template
  - 67fa6d4c 2026-08-06T02:19:36-05:00 docs: add decision log

### docs/reconcile-hermes-connect-readme

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 1612; PR #248 closed.
- Latest unique commits:
  - 07f5e83f 2026-08-04T19:27:22-05:00 Docs: reconcile Hermes Connect repository release status

### fix/connect-post-release-verification

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 1629; PR #237 closed.
- Latest unique commits:
  - 43193feb 2026-08-04T18:01:52-05:00 Ops: add controlled Cloudflare Pages production deploy
  - 9a45e75f 2026-08-04T17:43:38-05:00 ci(connect): test deployment classifier before live checks
  - 85e8ced6 2026-08-04T17:43:12-05:00 test(connect): cover isolation and release classifications
  - 415aeeeb 2026-08-04T17:42:53-05:00 ci(connect): verify preview baseline and post-release deployment
  - c8a260b7 2026-08-04T17:42:35-05:00 feat(connect): verify post-release web app and site bridge

### ops/connect-live-recheck-2026-08-05

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 2, behind 1628; PR #238 closed.
- Latest unique commits:
  - cd081042 2026-08-04T17:58:50-05:00 ops(connect): include main-site overview in live recheck
  - c289f7ca 2026-08-04T17:56:09-05:00 ops(connect): rerun live release observation

### seo5/hermes-connect-conversion-refresh

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 7, behind 1638; PR #231 closed.
- Relevant files: `tests/hermes-connect-conversion.spec.ts`
- Latest unique commits:
  - 766079bb 2026-08-04T16:43:13-05:00 Keep Codex workspace sync from overwriting Connect landing
  - 0440e2c7 2026-08-04T16:42:12-05:00 Protect Hermes Connect contact email from Cloudflare rewriting
  - 540bb4a8 2026-08-04T16:38:52-05:00 Add Hermes Connect conversion and responsive tests
  - cb7fc711 2026-08-04T16:38:38-05:00 Connect category preview and early-access application flow
  - 850521ef 2026-08-04T16:38:09-05:00 Add cross-category product and application model

### marketing/carrier-qualification-funnel

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 8, behind 1742; PR #114 closed.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - 46600db9 2026-08-01T21:50:56-05:00 Test carrier readiness qualification path
  - 9e841a8d 2026-08-01T21:50:35-05:00 Pass carrier handoff through qualification gate
  - baa1e49f 2026-08-01T21:50:13-05:00 Pass carrier analytics through qualification gate
  - 5474c55d 2026-08-01T21:49:52-05:00 Test carrier qualification review and handoff
  - a561c59f 2026-08-01T21:49:20-05:00 Mount carrier qualification enhancer

### codex/shipment-history-booked-status-2026-08-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 35, behind 1755; PR #85 closed.
- Latest unique commits:
  - eadf6942 2026-08-01T20:38:05-05:00 test: run Playwright with current date fixture
  - 82c75793 2026-08-01T20:37:52-05:00 test: make load-board e2e date stable
  - 3264c8be 2026-08-01T19:36:50-05:00 chore: reconcile current main IndexNow ownership key
  - c2a78086 2026-08-01T19:36:42-05:00 chore: reconcile current main IndexNow script
  - b38b958e 2026-08-01T19:36:28-05:00 chore: reconcile current main IndexNow workflow

### codex/phase-stack-main-reconciliation-2026-08-01

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 20, behind 1782; PR #78 closed.
- Relevant files: `scripts/load-board-adapter-registry.test.mjs`
- Latest unique commits:
  - b1364c69 2026-08-01T04:32:45-05:00 test: register load-board adapter checks
  - 6a65c599 2026-08-01T04:32:31-05:00 test: add default-deny load-board registry coverage
  - d4f5d19c 2026-08-01T04:32:17-05:00 feat: port default-deny load-board adapter registry
  - f00d8e2f 2026-08-01T04:29:27-05:00 docs: summarize reconciliation branch
  - 6723d532 2026-08-01T04:29:19-05:00 docs: stop planning-only expansion

### codex/load-board-adapter-registry

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 4, behind 1965; PR #40 closed.
- Relevant files: `scripts/load-board-adapter-registry.test.mjs`
- Latest unique commits:
  - b9e25ca0 2026-07-31T07:16:49-05:00 Fix adapter transport typing
  - fab0a1c5 2026-07-31T07:14:41-05:00 Run load-board adapter registry checks in CI
  - 953986b6 2026-07-31T07:14:18-05:00 Test disabled-by-default load-board adapter registry
  - 0f483d7f 2026-07-31T07:13:54-05:00 Add disabled-by-default load-board adapter registry

### codex/load-board-integration-research

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 1, behind 1965; PR #39 closed.
- Latest unique commits:
  - 778886cb 2026-07-31T07:10:07-05:00 Document official load-board integration discovery

### codex/shipment-history-preview-phase2

- Status: **CLOSED_UNMERGED_REVIEW**; ahead 3, behind 1965; PR #36 closed.
- Latest unique commits:
  - 154dd7f0 2026-07-31T06:56:17-05:00 Run import-preview quarantine checks in CI
  - 348ae03a 2026-07-31T06:56:02-05:00 Test preview-only import quarantine and lifecycle transitions
  - 795ede3a 2026-07-31T06:55:35-05:00 Add preview-only import quarantine and lifecycle model

### hc/repair-shops-finish-and-light-design-20260907

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 9, behind 132; PR #1126 merged.
- Relevant files: `public/repair-shop-design-polish.css`, `public/repair-shop-local-demo.js`, `scripts/repair-shop-private-design-contract.test.mjs`, `src/pages/services/hermes-connect/repair-shops/auth.astro`, `tests/hermes-connect-repair-auth-mode.spec.ts`, `tests/repair-shop-local-demo.spec.ts`
- Latest unique commits:
  - f045dda1 2026-09-07T01:47:24-05:00 Fit Repair Shop Pearl polish within site budget
  - 5165a659 2026-09-07T01:43:19-05:00 Finish Repair Shop polish performance trim
  - a92a051e 2026-09-07T01:41:01-05:00 Trim Repair Shop design polish below performance budget
  - 058bddf6 2026-09-07T01:35:44-05:00 Keep Pearl refinement inside performance budget
  - 4ed92712 2026-09-07T01:30:31-05:00 Extend Repair Shop design and preview contract

### hc/vadym-prefilled-prospects-20260907

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 134; PR #1125 merged.
- Relevant files: `.github/workflows/repair-shop-prospects-contract.yml`, `scripts/repair-shop-prospects-contract.test.mjs`, `src/pages/services/hermes-connect/internal/prospects/index.astro`
- Latest unique commits:
  - 4caafbcd 2026-09-07T00:54:06-05:00 chore: register private repair shop prospect route
  - b4d1b318 2026-09-07T00:49:17-05:00 ci: verify repair shop prospect prefill privacy contract
  - c6b5b7a4 2026-09-07T00:49:06-05:00 test: lock safe prefilled prospect contract
  - dc88f051 2026-09-07T00:48:48-05:00 feat: add private repair shop prospect review screen
  - e7052fa3 2026-09-07T00:48:01-05:00 feat: expose owner-only repair shop prospect ledger

### codex/repair-shop-crm-demo-polish-2026-09-06

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 135; PR #1124 merged.
- Relevant files: `public/repair-shop-activation.js`, `public/repair-shop-driver-discount.js`, `public/repair-shop-local-demo.js`, `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/availability.astro`, `src/pages/services/hermes-connect/repair-shops/customers.astro`, `tests/repair-shop-driver-discount.spec.ts`, `tests/repair-shop-local-demo.spec.ts`
- Latest unique commits:
  - 9f98e58a 2026-09-07T00:37:58-05:00 test: keep carrier dedupe click geometry-safe
  - bdcd787f 2026-09-06T17:18:20-05:00 Keep logistics application SEO utility gate green
  - 6bb39603 2026-09-06T17:13:56-05:00 Polish Repair Shop CRM and add local demo mode

### fix/hr-intake-current-main-20260906

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 137; PR #1121 merged.
- Latest unique commits:
  - 9845e27e 2026-09-06T15:19:07-05:00 feat(hr): persist logistics career applications from current main
  - 32361b17 2026-09-06T15:17:31-05:00 test(hr): preserve agency preview contract
  - 3cffd7f6 2026-09-06T15:17:31-05:00 test(hr): cover logistics career persistence handoff
  - 7abc8dbc 2026-09-06T15:17:06-05:00 fix(hr): use native browser UUID generator

### fix/academy-five-track-trust-badge-20260906

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 144; PR #1120 merged.
- Latest unique commits:
  - 0f3f4727 2026-09-06T15:10:51-05:00 fix(academy): align homepage trust badge with five tracks

### repair/services-workspace-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 20, behind 232; PR #1105 merged.
- Relevant files: `.github/workflows/repair-shop-services-contract.yml`, `docs/release-manifest-deltas/2026-09-05-hermes-connect-repair-services.json`, `scripts/repair-shop-services-contract.test.mjs`, `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/services.astro`, `tests/repair-shop-crm-shell.spec.ts`, `tests/repair-shop-services.spec.ts`
- Latest unique commits:
  - 5a374fd7 2026-09-05T16:28:39-05:00 test: normalize Services visual evidence capture
  - c0ad44fc 2026-09-05T16:23:37-05:00 test: activate Services skip link by keyboard
  - 161b27c6 2026-09-05T16:18:42-05:00 test: stabilize Services skip-link contract
  - 1c62a8dc 2026-09-05T16:14:27-05:00 test: verify Services private account switcher
  - 396069c5 2026-09-05T16:13:45-05:00 Repair CRM: align private header routes with owner shell

### repair/crm-office-demo-staff-schedule

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 25, behind 249; PR #1097 merged.
- Relevant files: `docs/release-manifest-deltas/2026-09-05-hermes-connect-repair-appointments.json`, `functions/api/repair-shop/bookings.ts`, `functions/api/repair-shop/customers.ts`, `functions/api/repair-shop/staff.ts`, `scripts/repair-russian-private-contract.test.mjs`, `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/appointments.astro`, `src/pages/services/hermes-connect/repair-shops/customers.astro`, `tests/hermes-connect-repair-appointments.spec.ts`, `tests/hermes-connect-repair-customers.spec.ts`, `tests/hermes-connect-repair-owner-locale-parity.spec.ts`, `tests/repair-shop-crm-shell.spec.ts`, `tests/repair-shop-office-demo.spec.ts`
- Latest unique commits:
  - 6915a500 2026-09-05T11:26:51-05:00 Repair CRM: scope locale assertion to customer list
  - 2a23ea93 2026-09-05T11:10:54-05:00 Repair CRM: align French customer summary locale contract
  - dab7bf75 2026-09-05T09:29:05-05:00 test: keep synthetic demo safety contract at registration boundary
  - 5718e2dd 2026-09-05T09:28:52-05:00 test: align CRM shell with dedicated appointments workspace
  - c5dfab1d 2026-09-05T09:28:27-05:00 test: target customer index heading after CRM detail workspace

### fix/connect-product-hub-current-order

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 250; PR #1096 merged.
- Relevant files: `public/hermes-connect-product-priority.js`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-product-priority.spec.ts`, `tests/hermes-connect-russian-complete.spec.ts`
- Latest unique commits:
  - 3f54be38 2026-09-05T08:15:11-05:00 test(hc): align Repair family nav with current product contract
  - 86ad8913 2026-09-05T08:14:27-05:00 test(hc): require localized AI product label
  - 34ff2501 2026-09-05T08:14:04-05:00 test(hc): align Russian navigation with current product order
  - 8dfe0e5a 2026-09-05T08:13:36-05:00 fix(hc): localize priority product labels
  - 3dc1ebe8 2026-09-05T07:56:16-05:00 test(hc): lock current product priority and active state

### repair/crm-shell-current-main

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 9, behind 251; PR #1092 merged.
- Relevant files: `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopOwnerNavEnhancer.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-repair-owner-nav.spec.ts`, `tests/repair-shop-crm-shell.spec.ts`
- Latest unique commits:
  - 10dcd7fb 2026-09-05T07:10:10-05:00 fix(repair): hydrate CRM shell locale from runtime URL
  - beba6dd8 2026-09-05T05:34:24-05:00 Merge current main into Repair Shop CRM shell
  - d140f6a1 2026-09-05T05:33:13-05:00 test(repair): refresh CRM acceptance on current main
  - 1320b603 2026-09-05T05:16:42-05:00 test(repair): enforce full viewport CRM app frame
  - 0119972f 2026-09-05T05:16:25-05:00 fix(repair): make CRM shell a real viewport app frame

### fix/load-board-email-contract-clock-20260905

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 252; PR #1095 merged.
- Relevant files: `scripts/load-board-email-bridge-contract.test.mjs`
- Latest unique commits:
  - 337b841f 2026-09-05T05:18:45-05:00 test(load-board): remove wall-clock expiry from email bridge fixture

### fix/repair-context-fresh-main-20260904

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 253; PR #1091 merged.
- Relevant files: `src/components/HermesConnectExperience.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-russian-complete.spec.ts`
- Latest unique commits:
  - 7db7ce5e 2026-09-04T16:21:35-05:00 test(connect): align Repair context regression with focused shell
  - 08f1d300 2026-09-04T16:04:38-05:00 fix(connect): keep Repair Shop shell context-specific

### seo/carrier-ga4-bridge-72h

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 254; PR #1090 merged.
- Relevant files: `tests/hermes-connect-analytics-consent.spec.ts`
- Latest unique commits:
  - c2138489 2026-09-04T12:25:49-05:00 fix(analytics): keep CI and preview traffic out of GA4
  - e4295e13 2026-09-04T12:15:24-05:00 test(analytics): verify carrier events reach consented GA4 transport
  - b1dac2e7 2026-09-04T12:14:37-05:00 fix(analytics): transport approved carrier events to GA4

### seo/load-board-owner-query-fit-72h

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 255; PR #1089 merged.
- Latest unique commits:
  - c011e9bf 2026-09-04T11:57:27-05:00 chore(seo): reconcile load board patch with current main
  - cfa9c174 2026-09-04T11:51:18-05:00 feat(seo): apply bounded load board query-fit patch
  - 455664ba 2026-09-04T11:48:23-05:00 fix(seo): restore complete load board before bounded patch
  - aeda878d 2026-09-04T11:47:41-05:00 test(seo): lock canonical load board query fit
  - 4755663d 2026-09-04T11:47:33-05:00 feat(seo): strengthen canonical load board query fit

### seo/p0-car-hauling-repair-72h

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 18, behind 256; PR #1087 merged.
- Latest unique commits:
  - 947f4834 2026-09-04T11:42:02-05:00 docs(seo): record verified page-query owner split
  - 56c7502b 2026-09-04T11:41:42-05:00 test(seo): lock dispatch and load-board owner separation
  - dd8b4dd4 2026-09-04T11:41:24-05:00 fix(seo): preserve page-query owner separation
  - f0a5e299 2026-09-04T11:37:20-05:00 fix(seo): preserve car hauling browser contracts
  - 963f39f2 2026-09-04T11:22:13-05:00 docs(seo): align 72h evidence with bounded implementation

### feature/loadboard-approved-email-bridge

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 257; PR #1085 merged.
- Relevant files: `scripts/load-board-email-bridge-contract.test.mjs`, `scripts/load-board-intake-api-contract.test.mjs`
- Latest unique commits:
  - f37c648d 2026-09-04T10:10:24-05:00 ci(cloudflare): dry-run composed Worker in PR ownership gate
  - 2bedc9a9 2026-09-04T10:10:06-05:00 ci(load-board): dry-run Worker package before credential gate
  - 3a1ef7bd 2026-09-04T10:02:30-05:00 test(load-board): cover complete general freight equipment projection
  - f76094ba 2026-09-04T10:02:09-05:00 fix(load-board): expose all supported general freight equipment filters
  - e22224b6 2026-09-04T09:58:56-05:00 test(cloudflare): require Load Board bridge gate before Worker deploy

### feature/loadboard-general-freight-intake-hold

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 258; PR #1083 merged.
- Relevant files: `scripts/load-board-intake-api-contract.test.mjs`
- Latest unique commits:
  - 55b92351 2026-09-04T09:36:29-05:00 fix(load-board): enforce general freight intake while Car Hauling is on hold

### fix/hc-mobile-language-default-scroll

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 260; PR #1081 merged.
- Relevant files: `scripts/repair-russian-private-contract.test.mjs`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-mobile-nav-contrast.spec.ts`
- Latest unique commits:
  - 831ae2ee 2026-09-04T09:20:02-05:00 test: keep explicit RU while clean Connect entry returns English
  - 7c50b71b 2026-09-04T09:19:27-05:00 test: allow subpixel viewport rounding in mobile drawer
  - ffe31169 2026-09-04T09:19:08-05:00 test: align clean Connect entry with English default
  - d50a6339 2026-09-04T08:21:25-05:00 test(hc): cover stale locale and mobile language scrolling
  - 306fbebc 2026-09-04T08:21:00-05:00 test(hc): lock English default and scrollable mobile language drawer

### feature/loadboard-product-ui-1074

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 260; PR #1082 merged.
- Relevant files: `tests/load-board-product.spec.ts`
- Latest unique commits:
  - a7801838 2026-09-04T09:18:20-05:00 test(load-board): make product coverage responsive-safe
  - b4a42825 2026-09-04T08:56:38-05:00 feat(load-board): expose marketplace product across Logistics and IT

### feat/repair-shop-driver-discount-20260904

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 262; PR #1080 merged.
- Relevant files: `functions/api/repair-shop/driver-discount.ts`, `public/repair-shop-driver-discount.js`, `scripts/repair-shop-driver-discount-contract.test.mjs`, `tests/repair-shop-driver-discount.spec.ts`
- Latest unique commits:
  - 3c986702 2026-09-04T07:44:37-05:00 test(repair): gate Hermes driver discount contract in CI
  - eb48240a 2026-09-04T07:44:21-05:00 test(repair): cover owner and public driver discounts
  - d12a1d1c 2026-09-04T07:43:45-05:00 test(repair): lock driver discount contract
  - 60828640 2026-09-04T07:43:24-05:00 feat(repair): load driver discount experience on repair surfaces
  - cf7b217e 2026-09-04T07:43:01-05:00 feat(repair): add multilingual Hermes driver discount UI

### feature/loadboard-intake-api-1074

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 262; PR #1079 merged.
- Relevant files: `scripts/load-board-intake-api-contract.test.mjs`
- Latest unique commits:
  - d045fafb 2026-09-04T07:28:18-05:00 Fix Load Board visibility type gate
  - b665ec97 2026-09-04T07:24:51-05:00 Run Load Board intake contract in CI
  - 4f453973 2026-09-04T07:24:31-05:00 Add Load Board intake API contract coverage
  - 5dacbfe0 2026-09-04T07:24:14-05:00 Add safe active Load Board feed API
  - 5c611ec7 2026-09-04T07:23:43-05:00 Add authenticated Load Board intake endpoint

### feature/realtime-mailbox-intake-1074

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 263; PR #1075 merged.
- Latest unique commits:
  - 15d16d4b 2026-09-04T07:06:33-05:00 test(load-board): register live pilot route in release manifest
  - b51bd001 2026-09-04T07:04:04-05:00 feat(load-board): add Tina live feed pilot page
  - 753772ea 2026-09-04T06:50:46-05:00 test(load-board): cover freight capacity email parsing
  - 8e91661c 2026-09-04T06:50:38-05:00 feat(load-board): add freight email capacity parser contract

### seo-geo/revenue-100-2026-09-04

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 24, behind 267; PR #1059 merged.
- Relevant files: `tests/academy-subsite.spec.ts`
- Latest unique commits:
  - 46b33021 2026-09-04T04:30:59-05:00 fix(seo): remove false sameAs regex collision
  - 48818e09 2026-09-04T03:29:32-05:00 docs(geo): state real-provider observation rule explicitly
  - d40c893a 2026-09-04T03:05:22-05:00 chore(sync): reconcile governance state from main #1066
  - c00cc6b2 2026-09-04T03:04:09-05:00 docs(geo): record current evidence and subordinate labels
  - e2d13968 2026-09-04T03:03:35-05:00 test(geo): align content pipeline canonical directions

### fix/hc-auth-source-truth-2026-09-04

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 270; PR #1064 merged.
- Relevant files: `src/pages/services/hermes-connect/repair-shops/auth.astro`
- Latest unique commits:
  - 4fcd6dec 2026-09-03T18:35:14-05:00 fix(connect): align repair owner auth source truth

### feat/hc-owner-registrations-clean-main-2026-09-04

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 270; PR #1062 merged.
- Relevant files: `docs/release-manifest-deltas/2026-09-03-hermes-connect-registration-ops.json`, `functions/api/repair-shop/profile.ts`, `scripts/hermes-connect-registration-ops-contract.test.mjs`, `src/pages/services/hermes-connect/internal/registrations/index.astro`
- Latest unique commits:
  - 0a73b9c1 2026-09-03T18:15:01-05:00 feat(connect): replay owner registration ledger on current main

### fix/connect-analytics-verifier-current-routing-2026-09-04

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 271; PR #1060 merged.
- Latest unique commits:
  - 838294db 2026-09-03T17:27:28-05:00 fix(ci): align Connect analytics verifier with current routing

### design/p4-repair-resilience-states-2026-09-03

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 274; PR #1052 merged.
- Relevant files: `tests/hermes-connect-repair-resilience.spec.ts`
- Latest unique commits:
  - c6b8e3c2 2026-09-03T16:32:05-05:00 test(design): model Repair service outage through retry
  - c37f0cb0 2026-09-03T16:16:03-05:00 fix(design): load Repair resilience observer before dashboard runtime
  - 374c266a 2026-09-03T16:02:21-05:00 fix(design): bind Repair recovery to real API outcomes
  - 2db92f4d 2026-09-03T14:52:25-05:00 fix(design): make Repair recovery state race-safe
  - 3f59a0a1 2026-09-03T14:36:06-05:00 test(design): cover repair workspace resilience states

### design/p4-public-account-affordance-2026-09-03

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 295; PR #1048 merged.
- Relevant files: `scripts/hermes-connect-account-switcher-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`, `tests/hermes-connect-account-portfolio.spec.ts`
- Latest unique commits:
  - 6da34963 2026-09-03T10:18:21-05:00 test(design): scope public account SSR privacy assertions to anchors
  - 512499bd 2026-09-03T15:09:55Z feat(design): add public authenticated Hermes account affordance
  - 245feeb9 2026-09-03T10:09:37-05:00 chore(design): normalize bounded account affordance patch
  - 88d1d198 2026-09-03T10:08:49-05:00 chore(design): run bounded public account affordance patch
  - d89682e7 2026-09-03T10:08:37-05:00 chore(design): stage bounded public account affordance patch

### fix/connect-production-verifier-current-routing-2026-09-03

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 297; PR #1047 merged.
- Latest unique commits:
  - 1970dfe9 2026-09-03T09:41:39-05:00 fix(ci): align Connect production verifier with current routing

### docs/design-state-post-hr-2026-09-03

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 305; PR #1045 merged.
- Latest unique commits:
  - 2ada88ba 2026-09-03T09:08:54-05:00 docs(design): close HR rework lane in master backlog
  - 62d36f6e 2026-09-03T09:08:14-05:00 docs(design): record merged HR convergence and bounded queue closure

### design/restore-approved-color-systems-2026-09-02

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 10, behind 432; PR #989 merged.
- Relevant files: `.github/workflows/hermes-connect-visual-evidence.yml`, `src/styles/hermes-connect-brand-visuals.css`, `src/styles/hermes-connect-division-context.css`, `src/styles/hermes-connect-workspace-colors.css`
- Latest unique commits:
  - 279358b8 2026-09-02T08:48:43+03:00 test(design): align public path contract with approved division colors
  - ec18da4e 2026-09-02T08:32:53+03:00 merge: sync approved color release with current main
  - 972559f8 2026-09-02T01:04:59+03:00 fix(design): contain Connect hero light field inside viewport
  - cb4723a9 2026-09-02T01:00:09+03:00 test(design): gate approved color system before visual capture
  - fe211b23 2026-09-02T00:59:56+03:00 test(design): protect approved Hermes color application

### hardening/internal-ai-readonly-doctor-2026-09-02

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 432; PR #990 merged.
- Relevant files: `.github/workflows/codex-hermes-router.yml`
- Latest unique commits:
  - a92a2adf 2026-09-02T08:28:50+03:00 docs(ai): require read-only doctor before runner proof
  - 405eab3f 2026-09-02T08:28:21+03:00 test(ai): lock read-only Internal AI doctor contract
  - 2940a302 2026-09-02T08:27:46+03:00 hardening(ai): add read-only Internal AI doctor

### hardening/internal-ai-evidence-redaction-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 10, behind 433; PR #988 merged.
- Relevant files: `scripts/internal-ai-assistant-contract.test.mjs`
- Latest unique commits:
  - 587c82c2 2026-09-02T01:08:48+03:00 fix(ai): assert canonical bypass prohibition correctly
  - c88c269e 2026-09-02T01:08:11+03:00 test(ai): lock canonical no-auto-review policy
  - 3e6761a6 2026-09-02T01:07:33+03:00 docs(ai): remove stale auto-review guidance from canonical agent policy
  - f9b5fc2f 2026-09-02T01:01:16+03:00 docs(ai): record fail-closed runner permission boundary
  - 979b1e4f 2026-09-02T01:00:09+03:00 test(ai): lock no-escalation runner environment contract

### replay/connect-internal-owner-bootstrap-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 434; PR #987 merged.
- Relevant files: `functions/api/internal-ai/bootstrap-owner.ts`, `scripts/internal-ai-assistant-contract.test.mjs`, `src/components/HermesConnectInternalAiNav.astro`, `tests/hermes-connect-ai-control-center.spec.ts`
- Latest unique commits:
  - eaba6219 2026-09-02T00:26:19+03:00 replay(connect): one-time internal owner activation on merged Control Center

### replay/connect-internal-ai-control-center-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 9, behind 435; PR #984 merged.
- Relevant files: `docs/release-manifest-deltas/2026-09-01-hermes-connect-ai-control-center.json`, `functions/api/internal-ai/runner/claim.ts`, `functions/api/internal-ai/runner/task.ts`, `scripts/internal-ai-assistant-contract.test.mjs`, `src/components/HermesConnectInternalAiNav.astro`, `src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-ai-control-center.spec.ts`
- Latest unique commits:
  - fedc446a 2026-09-02T00:11:38+03:00 replay(ai): stage reviewed Control Center surface for conflict reconciliation
  - c57f56d9 2026-09-02T00:11:05+03:00 replay(ai): restore reviewed Control Center project surfaces and tests
  - 669ee6ee 2026-09-02T00:08:31+03:00 replay(ai): add sanitized owner activity history
  - b998b454 2026-09-02T00:07:49+03:00 replay(ai): add owner-only internal AI navigation
  - 0bb33fdf 2026-09-02T00:07:14+03:00 replay(ai): extend security contract for runner-only prompts

### fix/repair-paid-intent-post-deploy-trigger-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 449; PR #980 merged.
- Relevant files: `.github/workflows/repair-paid-intent-production-smoke.yml`
- Latest unique commits:
  - b10ae540 2026-09-01T22:13:31+03:00 ci(repair): run paid-intent proof after successful deploy

### fix/repair-paid-intent-direct-fallback-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 450; PR #979 merged.
- Relevant files: `public/repair-shop-paid-plan-retry.js`, `tests/hermes-connect-paid-plan-idempotency.spec.ts`
- Latest unique commits:
  - 8624513d 2026-09-01T22:01:30+03:00 test(repair): verify direct paid-intent fallback
  - 24ce6556 2026-09-01T21:55:11+03:00 fix(repair): keep paid-intent direct contact fallback

### test/repair-paid-intent-diagnostic-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 451; PR #978 merged.
- Relevant files: `.github/workflows/repair-paid-intent-production-smoke.yml`
- Latest unique commits:
  - 8e724610 2026-09-01T21:42:09+03:00 test(repair): classify paid-intent receiver failures

### test/repair-paid-intent-production-smoke-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 452; PR #977 merged.
- Relevant files: `.github/workflows/repair-paid-intent-production-smoke.yml`
- Latest unique commits:
  - 03aeb6b1 2026-09-01T21:24:08+03:00 test(repair): add paid-intent production smoke

### test/connect-repair-booking-timezone-regression-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 455; PR #973 merged.
- Relevant files: `tests/hermes-connect-repair-booking-timezone.spec.ts`
- Latest unique commits:
  - 6cea09b0 2026-09-01T20:52:04+03:00 test(connect): lock Repair Shop booking to shop-calendar date

### test/connect-repair-booking-concurrency-production-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 462; PR #971 merged.
- Relevant files: `.github/workflows/repair-booking-concurrency-production-smoke.yml`, `scripts/repair-booking-concurrency-production-smoke.sh`
- Latest unique commits:
  - 3fc6e8a0 2026-09-01T19:26:45+03:00 test(connect): add production D1 booking concurrency proof

### fix/connect-availability-mobile-ergonomics-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 462; PR #967 merged.
- Relevant files: `src/styles/hermes-connect-workspace.css`, `tests/hermes-connect-workspace-design.spec.ts`
- Latest unique commits:
  - 270d5a34 2026-09-01T19:15:55+03:00 rebase(connect): replay availability mobile hardening on current main

### fix/connect-capability-slot-a11y-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 463; PR #970 merged.
- Relevant files: `src/components/RepairShopActivationEnhancer.astro`, `tests/hermes-connect-repair-a11y.spec.ts`
- Latest unique commits:
  - b1f031ba 2026-09-01T19:00:35+03:00 test(connect): lock Repair Shop mobile accessibility contracts
  - df4f6d6d 2026-09-01T19:00:06+03:00 fix(connect): harden Repair Shop capability and slot accessibility

### fix/connect-paid-activation-idempotency-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 464; PR #969 merged.
- Relevant files: `public/repair-shop-paid-plan-retry.js`, `src/components/RepairShopActivationEnhancer.astro`, `tests/hermes-connect-paid-plan-idempotency.spec.ts`
- Latest unique commits:
  - a6e4b1b0 2026-09-01T17:54:29+03:00 fix(connect): load paid activation retry guard in canonical repair shell
  - 7df6c715 2026-09-01T17:53:47+03:00 fix(connect): preserve paid activation identity across retries
  - 3c2fe9c2 2026-09-01T17:47:55+03:00 test(connect): guard paid activation retry idempotency

### design/final-design-integration-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 12, behind 478; PR #959 merged.
- Relevant files: `.github/workflows/hermes-connect-visual-evidence.yml`, `docs/release-manifest-deltas/2026-09-01-hermes-connect-option02-qa.json`, `scripts/hermes-connect-mark-contract.test.mjs`, `scripts/repair-russian-private-contract.test.mjs`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/styles/hermes-connect-division-context.css`
- Latest unique commits:
  - ed6f01b1 2026-09-01T15:58:22+03:00 docs(design): define final release completion gate
  - f951bfa3 2026-09-01T15:57:35+03:00 docs(design): register Option 02 QA and canonical design truth
  - 41bdd3a4 2026-09-01T15:54:09+03:00 design: harden Beauty B1 mobile and focus behavior
  - c48957ca 2026-09-01T15:52:55+03:00 ci(design): enforce five-width visual evidence and overflow gate
  - bec58add 2026-09-01T15:52:30+03:00 test(design): restore mark, Russian and overflow gates

### fix/connect-reminder-oidc-production-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 483; PR #953 merged.
- Relevant files: `.github/workflows/hermes-connect-weekly-inactivity-reminders.yml`, `functions/api/hermes-connect/reminders/unsubscribe.ts`, `tests/hermes-connect-reminder-oidc.spec.ts`
- Latest unique commits:
  - 9e9d5aef 2026-09-01T14:46:59+03:00 test(connect): protect reminder OIDC trust boundary
  - 548ac422 2026-09-01T14:46:45+03:00 docs(connect): document secretless reminder scheduler auth
  - 7157067b 2026-09-01T14:46:30+03:00 fix(connect): use existing server secret for reminder unsubscribe
  - fae010a7 2026-09-01T14:46:14+03:00 fix(connect): enable reminder job with GitHub OIDC
  - a4d10ba8 2026-09-01T14:45:55+03:00 feat(connect): verify GitHub Actions OIDC reminder jobs

### fix/connect-beauty-product-truth-v2-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 484; PR #951 merged.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-product.test.mjs`, `src/components/HermesConnectExperience.astro`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-beauty-live-workspace.spec.ts`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 79a6f985 2026-09-01T14:44:21+03:00 test(connect): protect private Beauty product truth
  - 1ae0f334 2026-09-01T14:43:59+03:00 test(connect): align Hub expectations with private Beauty
  - 584a4c93 2026-09-01T14:22:07+03:00 fix(connect): align Beauty private product truth

### feat/connect-beauty-b11-owner-controls-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 484; PR #952 merged.
- Relevant files: `tests/hermes-connect-beauty-owner-controls.spec.ts`
- Latest unique commits:
  - f6ea9196 2026-09-01T14:35:26+03:00 test(connect): cover Beauty B1.1 owner controls
  - 8ebbad18 2026-09-01T14:34:46+03:00 feat(connect): mount Beauty B1.1 owner controls
  - 6eed4c15 2026-09-01T14:33:59+03:00 feat(connect): add Beauty owner roster and service controls

### fix/connect-owner-signin-inactivity-reminders-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 13, behind 485; PR #950 merged.
- Relevant files: `.github/workflows/hermes-connect-weekly-inactivity-reminders.yml`, `functions/api/hermes-connect/reminders/unsubscribe.ts`, `src/components/RepairShopFreeLaunchOffer.astro`, `tests/repair-shop-inactivity-reminders.spec.ts`, `tests/repair-shop-owner-entry.spec.ts`
- Latest unique commits:
  - 0debf67d 2026-09-01T14:27:22+03:00 test(connect): cover weekly reminder window across midnight
  - e5126662 2026-09-01T14:26:55+03:00 fix(connect): preserve reminder timing across midnight
  - 69c1397d 2026-09-01T14:25:39+03:00 test(connect): protect registration-time reminder window
  - aaba6646 2026-09-01T14:25:19+03:00 fix(connect): align inactivity reminders to registration time window
  - 03ab5ff4 2026-09-01T14:21:50+03:00 docs(connect): document reminder job secret placeholder

### feat/connect-beauty-account-integration-v2-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 485; PR #946 merged.
- Relevant files: `functions/api/hermes-connect/account.ts`, `scripts/hermes-connect-account-contract.test.mjs`, `scripts/hermes-connect-account-switcher-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`, `tests/hermes-connect-account-portfolio.spec.ts`
- Latest unique commits:
  - f3292acd 2026-09-01T14:08:45+03:00 feat(connect): mount Beauty in shared private account shell
  - 5f4231db 2026-09-01T14:08:01+03:00 test(connect): protect switchable Beauty workspace
  - 1c51c87f 2026-09-01T14:06:27+03:00 feat(connect): make owned Beauty switchable
  - b059bc8d 2026-09-01T14:05:29+03:00 test(connect): protect canonical Beauty account route
  - 97daa77d 2026-09-01T14:05:13+03:00 feat(connect): expose canonical Beauty owner workspace

### feat/connect-beauty-b1-live-workspace-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 486; PR #943 merged.
- Relevant files: `docs/release-manifest-deltas/2026-09-01-hermes-connect-beauty-b1-live-workspace.json`, `src/pages/services/hermes-connect/beauty/workspace/index.astro`, `tests/hermes-connect-beauty-live-workspace.spec.ts`
- Latest unique commits:
  - ea6a5f18 2026-09-01T13:52:26+03:00 test(beauty): scope B1 profile locators
  - 857df8b4 2026-09-01T13:37:46+03:00 docs(release): register private Beauty B1 workspace
  - a03af337 2026-09-01T13:33:55+03:00 test(beauty): cover real B1 owner workspace
  - 4b111656 2026-09-01T13:33:18+03:00 feat(beauty): add real B1 owner workspace

### fix/connect-repair-registration-feedback-2026-09-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 9, behind 490; PR #936 merged.
- Relevant files: `public/repair-shop-form-clarity.js`, `tests/hermes-connect-repair-partner-offer.spec.ts`
- Latest unique commits:
  - 52e0518d 2026-09-01T11:06:46+03:00 fix(connect): strengthen equipment selection touch targets
  - f41cd0e1 2026-09-01T11:05:35+03:00 test(connect): protect review consent boundary and Russian clarity
  - 80e3964a 2026-09-01T11:03:24+03:00 fix(connect): mark optional Repair Shop fields across label patterns
  - 82ecd559 2026-09-01T11:01:55+03:00 chore(connect): clean mobile partner form rule
  - 7b8e66d4 2026-09-01T11:01:26+03:00 fix(connect): require partner consent only at real submission

### feat/connect-repair-owner-context-nav-2026-08-31

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 490; PR #934 merged.
- Relevant files: `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopOwnerNavEnhancer.astro`, `tests/hermes-connect-repair-owner-nav.spec.ts`
- Latest unique commits:
  - cb5dde5c 2026-08-31T21:57:42+03:00 test(connect): protect Repair Shop owner context nav
  - fc64c5a3 2026-08-31T21:57:18+03:00 feat(connect): mount Repair Shop owner context nav
  - 17459e3d 2026-08-31T21:56:39+03:00 feat(connect): add contextual Repair Shop owner navigation

### fix/repair-private-pearl-shell-fresh-2026-08-31

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 490; PR #930 merged.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `scripts/repair-shop-private-design-contract.test.mjs`, `tests/hermes-connect-workspace-design.spec.ts`
- Latest unique commits:
  - b6ea6891 2026-08-31T21:51:53+03:00 test(connect): lock Pearl base and Obsidian decision hierarchy
  - 0d3ed67c 2026-08-31T21:51:39+03:00 test(connect): verify canonical Pearl base and Obsidian action
  - a2ef5663 2026-08-31T21:51:09+03:00 fix(connect): align private repair shell with Pearl and Obsidian Design OS
  - ca400ba7 2026-08-31T21:21:44+03:00 test(connect): accept canonical Pearl gradient family
  - 439d05db 2026-08-31T21:07:49+03:00 docs(connect): refresh Pearl replay base after Sep15 browser fix

### feat/connect-account-switcher-unified-api-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 490; PR #910 merged.
- Relevant files: `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `scripts/hermes-connect-account-switcher-contract.test.mjs`, `src/components/HermesConnectAccountSwitcher.astro`, `tests/hermes-connect-account-portfolio.spec.ts`
- Latest unique commits:
  - 5299d35c 2026-08-31T21:22:59+03:00 test(connect): mock unified account portfolio in browser flows
  - 41647b52 2026-08-31T21:09:47+03:00 refactor(connect): drive account switcher from unified portfolio

### fix/repair-sep15-browser-contract-2026-08-31

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 491; PR #931 merged.
- Relevant files: `tests/repair-shop-free-launch.spec.ts`
- Latest unique commits:
  - 9da5a1eb 2026-08-31T19:47:23+03:00 test(connect): align Sep15 Repair Shop browser policy with current offer

### feat/london-uk-growth-cluster

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 79, behind 522; PR #913 merged.
- Relevant files: `tests/repair-shop-free-launch.spec.ts`
- Latest unique commits:
  - 9a4e3af8 2026-08-31T10:52:45+03:00 test(connect): align free launch e2e with post-deadline billing policy
  - 6d3247e5 2026-08-31T10:52:26+03:00 test(seo): include London sitemap in public contract
  - 977350c9 2026-08-31T10:33:50+03:00 seo(london): connect London hub from canonical market directions
  - 7f6981f5 2026-08-31T10:32:47+03:00 content(london): deepen UA London hub
  - 694da26e 2026-08-31T10:32:33+03:00 content(london): deepen RU London hub

### feat/connect-account-api-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 524; PR #907 merged.
- Relevant files: `functions/api/hermes-connect/account.ts`, `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `scripts/hermes-connect-account-contract.test.mjs`
- Latest unique commits:
  - 89c5f39d 2026-08-30T13:06:45+03:00 feat(connect): add unified authenticated account portfolio API

### fix/academy-russian-private-current-main-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 529; PR #909 merged.
- Relevant files: `scripts/academy-russian-private-contract.test.mjs`, `src/components/HermesConnectLauncher.astro`
- Latest unique commits:
  - 72dedac6 2026-08-30T12:59:23+03:00 test(academy): prove single canonical RU runtime mount
  - bb522734 2026-08-30T12:59:10+03:00 fix(academy): mount Russian runtime without duplicating Connect core
  - 90ffbec7 2026-08-30T12:58:26+03:00 refactor(academy): remove duplicate Connect runtime copy
  - f93db1bb 2026-08-30T12:57:29+03:00 test(academy): keep shell mount contract resilient
  - 64b69a5a 2026-08-30T12:57:08+03:00 test(academy): prove Russian runtime is mounted in Connect shell

### feat/hermes-vertical-design-tokens-current-main-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 530; PR #906 merged.
- Latest unique commits:
  - 93634cc6 2026-08-30T12:36:22+03:00 feat(brand): restore canonical Hermes vertical accent tokens

### feat/connect-account-portfolio-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 534; PR #902 merged.
- Relevant files: `src/components/HermesConnectAccountSwitcher.astro`, `tests/hermes-connect-account-portfolio.spec.ts`
- Latest unique commits:
  - 0ab52272 2026-08-30T12:05:39+03:00 fix(connect): localize account portfolio from runtime query locale
  - dc3d4641 2026-08-30T11:50:01+03:00 test(connect): protect shared account portfolio across private workspaces
  - 620b1780 2026-08-30T11:44:55+03:00 feat(connect): expose shared account portfolio on private workspaces
  - a4097122 2026-08-30T11:43:51+03:00 feat(connect): add compact shared-account menu mode

### fix/russian-route-integrity-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 25, behind 533; PR #898 merged.
- Relevant files: `src/components/HermesConnectLauncher.astro`
- Latest unique commits:
  - f8d4fbfd 2026-08-30T11:46:52+03:00 merge current main into Russian route integrity after Intel bootstrap
  - 0ef7bbab 2026-08-30T11:42:28+03:00 merge main into Russian route integrity
  - 64096641 2026-08-30T11:38:51+03:00 test(i18n): document visible launcher regression boundary
  - 884c4bdd 2026-08-30T11:33:01+03:00 test(i18n): use visible Hermes Connect entry on mobile
  - 68539912 2026-08-30T11:19:08+03:00 fix(i18n): preserve canonical Connect default contract

### fix/connect-public-truth-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 534; PR #901 merged.
- Latest unique commits:
  - 975386ab 2026-08-30T11:42:23+03:00 test(connect): align current Technology validator with live pilot truth
  - ee8c1e16 2026-08-30T11:38:08+03:00 fix(connect): align public build pulse with live Repair Shops pilot

### fix/hermes-fcc-intel-macos-bootstrap-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 535; PR #900 merged.
- Relevant files: `.github/workflows/codex-hermes-router.yml`
- Latest unique commits:
  - ee5c28fe 2026-08-30T11:37:45+03:00 test(ai): accept Markdown formatting around pinned OpenSSL version
  - a9eb9a56 2026-08-30T11:36:24+03:00 ci(ai): verify pinned Intel OpenSSL bootstrap
  - 00d82e36 2026-08-30T11:36:01+03:00 docs(ai): document reproducible Intel bootstrap boundary
  - efb0a782 2026-08-30T11:35:15+03:00 test(ai): lock Intel OpenSSL bootstrap contract
  - 33216f16 2026-08-30T11:34:43+03:00 fix(ai): expose isolated FCC helper on routed PATH

### fix/connect-ai-ru-account-shell-2026-08-30

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 536; PR #899 merged.
- Relevant files: `src/components/HermesConnectAccountSwitcher.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`
- Latest unique commits:
  - 7dfba3b6 2026-08-30T11:24:44+03:00 fix(connect): localize AI Assistant and align private workspace theme
  - 43ffd3f0 2026-08-30T11:23:54+03:00 fix(connect): localize AI Connect and move private shell to Pearl
  - 9fed750a 2026-08-30T11:23:07+03:00 feat(connect): add shared account workspace switcher

### feat/ai-connect-v1-shell

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 575; PR #880 merged.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect.json`, `src/components/HermesConnectExperience.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-internal-ai-assistant.spec.ts`
- Latest unique commits:
  - c5b394f5 2026-08-28T04:03:51-05:00 feat(connect): wire AI Connect owner navigation
  - 62797452 2026-08-28T11:50:43+03:00 test(connect): cover internal AI Connect overview
  - b51d9e81 2026-08-28T11:50:28+03:00 feat(connect): add internal AI Connect overview

### docs/hermes-connect-ai-pilot-audit-2026-08-27

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 576; PR #879 merged.
- Latest unique commits:
  - 008f5319 2026-08-27T04:26:01-05:00 docs(ai): record post-merge pilot blocker

### docs/gmail-signature-rollout-2026-08-26

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 579; PR #875 merged.
- Relevant files: `docs/email-signatures/html/hermes-connect.html`
- Latest unique commits:
  - 20352ab6 2026-08-26T06:53:21-05:00 docs: add Gmail signature rollout package

### docs/hermes-autonomy-policy-2026-08-26

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 580; PR #874 merged.
- Latest unique commits:
  - 0f0f51df 2026-08-26T05:13:26-05:00 docs(ai): define Hermes autonomy policy

### fix/repair-shops-ru-audit-2026-08-26

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 581; PR #873 merged.
- Relevant files: `src/components/HermesConnectDomReady.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-owner-locale-parity.spec.ts`
- Latest unique commits:
  - ae96cdee 2026-08-26T03:56:11-05:00 fix(connect): localize Russian owner dashboard states

### chore/codex-hermes-fcc-router-2026-08-25

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 582; PR #860 merged.
- Relevant files: `.github/workflows/codex-hermes-router.yml`
- Latest unique commits:
  - 80fe86e2 2026-08-25T09:57:45+03:00 docs(ai): record Hermes Codex routed runtime decision
  - ebe63170 2026-08-25T09:55:36+03:00 ci(ai): validate Hermes Codex router contract
  - cc78b07a 2026-08-25T09:53:48+03:00 chore(ai): add isolated routed Hermes Codex runtime

### fix/hermes-connect-russian-full-2026-08-24

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 621; PR #854 merged.
- Relevant files: `src/components/HermesConnectDomReady.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-russian-complete.spec.ts`, `tests/repair-shop-web-v1.spec.ts`
- Latest unique commits:
  - be5cd97f 2026-08-24T11:05:53+03:00 test: align Connect language switch contract with Russian content
  - 0252749e 2026-08-24T10:30:32+03:00 test(connect): expect Russian service count
  - 5f678f4d 2026-08-24T10:27:24+03:00 test(connect): cover complete Russian repair-shop surfaces
  - 6f47c36f 2026-08-24T10:26:22+03:00 fix(connect): complete Russian repair-shop localization

### fix/ceo-refresh-academy-readback-2026-08-23

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 643; PR #829 merged.
- Latest unique commits:
  - bac55d8d 2026-08-23T18:33:58+03:00 fix(connect): verify Academy learner readback shape

### fix/ceo-refresh-artifact-recovery-2026-08-23

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 648; PR #826 merged.
- Relevant files: `scripts/hermes-connect-workspace-contract.test.mjs`
- Latest unique commits:
  - a584562a 2026-08-23T15:09:25+03:00 test(connect): require bounded CEO QA recovery
  - f3d6a240 2026-08-23T15:09:00+03:00 ops(connect): harden CEO QA artifact recovery

### fix/ceo-profile-refresh-via-production-api-2026-08-23

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 649; PR #825 merged.
- Relevant files: `scripts/hermes-connect-workspace-contract.test.mjs`
- Latest unique commits:
  - d3729297 2026-08-23T14:50:21+03:00 test(connect): require API-based CEO profile refresh
  - 53aba0e7 2026-08-23T14:49:44+03:00 ops(connect): refresh CEO QA through production APIs

### fix/hermes-connect-russian-hub-2026-08-23

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 10, behind 682; PR #818 merged.
- Relevant files: `scripts/hermes-connect-product.test.mjs`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 25914a37 2026-08-23T12:14:28+03:00 test(connect): preserve RU into Academy entry
  - c2cdee98 2026-08-23T12:02:42+03:00 test(connect): prove Russian Hub content in browser
  - 42c12acd 2026-08-23T11:58:09+03:00 chore(connect): inherit current-main production verifier
  - 631b0f84 2026-08-23T11:51:45+03:00 test(connect): align experience suite with private Academy
  - 458cc106 2026-08-23T11:51:12+03:00 test(connect): align Hub status contract with private Academy

### fix/home-mobile-connect-ru-2026-08-23

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 696; PR #811 merged.
- Latest unique commits:
  - dbe7cfca 2026-08-23T09:48:43+03:00 fix(home): preserve gradient contact-shell contract
  - 003160a2 2026-08-23T09:37:28+03:00 test: cover homepage title and Connect Russian locale regressions
  - 276b36f6 2026-08-23T09:37:15+03:00 fix(connect): make locale switching persistent and reliable
  - 269b8e0b 2026-08-23T09:36:43+03:00 fix(home): load mobile visual stability layer
  - 304bead1 2026-08-23T09:36:33+03:00 fix(home): stabilize hero title and contact transitions

### finish/password-reset-timing-current-main-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 697; PR #807 merged.
- Relevant files: `scripts/repair-shop-password-recovery-contract.test.mjs`
- Latest unique commits:
  - 6f4e527b 2026-08-23T01:32:09+03:00 test(auth): run password recovery contract with TS stripping
  - 512b3c32 2026-08-23T01:31:25+03:00 test(auth): prove reset response does not await delivery
  - ebb0ab0d 2026-08-23T01:30:58+03:00 fix(auth): remove reset timing side channel

### feature/repair-first5-plan-attribution-2026-08-22

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 699; PR #803 merged.
- Relevant files: `src/pages/services/hermes-connect/repair-shops/plan.astro`, `tests/hermes-connect-repair-first5-plan-attribution.spec.ts`
- Latest unique commits:
  - 31f2b56b 2026-08-23T00:11:59+03:00 test: fix First-5 attribution payload typing
  - 13f3e9bd 2026-08-23T00:09:18+03:00 test: cover First-5 paid plan shop attribution
  - fca63cc1 2026-08-23T00:08:51+03:00 Repair: link Founding Plan requests to authenticated shop

### feature/repair-secondary-alert-locales-2026-08-22

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 700; PR #802 merged.
- Relevant files: `public/hermes-connect-repair-owner-secondary-i18n.js`, `tests/hermes-connect-repair-secondary-alert-locales.spec.ts`
- Latest unique commits:
  - c1b03306 2026-08-22T23:52:21+03:00 test(repair): use DOM-safe class mutation
  - 4709344c 2026-08-22T23:50:42+03:00 test(repair): cover secondary alert locale parity
  - 488e39fd 2026-08-22T23:50:13+03:00 fix(repair): complete secondary alert locale parity

### feature/repair-owner-locale-parity-2026-08-22

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 9, behind 701; PR #801 merged.
- Relevant files: `public/hermes-connect-repair-owner-secondary-i18n.js`, `src/components/RepairShopActivationEnhancer.astro`, `tests/hermes-connect-repair-owner-locale-parity.spec.ts`
- Latest unique commits:
  - da62cf87 2026-08-22T23:36:31+03:00 fix(repair): make secondary locale observer idempotent
  - df76fe1b 2026-08-22T23:16:33+03:00 revert(repair): drop ineffective locale heading guard
  - ebc1df85 2026-08-22T23:16:27+03:00 revert(repair): remove ineffective locale heading guard
  - 2b92cf7a 2026-08-22T23:15:52+03:00 test(repair): target exact owner page headings
  - ca8c58e0 2026-08-22T23:02:18+03:00 fix(repair): load locale heading stability guard

### feature/hermes-academy-a3-1-support-final-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 11, behind 745; PR #759 merged.
- Relevant files: `functions/api/academy/reviewer/support.ts`, `functions/api/academy/support.ts`, `scripts/academy-support-contract.test.mjs`, `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `src/pages/services/hermes-connect/academy/index.astro`, `src/pages/services/hermes-connect/academy/reviewer/support/index.astro`, `src/pages/services/hermes-connect/academy/support/index.astro`, `tests/academy-support.spec.ts`
- Latest unique commits:
  - 980c4f37 2026-08-19T16:33:15+03:00 feat(academy): expose private support entry points
  - 0f7c5a8c 2026-08-19T16:32:44+03:00 test(academy): wire support contract into shared chain
  - ab22d460 2026-08-19T16:31:57+03:00 test(academy): restore private support browser flow
  - 0c1177ef 2026-08-19T16:31:24+03:00 test(academy): restore private support contract
  - c7d417e1 2026-08-19T16:30:52+03:00 docs(academy): account for private support routes

### seo/academy-uk-marketing-final-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 745; PR #758 merged.
- Relevant files: `tests/academy-ukrainian-marketing.spec.ts`
- Latest unique commits:
  - bfb445f9 2026-08-19T16:14:36+03:00 seo(academy): add Ukrainian Marketing sitemap owner
  - fd940d42 2026-08-19T16:14:18+03:00 feat(academy): cross-link Ukrainian Logistics and Marketing
  - 18ed6bc3 2026-08-19T16:13:57+03:00 feat(academy): add reciprocal Ukrainian Marketing hreflang
  - 0016ed97 2026-08-19T16:13:42+03:00 test(academy): guard Ukrainian Marketing owner
  - 62234175 2026-08-19T16:13:21+03:00 feat(academy): add Ukrainian Marketing curriculum owner

### feature/hermes-connect-beauty-b1-final-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 748; PR #757 merged.
- Relevant files: `tests/hermes-connect-beauty-b1-backend.spec.ts`
- Latest unique commits:
  - 6589b36e 2026-08-19T16:01:31+03:00 test(connect): guard Beauty B1 backend boundaries
  - d80bfb05 2026-08-19T16:01:12+03:00 feat(connect): add Beauty team member API
  - fb70068f 2026-08-19T16:00:50+03:00 feat(connect): add Beauty team collection API
  - 047dcc90 2026-08-19T16:00:26+03:00 feat(connect): add Beauty salon profile API
  - b4e2fae7 2026-08-19T15:59:58+03:00 feat(connect): add Beauty salon schema

### seo/academy-application-analytics-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 752; PR #747 merged.
- Relevant files: `tests/academy-application-analytics.spec.ts`
- Latest unique commits:
  - 2f44afe6 2026-08-19T12:33:04+03:00 test(analytics): guard Academy funnel attribution privacy
  - 543a499d 2026-08-19T12:32:38+03:00 docs(analytics): register Academy application funnel delta
  - 90f49e86 2026-08-19T12:31:21+03:00 feat(analytics): instrument Academy application funnel
  - 2e92f835 2026-08-19T12:30:44+03:00 feat(analytics): add privacy-safe Academy application funnel events

### feature/hermes-connect-service-context-current-main-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 752; PR #740 merged.
- Relevant files: `functions/api/public/repair-booking.ts`, `tests/hermes-connect-service-context.spec.ts`
- Latest unique commits:
  - a85fac21 2026-08-19T12:23:08+03:00 test(connect): guard shared service context compatibility
  - b6676c36 2026-08-19T12:22:46+03:00 feat(connect): keep public Repair Shop booking context-safe
  - 05172335 2026-08-19T12:22:03+03:00 feat(connect): keep service deletion context-aware
  - c4263f0f 2026-08-19T12:21:47+03:00 feat(connect): scope shared service API by owner context
  - f9c1f092 2026-08-19T12:21:29+03:00 feat(connect): scope public Repair Shop services

### docs/repair-first5-scorecard-current-main-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 752; PR #733 merged.
- Latest unique commits:
  - f2aacfb1 2026-08-19T11:31:09+03:00 docs(connect): strengthen first-5 Repair Shop operating scorecard

### seo/academy-uk-application-surface-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 752; PR #732 merged.
- Relevant files: `tests/academy-ukrainian-application.spec.ts`
- Latest unique commits:
  - 1f6a3469 2026-08-19T11:28:51+03:00 test(academy): guard Ukrainian application funnel
  - 146da4cf 2026-08-19T11:28:23+03:00 release(academy): record Ukrainian application route delta
  - 1fb9ac93 2026-08-19T11:27:56+03:00 seo(academy): add Ukrainian application to Academy sitemap
  - 76bf27b1 2026-08-19T11:27:40+03:00 seo(academy): route Ukrainian logistics CTA to localized application
  - 1459b3b1 2026-08-19T11:27:15+03:00 seo(academy): add Ukrainian application surface

### seo/connect-repair-plan-attribution-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 757; PR #726 merged.
- Latest unique commits:
  - a4163d08 2026-08-19T11:01:25+03:00 test(connect): guard repair plan product attribution
  - 763bd20f 2026-08-19T09:12:15+03:00 fix(connect): normalize Repair Shops paid-plan lead attribution

### seo/academy-uk-application-shell-main-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 768; PR #719 merged.
- Relevant files: `tests/academy-application-localization.spec.ts`
- Latest unique commits:
  - 843cd567 2026-08-19T08:50:59+03:00 test(academy): guard Ukrainian application shell localization
  - c6d81ece 2026-08-19T08:50:46+03:00 feat(academy): localize Ukrainian application shell without forking backend values

### seo/academy-reciprocal-hreflang-main-2026-08-19

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 768; PR #718 merged.
- Relevant files: `tests/academy-ukraine-preview.spec.ts`
- Latest unique commits:
  - 6e8be916 2026-08-19T08:49:06+03:00 test(seo): guard reciprocal Academy hreflang
  - 62e07ad0 2026-08-19T08:48:53+03:00 fix(seo): restore reciprocal Academy EN-UK hreflang

### seo/100-task-batch-2026-08-18

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 13, behind 781; PR #692 merged.
- Relevant files: `scripts/academy-public-contract.test.mjs`, `tests/academy-application-localization.spec.ts`
- Latest unique commits:
  - 0152c8ac 2026-08-18T19:07:21+03:00 seo(logistics): register Texas Florida California research only
  - 4e144d3b 2026-08-18T19:06:35+03:00 test(academy): cover localized qualification application flow
  - 91893c30 2026-08-18T19:06:11+03:00 seo(academy): localize qualification fields without forking backend
  - ecc24cff 2026-08-18T19:04:52+03:00 ci(job): enforce vacancy lifecycle before release
  - 1c3f4e4f 2026-08-18T19:04:34+03:00 test(job): add JobPosting lifecycle release guard

### seo/hermes-framework-canonical-llms-short-2026-08-18

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 15, behind 820; PR #670 merged.
- Latest unique commits:
  - cb7258a6 2026-08-18T14:22:14+03:00 test(geo): distinguish negative from affirmative guarantees
  - dca33351 2026-08-18T14:10:42+03:00 test(geo): align llms public contract with evidence model
  - 819d5f6e 2026-08-18T14:10:29+03:00 fix(geo): preserve evidence boundaries in short AI context
  - eb5d1396 2026-08-18T13:33:50+03:00 ci: enforce short Hermes GEO context contract
  - c1bbe1f8 2026-08-18T13:33:31+03:00 geo: add short llms evidence contract

### ops/hermes-connect-owner-qa-cleanup

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 817; PR #675 merged.
- Relevant files: `.github/workflows/hermes-connect-owner-qa-provision.yml`, `scripts/hermes-connect-owner-qa-provision.sh`
- Latest unique commits:
  - 867f1bf6 2026-08-18T14:21:59+03:00 ops(connect): remove one-time CEO owner QA workflow
  - f11e31fd 2026-08-18T14:21:52+03:00 ops(connect): remove one-time CEO owner QA provision script

### ops/hermes-connect-owner-qa-secure-handoff

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 818; PR #674 merged.
- Relevant files: `scripts/hermes-connect-owner-qa-provision.sh`
- Latest unique commits:
  - a45ca1b1 2026-08-18T14:19:45+03:00 ops(connect): add encrypted CEO credential handoff

### ops/hermes-connect-owner-qa-provision-fix

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 819; PR #673 merged.
- Relevant files: `scripts/hermes-connect-owner-qa-provision.sh`
- Latest unique commits:
  - 6ce877fe 2026-08-18T14:16:29+03:00 fix(connect): complete persistent owner QA provisioning

### ops/hermes-connect-owner-qa-provision

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 820; PR #672 merged.
- Relevant files: `.github/workflows/hermes-connect-owner-qa-provision.yml`, `scripts/hermes-connect-owner-qa-provision.sh`
- Latest unique commits:
  - c19d9644 2026-08-18T14:12:20+03:00 ops(connect): add gated CEO owner QA provision workflow
  - c3e0377e 2026-08-18T14:12:10+03:00 ops(connect): add one-time owner QA provision script

### design/hermes-design-recovery-main

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 824; PR #647 merged.
- Relevant files: `scripts/academy-public-contract.test.mjs`, `src/components/HermesConnectLauncher.astro`, `tests/hermes-connect-site-bridge.spec.ts`, `tests/repair-shop-capabilities.spec.ts`
- Latest unique commits:
  - 9046bc57 2026-08-18T12:52:52+03:00 test(home): align final polish animation contract
  - 6314a66b 2026-08-18T08:39:26+03:00 design(home): finalize living four-room recovery

### fix/hermes-academy-a4-discoverability

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 822; PR #662 merged.
- Relevant files: `scripts/academy-a4-contract.test.mjs`, `src/pages/services/hermes-connect/academy/index.astro`
- Latest unique commits:
  - 591852b8 2026-08-18T12:29:57+03:00 test(academy): lock A4 workspace discovery paths
  - ea19ea24 2026-08-18T12:29:32+03:00 fix(academy): surface A2-A4 private workspaces

### feature/hermes-academy-a4-progression-completion

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 823; PR #656 merged.
- Relevant files: `functions/api/academy/progression.ts`, `functions/api/academy/reviewer/progression.ts`, `scripts/academy-a4-contract.test.mjs`, `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `src/pages/services/hermes-connect/academy/progression/index.astro`, `src/pages/services/hermes-connect/academy/reviewer/progression/index.astro`, `tests/academy-a4.spec.ts`
- Latest unique commits:
  - 73b40d1e 2026-08-18T12:14:47+03:00 feat(academy): add human-controlled A4 progression evidence

### feature/hermes-academy-a3-submission-review

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 19, behind 824; PR #654 merged.
- Relevant files: `functions/api/academy/reviewer/submissions.ts`, `functions/api/academy/submissions.ts`, `scripts/academy-a1-contract.test.mjs`, `scripts/academy-a3-contract.test.mjs`, `scripts/hermes-connect-academy-beauty-contract.test.mjs`, `src/pages/services/hermes-connect/academy/dashboard/index.astro`, `src/pages/services/hermes-connect/academy/reviewer/index.astro`, `src/pages/services/hermes-connect/academy/submissions/index.astro`, `tests/academy-a3.spec.ts`
- Latest unique commits:
  - f7692396 2026-08-18T11:20:39+03:00 test(academy): use unique reviewer name selector
  - 9a3c74e6 2026-08-18T07:44:08+03:00 fix(academy): label dynamic reviewer feedback control
  - a34c024a 2026-08-18T07:32:10+03:00 test(academy): narrow A1 credential-storage assertion
  - 23b6c2b2 2026-08-18T07:28:48+03:00 fix(academy): repair A3 no-fetch contract regex
  - 8d350c51 2026-08-18T07:21:35+03:00 security(academy): make reviewer authorization fail-closed

### design/hermes-technology-public-refresh

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 894; PR #626 merged.
- Latest unique commits:
  - 2612ab34 2026-08-17T18:59:50+03:00 test(technology): guard refreshed public system
  - 40a62341 2026-08-17T18:59:30+03:00 fix(technology): make public surface ownership explicit
  - b7ac28e1 2026-08-17T18:59:18+03:00 design(technology): add unified public system
  - 61d4845f 2026-08-17T18:58:45+03:00 design(technology): refresh unified public imports

### design/hermes-academy-public-system

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 897; PR #621 merged.
- Latest unique commits:
  - 341388c3 2026-08-17T16:06:07+03:00 test(academy): respect responsive learning radii
  - 2f1377d1 2026-08-17T15:57:45+03:00 test(academy): guard unified learning system
  - 68f7f00b 2026-08-17T15:57:16+03:00 design(academy): load unified learning system
  - 4c18ab93 2026-08-17T15:56:51+03:00 design(academy): add unified public learning system

### design/hermes-marketing-public-system

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 897; PR #620 merged.
- Latest unique commits:
  - 1557ea10 2026-08-17T16:05:17+03:00 test(marketing): respect responsive growth radius
  - 9e8d92e4 2026-08-17T15:52:26+03:00 test(marketing): guard unified public modules
  - 7e3aadb9 2026-08-17T15:52:05+03:00 design(marketing): add unified public module system
  - bb3ba622 2026-08-17T15:51:37+03:00 design(marketing): load unified public module styles

### design/hermes-logistics-public-system

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 897; PR #619 merged.
- Latest unique commits:
  - 754233c9 2026-08-17T15:53:45+03:00 test(logistics): respect responsive workspace radii
  - 3178f043 2026-08-17T15:44:17+03:00 test(logistics): guard unified public modules
  - 9c9af0e0 2026-08-17T15:43:58+03:00 design(logistics): add unified public module system
  - 0822a2a9 2026-08-17T15:43:29+03:00 design(logistics): load unified public module styles

### design/hermes-public-path-shell

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 898; PR #618 merged.
- Latest unique commits:
  - 5960bf48 2026-08-17T15:30:06+03:00 test(paths): respect responsive media radius
  - 62fbfc6c 2026-08-17T14:42:00+03:00 fix(paths): stack editorial hero vertically below tablet breakpoint
  - e9f4f512 2026-08-17T14:40:25+03:00 test(paths): assert public direction screenshot coverage
  - 64c3204a 2026-08-17T14:40:08+03:00 test(paths): add all public directions to screenshot matrix
  - b553cef9 2026-08-17T14:32:57+03:00 test(paths): lock shared Pearl direction shell in browser

### design/hermes-site-system-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1037; PR #588 merged.
- Latest unique commits:
  - 10ceb96f 2026-08-16T23:09:33+03:00 test(design): guard compact single-DOM mobile footer
  - 3d1816b3 2026-08-16T23:09:17+03:00 fix(design): keep mobile footer links visible without duplicate DOM
  - 1ca17f20 2026-08-16T21:10:46+03:00 test(design): lock homepage shell and mobile footer contracts
  - 21415621 2026-08-16T21:10:07+03:00 design(consent): reduce first-visit visual weight without changing semantics
  - e1f395c8 2026-08-16T21:09:24+03:00 design(footer): collapse mobile navigation into native groups

### seo14/repair-shop-search-entry-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1038; PR #583 merged.
- Relevant files: `src/pages/services/hermes-connect/repair-shops.astro`
- Latest unique commits:
  - a38e7cc0 2026-08-16T19:58:56+03:00 seo(repair-shops): align fresh redesign with U.S. search intent

### design/hermes-knot-core-production

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 1075; PR #576 merged.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `src/components/HermesConnectLauncher.astro`, `src/styles/hermes-connect-knot-core.css`
- Latest unique commits:
  - 1f4d0953 2026-08-16T17:48:51+03:00 test(connect): lock header polish compatibility selector
  - 74a73243 2026-08-16T17:48:33+03:00 fix(connect): preserve header polish compatibility selector
  - f398d547 2026-08-16T17:43:02+03:00 design(connect): keep Knot motion in Product Hub focus area
  - 373f84a8 2026-08-16T17:41:29+03:00 design(connect): server-render Pearl header and Knot layer
  - 56af5416 2026-08-16T17:39:42+03:00 design(connect): add restrained Hermes Knot core

### fix/connect-host-canonical-compat-current-main

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 1076; PR #573 merged.
- Relevant files: `functions/api/repair-shop/referral.ts`, `scripts/repair-shop-sales-attribution-contract.test.mjs`
- Latest unique commits:
  - 049adb8d 2026-08-16T17:27:16+03:00 merge main into compatibility routing branch
  - 0c8e4132 2026-08-16T17:16:37+03:00 test(repair-shops): preserve referral locale privately
  - 6ad09678 2026-08-16T17:16:10+03:00 test(connect): cover canonical compatibility routing
  - 278cd670 2026-08-16T17:15:46+03:00 fix(repair-shops): preserve locale through referral capture
  - d2f5689b 2026-08-16T17:15:34+03:00 fix(connect): redirect compatibility entries safely

### design/hermes-connect-safe-polish-01

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 14, behind 1077; PR #570 merged.
- Relevant files: `src/components/HermesConnectCapabilityPage.astro`, `src/components/HermesConnectExperience.astro`, `src/pages/services/hermes-connect/index.astro`, `src/styles/hermes-connect-safe-polish.css`
- Latest unique commits:
  - 7b6e3f60 2026-08-16T17:12:15+03:00 design(connect): align product header with pearl surfaces
  - 0353c8c4 2026-08-16T17:10:52+03:00 design(connect): simplify product header chrome
  - a3450836 2026-08-16T17:09:40+03:00 chore(design): sync current main into Hermes Connect design preview
  - 06c5cd01 2026-08-16T17:08:38+03:00 design(connect): strengthen focus and reduced-motion accessibility
  - cf34b55a 2026-08-16T17:07:42+03:00 design(connect): calm shadows and surface depth

### feature/repair-shop-multilingual-onboarding

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1078; PR #571 merged.
- Relevant files: `src/components/HermesConnectDomReady.astro`, `tests/hermes-connect-experience.spec.ts`
- Latest unique commits:
  - 3223dbb0 2026-08-16T16:07:40+03:00 test(connect): cover multilingual repair shop onboarding
  - 1b4d7eb5 2026-08-16T16:07:03+03:00 feat(connect): localize repair shop owner onboarding

### docs/hermes-connect-runtime-status-2026-08-16

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1079; PR #565 merged.
- Latest unique commits:
  - 04cdd0a2 2026-08-16T15:48:37+03:00 docs(connect): record canonical runtime status

### agent/repair-auth-mode-cleanup

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1080; PR #563 merged.
- Relevant files: `src/components/HermesConnectDomReady.astro`, `tests/hermes-connect-repair-auth-mode.spec.ts`
- Latest unique commits:
  - 4283bc93 2026-08-16T15:01:16+03:00 test(connect): cover direct repair auth mode
  - 4101cb50 2026-08-16T15:00:51+03:00 fix(connect): honor repair shop auth mode links

### agent/hermes-connect-product-family-hardening

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 36, behind 1081; PR #562 merged.
- Relevant files: `scripts/hermes-connect-android-release-boundary.test.mjs`, `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `scripts/hermes-connect-product.test.mjs`, `scripts/repair-shop-partner-offer-contract.test.mjs`, `src/components/HermesConnectCapabilityPage.astro`, `src/components/HermesConnectDomReady.astro`, `src/components/HermesConnectExperience.astro`, `src/components/HermesConnectLauncher.astro`, `src/pages/services/hermes-connect/ai-command-center.astro`, `src/pages/services/hermes-connect/business-automation.astro`, `src/pages/services/hermes-connect/index.astro`, `src/pages/services/hermes-connect/load-analyzer.astro`, `src/pages/services/hermes-connect/proposal-builder.astro`, `src/pages/services/hermes-connect/rate-negotiator.astro`, `src/pages/services/hermes-connect/repair-shops.astro`, `src/pages/services/hermes-connect/roi-calculator.astro`, `src/pages/services/hermes-connect/unified-inbox.astro`, `tests/hermes-connect-download-release.spec.ts`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-mobile-regression.spec.ts` … +1
- Latest unique commits:
  - bfb1300c 2026-08-16T14:21:32+03:00 fix(connect): remove stale beta wording from shared header launcher
  - 0bb35fc6 2026-08-16T14:20:57+03:00 test(connect): align Access Center e2e with browser-first release boundary
  - efc41cdb 2026-08-16T14:20:44+03:00 fix(connect): remove historical pricing numbers from canonical Proposal Builder
  - aeee43f7 2026-08-16T14:07:32+03:00 test(connect): align language assertion with current Repair Shop hero
  - 6931a379 2026-08-16T14:07:15+03:00 fix(connect): remove final stale Repair Shop availability claims

### agent/hermes-connect-ux-i18n-stabilization

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 13, behind 1084; PR #560 merged.
- Relevant files: `src/components/HermesConnectDomReady.astro`, `src/components/HermesConnectExperience.astro`, `tests/hermes-connect-app-launch.spec.ts`, `tests/hermes-connect-experience.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - dd502888 2026-08-16T12:59:37+03:00 test(connect): align product overview with canonical Repair Shop entry
  - d4a8d96b 2026-08-16T12:59:24+03:00 test(connect): simplify canonical rewritten-link assertions
  - 49fa43e1 2026-08-16T12:59:08+03:00 test(connect): make locale and canonical link assertions precise
  - 28423d41 2026-08-16T12:58:56+03:00 test(connect): align app launch with current Repair Shop runtime
  - 61815a3d 2026-08-16T12:48:27+03:00 fix(connect): reflect active locale across Hermes Connect header

### fix/hermes-connect-pilot-ready

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1088; PR #557 merged.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 758d6eef 2026-08-16T11:44:12+03:00 test(connect): expect Repair Shop pilot as canonical site entry
  - e833255d 2026-08-16T11:34:58+03:00 test(connect): enforce one canonical header entry for pilot
  - d7659b64 2026-08-16T11:34:43+03:00 fix(connect): make repair shop pilot the primary Hermes Connect entry
  - ba4816b9 2026-08-16T11:33:37+03:00 fix(connect): remove duplicate header entry and route to canonical hub

### fix/repair-shop-live-offer-rebased

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 1087; PR #558 merged.
- Relevant files: `scripts/repair-shop-partner-offer-contract.test.mjs`, `tests/hermes-connect-repair-partner-offer.spec.ts`
- Latest unique commits:
  - f7b3f239 2026-08-16T11:38:27+03:00 test(repair-shops): verify live partner offer delivery in browser
  - 1e629d37 2026-08-16T11:38:08+03:00 test(repair-shops): add live partner offer contract
  - bdda416a 2026-08-16T11:37:45+03:00 feat(repair-shops): mount live partner offer on repair shop route
  - 57c8232d 2026-08-16T11:37:19+03:00 feat(repair-shops): add live partner offer contact and consent UI
  - 3d574748 2026-08-16T11:36:23+03:00 feat(repair-shops): activate live partner offer submission

### agent/connect-entry-ci-hotfix

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1085; PR #559 merged.
- Relevant files: `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 5af78603 2026-08-16T04:06:29-05:00 test(connect): align entry assertion with accessible label

### feature/repair-shop-private-sales-attribution

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1089; PR #555 merged.
- Relevant files: `functions/api/repair-shop/referral.ts`, `scripts/repair-shop-feedback-contract.test.mjs`, `scripts/repair-shop-sales-attribution-contract.test.mjs`
- Latest unique commits:
  - 7f0102ba 2026-08-16T01:14:16+03:00 test(repair-shops): keep owner signup alive when attribution write fails
  - 53bb26d4 2026-08-16T01:13:51+03:00 fix(repair-shops): never strand owner signup on attribution failure
  - 0ce0a70f 2026-08-16T01:08:57+03:00 docs(repair-shops): document private sales attribution
  - ebddf79b 2026-08-16T01:08:40+03:00 test(repair-shops): include private attribution in auth gate
  - 424f770a 2026-08-16T01:08:26+03:00 test(repair-shops): cover private sales attribution

### feature/repair-booking-growth-lead

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 14, behind 1089; PR #553 merged.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `tests/hermes-connect-repair-growth-cta.spec.ts`
- Latest unique commits:
  - da31f08a 2026-08-16T00:49:20+03:00 test(repair-shops): capture growth request id explicitly
  - 387d27eb 2026-08-16T00:47:47+03:00 test(repair-shops): validate isolated growth runtime
  - 4df5c0db 2026-08-16T00:46:52+03:00 fix(repair-shops): keep Astro enhancer presentation-only
  - cfc8b214 2026-08-16T00:46:40+03:00 fix(repair-shops): isolate growth bridge browser runtime
  - d5cd7394 2026-08-16T00:44:52+03:00 fix(repair-shops): type growth bridge client script

### feature/repair-shop-private-beta-feedback

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1090; PR #552 merged.
- Relevant files: `functions/api/repair-shop/feedback.ts`, `scripts/hermes-connect-auth-unification.test.mjs`, `scripts/repair-shop-feedback-contract.test.mjs`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-booking-status.spec.ts`, `tests/hermes-connect-repair-feedback.spec.ts`
- Latest unique commits:
  - e7be235d 2026-08-16T00:11:20+03:00 test(repair-shops): cover private feedback flow
  - 7153d860 2026-08-16T00:04:00+03:00 feat(repair-shops): add private beta feedback

### fix/android-release-boundary

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1092; PR #550 merged.
- Relevant files: `scripts/hermes-connect-android-release-boundary.test.mjs`, `tests/hermes-connect-download-release.spec.ts`
- Latest unique commits:
  - 7d3e0a7a 2026-08-15T17:59:27+03:00 docs(connect): link Android release cleanup PR
  - c3f0b010 2026-08-15T17:58:39+03:00 fix(connect): redirect retired APK URL
  - da926e34 2026-08-15T17:56:59+03:00 fix(connect): retire stale debug-signed Android APK

### docs/connect-current-state-2026-08-15

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1093; PR #549 merged.
- Latest unique commits:
  - 6651d276 2026-08-15T17:36:16+03:00 docs(connect): reconcile canonical production state

### cleanup/connect-retired-runtime-labels

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1094; PR #548 merged.
- Relevant files: `scripts/hermes-connect-workspace-contract.test.mjs`
- Latest unique commits:
  - 6eceec42 2026-08-15T17:21:22+03:00 chore(connect): remove retired runtime labels

### fix/repair-customer-crm-next-appointment

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1097; PR #545 merged.
- Relevant files: `functions/api/repair-shop/customers.ts`, `scripts/repair-customer-crm-production-smoke.sh`
- Latest unique commits:
  - a52f373a 2026-08-15T12:12:48+03:00 test(connect): always clean CRM production smoke data
  - 8348264c 2026-08-15T12:12:20+03:00 fix(connect): exclude terminal bookings from next appointment

### feature/repair-shop-customer-crm

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 26, behind 1098; PR #544 merged.
- Relevant files: `.github/workflows/repair-customer-crm-production-smoke.yml`, `.github/workflows/repair-shop-customer-crm-contract.yml`, `docs/release-manifest-deltas/2026-08-15-hermes-connect-repair-customers.json`, `functions/api/repair-shop/cleanup-customer-crm-smoke.ts`, `functions/api/repair-shop/customers.ts`, `scripts/repair-customer-crm-production-smoke.sh`, `src/pages/services/hermes-connect/repair-shops/customers.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-customers.spec.ts`
- Latest unique commits:
  - af51a067 2026-08-15T11:56:19+03:00 test(connect): gate customer CRM on desktop and mobile browsers
  - e48dd9cd 2026-08-15T11:54:35+03:00 test(connect): preserve production vehicle booking contract
  - 42bce52b 2026-08-15T11:53:42+03:00 chore(connect): sync customer CRM branch with production main
  - 0a3be8b9 2026-08-15T11:51:17+03:00 chore(connect): trigger final Repair Shop CRM validation
  - 6eda67a6 2026-08-15T11:50:43+03:00 chore(connect): remove one-time Customers navigation patch workflow

### feature/repair-shop-booking-vehicle-data

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 12, behind 1099; PR #543 merged.
- Relevant files: `.github/workflows/repair-booking-production-smoke.yml`, `.github/workflows/repair-booking-vehicle-contract-marker.yml`, `functions/api/public/repair-booking.ts`, `functions/api/repair-shop/bookings.ts`, `functions/api/repair-shop/cleanup-booking-smoke.ts`, `functions/api/repair-shop/cleanup-cancel-rebook-smoke.ts`, `scripts/repair-booking-production-smoke.sh`, `src/pages/services/hermes-connect/repair-shops/booking.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-booking-loop.spec.ts`
- Latest unique commits:
  - c42d104d 2026-08-15T11:28:20+03:00 test(connect): align real booking browser contract with vehicle capture
  - 2cde41cb 2026-08-15T11:17:29+03:00 test(connect): register vehicle booking contract in CI
  - 0dad0cc4 2026-08-15T11:17:17+03:00 test(connect): verify vehicle persistence in production booking smoke
  - 89e346ea 2026-08-15T11:16:39+03:00 fix(connect): keep booking API backward compatible with vehicle capture
  - fbe6f47a 2026-08-15T11:15:52+03:00 test(connect): trigger booking smoke for vehicle contract

### fix/repair-cancel-rebook-smoke-isolation

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1100; PR #542 merged.
- Relevant files: `.github/workflows/repair-cancel-rebook-production-smoke.yml`, `functions/api/repair-shop/cleanup-cancel-rebook-smoke.ts`
- Latest unique commits:
  - f3b0e89b 2026-08-15T10:50:31+03:00 test(connect): isolate cancel-rebook production smoke identity
  - 8fd6082b 2026-08-15T10:49:54+03:00 test(connect): isolate cancel-rebook smoke cleanup account

### feature/repair-shop-cancel-rebook-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1101; PR #541 merged.
- Relevant files: `.github/workflows/repair-cancel-rebook-production-smoke.yml`
- Latest unique commits:
  - 3d624b86 2026-08-15T10:38:19+03:00 test(connect): verify cancelled slot rebooking behind exact Pages gate
  - 7f7f1a64 2026-08-15T10:37:50+03:00 fix(connect): allow cancelled repair slots to be rebooked

### fix/repair-booking-smoke-runtime-gate

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1102; PR #540 merged.
- Relevant files: `.github/workflows/repair-booking-production-smoke.yml`, `scripts/repair-booking-production-smoke.sh`
- Latest unique commits:
  - e0b7f41c 2026-08-15T10:24:47+03:00 fix(connect): gate production booking smoke on exact Pages deploy
  - 1df8474e 2026-08-15T10:24:33+03:00 test(connect): move production booking smoke behind exact Pages deploy gate

### feature/repair-shop-booking-status-history

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1103; PR #538 merged.
- Relevant files: `.github/workflows/repair-booking-production-smoke.yml`, `functions/api/public/repair-booking.ts`, `functions/api/repair-shop/bookings.ts`, `functions/api/repair-shop/bookings/[id]/status.ts`, `functions/api/repair-shop/cleanup-booking-smoke.ts`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-booking-status.spec.ts`
- Latest unique commits:
  - 25ef3065 2026-08-15T10:08:31+03:00 test(connect): cover owner booking status and history browser flow
  - 3e6e5046 2026-08-15T10:08:04+03:00 test(connect): extend production smoke through booking status history
  - dd296d1b 2026-08-15T10:07:20+03:00 feat(connect): add persisted booking status controls and timeline
  - 74afe58f 2026-08-15T10:04:52+03:00 test(connect): clean repair booking history smoke data
  - 2612d104 2026-08-15T10:04:32+03:00 feat(connect): return persisted status history with owner bookings

### feature/repair-shop-real-booking-loop

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 17, behind 1104; PR #537 merged.
- Relevant files: `.github/workflows/repair-booking-production-smoke.yml`, `docs/release-manifest-deltas/2026-08-14-hermes-connect-beta-release.json`, `functions/api/public/repair-booking.ts`, `functions/api/repair-shop/bookings.ts`, `functions/api/repair-shop/cleanup-booking-smoke.ts`, `src/pages/services/hermes-connect/repair-shops/booking.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`, `tests/hermes-connect-repair-booking-loop.spec.ts`
- Latest unique commits:
  - 46a3be50 2026-08-15T09:49:50+03:00 test(connect): verify public busy feed exposes intervals only
  - 2cdca9d8 2026-08-15T09:49:18+03:00 fix(connect): expose only public busy intervals
  - 843ba6be 2026-08-15T09:43:40+03:00 chore(connect): remove duplicate booking release delta
  - 7c87fd5d 2026-08-15T09:43:27+03:00 fix(connect): mark owner booking route noindex in release manifest
  - b842b01e 2026-08-15T09:41:04+03:00 fix(connect): align repair booking delta with release manifest contract

### cleanup/connect-canonical-doc-links

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1095; PR #547 merged.
- Latest unique commits:
  - 0e34fe35 2026-08-15T06:25:13-05:00 docs(connect): point active guidance to canonical runtime

### feature/repair-shop-owner-availability

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 1105; PR #536 merged.
- Relevant files: `.github/workflows/repair-availability-production-smoke.yml`, `docs/release-manifest-deltas/2026-08-15-hermes-connect-repair-availability.json`, `functions/api/repair-shop/availability.ts`, `functions/api/repair-shop/cleanup-availability-smoke.ts`, `src/pages/services/hermes-connect/repair-shops/availability.astro`
- Latest unique commits:
  - e877578d 2026-08-15T03:18:45+03:00 chore(connect): register repair availability route in release manifest
  - 87f05b6f 2026-08-15T03:15:19+03:00 test(connect): add production repair shop availability smoke
  - ab75d7f6 2026-08-15T03:14:55+03:00 test(connect): add exact-target availability smoke cleanup
  - a1356e0c 2026-08-15T03:12:46+03:00 feat(connect): add real repair shop availability workspace
  - 83603b67 2026-08-15T03:11:54+03:00 feat(connect): expose repair shop weekly availability publicly

### fix/repair-shop-profile-d1-schema-init

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1112; PR #535 merged.
- Latest unique commits:
  - f0ba18f7 2026-08-15T02:52:43+03:00 fix(connect): initialize repair shop D1 schema with prepared statements

### feature/repair-shop-profile-runtime

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1114; PR #534 merged.
- Relevant files: `functions/api/repair-shop/profile.ts`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`
- Latest unique commits:
  - 0e5d028d 2026-08-15T02:40:35+03:00 feat(connect): add real shop profile and public link to owner workspace
  - 23a39d08 2026-08-15T02:39:31+03:00 feat(connect): expose public repair shop profile and services by slug
  - 6dc8a5d9 2026-08-15T02:39:20+03:00 feat(connect): add authenticated repair shop profile API
  - 829ace19 2026-08-15T02:39:02+03:00 feat(connect): define non-destructive repair shop profile schema

### feature/repair-shop-services-runtime

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 5, behind 1121; PR #533 merged.
- Relevant files: `docs/release-manifest-deltas/2026-08-15-hermes-connect-repair-dashboard.json`, `src/pages/services/hermes-connect/repair-shops/auth.astro`, `src/pages/services/hermes-connect/repair-shops/dashboard.astro`
- Latest unique commits:
  - a41cfb2f 2026-08-15T02:20:19+03:00 fix(connect): route authenticated shop owners to real workspace
  - bfdb8784 2026-08-15T02:19:39+03:00 docs(connect): register repair shop owner dashboard route
  - 1c8c46ec 2026-08-15T02:18:46+03:00 feat(connect): add real repair shop owner services workspace
  - c13368e0 2026-08-15T02:18:07+03:00 feat(connect): add owner-scoped service deletion
  - e0b453ba 2026-08-15T02:17:56+03:00 feat(connect): add owner-scoped repair shop services API

### fix/repair-shop-auth-db-guard

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1130; PR #532 merged.
- Relevant files: `docs/release-manifest-deltas/2026-08-14-hermes-connect-repair-auth.json`, `src/pages/services/hermes-connect/repair-shops/auth.astro`
- Latest unique commits:
  - ca85c158 2026-08-15T01:49:39+03:00 chore(release): register repair shop owner auth route
  - dd86e380 2026-08-15T01:49:28+03:00 fix(connect): keep owner auth out of search index
  - 87bb7bb3 2026-08-15T01:45:49+03:00 fix(connect): add semantic auth page heading
  - e79a416e 2026-08-15T01:38:55+03:00 fix(connect): guard Telegram auth when D1 is not bound
  - 59b6fdf3 2026-08-15T01:38:43+03:00 fix(connect): clear auth cookie and report missing D1 on logout

### seo14-job-apply-compliance

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1174; PR #519 merged.
- Relevant files: `scripts/academy-careers-growth-governance.test.mjs`, `tests/academy-careers-governance.spec.ts`
- Latest unique commits:
  - 80103a79 2026-08-14T15:58:05+03:00 SEO14: test real JobPosting submission governance
  - 910dcd53 2026-08-14T15:57:35+03:00 SEO14: require a real submission URL for JobPosting eligibility
  - 41e123c9 2026-08-14T15:54:11+03:00 SEO14: guard remote JobPosting title and applicant countries
  - 6ce575ae 2026-08-14T15:53:52+03:00 SEO14: add remote applicant location requirements
  - 8a3265af 2026-08-14T15:51:29+03:00 SEO14: guard complete JobPosting description

### seo14-authority-registry-refresh

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1174; PR #517 merged.
- Latest unique commits:
  - 71bba559 2026-08-14T15:37:43+03:00 Cleanup accidental placeholder on refresh branch
  - d535b5cc 2026-08-14T15:37:31+03:00 x
  - 129c6e95 2026-08-14T15:37:24+03:00 SEO14: add primary-source authority opportunity registry

### recruiting-growth-loop-phase1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 14, behind 1179; PR #514 merged.
- Relevant files: `scripts/academy-careers-growth-governance.test.mjs`, `tests/academy-careers-governance.spec.ts`
- Latest unique commits:
  - fb77e0ad 2026-08-14T14:39:57+03:00 Fix careers Playwright locator strictness
  - e14356c0 2026-08-14T14:30:59+03:00 Fix dispatcher sitemap owner manifest path
  - c050cd2c 2026-08-14T14:28:21+03:00 Align recruiting release delta with manifest contract
  - 326914d4 2026-08-14T14:26:26+03:00 Align dispatcher release delta with primary sitemap
  - 34c29691 2026-08-14T14:26:12+03:00 Place dispatcher vacancy in primary careers sitemap path

### agent/connect-access-route-final

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1182; PR #506 merged.
- Latest unique commits:
  - 1675cf9a 2026-08-13T17:00:38+03:00 Add Connect request access routing test
  - 6c388156 2026-08-13T16:55:58+03:00 Update Connect access routing
  - 5e71b957 2026-08-13T16:51:09+03:00 Hermes Connect: keep request-access route minimal
  - e504c090 2026-08-13T16:49:14+03:00 Hermes Connect: restore request-access route on current main

### agent/connect-site-shell-entry-current

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1185; PR #503 merged.
- Relevant files: `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 8073a35d 2026-08-13T16:18:57+03:00 test: lock persistent Hermes Connect site-shell entry
  - 17d845dd 2026-08-13T16:18:28+03:00 Hermes Connect: add persistent site-shell app entry

### agent/seo13-load-board-connect-handoff

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1189; PR #499 merged.
- Latest unique commits:
  - 468bef65 2026-08-13T15:47:17+03:00 SEO13: connect Load Board to Load Analyzer

### release/hermes-connect-app-launch-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1190; PR #498 merged.
- Relevant files: `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-app-launch-v1.spec.ts`
- Latest unique commits:
  - e6c24777 2026-08-13T11:08:56+03:00 fix: preserve two Web App access CTAs while exposing workspace
  - ae9d5526 2026-08-13T10:59:50+03:00 fix: prevent legacy connector badges from appearing live
  - 100e9bc7 2026-08-13T10:51:32+03:00 test: cover Hermes Connect launch path and multi-vertical demo
  - abe51a53 2026-08-13T10:51:10+03:00 release: expose Hermes Connect interactive workspace from service page
  - 75ecfac1 2026-08-13T10:49:19+03:00 release: wire Hermes Connect launch enhancements

### feature/hermes-connect-mobile-web-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1192; PR #495 merged.
- Relevant files: `tests/hermes-connect-mobile-v2.spec.ts`
- Latest unique commits:
  - a84a3fca 2026-08-13T10:23:26+03:00 test: guard Hermes Connect Mobile V2 visual contract
  - f9ed0466 2026-08-13T10:23:13+03:00 feat: bring Hermes Connect Mobile Web to animated V2 brand system

### seo13/load-board-canonical-owner-v3

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1193; PR #493 merged.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - 8635155f 2026-08-13T10:12:38+03:00 docs: record Load Board canonical owner on current main
  - 6aaacffa 2026-08-13T10:12:22+03:00 test: lock Load Board canonical owner on current main

### feature/hermes-connect-web-product-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 14, behind 1196; PR #487 merged.
- Relevant files: `docs/release-manifest-deltas/2026-08-13-hermes-connect-web-product-v1.json`, `scripts/hermes-connect-web-product-v1.test.mjs`, `tests/hermes-connect-web-product-v1.spec.ts`
- Latest unique commits:
  - 39802df6 2026-08-13T09:45:51+03:00 fix: register animated workspace V2 in release manifest delta
  - 0cd10e42 2026-08-13T09:40:22+03:00 feat: add Hermes pointer motion floating knot and module atmosphere
  - e3a67b98 2026-08-13T09:39:52+03:00 feat: enrich Hermes Connect motion color typography and knot launcher
  - 9303afd6 2026-08-13T09:38:49+03:00 feat: add owner-approved animated Hermes Connect workspace V2
  - 0a64da44 2026-08-13T09:20:41+03:00 docs: lock Hermes Connect visual motion directive v1

### feature/hermes-sales-roleplay-web-spike

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1208; PR #484 merged.
- Latest unique commits:
  - 350762b6 2026-08-13T08:22:50+03:00 docs: add founder outreach and 15-minute audit playbook
  - b17c3bfa 2026-08-13T08:22:24+03:00 docs: define AWS sales roleplay adoption plan
  - fb42f1f2 2026-08-13T08:22:01+03:00 feat: add Hermes Sales Coach web roleplay prototype

### docs/hermes-connect-brand-prompts-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1225; PR #481 merged.
- Latest unique commits:
  - 6bd776f0 2026-08-13T07:53:28+03:00 docs: record Antigravity prototype integration status
  - 356bf793 2026-08-13T07:53:16+03:00 docs: add canonical short Hermes Connect brand prompt
  - ffc3c366 2026-08-13T07:53:09+03:00 docs: add canonical Hermes Connect master AI brand prompt

### docs/hermes-connect-brand-approved-v1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1226; PR #479 merged.
- Latest unique commits:
  - a0741238 2026-08-13T07:43:49+03:00 docs: record approved Hermes Connect brand direction
  - 30ab7f75 2026-08-13T07:43:39+03:00 docs: update Hermes Connect design current state to approved V1
  - fc4725cc 2026-08-13T07:43:19+03:00 docs: lock Hermes Connect approved brand system v1

### seo12/load-board-dual-entry-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1312; PR #429 merged.
- Relevant files: `tests/load-board-dual-entry.spec.ts`
- Latest unique commits:
  - 5adfd853 2026-08-12T13:17:01+03:00 SEO12: keep carrier role accessible name static
  - f5e77aeb 2026-08-12T13:02:02+03:00 SEO12: rebuild Load Board dual entry without global accessibility script

### human-copy/academy-learning-method

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1315; PR #425 merged.
- Relevant files: `tests/academy-learning-method.spec.ts`
- Latest unique commits:
  - 5cd466e2 2026-08-12T11:46:12+03:00 Test: cover Academy levels and practice loop
  - 5c30fad7 2026-08-12T11:45:58+03:00 Academy: add level chooser and repeatable practice method
  - 73dfc762 2026-08-12T11:45:42+03:00 Academy: explain learning levels and practice loop

### seo11/customer-proof-eligibility

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1318; PR #420 merged.
- Latest unique commits:
  - dfac999d 2026-08-12T10:58:48+03:00 SEO11: align customer proof registry CSV
  - 9ef999de 2026-08-12T10:58:30+03:00 SEO11: verify historical customer-side proof eligibility

### seo11/proof-candidate-selection-status-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1323; PR #416 merged.
- Latest unique commits:
  - e6ee141c 2026-08-12T02:51:13+03:00 SEO11: sync verified historic carrier relationship
  - da93a374 2026-08-12T02:50:47+03:00 SEO11: record verified historic carrier relationship
  - 8e8f3b37 2026-08-12T02:48:58+03:00 SEO11: sync proof candidate selection CSV
  - 0c3bb711 2026-08-12T02:48:33+03:00 SEO11: record private proof candidate selection status

### docs/connect-agent-readiness-current-main

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1327; PR #406 merged.
- Latest unique commits:
  - e189766c 2026-08-12T02:08:35+03:00 Docs: add Hermes Connect API inventory on current main
  - 93bc9d00 2026-08-12T02:08:15+03:00 Docs: restore Hermes Connect Agent Readiness baseline on current main

### seo11/authority-registry-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1331; PR #400 merged.
- Latest unique commits:
  - 7f546562 2026-08-12T01:21:09+03:00 Add public-safe authority opportunity registry

### feat/connect-markdown-negotiation

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1334; PR #396 merged.
- Latest unique commits:
  - 03dec90e 2026-08-12T01:04:21+03:00 Connect: negotiate Markdown for AI agents
  - a17bf7bc 2026-08-12T01:03:57+03:00 Connect: add agent-readable Markdown view

### seo11/proof-registry-362

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1352; PR #363 merged.
- Latest unique commits:
  - 370a968f 2026-08-11T21:52:24+03:00 SEO11: add machine-readable proof registry
  - 76ea2576 2026-08-11T21:52:08+03:00 SEO11: add public-safe permissioned proof registry

### conversion/marketing-academy-cta-copy

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1372; PR #337 merged.
- Latest unique commits:
  - 20f216eb 2026-08-11T14:02:59+03:00 Add regression coverage for path CTA copy
  - 2614d667 2026-08-11T14:02:51+03:00 Refine marketing and Academy path CTAs

### agent/finish-hermes-connect

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 12, behind 1525; PR #283 merged.
- Relevant files: `scripts/hermes-connect-product.test.mjs`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-early-access.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 4b061892 2026-08-05T23:27:19-05:00 Hermes Connect: align site bridge browser contract with ten categories
  - 60c17087 2026-08-05T23:20:57-05:00 Hermes Connect: verify public overview category alignment
  - 1b06b928 2026-08-05T23:20:33-05:00 Hermes Connect: align public overview with ten product categories
  - 92dd0a05 2026-08-05T23:18:39-05:00 Hermes Connect: cover ten categories in desktop and mobile browser tests
  - cfc4c0f0 2026-08-05T23:13:33-05:00 Fix carrier agreement readiness assertion

### ops/connect-production-verifier-command

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1605; PR #255 merged.
- Latest unique commits:
  - 356de7af 2026-08-05T07:52:11-05:00 Add issue-command production verifier for Hermes Connect

### fix/connect-host-routing

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1606; PR #254 merged.
- Latest unique commits:
  - 6579b108 2026-08-05T07:36:26-05:00 ci: verify Connect host routing after merge
  - e1a02139 2026-08-05T07:31:34-05:00 test: run Connect host routing contract in CI
  - d080b3c9 2026-08-05T07:31:12-05:00 test: cover Connect hostname routing contract
  - e1d76ab0 2026-08-05T07:25:29-05:00 fix: route Connect hostname to approved web app assets

### docs/reconcile-hermes-connect-readme-v2

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1610; PR #249 merged.
- Latest unique commits:
  - 8bef4f45 2026-08-04T19:34:33-05:00 Docs: reconcile Hermes Connect repository release status

### fix/load-board-evergreen-demo-labels

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1612; PR #246 merged.
- Relevant files: `tests/load-board-evergreen-demo.spec.ts`
- Latest unique commits:
  - 6a4584da 2026-08-04T19:22:44-05:00 Tests: gate crawler-visible evergreen Load Board HTML
  - b4b182c4 2026-08-04T19:22:20-05:00 Tests: verify evergreen labels in built Load Board HTML
  - 4c096d8b 2026-08-04T19:21:23-05:00 Tests: align evergreen demo assertions with SEO-4 contract
  - 0358854d 2026-08-04T19:21:06-05:00 Load Board: align build-time labels with SEO-4 contract
  - d23c22e0 2026-08-04T19:13:40-05:00 Tests: scope Load Board fictional-boundary assertion correctly

### fix/hermes-connect-conversion-accessibility

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1617; PR #242 merged.
- Relevant files: `tests/hermes-connect-accessibility.spec.ts`
- Latest unique commits:
  - 6998e5a6 2026-08-04T18:49:01-05:00 Tests: use explicit Playwright Page type
  - 300b4da0 2026-08-04T18:48:37-05:00 Tests: lock Hermes Connect accessible validation and result focus
  - 59966475 2026-08-04T18:48:15-05:00 Hermes Connect: improve form accessibility and safe intake guidance

### ops/connect-post-merge-verification

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1629; PR #236 merged.
- Latest unique commits:
  - ca712d73 2026-08-04T17:44:58-05:00 Ops: use release-pending verification before merge
  - ae12d08f 2026-08-04T17:44:44-05:00 Ops: allow release-pending Connect verification on PRs
  - 43f54827 2026-08-04T17:43:41-05:00 Ops: verify approved Connect release after main deploy
  - 8ca64762 2026-08-04T17:43:25-05:00 Ops: distinguish preview isolation from approved Connect release

### feat/hermes-connect-download-funnel

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 42, behind 1636; PR #234 merged.
- Relevant files: `docs/release-manifest-deltas/2026-08-05-hermes-connect-web.json`, `src/pages/services/hermes-connect/index.astro`, `tests/hermes-connect-early-access.spec.ts`, `tests/hermes-connect-site-bridge.spec.ts`
- Latest unique commits:
  - 510e1074 2026-08-04T17:31:52-05:00 test(connect): verify visible mobile site bridge
  - 5a91abb8 2026-08-04T17:24:55-05:00 release(connect): register indexed product overview route
  - 0629b9db 2026-08-04T17:23:09-05:00 style(connect): add product FAQ presentation
  - eafc8b43 2026-08-04T17:22:56-05:00 seo(connect): add service and FAQ contracts
  - 3bb3d989 2026-08-04T17:20:54-05:00 test(connect): assert public AI-assisted delivery language

### fix/customer-recommendations-direct-intake

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1638; PR #227 merged.
- Latest unique commits:
  - 357adbc8 2026-08-04T16:25:37-05:00 Tests: keep customer recommendations on direct intake
  - 62a1f833 2026-08-04T16:25:20-05:00 Customer paths: route real moves to direct intake

### seo5/live-custom-domain-reconciliation

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 1641; PR #224 merged.
- Latest unique commits:
  - c1042917 2026-08-04T16:23:40-05:00 fix: require current release marker without hiding live lag
  - 72a2cc73 2026-08-04T16:18:44-05:00 Production check: use current live contact marker
  - 05f1302c 2026-08-04T16:16:54-05:00 fix: classify stale live state from current-state markers
  - 47ab4993 2026-08-04T16:10:16-05:00 ci: run custom-domain reconciliation on pull requests
  - 88ba7b5e 2026-08-04T16:08:49-05:00 ci: add one-shot custom-domain live verification

### seo5/production-analytics-event-registry

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1648; PR #212 merged.
- Latest unique commits:
  - 92b04dc0 2026-08-04T15:38:26-05:00 docs: inventory production analytics events and verification gaps

### seo5/hermes-commercial-rebuild-case-draft

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 1, behind 1655; PR #209 merged.
- Latest unique commits:
  - 3ca56dbe 2026-08-04T15:29:21-05:00 docs: draft evidence-gated Hermes commercial rebuild case

### feat/academy-application-review-clarity

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1656; PR #207 merged.
- Relevant files: `scripts/academy-public-contract.test.mjs`
- Latest unique commits:
  - a171b5d4 2026-08-04T15:26:18-05:00 Tests: lock Academy application review clarity
  - ca296aca 2026-08-04T15:25:53-05:00 Academy: explain the human application review

### agent/seo4-customer-transport-intake

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 16, behind 1689; PR #179 merged.
- Latest unique commits:
  - 201cc782 2026-08-04T04:06:20-05:00 SEO-4: avoid repeating carrier demo in final CTA
  - 972754e0 2026-08-04T03:59:50-05:00 SEO-4: keep one explicit demo link per audience page
  - 748505f9 2026-08-04T03:53:54-05:00 SEO-4: open auction FAQ and assert explicit demo links
  - 1ead3941 2026-08-04T03:53:05-05:00 SEO-4: render secondary Load Board demo links
  - 23218ca5 2026-08-04T03:52:12-05:00 SEO-4: keep Load Board as explicit secondary demo path

### content/website-social-crm-system

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1708; PR #170 merged.
- Latest unique commits:
  - b81bdb45 2026-08-03T16:23:51-05:00 Test connected growth system expansion
  - 07697371 2026-08-03T16:23:30-05:00 Expand conversion checklist with connected growth system

### fix/academy-home-contract

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 7, behind 1710; PR #168 merged.
- Relevant files: `scripts/academy-public-contract.test.mjs`
- Latest unique commits:
  - 3501b7c6 2026-08-03T14:44:53-05:00 Correct lead delivery architecture finding
  - 3a409249 2026-08-03T14:43:49-05:00 Save reviewed Grok site audit decisions
  - 334b5dcd 2026-08-03T14:43:06-05:00 Prevent crawler-visible retired Academy copy
  - ce9dc524 2026-08-03T14:42:44-05:00 Align homepage Academy trust signal
  - 71112e92 2026-08-03T14:42:28-05:00 Use centralized public path data

### seo/entity-split-hermes-progressopro

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 6, behind 1714; PR #148 merged.
- Latest unique commits:
  - 9148690d 2026-08-03T08:21:41-05:00 Run public entity registry checks in CI
  - ec03c8cb 2026-08-03T08:21:08-05:00 Test Hermes and ProgressoPro schema separation
  - 038ee381 2026-08-03T08:20:48-05:00 Test entity relationship and social-profile gates
  - 716e99c7 2026-08-03T08:20:20-05:00 Prevent cross-brand profiles in Hermes sameAs
  - b6ff52ce 2026-08-03T08:19:23-05:00 Use approved same-entity social profiles in root schema

### distribution/social-preview-release-a

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 8, behind 1715; PR #147 merged.
- Latest unique commits:
  - 29b0d785 2026-08-03T07:57:58-05:00 Block formatted authority identifiers in UTM variants
  - 1e7d1814 2026-08-03T07:56:39-05:00 Run social distribution contracts in CI
  - 19107c43 2026-08-03T07:56:09-05:00 Test preview-only social distribution queue
  - 8140c9e7 2026-08-03T07:55:33-05:00 Test preview-only social distribution contracts
  - ab3910e0 2026-08-03T07:54:41-05:00 Add noindex social distribution review queue

### content/social-to-site-pipeline-release-a

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 19, behind 1716; PR #146 merged.
- Latest unique commits:
  - a3a2207a 2026-08-03T07:42:36-05:00 Use semantic entity selectors in content pipeline tests
  - 7f978d95 2026-08-03T07:37:47-05:00 Use explicit TypeScript import in publication gate
  - 27863159 2026-08-03T07:36:20-05:00 Use current insight template icons
  - 48959a67 2026-08-03T07:35:19-05:00 Test strict content publication gate
  - 7d282f87 2026-08-03T07:34:40-05:00 Use strict publication gate for reviewed fixtures

### academy/public-subsite-phase-1

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 17, behind 1717; PR #145 merged.
- Relevant files: `tests/academy-subsite.spec.ts`
- Latest unique commits:
  - 975574e7 2026-08-03T07:11:44-05:00 Include Academy qualification in preview handoff
  - 318b86c8 2026-08-03T07:06:24-05:00 Add Academy application Service schema
  - 842c66d0 2026-08-03T07:05:40-05:00 Add Academy Service schema and clean icons
  - 1d93c2dd 2026-08-03T07:02:10-05:00 Test Academy public subsite and application flow
  - 6582a2d5 2026-08-03T07:01:25-05:00 Declare Academy sitemap

### marketing/carrier-qualification-current-main

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 4, behind 1741; PR #115 merged.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - b3aac3a5 2026-08-01T22:01:36-05:00 Align zero-delivery assertion with qualified preview
  - d109c1d7 2026-08-01T22:01:13-05:00 Preserve zero-delivery carrier preview coverage
  - 023f859d 2026-08-01T22:00:52-05:00 Retire superseded legacy carrier browser case
  - 99cf8d8a 2026-08-01T21:52:37-05:00 Logistics: complete carrier qualification funnel

### marketing/outreach-crm-foundation

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 1746; PR #108 merged.
- Latest unique commits:
  - 9af3d37e 2026-08-01T21:26:12-05:00 Marketing: add outreach operating playbook
  - e17035b7 2026-08-01T21:25:53-05:00 Marketing: add SEO outreach CRM template

### hotfix/dynamic-load-board-test-dates

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 3, behind 1754; PR #95 merged.
- Relevant files: `scripts/load-board.test.mjs`
- Latest unique commits:
  - 6bd3b026 2026-08-01T20:23:20-05:00 chore: keep Load Board date hotfix scoped
  - 1ea8bd89 2026-08-01T20:21:11-05:00 test: keep Playwright Load Board dates in the future
  - 403b5594 2026-08-01T19:51:25-05:00 test: use dynamic future dates for load board checks

### fix/restore-journey-anchor

- Status: **POST_MERGE_OR_SUPERSEDED**; ahead 2, behind 2041; PR #7 merged.
- Latest unique commits:
  - 732bce69 2026-07-30T19:51:59-05:00 docs: log #journey anchor fix in AI_HANDOFF.mdRestore #journey anchor in AI Handoff Log
  - 10b10b59 2026-07-30T19:50:18-05:00 fix: restore #journey anchor required by DESIGN_INTEGRATION_CONTRACT.md

### repair/crm-routes-appointments-customer

- Status: **STALE_DONOR_REVIEW**; ahead 3, behind 250; PR —.
- Relevant files: `src/components/RepairShopOwnerNavEnhancer.astro`, `src/pages/services/hermes-connect/repair-shops/appointments.astro`, `src/pages/services/hermes-connect/repair-shops/customers.astro`
- Latest unique commits:
  - 471d1274 2026-09-05T07:31:30-05:00 feat(repair): turn Customers into routed CRM customer detail
  - d42ff1c5 2026-09-05T07:29:39-05:00 feat(repair): add routed CRM Appointments workspace
  - 0d876f4f 2026-09-05T07:28:21-05:00 feat(repair): route Appointments inside CRM shell

### car-hauling/allow-ingest-hold-outreach

- Status: **STALE_DONOR_REVIEW**; ahead 3, behind 252; PR —.
- Relevant files: `scripts/load-board-intake-api-contract.test.mjs`, `src/components/RepairShopActivationEnhancer.astro`, `src/components/RepairShopOwnerNavEnhancer.astro`, `tests/hermes-connect-experience.spec.ts`, `tests/repair-shop-crm-shell.spec.ts`
- Latest unique commits:
  - 2a82282f 2026-09-04T17:08:47-05:00 feat(load-board): allow car-hauling ingestion while outreach stays held
  - d882b068 2026-09-04T16:56:20-05:00 test(repair): require direct localized CRM entry after auth
  - 0fb36d10 2026-09-04T16:54:44-05:00 feat(repair): port customer CRM shell onto current main

### feature/loadboard-email-forwarding-1074

- Status: **STALE_DONOR_REVIEW**; ahead 9, behind 261; PR —.
- Relevant files: `tests/load-board-product.spec.ts`
- Latest unique commits:
  - bfae8e25 2026-09-04T08:54:34-05:00 Cover IT header label and Load Board product UX
  - 386b5a34 2026-09-04T08:54:10-05:00 Rename Technology header label to IT
  - 892b1d0c 2026-09-04T08:53:04-05:00 Add Load Board product navigation and privacy tests
  - bb893536 2026-09-04T08:50:50-05:00 Turn live pilot into Hermes Load Board marketplace v1
  - 764ca9fc 2026-09-04T08:49:09-05:00 Add Logistics product navigation to recommendation pages

### feat/academy-russian-public-funnel-2026-08-31

- Status: **STALE_DONOR_REVIEW**; ahead 4, behind 490; PR —.
- Latest unique commits:
  - c85dd24e 2026-08-31T22:11:27+03:00 feat(academy): add Russian Marketing program
  - d39df933 2026-08-31T22:11:15+03:00 feat(academy): add Russian U.S. Logistics program
  - 897037f5 2026-08-31T22:11:03+03:00 feat(academy): add Russian public Academy hub
  - 912749d6 2026-08-31T22:10:36+03:00 feat(academy): add Russian public program content

### fix/repair-private-pearl-shell-fresh-2026-08-31-copy

- Status: **STALE_DONOR_REVIEW**; ahead 5, behind 491; PR —.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `scripts/repair-shop-private-design-contract.test.mjs`
- Latest unique commits:
  - e5fa9498 2026-08-31T19:37:12+03:00 docs(connect): record fresh Pearl replay provenance
  - fb6bcd0f 2026-08-31T19:37:00+03:00 docs(ai): record branch artifact discipline lesson
  - 587e1b00 2026-08-31T19:36:29+03:00 test(connect): preserve Sep15 gate while adding Pearl private UI contract
  - def509f2 2026-08-31T19:35:51+03:00 test(connect): guard private Repair Shop Pearl design layer
  - 9e637cc7 2026-08-31T19:35:35+03:00 fix(connect): replay Pearl private Repair Shop shell on current main

### tmp-noop-check

- Status: **STALE_DONOR_REVIEW**; ahead 3, behind 491; PR —.
- Relevant files: `scripts/repair-shop-growth-cta-contract.test.mjs`, `scripts/repair-shop-private-design-contract.test.mjs`
- Latest unique commits:
  - 587e1b00 2026-08-31T19:36:29+03:00 test(connect): preserve Sep15 gate while adding Pearl private UI contract
  - def509f2 2026-08-31T19:35:51+03:00 test(connect): guard private Repair Shop Pearl design layer
  - 9e637cc7 2026-08-31T19:35:35+03:00 fix(connect): replay Pearl private Repair Shop shell on current main

### design/hermes-connect-option02-launch

- Status: **STALE_DONOR_REVIEW**; ahead 11, behind 521; PR —.
- Relevant files: `src/styles/hermes-connect-knot-core.css`
- Latest unique commits:
  - 9e7708af 2026-08-31T13:49:03+03:00 docs(design): add iteration quality learning loop
  - e366f2b7 2026-08-31T11:09:44+03:00 docs(connect): make option 02 the current logo decision
  - 83256724 2026-08-31T11:09:18+03:00 docs(connect): record owner approval of option 02
  - 553a3be2 2026-08-31T11:07:33+03:00 fix(logistics): restore directory grid and visual hierarchy
  - 04555721 2026-08-31T11:06:57+03:00 feat(connect): align hero core with approved option 02

### fix/academy-russian-private-2026-08-30

- Status: **STALE_DONOR_REVIEW**; ahead 2, behind 531; PR —.
- Relevant files: `scripts/academy-russian-private-contract.test.mjs`
- Latest unique commits:
  - 571cb3b4 2026-08-30T12:13:17+03:00 test(academy): guard Russian private workspace locale boundaries
  - b4ae3155 2026-08-30T12:11:35+03:00 feat(academy): add Russian private workspace locale runtime

### seo/academy-uk-application-shell-2026-08-19

- Status: **STALE_DONOR_REVIEW**; ahead 4, behind 779; PR —.
- Relevant files: `tests/academy-application-localization.spec.ts`, `tests/academy-ukraine-preview.spec.ts`
- Latest unique commits:
  - e77f6042 2026-08-19T08:35:20+03:00 test(academy): guard Ukrainian application shell labels and payload
  - 1b6699ff 2026-08-19T08:34:51+03:00 seo(academy): localize Ukrainian application shell without forking payload
  - 51712b91 2026-08-19T08:27:41+03:00 test(academy): enforce reciprocal EN-UK hreflang
  - 970e678f 2026-08-19T08:27:23+03:00 seo(academy): add reciprocal Ukrainian hreflang

### qa/hermes-design-screenshots-c550d2a

- Status: **STALE_DONOR_REVIEW**; ahead 18, behind 947; PR —.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `src/styles/hermes-connect-workspace.css`, `tests/hermes-connect-workspace-design.spec.ts`
- Latest unique commits:
  - 12a8a2c8 2026-08-17T13:16:29+03:00 qa(design): capture screenshots for current visual fixes
  - c550d2a8 2026-08-17T13:12:26+03:00 test(design): document stacked Repair public visual gate
  - 26c1b3f2 2026-08-17T13:11:06+03:00 test(design): carry Repair Shop public visual gate into homepage stack
  - a285826b 2026-08-17T13:09:37+03:00 fix(home): remove hero overflow and inherited full-height spacing
  - e70f22d5 2026-08-17T13:09:03+03:00 fix(design): load Repair Shop public screenshot shell

### qa/hermes-design-screenshots-860ff51

- Status: **STALE_DONOR_REVIEW**; ahead 13, behind 947; PR —.
- Relevant files: `scripts/hermes-connect-brand-funnel-contract.test.mjs`, `src/styles/hermes-connect-workspace.css`, `tests/hermes-connect-workspace-design.spec.ts`
- Latest unique commits:
  - d3dd8db3 2026-08-17T12:56:07+03:00 qa(design): capture screenshot evidence for current design head
  - 860ff51c 2026-08-17T12:52:52+03:00 test(home): verify responsive Pearl geometry by viewport
  - 63485c8d 2026-08-17T12:52:38+03:00 test(home): accept intentional responsive hero image sizing
  - cdb9ed36 2026-08-17T12:42:23+03:00 test(home): verify Pearl hero and master public primitives in browser
  - e8597e10 2026-08-17T12:42:05+03:00 test(home): lock Pearl homepage design contract

### feature/repair-shop-web-v1-complete

- Status: **STALE_DONOR_REVIEW**; ahead 10, behind 1025; PR —.
- Relevant files: `public/repair-shop-web-v1.js`, `scripts/repair-shop-web-v1-contract.test.mjs`, `src/components/RepairShopWebV1Enhancer.astro`, `tests/repair-shop-web-v1.spec.ts`
- Latest unique commits:
  - 7735b9a8 2026-08-17T01:12:30+03:00 fix(test): use explicit weekday time locators
  - f7a6270c 2026-08-17T01:12:00+03:00 fix(test): apply locator indexing before assertions
  - 9238e0e9 2026-08-17T01:11:36+03:00 fix(test): close weekday time selectors
  - 2b6c151e 2026-08-17T01:11:13+03:00 fix(test): correct weekday time selectors
  - 1cfdbb76 2026-08-17T01:10:53+03:00 fix(test): tighten repair shop web v1 browser assertions

### docs/hermes-connect-runtime-state-2026-08-16

- Status: **STALE_DONOR_REVIEW**; ahead 1, behind 1079; PR —.
- Latest unique commits:
  - 2066aea2 2026-08-16T15:25:28+03:00 docs(connect): record canonical runtime and legacy boundary

### feature/repair-shop-availability-runtime-v2

- Status: **STALE_DONOR_REVIEW**; ahead 3, behind 1112; PR —.
- Relevant files: `functions/api/repair-shop/availability.ts`
- Latest unique commits:
  - 693afe1f 2026-08-15T02:54:25+03:00 feat(connect): add authenticated weekly availability API
  - 24bf4eb3 2026-08-15T02:54:10+03:00 feat(connect): add owner-scoped repair shop availability schema
  - f0ba18f7 2026-08-15T02:52:43+03:00 fix(connect): initialize repair shop D1 schema with prepared statements

### agent/connect-access-fix-current

- Status: **STALE_DONOR_REVIEW**; ahead 2, behind 1182; PR —.
- Latest unique commits:
  - 5e71b957 2026-08-13T16:51:09+03:00 Hermes Connect: keep request-access route minimal
  - e504c090 2026-08-13T16:49:14+03:00 Hermes Connect: restore request-access route on current main

### seo/academy-audience-roadmap

- Status: **STALE_DONOR_REVIEW**; ahead 37, behind 2042; PR —.
- Latest unique commits:
  - d5a67bb5 2026-07-30T21:05:06-05:00 fix localized partnership labels and hero loading hints
  - fab7ce2e 2026-07-30T21:02:41-05:00 fix(content): use standard i in homepage directions heading
  - 7f59ba48 2026-07-30T20:39:11-05:00 Add dealer vehicle transportation SEO content brief
  - d2c96e67 2026-07-30T20:37:27-05:00 Add implementation-ready car hauling dispatch SEO brief
  - e5543072 2026-07-30T20:35:41-05:00 Preload homepage LCP image

### fix/repair-company-schedule-layout-20260908-replay

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 1, behind 14; PR —.
- Latest unique commits:
  - c7742f10 2026-09-08T06:27:24-05:00 style(repair): replay readable Company schedules on current main

### feat/connect-website-factory-design4-replay

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 3, behind 420; PR —.
- Latest unique commits:
  - b000d016 2026-09-03T03:10:30-05:00 feat(connect): add immutable Website Factory draft lifecycle and handoff
  - c14c4594 2026-09-03T03:09:22-05:00 feat(connect): add owner-scoped Website Factory draft collection
  - ee5a61f6 2026-09-03T03:09:06-05:00 feat(connect): replay Website Factory backend contract on current main

### proof/repair-paid-activation-production-2026-09-01

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 1, behind 453; PR —.
- Relevant files: `.github/workflows/repair-paid-activation-production-proof.yml`
- Latest unique commits:
  - 378bcc4a 2026-09-01T21:14:11+03:00 test(connect): add bounded paid activation production proof

### replay/pr-882-main-2026-08-28

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 3, behind 574; PR —.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-project.json`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `tests/hermes-connect-ai-connect-project.spec.ts`
- Latest unique commits:
  - 18d07649 2026-08-28T15:44:47+03:00 replay(test): restore AI Connect project browser contract on current main
  - 396063e2 2026-08-28T15:44:29+03:00 replay(connect): restore AI Connect project workspace on current main
  - a129bf43 2026-08-28T15:43:58+03:00 replay(connect): restore AI Connect project manifest on current main

### backup/pr-885-pre-clean-replay-2026-08-28

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 35, behind 575; PR —.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-internal.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-project.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`, `tests/hermes-connect-internal-ai-assistant.spec.ts`
- Latest unique commits:
  - b7f3ca8a 2026-08-28T14:41:47+03:00 chore(connect): settle cabinet after foundation merge
  - d2e71493 2026-08-28T14:41:07+03:00 chore(connect): settle cabinet branch after foundation merge
  - 002b0f84 2026-08-28T14:40:16+03:00 chore(connect): settle cabinet UX branch
  - a8a48d91 2026-08-28T14:39:29+03:00 chore(connect): stabilize cabinet branch state
  - bf8f7f24 2026-08-28T14:38:47+03:00 chore(connect): no-op align cabinet branch

### backup/pr-887-pre-clean-replay-2026-08-28

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 28, behind 575; PR —.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-activity.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-internal.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-projects-list.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/activity/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-activity.spec.ts`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect-projects-list.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`
- Latest unique commits:
  - 574bd57a 2026-08-28T13:44:56+03:00 test(connect): cover internal AI activity history
  - ba183f90 2026-08-28T13:44:30+03:00 docs(connect): register internal AI activity route
  - acafaa06 2026-08-28T13:44:17+03:00 fix(connect): preserve localized cabinet aria labels
  - 541a7d67 2026-08-28T13:43:37+03:00 feat(connect): add Activity to internal cabinet navigation
  - b8f4b864 2026-08-28T13:43:03+03:00 feat(connect): add internal AI activity history

### backup/pr-886-pre-clean-replay-2026-08-28

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 23, behind 575; PR —.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-internal.json`, `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-projects-list.json`, `src/components/HermesConnectInternalCabinetNav.astro`, `src/pages/services/hermes-connect/internal/ai-assistant/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/index.astro`, `tests/hermes-connect-ai-cabinet-ux-ru.spec.ts`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect-projects-list.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`
- Latest unique commits:
  - a46e8eae 2026-08-28T13:41:15+03:00 chore(connect): sync cabinet browser evidence from base
  - c461fd88 2026-08-28T13:17:42+03:00 test(connect): stabilize verified-owner project navigation
  - f539affa 2026-08-28T12:43:56+03:00 fix(connect): type cabinet navigation items
  - 2d46fcad 2026-08-28T12:27:22+03:00 chore(release): register internal AI Connect projects list
  - 1e00fb3a 2026-08-28T12:27:08+03:00 test(connect): cover familiar AI Connect projects list

### backup/pr-882-pre-main-replay-2026-08-28

- Status: **EVIDENCE_OR_REPLAY_REVIEW**; ahead 6, behind 575; PR —.
- Relevant files: `docs/release-manifest-deltas/2026-08-28-hermes-connect-ai-connect-project.json`, `src/pages/services/hermes-connect/internal/ai-connect/index.astro`, `src/pages/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/index.astro`, `tests/hermes-connect-ai-connect-project.spec.ts`, `tests/hermes-connect-ai-connect.spec.ts`
- Latest unique commits:
  - ce17bf93 2026-08-28T12:41:43+03:00 test(connect): disambiguate AI project runtime locators
  - 71bf2a82 2026-08-28T12:17:49+03:00 chore(release): register internal AI Connect project route
  - 53a4c446 2026-08-28T11:56:04+03:00 test(connect): cover AI Connect project workspace
  - b0530554 2026-08-28T11:55:43+03:00 feat(connect): add AI Connect project workspace
  - 62797452 2026-08-28T11:50:43+03:00 test(connect): cover internal AI Connect overview

