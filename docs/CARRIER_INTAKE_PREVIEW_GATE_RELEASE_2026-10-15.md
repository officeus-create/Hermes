# P0: Car-hauling carrier intake — fail-closed UI and Sales delivery release contract (2026-10-15)

Status: **DRAFT CODE / NOT DEPLOYED / NO REAL LEAD OR DELIVERY PROOF.** Linked to existing business owner issue #1296. This is a source-level correction, not permission to email prospects or contact current dispatchers.

## The exact defect

`src/pages/logistics/start-car-hauling-dispatch/index.astro` emits `data-lead-mode` from build-time `PUBLIC_CONTACT_MODE` and `data-lead-endpoint` from `PUBLIC_CONTACT_ENDPOINT`. Previously `src/components/CarrierDispatchIntakeEnhancer.astro` overrode `preview` to `live` for any HTTPS browser on `hermeslogisticsus.com`, silently filling in `/api/logistics-lead` if missing. It could display **Send securely to Logistics Sales** even when the independent backend `functions/api/logistics-lead.ts` required but lacked runtime `LEAD_DELIVERY_MODE=live`, `LEAD_EMAIL_SERVICE`, `LEAD_LIMITS` or `LEAD_SERVICE_TOKEN`.

The result was inconsistent SSR/non-JS versus hydrated copy, an unusable send control, and incorrect assumptions that a submitted lead was actually delivered or received.

## Current draft scope

- Server-declared `preview` is **never** upgraded merely from a hostname.
- To show live send controls, the server must have explicitly emitted `data-lead-mode=live` **and** a configured same-origin HTTPS endpoint whose exact path is `/api/logistics-lead`, with no query or fragment. Otherwise browser controls remain preview-only and user-initiated email fallback remains available.
- The direct carrier path now has a second, separately gated source change: owner-opt-in **D1 capture-only**. It requires `CARRIER_INTAKE_CAPTURE_MODE=capture_only`, the existing `LEAD_LIMITS` KV and existing Hermes Connect `DB`, explicit consent, validation, rate/idempotency checks and the one-time migration. It returns `delivery_state=not_sent` and does not call `LEAD_EMAIL_SERVICE`.
- The API remains the independent final authority. Legacy non-carrier delivery still has its own email runtime gates; while carrier capture-only is enabled, this draft intentionally fails unrelated outbound lead types closed with `outbound_disabled_during_carrier_capture` rather than silently re-enabling mail. That shared-endpoint business impact must be accepted before release.
- The draft also adds an **owner-capability-protected private triage route** for reading captured carrier records, recording bounded human review/closure state, and purging expired rows. It is `noindex`; it is not a public CRM and does not qualify, dispatch, notify or email anyone.
- A browser says `submitted` only after a persisted D1 receipt. Delivery remains **not sent** and human acknowledgement stays **UNKNOWN** until an authorized person actually reviews the record. Synthetic fixture events never count as leads or money.

## Tests and environment acceptance

Targeted existing test: `tests/carrier-dispatch-mode-note.spec.ts`. New negative cases cover canonical production host with preview gate, missing/wrong-origin/HTTP/unknown endpoint, no send event or requests; existing live cases cover explicit configured endpoint, qualification gate, idempotency/receipt, and no private PII analytics. Playwright fixture runs a mocked browser VM; no outgoing API calls or mail are made.

Before requesting owner approval to merge, confirm with the authorised Cloudflare environment owner:

1. Production build `PUBLIC_CONTACT_MODE` and `PUBLIC_CONTACT_ENDPOINT` values (use the declared explicit endpoint; no host auto-upgrade), and preview environment values. Do **not** expose credential contents.
2. Backend production `LEAD_DELIVERY_MODE`, `LEAD_EMAIL_SERVICE`, `LEAD_LIMITS`, `LEAD_SERVICE_TOKEN`, `ALLOWED_ORIGIN` readiness. A configured UI is NOT proof the backend can deliver.
3. Recipient mapping and downstream routes are **Sales-only** for real car-hauling carrier inquiries, NOT current Dispatch Truck 107 or operational dispatcher inboxes. Synthetic QA must remain excluded and no 'loads available today' promise unless live data verifies it.
4. Independent browser QA with full JavaScript and no JavaScript on the canonical landing page, confirm consistent truth/expectations and accessible user-initiated fallback.
5. When owner explicitly approves a *real, consenting* business inquiry, record `landing -> form start -> reviewed -> server accepted -> delivery independently confirmed -> Sales human receipt -> qualified -> agreement`. The UI cannot infer the final steps from HTTP 2xx. Do not submit artificial leads just to make a green metric.
6. Stage first, then updated-base exact-head CI, business/Sales review, security review and separately authorised deploy. Roll back if conversion path becomes inaccessible.

## Additional release blockers discovered in source review (2026-10-16)

- **Retention policy is not owner-approved yet.** The draft stores carrier contact email and the submitted body in D1 for **180 days**. Do not apply the migration or enable capture until privacy/retention/erasure ownership explicitly accepts or changes that period.
- **Shared endpoint impact is intentional but material.** With `CARRIER_INTAKE_CAPTURE_MODE=capture_only`, unrelated lead types on `/api/logistics-lead` are failed closed instead of emailed. Confirm this is the desired temporary business policy so Marketing/Technology/general-contact demand is not accidentally discarded.
- **No migration/runtime proof yet.** `migrations/20261015_carrier_intake_d1.sql` remains unapplied by this PR; production `DB`, `LEAD_LIMITS`, build-time `PUBLIC_CARRIER_CAPTURE_MODE` and runtime capture mode require authorized readback. Do not create a synthetic production lead just to prove the path.
- **Qualification remains human/unproven.** The schema contains a `qualified` state, but the owner API in this draft only permits `new -> reviewed -> closed`. No code path may infer a qualified carrier, load assignment, agreement or revenue from a persisted intake.

## Existing technology to reuse

- **Playwright** supports `context.route('**/api/logistics-lead', route => route.fulfill(...))` before navigation, allowing real-browser front-end tests without any outbound lead. Official: https://playwright.dev/docs/network
- **Cloudflare Turnstile Free** has currently documented up to 20 widgets and unlimited challenges; **do not create a new account**. Hermes already uses `functions/api/_lib/turnstile.mjs` in repair booking, with server-side Siteverify, action and hostname checks and existing regression tests. If public carrier spam becomes measurable, evaluate a separately scoped `carrier_intake` verification gate and test accessibility/consent. Not justified yet by this defect and not added here. Source: https://developers.cloudflare.com/turnstile/plans/
- Cloudflare Pages bindings can differ between build-time and runtime and between preview and production. Official: https://developers.cloudflare.com/pages/functions/bindings/

Owner: existing Sales/Carriers lead and website/Cloudflare owners under #1296, with one writer per PR. No duplicate CRM, AI email automation or new paid tool.


## 2026-10-15 targeted release blockers and follow-through

- Source-based browser QA (no public API POST): the public, no-JavaScript view currently says **Preview mode is active**. Browser enhancer on deployed main can still enable send by hostname; do not infer actual delivery mode or success from either view. `PUBLIC_CONTACT_MODE` and `PUBLIC_CONTACT_ENDPOINT` in the actual Pages build remain UNKNOWN until authenticated deployment readback.
- CI root cause confirmed from workflow run 38637627190: old `tests/car-hauling-commercial-funnel.spec.ts` asserted that `hermeslogisticsus.com` must override preview. That test was stale/unsafe and failed after the correct removal. Replaced it with assertions for server-declared live and approved same-origin HTTPS endpoint; also corrected the landing-page handoff copy to **Logistics Sales reviews** rather than suggesting an automatic dispatcher review. Both changes are on this DRAFT branch; exact new-head CI must finish before any PASS claim.
- Follow-up source-level routing distinction: current direct-carrier API assigns `[HERMES INQUIRY] [LOGISTICS]` and passes to the Worker's generic Sales destination with an optional separately configured owner alert. The older `[HERMES SALES] [CAR HAULING] [CARRIER]` Worker branch has separate multi-recipient/Telegram/durable outbox logic. Do not assume protection or real receipts from the older Durable Object path automatically apply to the current direct carrier intake. Actual configured destinations remain UNKNOWN until authorized env readback. Do not send a smoke lead to make the status green.
- The old special Car Hauling Worker branch contains a default additional recipient even when `CAR_HAULING_INTERNAL_RECIPIENTS` is unset. Treat that as **legacy-route policy review**, not proof this direct carrier page notified an unapproved person. No recipient defaults are changed by this front-end PR. Scope further remediation against #1296 and current owner routing policy.
- For a future verified-durable Sales handoff, prefer the existing service binding and the codebase's Durable Object per-destination ledger over adding another CRM. Cloudflare Queues Free now has 10,000 operations/day but only 24-hour retention; this alone does not prove exactly-once email delivery or human receipt. Source: https://developers.cloudflare.com/queues/platform/pricing/ and https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/ .
