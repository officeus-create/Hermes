# Carrier Agreement ↔ Load Board reconciliation (2026-11-02)

Status: SAFE ROUTE BRIDGE IMPLEMENTED IN PR; EXECUTION AND IDENTITY PROVISIONING STILL SEPARATE.

## Source inventory
- 2024 historical Google Doc "2.0 Carrier Agreement 2024": legacy 5% gross/revenue wording, operational profile and insurance/CDL/third-party portal access, Nevada venue.
- 2025 historical Google Docs "2.0 Dispatcher- Carrier Agreement 2025" and "SOURCE — Dispatch 107": separate legacy 10% gross/revenue wording, operating profile, broker/load-board delegation instructions, old dispatcher email.
- August 2026 legal draft #280: proposed 5% terms; non-broker, carrier load approval and secure operational handoff.
- Current v3 review: blank master %, separate carrier Appendix A; website remains review-only.
- Owner-approved 2026-11-02 seven-page contract: optional 14-calendar-day trial, separately blank trial and standard rates, no automatic post-trial continuation, two authorized signatures. New logo is the approved site's `/brand/hermes-mark.svg`. Locally generated branded PDF SHA-256: `772a9f69c5bb201d79f8d7b2788b9a008d4131314d6180ce999a5845fa2e150c`. This PR does not install that unsigned master.

## Public pathways (different commitments)
1. `/load-board/?role=carrier#carrier-access`: *free access inquiry*, not a signed dispatch agreement, not automatic account or broker/source privilege.
2. `/carrier/` → `/logistics/carrier-offer/` → `/logistics/carrier-agreement/` → `/logistics/carrier-onboarding/`: select 6% Dispatch Support, 8% Full Partnership or Custom, confirm company and Appendix A and sign only a current approved document version.
3. After qualified, authorized contract: securely collect authority/insurance evidence, actual equipment capacity, origins/lanes, deadhead and RPM expectations, factoring and delegated provider seats; match verified carrier identity and provision limited Hermes Connect/Load Board access. No raw passwords, OTP, tokens, bank or CDL files in public forms.
4. Live cargo/source access requires its own permissions, verified carrier authority, review and auditable entitlement. Public demos are not live freight.

## Confirmed gaps
- Three support choices already existed on `/logistics/carrier-offer/` but were hidden from most `/carrier/`, `/sign/` and agreement entries after route redesign. PR #2251 restores that entry component and Cloudflare static route mitigation. This PR adds explicit *optional* routing from the public Load Board access form and review result, without forcing a paid agreement.
- Public Load Board form stores/submits *lead* to `/api/logistics-lead` on canonical site, not an account. Browser preview does not send automatically.
- `src/pages/logistics/carrier-onboarding/index.astro` has one `service_percentage` input but not separate trial & post-trial fields. The API `functions/api/carrier-contract.ts` enforces `LEGAL_EXECUTION_APPROVED=false` and does not issue the approved 14-day execution master. Requires issue #2252.
- The 2024/25 fee basis, weekly due rules and legal venue differ materially from present v3. Never mix historical 5% / 10% terms with current 6% / 8% / Custom without carrier-specific written agreement.
- HTML 200 alone is not proof of Cloudflare routing, working download or successful signature/email. Prove browser navigation and production receipt after any deployment.

## Remaining P0
See #2251 (UI routes, browser and Cloudflare) and #2252 (immutable owner-approved 14-day master/hash, Appendix A trial schema, backend, signed countersignature and delivery/retention verification). Until #2252 completes, do not represent current website review packet as final executed agreement. Do not send the old broken links to carriers as if they are updated.

Security contract: no old `dispatchtruck3447@gmail.com` or retired `freight_301@hermeslogisticsus.com` as default. Canonical contract receipt: `officeus@hermeslogisticsus.com`. 
