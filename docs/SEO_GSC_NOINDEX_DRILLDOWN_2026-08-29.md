# GSC intentional noindex drilldown — 2026-08-29

```yaml
ai_name: ChatGPT
model: GPT-5.6 Sol
role: SEO evidence reviewer and technical implementation owner
department: SEO / website
date: 2026-08-29
contribution_type: Evidence Review + Regression Guard
source_of_truth: owner-provided Google Search Console Coverage Drilldown export dated 2026-08-29 + current repository main
base_sha: 623a71eeb0b96d8328314de8646c8f40807ee5e2
evidence_class: OWNER_PROVIDED_GSC_EXPORT + REPOSITORY_VERIFIED
result: EXPECTED_NOINDEX / NO_INDEXABILITY_CHANGE
```

## Input receipt

The owner-provided GSC export is scoped to:

- **Problem:** page indexing prohibited by `noindex`;
- affected examples rise from `0` on 2026-08-04 to `12` on 2026-08-05, `19` on 2026-08-07, and `20` on 2026-08-10;
- the chart remains at `20` through its final included date, 2026-08-20;
- example last-crawl dates range from 2026-08-07 through 2026-08-12.

This export is evidence of Google seeing intentional `noindex` URLs. It is **not** evidence that 20 SEO owners were accidentally removed from the index.

## Classification of all 20 examples

### 1. Vehicle transport intake — 6 examples

Canonical workspace:

- `/logistics/request-vehicle-transport/`

Five GSC examples are query-prefilled states of the same workspace, including equipment and dealer-request parameters.

Current repository contract: `noindex,follow`.

Decision: **PRESERVE**. This is the conversion/intake destination behind public vehicle-transport owners, not a search owner itself. Query variants must not be added to sitemaps or converted into separate SEO pages.

### 2. Carrier onboarding — 4 examples

Canonical workspace:

- `/logistics/carrier-onboarding/`

Three additional GSC examples use `plan=essential`, `plan=pro`, or `plan=custom`.

Current repository contract: `noindex,nofollow`.

Decision: **PRESERVE**. These are private carrier agreement/onboarding states, not public search landing pages.

### 3. Carrier agreement / signing / attorney-review flow — 8 examples

- `/carrier/`
- `/sign/`
- `/logistics/start-car-hauling-dispatch/`
- `/logistics/carrier-offer/`
- `/logistics/carrier-agreement/`
- `/contracts/carrier-agreement-v3/`
- `/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW`
- `/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.html`

Repository verification:

- carrier/signing/agreement workspaces are intentionally `noindex`;
- the attorney-review HTML explicitly carries `noindex,nofollow,noarchive`;
- the attorney-review document is marked as a review draft and must not become a public search owner.

Decision: **PRESERVE**. Search ownership belongs to approved public logistics/service pages, not signing, proposal, agreement, or attorney-review surfaces.

### 4. Internal/demo previews — 2 examples

- `/demos/crm-validation/`
- `/demos/website-audit/`

Both static demo pages explicitly carry `noindex,nofollow`.

Decision: **PRESERVE**. They are preview/diagnostic artifacts and must not compete with public Marketing/Technology owners.

## Technical action

`scripts/logistics-path-indexability.test.mjs` is extended on the bounded branch to:

1. load every committed `public/sitemap*.xml` file;
2. require all intentional private/conversion/demo routes above to remain `noindex` with their current follow/nofollow policy;
3. require the attorney-review HTML to remain `noindex,nofollow,noarchive`;
4. ensure both the `.html` and extensionless attorney-review URLs are absent from every sitemap;
5. ensure all intentional noindex routes are absent from every sitemap;
6. continue protecting the existing public indexable Logistics owners.

## What not to do

- Do **not** remove `noindex` from these 20 examples merely to make the GSC exclusion count fall.
- Do **not** add query-parameter variants to a sitemap.
- Do **not** block these HTML pages in `robots.txt`; Google must be able to crawl a page to observe its `noindex` directive.
- Do **not** create duplicate public SEO pages for the agreement/signing/intake states.
- Do **not** start a GSC “validation fixed” workflow for a condition that is intentionally correct.

## Measurement decision

Treat this GSC class as a **known intentional-exclusion baseline**, not a P0 indexing defect.

Future action is required only if one of the following occurs:

- an intended public SEO owner appears in this noindex class;
- one of these private routes appears in any sitemap;
- its robots directive changes unexpectedly;
- Google reports a canonical/indexing conflict on a public owner that links into these workspaces;
- crawl volume from parameter variants becomes materially large enough to justify URL-state consolidation.

Until then, the correct status is:

`EXPECTED_NOINDEX / CONTRACT_PROTECTED / NO_GSC_FIX_VALIDATION`
