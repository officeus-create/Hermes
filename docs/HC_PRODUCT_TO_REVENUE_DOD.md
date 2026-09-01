# Hermes Connect — Product-to-Revenue Definition of Done

Owner rule adopted 2026-09-01. Canonical execution checklist: GitHub #960.

A Hermes Connect product task is not complete merely because code exists, CI passes, or a preview renders.

For a sellable workflow, applicable completion evidence is:

1. **OPEN** — the owner can open the real production surface from a normal desktop or mobile browser.
2. **USE** — the intended user can complete the real workflow using persisted operational data, not sample/demo state.
3. **VERIFY** — the resulting state can be read back after reload/sign-in.
4. **PAY** — a truthful payment path exists. For the First-5 Repair Shop cohort, human confirmation + invoice is an approved real payment path; a fake website checkout is not.
5. **ACTIVATE** — the commercial access state can be applied by an authorized process and is reflected in the product.
6. **LIVE PARITY** — production serves the approved current-main behavior. Repository-only completion does not count.
7. **REAL USER** — synthetic smoke proves engineering safety, but the customer loop is not complete until a real target user traverses it.

Evidence ladder:

`DOCUMENTED → CODE_EXISTS → TESTED_LOCALLY → CI_VERIFIED → DEPLOYED → LIVE_VERIFIED → REAL_DATA_BACKED → REAL_USER_USED → MONETIZED`

Do not promote a task to a later state from weaker evidence.

## Revenue priority

Until the existing Repair Shop loop is live-parity, touchable and able to close a real paid activation, new speculative Hermes Connect modules do not outrank that closure work.

Current Repair Shop paid path remains:

`paid activation intent → human confirmation → invoice/payment decision → authorized repair_shop_access state → owner dashboard read-back`

Online card/subscription billing is a later gate under #319 and requires approved commercial/legal/provider facts.
