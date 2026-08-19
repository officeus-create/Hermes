# Academy + Hermes Connect GSC diagnostic — Batch 4 tasks 271–290

## Academy
GSC snapshot:
- `/academy/us-logistics-operations/`: 13 impressions / 0 clicks / avg position 31.62.
- `logistics training systems`: 6 impressions / avg position 53.67.
- `/academy/apply/`: 1 impression / avg position 9.

### Decision
- Keep the English U.S. Logistics Operations owner intact.
- Keep Ukrainian acquisition separate from English U.S.-operations search intent.
- Current evidence is far too small to justify Germany/Poland/Czechia/Spain or other diaspora country pages.
- Logistics B2+ language readiness, Marketing working RU/UA base-language requirement, local-market language advantage, English B2+ advantage/conditional requirement, and sanctions/legal-compliance eligibility boundaries remain program-truth constraints rather than SEO keyword material.

### Carry-forward
PR #721 (`/ua/academy/marketing/`) has green exact-head CI after the 390px overflow fix but remains intentionally unmerged until visual review/CEO approval because it adds a new visible public page.

The localized Ukrainian Academy application funnel remains a separate unfinished carry-forward: reuse one backend/payload and localize the application surface rather than creating a duplicate receiver.

## Hermes Connect
GSC snapshot:
- `/services/hermes-connect/`: 22 impressions / 0 clicks / avg position 13.55.

### Current product truth
The current public owner states:
- Hermes Connect is one business operating-system product family;
- Repair Shops is the current live product vertical;
- Logistics, Marketing, Academy, Beauty & Wellness and Professional Services are preview configurations;
- preview numbers/sample UI are explicitly labeled;
- primary live path is Repair Shops.

### Decision
Position 13.55 makes Hermes Connect a higher-priority near-page-one owner than pages ranking around 60–80. However, the supplied GSC export does not provide a query×page join for this URL, so there is not enough evidence to rewrite its title/H1 around a guessed query.

KEEP current product-truth owner. Next evidence step is a page-filtered GSC query export or comparable joined data. Until then:
- preserve title/H1/product truth;
- preserve Repair Shops as the first canonical live vertical;
- keep preview verticals labeled as previews;
- do not invent AI receptionist, inventory, invoicing or other unsupported live capabilities;
- do not create vertical keyword permutations.

## Repair Shops attribution carry-forward
PR #726 was merged to main on 2026-08-19. Exact `/services/hermes-connect/repair-shops/plan/` paid-activation requests posted through the shared lead endpoint are normalized to IT Development / Hermes Connect product intent while unrelated Logistics leads remain untouched.

This closes the known classification defect. Search-to-signup and paid-intent measurement still require authenticated analytics/lead-delivery evidence; GSC alone cannot prove conversion delivery.

## Tasks 271–290 status
- 271–273: Academy evidence and intent separation recorded.
- 274: code/CI complete for #721; visual CEO approval remains external merge gate.
- 275: localized application funnel remains unfinished carry-forward.
- 276–279: program language/compliance and no-diaspora-permutation boundaries preserved.
- 280: application measurement requires privacy-safe analytics evidence; external input pending.
- 281–282: Hermes Connect near-page-one evidence and owner audit completed; no unsupported visible rewrite authorized from this export.
- 283: Repair Shops paid-plan attribution fix merged (#726).
- 284: post-merge conversion verification requires authenticated analytics/receiver evidence.
- 285: Repair Shops public owner intent-dilution review remains a visual/content review item; no change without preview approval.
- 286–290: Repair Shops remains first live vertical; other verticals stay evidence-gated; permutation guard and browser-first/PWA truthfulness remain active.
