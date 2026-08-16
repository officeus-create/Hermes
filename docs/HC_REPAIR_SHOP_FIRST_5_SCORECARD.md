# Hermes Connect Repair Shops — First 5 Operating Scorecard

Parent: #585 / #586
Purpose: run the product with real shops and fix the earliest repeated funnel break before adding features.

Use one row per real shop. Keep private customer/shop contact details in the approved private operating system, not this repository.

| Shop # | Source | Language | First device | Registered | Profile ready | 3 services | Hours set | Booking link shared | First booking | First completed booking | Plan viewed | Paid intent | Invoice sent | Paid | 7d active | Main friction | Missing feature | $99 objection | Next action | Owner | Due |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 2 | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 3 | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 4 | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 5 | DATA_PENDING | DATA_PENDING | DATA_PENDING | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |

## Funnel decision rule

Rank product fixes by the earliest repeated break:

1. registration failure/friction;
2. setup/profile confusion;
3. service/availability setup confusion;
4. booking-link distribution friction;
5. customer booking friction;
6. owner booking-processing friction;
7. no repeat use;
8. no plan interest;
9. paid-intent delivery/close friction;
10. price/value objection.

Do not build a new major Repair Shop feature because one person casually requested it. Promote a feature when it blocks the core workflow, appears repeatedly across users, or directly improves activation/retention/payment.

## Stage-1 exit

Repair Shops can hand primary engineering priority to Academy when:
- the canonical activation release is in production;
- the full workflow has been proven on phone and desktop;
- real shops are entering the funnel;
- paid intent can reach Hermes and be manually closed;
- the first-user friction queue is based on observed use rather than speculation.
