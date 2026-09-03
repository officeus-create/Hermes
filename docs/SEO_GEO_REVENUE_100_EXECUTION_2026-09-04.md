# SEO/GEO Revenue-First 100 — Execution Ledger

Date: 2026-09-04

North star: **SEO/GEO → traffic → measurable lead handoff → qualified opportunity → money**.

This ledger deliberately separates repository execution from external outcomes. `VERIFIED_IN_PR` means the current PR proves the implementation/invariant. `GATE_IMPLEMENTED` means the repository is ready to accept/validate real external evidence, but the external result itself is not claimed. `EXTERNAL_RESULT_PENDING` must never be rewritten as zero, failed, indexed, ranked, cited, qualified, won, or revenue without the corresponding real evidence.

Canonical execution PR: #1059.

| # | Task | Engineering state | External outcome |
|---:|---|---|---|
| 001 | Marketing root output exists after production build | VERIFIED_IN_PR | n/a |
| 002 | Marketing root has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 003 | Marketing root has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 004 | Marketing root has a visible H1 | VERIFIED_IN_PR | n/a |
| 005 | Academy root output exists after production build | VERIFIED_IN_PR | n/a |
| 006 | Academy root has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 007 | Academy root has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 008 | Academy root has a visible H1 | VERIFIED_IN_PR | n/a |
| 009 | Technology root output exists after production build | VERIFIED_IN_PR | n/a |
| 010 | Technology root has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 011 | Technology root has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 012 | Technology root has a visible H1 | VERIFIED_IN_PR | n/a |
| 013 | SEO service output exists after production build | VERIFIED_IN_PR | n/a |
| 014 | SEO service has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 015 | SEO service has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 016 | SEO service has a visible H1 | VERIFIED_IN_PR | n/a |
| 017 | Local SEO output exists after production build | VERIFIED_IN_PR | n/a |
| 018 | Local SEO has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 019 | Local SEO has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 020 | Local SEO has a visible H1 | VERIFIED_IN_PR | n/a |
| 021 | Auto-dealer SEO output exists after production build | VERIFIED_IN_PR | n/a |
| 022 | Auto-dealer SEO has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 023 | Auto-dealer SEO has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 024 | Auto-dealer SEO has a visible H1 | VERIFIED_IN_PR | n/a |
| 025 | Website Development output exists after production build | VERIFIED_IN_PR | n/a |
| 026 | Website Development has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 027 | Website Development has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 028 | Website Development has a visible H1 | VERIFIED_IN_PR | n/a |
| 029 | Website Redesign output exists after production build | VERIFIED_IN_PR | n/a |
| 030 | Website Redesign has a non-empty title | VERIFIED_IN_PR | ranking pending |
| 031 | Website Redesign has exactly one canonical | VERIFIED_IN_PR | index state pending |
| 032 | Website Redesign has a visible H1 | VERIFIED_IN_PR | n/a |
| 033 | U.S. Logistics Operations Academy output exists | VERIFIED_IN_PR | n/a |
| 034 | U.S. Logistics Operations Academy has a title | VERIFIED_IN_PR | ranking pending |
| 035 | U.S. Logistics Operations Academy has one canonical | VERIFIED_IN_PR | index state pending |
| 036 | U.S. Logistics Operations Academy has a visible H1 | VERIFIED_IN_PR | n/a |
| 037 | Marketing Academy output exists | VERIFIED_IN_PR | n/a |
| 038 | Marketing Academy has a title | VERIFIED_IN_PR | ranking pending |
| 039 | Marketing Academy has one canonical | VERIFIED_IN_PR | index state pending |
| 040 | Marketing Academy has a visible H1 | VERIFIED_IN_PR | n/a |
| 041 | `llms.txt` exposes Hermes Logistics | VERIFIED_IN_PR | AI mention pending |
| 042 | `llms.txt` exposes Hermes Marketing | VERIFIED_IN_PR | AI mention pending |
| 043 | `llms.txt` exposes Hermes Academy | VERIFIED_IN_PR | AI mention pending |
| 044 | `llms.txt` exposes Hermes Technology | VERIFIED_IN_PR | AI mention pending |
| 045 | `llms-full.txt` preserves all Four Directions | VERIFIED_IN_PR | AI citation pending |
| 046 | GEO Source of Truth names Hermes Technology as root direction | VERIFIED_IN_PR | n/a |
| 047 | GEO Source of Truth keeps operating labels subordinate | VERIFIED_IN_PR | n/a |
| 048 | Unmeasured AI visibility remains `Not measured` | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 049 | AI prompt contract contains Hermes Technology | VERIFIED_IN_PR | observation pending |
| 050 | AI prompt contract contains Hermes Academy | VERIFIED_IN_PR | observation pending |
| 051 | AI ledger is ready for real observations | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 052 | AI ledger contains exactly 48 governed prompts | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 053 | AI ledger contains exactly five governed providers | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 054 | AI ledger denominator is exactly 240 | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 055 | Completed observation count is not fabricated | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 056 | All 240 provider/prompt slots are materialized | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 057 | All provider/prompt keys are unique | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 058 | Unobserved slots remain `unobserved` | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 059 | Unobserved slots keep null observation timestamps | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 060 | Unobserved slots keep null results | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 061 | Exact U.S. GSC owner-export contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 062 | Google URL Inspection contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 063 | Bing exact-URL contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 064 | GA4 exact-once receipt contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 065 | Private funnel aggregate contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 066 | Manual AI provider review contract exists | GATE_IMPLEMENTED | EXTERNAL_RESULT_PENDING |
| 067 | External acquisition queue remains `external_action_required` | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 068 | GA4 exact-once proof requires observed count = 1 | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 069 | IndexNow acceptance cannot impersonate Bing index proof | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 070 | Raw AI responses/transcripts are forbidden from repository evidence | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 071 | SEO commercial CTA click is instrumented | VERIFIED_IN_PR | traffic volume pending |
| 072 | SEO intake start is instrumented | VERIFIED_IN_PR | lead volume pending |
| 073 | SEO preview-ready is instrumented | VERIFIED_IN_PR | lead volume pending |
| 074 | SEO handoff-ready is instrumented | VERIFIED_IN_PR | receiver outcome pending |
| 075 | Local SEO keeps a distinct service variant | VERIFIED_IN_PR | qualified lead mix pending |
| 076 | Logistics SEO keeps a distinct service variant | VERIFIED_IN_PR | qualified lead mix pending |
| 077 | Auto-dealer SEO keeps a distinct service variant | VERIFIED_IN_PR | qualified lead mix pending |
| 078 | Money-page contract requires page-specific action labels | VERIFIED_IN_PR | conversion rate pending |
| 079 | Money-page contract requires direct intake destinations | VERIFIED_IN_PR | receiver outcome pending |
| 080 | Money-page contract requires approved direct fallbacks | VERIFIED_IN_PR | fallback usage pending |
| 081 | Marketing direction exposes a search/growth action | VERIFIED_IN_PR | lead outcome pending |
| 082 | Academy direction exposes real public programs | VERIFIED_IN_PR | application outcome pending |
| 083 | Technology direction exposes Hermes Connect | VERIFIED_IN_PR | product lead outcome pending |
| 084 | SEO service exposes its intake action | VERIFIED_IN_PR | lead outcome pending |
| 085 | Local SEO exposes its intake action | VERIFIED_IN_PR | lead outcome pending |
| 086 | Auto-dealer SEO exposes its intake action | VERIFIED_IN_PR | lead outcome pending |
| 087 | Website Development exposes a project-brief action | VERIFIED_IN_PR | lead outcome pending |
| 088 | Website Redesign exposes a project-brief action | VERIFIED_IN_PR | lead outcome pending |
| 089 | SEO service keeps the approved direct-email fallback | VERIFIED_IN_PR | lead outcome pending |
| 090 | Website Development keeps the approved direct-email fallback | VERIFIED_IN_PR | lead outcome pending |
| 091 | GEO state forbids synthetic provider observations as business evidence | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 092 | GEO state preserves the 48×5 denominator | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 093 | GSC/Bing/GA4 evidence classes remain separate | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 094 | Canonical-owner governance remains explicit | VERIFIED_IN_PR | search outcome pending |
| 095 | Private commercial outcomes remain separate from public evidence | VERIFIED_IN_PR | revenue aggregate pending |
| 096 | Public entity registry remains the controlled entity source | VERIFIED_IN_PR | external entity cleanup pending |
| 097 | ProgressoPro is not silently promoted into Hermes root `sameAs` | VERIFIED_IN_PR | external profile reconciliation pending |
| 098 | Five governed AI providers remain explicit | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 099 | Optional `other` provider remains outside the governed denominator | VERIFIED_IN_PR | EXTERNAL_RESULT_PENDING |
| 100 | CI self-check requires the batch to contain exactly 100 invariants | VERIFIED_IN_PR | n/a |

## Root entity corrections included in this wave

- English root navigation: `IT Development` → `Technology`.
- Marketing root identity: `ProgressoPro` → `Hermes Marketing`; ProgressoPro remains an operating marketing label.
- Academy root identity: `Hermes Business Academy` → `Hermes Academy`; Hermes Business Academy may remain a subordinate program/operating label.
- Technology root identity: `IT Development` / `Hermes IT Development` → `Hermes Technology`; IT Development remains a subordinate service/operating label.

## Do not claim yet

Until external evidence is genuinely acquired, this wave does **not** claim Google/Bing indexation, rankings, traffic growth, AI mentions/citations, delivered leads, qualified opportunities, won deals, or revenue. Those are the next evidence layer after the engineering gate is merged and production parity is verified.
