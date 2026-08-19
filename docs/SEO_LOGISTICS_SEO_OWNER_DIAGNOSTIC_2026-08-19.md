# Logistics SEO owner diagnostic — Batch 4 tasks 221–240

## Evidence
The 2026-08-19 owner-provided GSC export shows the logistics-specific commercial owner at 242 impressions, 0 clicks, and average position 62.65. Its demonstrated query family includes logistics SEO, trucking SEO, transportation SEO, consultant/agency and adjacent supply-chain variants.

## Canonical owner decision
Preferred owner for logistics/trucking/transportation SEO commercial intent:

`/services/seo-for-logistics-companies/`

The general `/services/seo/` page remains the general service owner and must point users/search crawlers toward the niche owner for logistics-specific intent. It must not be rewritten into a second logistics/trucking landing page.

`/services/seo-for-independent-auto-dealers/` remains a separate dealer-specific owner because dealership inventory/local/customer intent is materially different from logistics-company SEO.

## Current architecture observations
1. The general SEO page already includes a descriptive related link to `SEO for Logistics Companies`.
2. The logistics niche page explicitly links back to General SEO Services and has separate logistics-focused audience, deliverables, process, boundaries and FAQ.
3. The existing commercial-owner CI gate already requires `/services/seo-for-logistics-companies/`, `/services/seo/`, and `/services/seo-for-independent-auto-dealers/` to remain indexable and have descriptive contextual inbound links within four clicks.
4. Therefore the immediate defect is not missing basic crawl connectivity.
5. At average position ~63, a 0% CTR result is not enough evidence to justify a title/meta-only rewrite.

## Query-family map
### Owned by `/services/seo-for-logistics-companies/`
- seo for logistics companies
- logistics seo agency
- seo for logistics
- logistics seo
- logistics seo company
- logistics seo consultants
- seo consultants in logistics sector
- trucking seo company
- trucking company seo
- trucking seo
- seo for transportation companies
- transportation company seo
- seo services for transportation business
- seo for logistics business
- logistics seo services
- seo for transportation and logistics
- logistic seo services
- seo for logistics company
- seo services for logistics companies
- seo for carrier companies
- seo for supply chain companies (only where the client scope actually supports the service)
- ai seo services for logistics (AI wording is a query observation, not permission to invent capabilities)

### General owner `/services/seo/`
General SEO audit, technical SEO, search architecture, conversion SEO and measurement intent without a logistics-specific buyer/business context.

### Separate dealer owner
Dealer/dealership SEO, inventory/feed SEO, dealership Local SEO, trade-in/financing preparation and dealer-specific search architecture belong to `/services/seo-for-independent-auto-dealers/`.

## Unsupported/mismatch terms
`seo for warehousing companies` can belong to the logistics SEO service **only when the SEO client is a real warehousing business**. It does not mean Hermes Logistics itself provides warehousing.

Japanese query `運送業 seo対策` is an international research signal only. Eight impressions at average position 71.88 do not justify a Japanese service page or translation by themselves.

## Recovery sequence
1. KEEP the niche canonical owner.
2. Do not rewrite the active experiment solely because CTR is 0 at position ~63.
3. Preserve descriptive contextual links and review whether higher-authority Logistics/Marketing surfaces can add genuinely useful contextual paths in a future approved visible change.
4. Preserve evidence boundaries; do not invent customer results, rankings, lead counts, traffic, revenue or case studies.
5. Separate niche vs general owner in monitoring.
6. Re-export comparable GSC data after a real measurement window.
7. Permit a visible title/H1/intro adjustment only if comparable evidence shows a query-language mismatch or the page reaches a ranking range where snippet CTR becomes actionable.

## Build gate for any future visible rewrite
A visible rewrite is allowed only after at least one of:
- comparable GSC evidence shows the owner continues receiving material relevant impressions while title/H1 language materially misses the demonstrated query family;
- the page reaches approximately page-two/page-one range but CTR is materially weak relative to query intent;
- a factual production defect or misleading scope is found;
- CEO explicitly approves a controlled experiment after desktop + 390px preview QA.

## Tasks 221–240 status
- 221–225: completed by evidence and owner-overlap review.
- 226: title/H1/meta reviewed; no emergency rewrite justified by current rank evidence.
- 227: contextual inbound-link contract confirmed in CI; future link additions remain evidence/visual gated.
- 228: proof remains bounded to first-party system/process evidence; no fabricated outcome proof permitted.
- 229–230: rewrite trigger and observation rule recorded.
- 231–237: logistics/trucking/transport query families mapped to one preferred owner; supporting/general/dealer owners separated.
- 238: Japanese query held as research only.
- 239: permutation-page prohibition retained.
- 240: requires future comparable GSC export; external measurement input remains pending.
