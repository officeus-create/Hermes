# SEO Revenue Architecture Notes — 2026-08-02

## Car hauling dispatch

Canonical commercial page: `/logistics/car-hauling-dispatch/`.

Current strengths:
- national U.S. service targeting;
- clear owner-operator and small-fleet audience;
- explicit carrier-controlled booking boundary;
- no guaranteed load, rate, lane, mileage, or revenue claims;
- supporting links to owner-operator, new-authority, capacity-checklist, Wisconsin transport, and dealer transport pages.

Current conversion gap:
- the shared `LogisticsCommercialPage` sends the dominant CTA directly to `mailto:freight_301@hermeslogisticsus.com`;
- the page does not route visitors into the structured carrier intake;
- the CTA therefore cannot measure intake start, preview readiness, or qualification completion;
- there is no supporting CTA after the FAQ/process sections.

Recommended status: `CTA_WITHOUT_HANDOFF`.

Required implementation after PR #95 merges:
1. keep the email and phone as fallbacks, not the dominant funnel;
2. route the primary CTA to `/load-board/?role=carrier&equipment=car_hauler#carrier-access` where supported;
3. add a supporting CTA after proof/FAQ;
4. explain what information is reviewed and what happens after preview;
5. add privacy-safe funnel events and regression coverage;
6. keep `/paths/logistics/carriers/car-hauling/` as an audience page that links to the commercial page and intake.

## Website development and SEO

Current architecture already separates:
- website development;
- website redesign;
- national SEO;
- Local SEO;
- logistics-company SEO;
- independent-auto-dealer SEO.

Current strengths:
- `/services/website-development/` already includes technical SEO foundations, conversion paths, analytics planning, QA, controlled release, and a U.S. national audience;
- related links connect development, redesign, SEO, Local SEO, the public case study, and IT Development;
- the service template routes users into a structured IT Development contact area rather than a generic external action.

Current conversion gap:
- the above-the-fold CTA label is generic (`Discuss this service`);
- the form does not visibly distinguish new website, redesign, SEO-only, and combined website + SEO needs at the landing-page level;
- reviewed qualified outcomes are not connected to the SEO revenue scorecard;
- there is no proof-led CTA after the case/process/FAQ content.

Preliminary architecture decision:
- do not create `/paths/marketing/website-seo/` yet;
- strengthen `/services/website-development/` as the primary new-build + SEO-foundation page;
- preserve `/services/website-redesign/` and `/services/seo/` for distinct intent;
- create a new combined-intent URL only if dated SERP evidence proves a separate need and cannibalization risk is controlled.

Recommended status: `HANDOFF_WITHOUT_QUALIFICATION`.

## Dependency

No implementation branch should start from the old baseline. PR #95 must first make both unit and Playwright Load Board dates deterministic and merge into `main`.
