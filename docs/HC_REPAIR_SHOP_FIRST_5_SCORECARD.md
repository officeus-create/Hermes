# Hermes Connect Repair Shops — First 5 Operating Scorecard

Parent: #585 / #586 / #596
Purpose: run the product with real shops and fix the earliest repeated funnel break before adding features.

Use one numbered slot per real shop. Keep shop names, contact details, customer data, invoices, private feedback text, account identifiers and raw screenshots in the approved private operating system, not this repository. GitHub records only sanitized status, timing, categories and aggregate evidence.

## Owner-ready First-5 call + invoice activation packet (10 minutes)

Use this packet only with a real independent U.S. repair-shop owner or manager already approved for a human conversation. It prepares a truthful manual close; it does not authorize outreach, send an invoice, charge a card, promise results, or activate access by itself.

### Ownership and evidence

- **Business owner:** Sales / Customer Success plus the authorized Hermes commercial owner.
- **Single writer:** the trained human caller who owns the canonical private `CALL LOG` row for that shop.
- **Independent verifier:** Completion Architect checks offer fidelity; Finance verifies invoice/payment evidence; Analytics/QA verifies activation and product readback.
- **Public offer:** setup-period software fee `$0`; standard Founding Shop price `$99/month per repair shop location` only after setup and human confirmation before invoicing.
- **Private evidence only:** decision-maker identity, contact details, call notes, billing contact, invoice, payment/provider receipt and account identifiers.
- **Repository evidence only:** sanitized slot/state, timing, friction category, payment state and next action in this scorecard.

### Before the call — 2-minute operator check

1. Open the existing private shop/lead row and confirm one owner, one next action and no duplicate or `DNC` state.
2. Confirm the person is the owner/manager or can bring the decision-maker into the conversation.
3. Open the live Repair Shops page, owner registration route and Founding Shop Plan; stop if they do not show `$0 during setup`, `$99/month after setup`, no card during setup and human confirmation before invoice.
4. Keep the canonical private `CALL LOG` ready. Do not copy PII, verbatim notes, invoice data or screenshots into GitHub.

### Call — maximum 10 minutes

| Time | Human prompt | Required private note |
|---|---|---|
| 0:00–0:45 | “Are you the owner or manager responsible for scheduling and software decisions? I want to understand the current workflow before discussing Hermes Connect.” | `DECISION_MAKER = YES / NO / UNKNOWN` |
| 0:45–2:30 | “How do customers request appointments today, and where does the team lose the most time: calls/messages, services, availability, booking status, customer history or vehicle history?” | One observed primary friction category; no invented pain |
| 2:30–4:30 | “Hermes Connect puts services, weekly availability, one booking link, booking status, customers and vehicles in one browser workspace. Which part would you test first?” | `FIRST_VALUE_TARGET` and the owner’s own success signal |
| 4:30–6:30 | “Setup-period software access is $0 while the real shop profile, services, availability and booking workflow are configured. Would you be willing to complete setup and test one real workflow?” | `SETUP_DECISION = YES / NO / LATER` plus next date/owner |
| 6:30–8:00 | “If the configured workflow is useful, the standard Founding Shop price is $99/month for one location. Hermes confirms the scope, billing contact and invoice with you before paid activation; the website does not charge a card. Is that process clear?” | `PRICE_UNDERSTOOD`, `INVOICE_CONSENT`, sanitized objection category |
| 8:00–10:00 | Agree one next step only: start/finish setup, schedule observed traversal, request the manual invoice, or close/pause the opportunity. Repeat that no customer, booking, ranking or revenue result is guaranteed. | `NEXT_ACTION`, human owner, due date, permission state |

### Stop / pause rules

Stop the commercial close and record a bounded reason when any of these is true:

- the decision-maker is absent and no approved follow-up exists;
- the shop is outside the represented repair-shop workflow or current First-5 scope;
- the person does not consent to billing follow-up;
- the owner expects guaranteed customers, rankings, bookings or revenue;
- price, cancellation, refund, tax, contract or provider facts would need to be invented;
- a duplicate, `DNC`, privacy, identity or account-ownership conflict exists;
- the real workflow has not been tested enough for the owner to make an informed decision.

Allowed dispositions: `SETUP_ACCEPTED | OBSERVED_TRAVERSAL_SCHEDULED | INVOICE_REQUESTED | NOT_NOW | NOT_FIT | DNC | OWNER_DECISION_REQUIRED`.

### Manual invoice + activation handoff

The authorized commercial owner completes this only after `INVOICE_REQUESTED` from a real decision-maker:

1. Confirm privately: one shop location, `$0` setup period, `$99/month` continuation price, billing contact, invoice cadence/start date and the exact scope already published on the Founding Shop Plan.
2. Issue the invoice through the existing approved company process. Store only a pointer/reference in the private operating system; never place financial data in this repository.
3. Keep states separate: `PAID_INTENT` is not `INVOICE_SENT`; `INVOICE_SENT` is not `PAID`; `PAID` requires settled provider/financial evidence.
4. After settled payment or another explicitly authorized commercial state, the authorized operator applies the existing `repair_shop_access` state and records who approved it and when.
5. Independently read back the paid/access state in the owner product and confirm the real shop can continue the intended workflow.
6. Update the private evidence first, then this repository’s sanitized First-5 slot and aggregate KPI.

### DONE for one First-5 paying shop

All of the following must be true:

- real decision-maker conversation and disposition exist in the canonical private `CALL LOG`;
- the shop completed or observed enough of the real workflow to make an informed payment decision;
- exact `$99/month/location` manual invoice evidence exists and settled payment is independently verified;
- authorized access state is applied and read back in the owner product;
- at least one real post-activation use signal is observed;
- Finance and Analytics/QA independently sign off on payment and activation evidence;
- only sanitized state/timing/categories are written to this scorecard.

Synthetic requests, test invoices, screenshots, workflow checks or access-state smoke runs never satisfy this business DONE contract.

## Release gates before a real first-5 cohort

Do not move a real shop from `INVITED` into `REGISTERED` or later cohort tracking until the selected exact `main` release has cleared the applicable production gates:

- canonical Repair Shop P0/current closure release is merged to `main` and the exact deployed SHA is recorded;
- exact-current-main production smoke proves the real registration/auth → profile → services → availability → public booking → owner visibility loop on the canonical production domain;
- desktop and 390px browser acceptance is green for the selected release, including applicable locale behavior;
- local legacy tunnel issue #579 remains stopped and the current web pilot is explicitly independent of that legacy runtime; retiring/containing the local file remains a separate security task and must not be bypassed by reintroducing it;
- Cloudflare Preview D1 issue #687 is **not** an unconditional blocker to a tightly controlled production first-5 cohort when the exact `main` production smoke above is green. #687 remains required before a branch Preview is treated as a trusted D1-backed acceptance/re-review environment;
- automated password-reset email issue #611 may remain on the existing localized support fallback until its scoped Cloudflare deploy credential + production email proof is complete; do not claim automated reset-email delivery is live before that proof;
- no second D1, auth stack, copied runtime, mock authority or legacy workspace is introduced to bypass a gate.

A generic PR Preview without the canonical `DB` binding must fail closed and must not be represented as D1-backed acceptance evidence.

Allowed cohort state:
`DATA_PENDING | INVITED | REGISTERED | ACTIVATED | FIRST_BOOKING | COMPLETED_SERVICE | 7D_ACTIVE | PAID_INTENT | PAID | PAUSED`

## A. First-value / activation evidence

| Shop # | State | Source | Language | First device | Registration min | First booking-link min | Phone setup complete | Profile ready | 3 services | Hours set | Link shared | First booking without Hermes help | First booking | First completed booking | Friction count before first value | Main friction category |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — |
| 2 | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — |
| 3 | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — |
| 4 | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — |
| 5 | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — |

### Timing rules

- `Registration min`: elapsed minutes from the owner starting the registration flow to a valid authenticated owner state.
- `First booking-link min`: elapsed minutes from registration start to the first successful open/copy/share of the canonical public booking link.
- Record observed elapsed time only. Do not infer timing from analytics timestamps when session boundaries are ambiguous.
- The `<=10 minutes` first-value target from #596 is an internal hypothesis until enough real users prove it.

### Friction categories

Use one primary category plus a sanitized note in the private operating source:

`REGISTRATION | LOGIN | PROFILE | SERVICES | AVAILABILITY | SHARE_LINK | PUBLIC_BOOKING | OWNER_INBOX | STATUS_WORKFLOW | MOBILE | LANGUAGE | SUPPORT | PERFORMANCE | OTHER`

Count a friction event when the owner is blocked, confused enough to ask for help, repeats a failed action, or abandons and resumes later. Do not count normal reading/decision time as friction.

## B. Retention / satisfaction / commercial evidence

| Shop # | 7d active | Would use again next week | Satisfaction 1–5 | Support/feedback category | Missing capability expected most | Plan viewed | Would pay current offer | Price/value objection | Paid intent | Invoice sent | Paid | Next action | Owner | Due |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 3 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 4 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 5 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |

### Commercial evidence rules

- `Would use again next week`: ask directly after first value or first completed booking; allowed values `YES | NO | UNSURE | NOT_ASKED`.
- `Would pay current offer`: allowed values `YES | NO | MAYBE | NOT_ASKED`; keep the verbatim reason private and record only a sanitized category here.
- `Price/value objection`: use `NONE | PRICE_TOO_HIGH | VALUE_NOT_CLEAR | NEED_FEATURE | NOT_READY | PAYMENT_PROCESS | CONTRACT_CONCERN | OTHER`.
- `Paid intent` is not payment. `Invoice sent` is not payment. `Paid` requires private operating evidence of completed payment/approved paid state.
- Do not claim first paid shop publicly from this repository alone.

## C. First-5 aggregate KPI checkpoint

Update only from the five real-shop slots above.

| KPI | Stage-1 target | Current |
|---|---:|---:|
| Real shops registered | 5 | DATA_PENDING |
| Profile + services + availability complete | >=4 | DATA_PENDING |
| Public booking link shared | >=3 | DATA_PENDING |
| At least one booking received/processed | >=3 | DATA_PENDING |
| First completed booking | evidence required | DATA_PENDING |
| 7-day active shops | measure | DATA_PENDING |
| Shops willing to use again next week | measure | DATA_PENDING |
| Shops expressing paid intent | measure | DATA_PENDING |
| First paid shop | 1 | DATA_PENDING |
| Median registration time | measure | DATA_PENDING |
| Median time to first booking link | target hypothesis <=10 min | DATA_PENDING |
| Median satisfaction | measure | DATA_PENDING |

Do not calculate percentages/medians from `DATA_PENDING`, synthetic QA accounts or internal team test accounts.

## Funnel decision rule

Rank product fixes by the earliest repeated break:

1. registration failure/friction;
2. setup/profile confusion;
3. service/availability setup confusion;
4. booking-link distribution friction;
5. customer booking friction;
6. owner booking-processing friction;
7. no repeat use / weak 7-day return;
8. no plan interest / unclear value;
9. paid-intent delivery or manual-close friction;
10. price/value objection.

Promote a new feature only when it:
- blocks the core workflow;
- appears repeatedly across real shops;
- materially improves activation, retention or payment;
- or is required for truthful/compliant operation.

One casual feature request is not enough to change the roadmap.

## Weekly decision output

After each new real-shop session, update the private evidence source first, then this sanitized scorecard. The weekly product decision should contain exactly:

1. earliest repeated funnel break;
2. number of shops affected;
3. evidence class (`OBSERVED | DIRECT_OWNER_FEEDBACK | OPERATING_DATA | PAYMENT_EVIDENCE`);
4. smallest fix to test next;
5. explicit `DO_NOT_BUILD_YET` list for requested features without repeated evidence.

## Stage-1 exit

Repair Shops can hand primary engineering priority to Academy when:

- the canonical activation release is in production;
- the full workflow has been proven on phone and desktop;
- real shops are entering the funnel;
- at least the first cohort provides observed activation/friction evidence;
- paid intent can reach Hermes and be manually closed;
- the next feature queue is ranked from observed first-shop use rather than speculation.

Do not call Stage 1 complete because pages, tests or PRs exist. The exit criterion is real owner behavior through activation, booking, return use and a payment decision.
