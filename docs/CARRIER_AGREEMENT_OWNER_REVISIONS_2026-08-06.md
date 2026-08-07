# Carrier Agreement Owner Revisions — 2026-08-06

Status: **OWNER-APPROVED REVIEW TEXT / PRODUCTION EXECUTION REMAINS OFF**

This decision record applies the owner-approved commercial model and the contract-protection recommendations identified after the technical carrier-signing flow was completed.

## Approved commercial model

- **6% — Dispatch Support**
- **8% — Full Partnership (Recommended)**
- **Carrier Proposal — custom percentage/scope, non-binding until written Hermes approval and matching signed terms**

The standard 6% and 8% choices may be displayed publicly. A carrier-specific custom percentage must not be placed in a public URL, analytics event, or public log.

## Contract changes applied

The new `Hermes_Carrier_Protection_and_Compensation_Addendum_v3_ATTORNEY_REVIEW.html` is incorporated into the v3 Master Agreement and overrides conflicting master terms for the following subjects:

1. `Operations + Growth` is renamed **Full Partnership**.
2. A **Hermes-Supported Load** includes a transaction Hermes identifies, sources, introduces, researches, negotiates, books, dispatches, monitors, documents, invoices, follows up, or otherwise materially supports.
3. The selected fee survives a later change in booking, invoicing, payment, dispatcher, affiliate, factor, authority, or intermediary.
4. Regular work period: **Monday through Saturday**; Hermes may issue the weekly invoice on **Saturday**; default due date is **seven calendar days after invoice** unless Appendix A states otherwise.
5. A specific invoice objection must be delivered within **five business days**; undisputed amounts remain due.
6. Undisputed overdue amounts may accrue the lesser of **1.5% per month** or the maximum lawful rate, and Hermes may pause new work after reasonable notice.
7. A **Protected Account** may be a shipper, dealer, auction, fleet, customer, broker program, or direct commercial contact introduced to or materially developed for the Carrier by Hermes.
8. Protected Account fee protection continues during the Agreement and for **24 months after termination**.
9. The Carrier may not conceal covered revenue or route business through another MC, authority, affiliate, owner, employee, driver, contractor, dispatcher, factor, or intermediary to avoid the fee.
10. Relevant rate confirmations, invoices, settlements, factor reports, and payment records must be supplied for limited reconciliation of covered compensation.
11. A targeted **12-month** personnel restriction applies only to Hermes personnel who materially served the Carrier and had direct business contact; general advertising, pre-existing relationships, and unrelated contact are excluded.
12. Remedies are unpaid contractual fees, accounting, actual proven damages, reasonable documented collection costs, and lawful equitable relief. **No automatic punitive fixed penalty** is included.
13. Protected Account, personnel, confidentiality, records, accounting, payment, collection, and pre-termination earned-fee obligations expressly survive termination.
14. Carrier control and the bona fide carrier-agent boundary remain unchanged. A workflow requiring broker authority must use a separately authorized and properly licensed broker.

## New review assets in the repository

- `public/contracts/Hermes_Carrier_Protection_and_Compensation_Addendum_v3_ATTORNEY_REVIEW.html`
- `public/contracts/Hermes_Protected_Account_Notice_v3_ATTORNEY_REVIEW.html`

These files are `noindex,nofollow,noarchive` and remain explicitly labeled `ATTORNEY REVIEW DRAFT - NOT FOR EXECUTION`.

## Generated owner-review artifacts

The matching locally generated and visually reviewed artifacts are:

- `Hermes_Carrier_Agreement_OWNER_REVIEW_v2026-08-06.docx`
  - SHA-256: `fcefcf2a8deb071c1dd2be8210dabe99589d21ee5e4f0f260c7af502f378a82f`
- `Hermes_Carrier_Agreement_OWNER_REVIEW_v2026-08-06.pdf`
  - SHA-256: `82762bd8d120db5e099c553165a231451811576bf1a8a35a1a0eb08b68358417`
- `Hermes_Protected_Account_Notice_OWNER_REVIEW_v2026-08-06.docx`
  - SHA-256: `74c382523d9482b994db5a3b010305db34f5a6e44432612fa53554cf88a538fa`
- `Hermes_Protected_Account_Notice_OWNER_REVIEW_v2026-08-06.pdf`
  - SHA-256: `a92e49d660c933d5faa3ace054ef17c3967c9980d89bbcd42f3cd8e2456242fe`
- `Hermes_Carrier_Agreement_OWNER_REVIEW_Package_v2026-08-06.zip`
  - SHA-256: `8afa3c11c40acf7d9df4f26ec0eaf6bf7148246a4eaf9fcc0f04333afb7f0e15`

The agreement remains three pages and the Protected Account Notice remains one page. Rendered pages were visually inspected for clipping, overlapping text, and broken tables.

## Merge status update (2026-08-06)

This decision record was written while PR #303 was still open. PR #303 was merged into `main` on 2026-08-06 (merge commit `65a20b7`). The blockers below described the state at decision time; they remain accurate as **production execution** blockers, not as merge blockers, since the merge has already occurred.

## Production blockers that remain intentional

1. `CARRIER_CONTRACT_MODE` remains review/default-off.
2. The existing repository master PDF remains the prior immutable attorney-review snapshot and must not be represented as matching the new Addendum.
3. Before live execution, the Master Agreement, Addendum, Protected Account Notice, and Appendix A must be assembled into one immutable carrier-specific packet or an equivalent provider envelope.
4. The combined execution PDF must receive a new non-review version identifier and SHA-256.
5. Production `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` must allow the approved standard percentages and continue to require separate approval for custom terms.
6. One synthetic mobile signing and delivery test must pass against the exact combined packet.
7. GitHub Actions and Workers build infrastructure issues (see `docs/CLOUDFLARE_DEPLOYMENT_OWNERSHIP.md` for the confirmed duplicate Workers Builds integration) remain separate technical blockers and must be resolved before production execution activation.

## Activation rule

No review label, production gate, or immutable-file check may be removed merely because this owner revision exists. Live execution begins only after the combined packet, registry, checks, and delivery path all match the same approved version.
