# Objection Coverage Audit — 5 money pages

Reviewed: 2026-08-04
Method: extracted rendered `dist/` HTML text for each page (post-`npm run build` on current `main`) and checked it against the buyer-question sequences an owner-pasted analysis proposed for each audience. Findings below are grep/read confirmed against the actual built page text, not inferred — see the `checks` per page for exactly what was searched. This is a read-only content audit; no page copy was changed.

Pages covered (the five canonical/near-canonical commercial pages):

- Car Hauling Dispatch — `/logistics/car-hauling-dispatch/`
- Dealer Vehicle Transportation — `/logistics/dealer-vehicle-transportation/`
- Logistics SEO — `/services/seo-for-logistics-companies/`
- Website Development — `/services/website-development/`
- Academy (US Logistics Operations) — `/academy/us-logistics-operations/`

## Summary

| Page | Covered well | Real gaps found |
| --- | --- | --- |
| Car Hauling Dispatch | Pricing/fee language, final-decision control, guarantee language, self-dispatch/Central Dispatch comparison, trust/experience mentions | No explicit "what happens after you submit" timing — the page explicitly avoids promising a response time ("without guaranteeing... response time"), which is policy-correct (no unverified claims) but still leaves a first-time visitor without a concrete next-step expectation |
| Dealer Vehicle Transportation | Copart/IAA/Manheim, release requirements, inoperable vehicles, open vs enclosed, storage deadline, insurance, multi-vehicle | Damage/delay handling only surfaces via the word "claim," no visible explanation of the actual process if something goes wrong in transit |
| Logistics SEO | Scope language, case study/results references, onboarding description | No named external-facing expert or reviewer profile — "author"/"credentials" only appear in the page's internal evidence-and-privacy-controls copy, not as a byline or bio a buyer would see |
| Website Development | Pricing/scope/quote language, timeline/phase/process, case study reference, guarantee language | None found in this pass — best-covered of the five |
| Academy (US Logistics Operations) | Pricing/fee, certificate/outcome language, program duration | No named instructor/mentor bio yet — the page lists "mentors" among things that *will* be disclosed (dates, capacity, languages, etc.), not an actual person shown now |

## Detail

### Car Hauling Dispatch
- ✅ Pricing/fee, final-decision-stays-with-carrier language, guarantee disclaimer, self-dispatch/Central Dispatch comparison, and "experience"/review language are all present.
- ⚠️ Gap: the response-time disclaimer ("without guaranteeing revenue, mileage, rates, lanes, response time, or specific loads") is honest and consistent with `docs/AI_START_HERE.md`'s no-invented-claims rule, but it means a first-time carrier visitor has no stated expectation at all for how fast they'll hear back after submitting an inquiry. This is a real conversion-anxiety point, distinct from removing the disclaimer — the fix is not "promise a time," it's "state the actual process" (e.g. "a person reviews every submission during business hours" — only if that's true).

### Dealer Vehicle Transportation
- ✅ Strong coverage: auction sources named, release/gate-pass, inoperable-vehicle handling, open vs enclosed, storage-deadline awareness, insurance mention, multi-vehicle/fleet language all present.
- ⚠️ Gap: "damage/delay handling" only resolves via the bare word "claim" in the text — there's no visible step-by-step of what a dealer should expect if a vehicle is damaged or a pickup/delivery slips. This is a specific, checkable objection from the persona list ("Что при повреждении или задержке?") that isn't addressed as thoroughly as the others on this page.

### Logistics SEO
- ✅ Scope and case-study/results language present; onboarding is described.
- ⚠️ Gap: no named, external-facing expert/reviewer. The word "author" and "credentials" both occur, but only inside the page's internal evidence/privacy-controls copy ("evidence, privacy and authority controls define which facts may be public..."), not as a visible byline or bio. This matches `docs/ERROR_REGISTER.md` ERR-EXT-004 and issue #176's C3 trust-layer gap — it is not a copy bug to fix by inventing a name, it needs the owner to supply a real reviewer identity (see the "trust layer pending" plan already noted for tomorrow).

### Website Development
- ✅ Best-covered page in this pass: pricing/scope/quote, timeline/phase language, a case-study reference, and guarantee language are all present. No gap found against this check set.

### Academy (US Logistics Operations)
- ✅ Pricing/fee, certificate/outcome, and duration language present.
- ⚠️ Gap: "mentors" is only mentioned as something that *will* be published alongside dates/capacity/languages — no actual instructor name or bio is shown yet. Same category as the Logistics SEO gap: needs a real person from the owner, not a placeholder.

## What this does and doesn't mean

Two of the five gaps (Logistics SEO, Academy) are the same underlying issue — a missing named, real person — and are explicitly out of scope for me or ChatGPT to fill in per `docs/AI_START_HERE.md` ("Never invent... testimonials, case results... named experts"). They're tracked as part of the trust-layer work already noted as pending for the owner.

The other two (Car Hauling Dispatch response-time expectation, Dealer damage/delay process) are copy-level gaps that *can* be closed without inventing anything, once the owner confirms what the actual internal process is (e.g. "who reviews inbound Car Hauling Dispatch requests and how fast," "what actually happens today if a vehicle is damaged in transit") — flagged here as ready for a small, real content PR once that's confirmed, not attempted blind in this pass.
