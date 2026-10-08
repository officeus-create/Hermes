# Runtime Repair Catalog discovery — bounded implementation

Status: REVIEW IMPLEMENTATION; no merge, deploy, production data change, indexing claim or client communication.
Base: main `d82279a8d81f5415137cefef4ac3cc656df52086`.
Target: `https://hermeslogisticsus.com/businesses/connect/repair-shop/kittle-s-garage-a146544/`.

## Collision decision

- #1744: OPEN, non-draft, head `8aad60782d41a637a7f7943361d65a2da66473b1`, mergeable at inspection; locale parity. Its Catalog root delta changes international display aliases.
- #1663: OPEN DRAFT, head `d0ac1018590404b568d34a6e000cff26e6257bde`, not mergeable at inspection; counts/facets and client renderer.
- Neither branch is replayed wholesale. This branch leaves `src/pages/businesses/index.astro`, `public/catalog-connect-live.v2.js` and their existing browser tests untouched. Both PR heads retain the `data-catalog-grid` insertion marker. The new navigation has no `data-catalog-card` and stays outside the grid, search facets and counts; the existing renderer creates one card. No active-file collision with their actual PR deltas was found. Their stale base-to-main differences are not their feature patches.

## Exact ownership

| Surface | File / API | Rule |
| --- | --- | --- |
| Server HTML link | `functions/businesses/index.ts`, GET `/businesses/` | `next()` obtains current static Astro HTML; read-only public-name/location projection from D1; insert visible navigation immediately before the existing card grid. |
| Shared eligibility and URL | `functions/api/_lib/repair-catalog-publication.mjs` | Opt-in = 1, nonempty CRM identity and public name, valid existing slug syntax and length <= 80. Same path for all consumers. |
| Existing profile | `functions/businesses/connect/repair-shop/[slug].ts` | Ineligible / withdrawn is 404 + noindex; eligible remains 200, self-canonical, index,follow and truthful AutoRepair schema. |
| Runtime sitemap owner | `functions/sitemap-connect-catalog.xml.ts`, GET `/sitemap-connect-catalog.xml` | Same eligibility and canonical path; one existing repair-shop owner, no new family. |
| Client card feed | `functions/api/catalog/companies.ts`, GET `/api/catalog/companies` | Same eligibility/path; no opted-out card on subsequent load. |
| Owner withdrawal | Existing `functions/api/repair-shop/catalog.ts` | Existing authenticated, same-origin opt-in API remains unchanged; no consent migration or automatic opt-in. |

The root projection reads only id/name/slug/city/state/region/opt-in. Owner account identifiers, services, appointments, contacts and customer records are not selected or rendered by this layer. Text is escaped, paths deduplicated, and missing/failing D1 leaves the static catalog available without fabricated runtime links. All four consent-sensitive responses use `Cache-Control: no-store`; transformed HTML drops validators/content length. Withdrawal applies on the next successful request, not retroactively to a document already open in a browser. Previously cached production responses may survive their former TTL until the release settles; no account-level cache changes are authorized here.

The root/API are bounded to their existing 100 most recently updated repair records; sitemap supports 5,000. If the runtime population exceeds 100, implement a consent-aware paginated discovery hub before claiming complete internal discovery for every owner. No unbounded link wall or new geographic pages are added here.

## Readiness and truth boundary

This is a shared **mechanical publication readiness** contract. It is not a business verification, proof of individual-field consent, manager QA, a customer relationship, useful-content certification or a Google indexing guarantee. It intentionally preserves existing opted-in owners, including Kittle’s, rather than introducing a new completeness threshold that could silently deindex them. Hours/services still come from the existing scoped CRM sources; no new address, rating, service or review is published.

Before promoting a *new* search owner, the business/Search owner must separately record the existing Search Release Gate: authorized public fields; distinct business identity/canonical owner; factual location and suitable public contact/action; substantive relevant services or operating details; useful content for the intended carrier, repair customer, dealer or shipper; functioning receiver; no duplicate or thin permutation. Missing evidence is UNKNOWN. New-owner editorial approval storage/enforcement and broader vertical readiness remain separate backlog, not claimed complete by this patch. Kittle’s booking/claim/contact CTAs remain unchanged; end-to-end delivery/activation is not established by a 200 response or synthetic QA.

## Acceptance and safe release

1. On preview with isolated synthetic D1, opted-in record produces a visible raw-HTML anchor at `/businesses/`; disabled JavaScript still exposes it.
2. Profile, feed, root links and sitemap agree for eligible, opt-out, missing identity/name and invalid slug states; exact Kittle path remains unchanged.
3. Fresh post-opt-out requests have no anchor, no feed card and no sitemap owner; profile is 404/noindex. No real production record is toggled for QA.
4. JavaScript creates exactly one card. The navigation is not a card, a count, a duplicate profile URL owner or a new indexed page.
5. Canonical/robots/schema, escaping, privacy and existing Catalog publication tests pass; full current-head build/unit/browser CI must pass before owner release.
6. Owner-approved merge/deploy, then exact-SHA raw HTML/profile/sitemap/header readback for Kittle only. Generic preview has no production D1 binding: absence of the link there is expected, not proof of an opt-out.
7. Recheck dated GSC URL Inspection after crawl settlement; Discovered—not indexed does not identify a single cause and sitemap/link changes do not guarantee indexing.

Rollback: revert this bounded PR; do not delete Kittle or opt it out to roll back the discovery layer. Record that the HTML-orphan gap returns. Next implementation/release owner: Project31 / repository owner; #1663 reconciliation remains with its existing owner.

## Release bound after #1757 (2026-10-08)

Owner restricted this release’s new SSR discovery to `/businesses/connect/repair-shop/kittle-s-garage-a146544/`. The hub applies this promotion bound after the shared eligibility helper; opt-out still removes the anchor. Other opted-in runtime owners remain eligible/indexable in their existing profiles, feed and sitemap, without receiving a new SSR link in this release. No consent or business facts are changed.
