# GSC intentional noindex validation closeout — 2026-09-02

```yaml
ai_name: ChatGPT
model: GPT-5.6 Sol
role: SEO evidence reviewer and technical implementation owner
department: SEO / website
date: 2026-09-02
contribution_type: Evidence Review + Regression Guard
source_of_truth: owner-provided Coverage Validation ZIP dated 2026-09-02 + current repository main
base_sha: 5b511eb7e3cd7581bc4e1b68cddb9475a636dc13
evidence_class: OWNER_PROVIDED_GSC_EXPORT + REPOSITORY_VERIFIED
result: EXPECTED_NOINDEX / VALIDATION_WAS_NOT_A_FIXABLE_DEFECT
```

## Input receipt

The uploaded Google Search Console validation export contains **47 URLs** for the problem:

> Page indexing prohibited by `noindex`.

Validation status distribution:

- **20** — pending (`В ожидании`);
- **27** — error (`Ошибка`).

The validation error does **not** mean the site failed to remove an accidental indexing blocker. It means Google recrawled URLs included in a “Validate fix” workflow and still found `noindex`. For these URL classes, retaining `noindex` is the intended and correct result.

## Reconciliation with the prior 2026-08-29 drilldown

The 20 pending examples are the same intentional private/conversion/demo classes already reviewed in `docs/SEO_GSC_NOINDEX_DRILLDOWN_2026-08-29.md`:

- vehicle-transport intake and query-prefill states;
- carrier onboarding plan states;
- carrier proposal/agreement/signing/attorney-review routes;
- CRM and website-audit demos.

No indexability change is justified for those routes.

## Classification of the 27 validation errors

### Vehicle-transport intake query states — 2

Examples include additional request/customer prefill parameters on:

- `/logistics/request-vehicle-transport/`

Decision: **PRESERVE `noindex,follow`**. Query parameters represent conversion state, not separate organic search owners.

### Hermes Connect demo — 1

- `/demos/hermes-connect/`

Decision: **PRESERVE `noindex,nofollow`**. This is a product/demo workspace; public search ownership belongs to approved Hermes Connect service pages.

### Repair Shop owner/authentication workspaces — 24

The export contains localized and stateful variants of:

- `/services/hermes-connect/repair-shops/auth/` — including register/language variants and one slashless request;
- `/services/hermes-connect/repair-shops/dashboard/`;
- `/services/hermes-connect/repair-shops/customers/`;
- `/services/hermes-connect/repair-shops/availability/`;
- `/services/hermes-connect/repair-shops/forgot-password/`.

Decision: **PRESERVE `noindex,nofollow`**. Authentication, password recovery, owner dashboard, customer history, and owner availability are private/product workspaces, not organic landing pages. Language or mode query parameters are UI state and must not become SEO pages.

The protected public search owner remains:

- `/services/hermes-connect/repair-shops/`

That public owner must remain indexable and in its declared canonical sitemap, `public/sitemap-digital-services.xml`.

## Technical correction

The repository regression guard now explicitly protects the additional Hermes Connect classes reported by this validation export:

- `/demos/hermes-connect/`;
- Repair Shop auth;
- dashboard;
- customers;
- availability;
- forgot-password.

The same contract also protects `/services/hermes-connect/repair-shops/` as the indexable public owner and requires it to remain in `sitemap-digital-services.xml`.

Every intentional noindex route is required to stay out of every sitemap.

## What was actually wrong

The site behavior was correct. The workflow classification was wrong: an intentional exclusion class had been treated as if it were a defect eligible for GSC “Validate fix.”

Therefore the correction is:

1. preserve the intentional `noindex` directives;
2. preserve sitemap exclusion for private/demo/conversion states;
3. protect the public Repair Shops owner from accidental `noindex` and preserve its declared sitemap ownership;
4. stop treating this GSC validation as an active SEO defect;
5. do not re-run “Validate fix” for this intentional exclusion class.

## Do not do

- Do not remove `noindex` merely to make validation green.
- Do not add auth/dashboard/password/query-state URLs to a sitemap.
- Do not create localized query-parameter SEO pages from these states.
- Do not block these pages in `robots.txt` solely to suppress the report; Google needs crawl access to observe `noindex`.
- Do not count GSC validation failure on intentional noindex URLs as a ranking or technical SEO failure.

## Closure status

`EXPECTED_NOINDEX / CONTRACT_PROTECTED / VALIDATION_NOT_ACTIONABLE / CLOSED_AS_NON_DEFECT`

Reopen only if:

- an intended public SEO owner appears in this noindex class;
- an intentional noindex route appears in a sitemap;
- a protected public owner loses indexability or its declared sitemap ownership;
- a canonical/index conflict affects a public owner;
- parameter crawl volume becomes materially large enough to justify a separate crawl-budget intervention.
