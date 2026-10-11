# MZM Junk Removal — Three-Surface Closeout

Date: 2026-10-12  
Canonical project owner: GitHub #1799  
Scope: Hermes-owned product surfaces only.

## Why MZM exists in Hermes

MZM is a Home & Local Services training/client case used to harden one reusable Hermes pipeline:

`Company → Catalog → CRM → Evidence → Insight/News → attribution → real outcome evidence`

MZM owns its external website. That site is public evidence/reference only unless a separate explicit implementation scope is later authorized. Hermes does not edit, replace, migrate, proxy, reroute, repair, or create client-site bridges for it.

## Original operating problem captured for CRM

The junk-removal operator handles a full service chain: acquisition source/search query, lead intake, photos/volume, estimate, follow-up, scheduling, driver/crew handoff, completion, payment, disposal/landfill cost, and review follow-up.

The canonical CRM flow is:

`source/query → lead → quote → booked → in progress → completed → revenue → review`

Required private fields include source/query, customer/contact, address/ZIP/city, job type, photos, approximate volume, lead cost, quote, status, schedule, assigned driver, final amount, disposal cost, duration, payment method, loss reason, follow-up, and review requested/received.

Analytics must answer which city, source/channel, job type and search query produce booked/completed work and source-verified economics. UNKNOWN is never converted to zero.

The client semantic core contains 8,155 unique keyword variants across 82 topic groups. It is an attribution/content-clustering input, not permission to create one page per keyword.

## What went wrong during implementation

1. Architecture work outran the client-facing result. Too much time went into PR/replay/evidence mechanics before the three visible outcomes were treated as the acceptance contract.
2. Provisioned Company/Profile was repeatedly confused with activated/adopted client use. Reviewer access was at times discussed as if it were owner authentication.
3. Catalog, CRM and Insight were developed in separate lanes before being reconciled as one Company and one client story.
4. The project drifted into the client-owned website: source/hosting/DNS/Netlify/Wix investigations, copy-repair planning and a replacement-site experiment. This was scope creep.
5. PR #1844 then encoded that scope creep in Hermes by adding MZM-specific public intake/availability endpoints intended to bridge client-site behavior.
6. Several states were stale after later releases, causing agents to repeat owner-wait/source-recovery work that was no longer part of the goal.
7. Too much effort was spent proving absence/access gaps instead of asking the simpler acceptance question: are the Hermes News, Catalog and CRM outcomes complete?

## Final architecture

### 1. News / Insight

Canonical public editorial owner:

`/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/`

It uses public-source evidence, links directly to the official MZM website with bounded attribution, links to the MZM Catalog profile, and does not claim ranking/lead/revenue outcomes without evidence.

### 2. Business Catalog mini-site / showroom

Canonical public profile:

`/businesses/connect/company/mzm-junk-removal/`

It is a Hermes-owned site-like public projection from the same Company: hero/business identity, services, service areas, official website/call actions, verified first-party team/social context, recent public job evidence and Insight handoff.

The Catalog is a secondary entity/discovery/showroom surface. It must not clone MZM city/service landing pages or publish private CRM data.

### 3. Home Services CRM

Canonical Company:
`home-service-managed:mzm-junk-removal`

Canonical data owner:
`hermes-managed:mzm-junk-removal`

Private workspace:
`/services/hermes-connect/home-services/workspace/?managed=mzm-junk-removal`

The workspace implements the MZM operating chain and analytics described above. A scoped Hermes reviewer can inspect the same Company in read-only mode. SAMPLE rows are visibly marked, never persisted as real business outcomes and never counted in KPI.

## Durable rules

- One Company, one Catalog identity, one CRM data owner, one Insight owner.
- Client-owned external website = evidence/reference, not an implementation backlog.
- Reviewer access != client owner authentication.
- SAMPLE/demo != real lead/job/revenue/review.
- UNKNOWN != zero.
- Public evidence != CRM outcome.
- Catalog may look like a useful mini-site/showroom on Hermes; it does not replace the client's website.
- Do not reopen broad MZM audits after this closeout. Reopen only for a proven regression in one of the three Hermes-owned surfaces or for genuinely new verified evidence.

## Acceptance contract

MZM is complete as a Hermes training/client case only when all three remain true together:

1. News/Insight is public, source-backed and links to MZM.
2. Catalog profile is public, useful and site-like on Hermes, from the canonical Company.
3. CRM is private, tailored to the junk-removal operating workflow, same-Company scoped and truthful about real versus SAMPLE/UNKNOWN data.

PR #1845 removes the out-of-scope client-site bridge introduced by #1844 and locks this three-surface contract in regression tests.
