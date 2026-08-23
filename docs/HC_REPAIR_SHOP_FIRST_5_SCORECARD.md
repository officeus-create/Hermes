# Hermes Connect Repair Shops — First 5 Operating Scorecard

Parent: #585 / #586 / #596
Purpose: run the product with real shops and fix the earliest repeated funnel break before adding features.

Use one numbered slot per real shop. Keep shop names, contact details, customer data, invoices, private feedback text, account identifiers and raw screenshots in the approved private operating system, not this repository. GitHub records only sanitized status, timing, categories and aggregate evidence.

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
