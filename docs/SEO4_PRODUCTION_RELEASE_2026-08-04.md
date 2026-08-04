# SEO-4 Production Release Reconciliation — 2026-08-04

## Current approved source

Deploy current `main` at or after:

`e9c2cccb17d4d8aa0c4e9ea65fd2ef6786a950ce`

This commit includes the three merged SEO-4 conversion packages:

- direct car-hauling dispatch intake and final Logistics CTA modules;
- homepage role-first routing;
- direct dealer, auction, shipper, broker, business, and private-customer vehicle transport intake.

## Why a production reconciliation is required

A read-only external check after the merges still returned the older homepage:

- no homepage role-first router;
- contact mode still displayed as `Preview`;
- old manual-contact copy remained visible;
- the two new noindex intake URLs were not externally confirmed.

Repository CI is green, but repository merge is not accepted as proof of production deployment.

## Deployment target

Cloudflare Pages project serving:

`https://hermeslogisticsus.com`

Expected project settings:

- production branch: `main`;
- build command: `npm run build`;
- output directory: `dist`;
- Node: 22;
- preserve the currently verified production lead-delivery bindings and secrets;
- do not change Google Workspace MX/DNS;
- do not expose secrets, account IDs, KV IDs, or real submitted lead data.

## Required release sequence

1. Confirm the Cloudflare Pages production project and current production commit.
2. Confirm the production build is using current `main` at or after `e9c2cccb17d4d8aa0c4e9ea65fd2ef6786a950ce`.
3. Trigger or allow the normal Cloudflare Pages production deployment.
4. Record the immutable `*.pages.dev` deployment URL and deployed commit.
5. Verify production HTTP 200 and rendered content for:
   - `/`;
   - `/logistics/car-hauling-dispatch/`;
   - `/logistics/start-car-hauling-dispatch/`;
   - `/logistics/dealer-vehicle-transportation/`;
   - `/logistics/auction-vehicle-pickup/`;
   - `/logistics/request-vehicle-transport/`;
   - `/logistics/shipper-dealer/`;
   - `/logistics/broker/`;
   - `/logistics/carrier/`;
   - `/load-board/`.
6. Confirm the homepage displays the six-card role router before the four ecosystem pillars.
7. Confirm the primary Car Hauling Dispatch CTA opens `/logistics/start-car-hauling-dispatch/`.
8. Confirm dealer and auction CTAs open `/logistics/request-vehicle-transport/` with the correct query preselection.
9. Confirm the two intake routes render `noindex,follow` and are absent from all sitemaps.
10. Confirm Load Board labels use evergreen demo wording rather than stale dates or false recent-posting labels.
11. Confirm production form mode is `live` only where the approved same-origin Logistics receiver is used.
12. Send one approved synthetic carrier lead and one approved synthetic customer-transport lead.
13. Reconcile both messages in the fixed sales inbox.
14. Repeat each idempotency key and confirm no duplicate message.
15. Confirm direct email and phone fallbacks remain visible.
16. Confirm rollback to the previous verified deployment and `LEAD_DELIVERY_MODE=off` remains available.

## Repository validation already complete

Final SEO-4 customer-intake PR head:

`201cc782cd7001a24d7402b587daf3836e3cec64`

GitHub Actions run:

`30894845230`

Results:

- dependency audit: zero vulnerabilities;
- Astro: zero errors and zero warnings;
- 107 generated HTML routes;
- zero broken internal links;
- 96 indexable routes across seven sitemap files;
- 316 browser workflows passed;
- two intentional skips;
- zero browser failures.

## Completion rule

Do not mark the SEO-4 release live based only on a merge or Cloudflare build status. Completion requires the deployed commit, immutable deployment URL, rendered-route verification, and reconciled synthetic carrier and customer-transport deliveries.
