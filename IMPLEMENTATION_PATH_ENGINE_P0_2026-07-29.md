# Hermes Website — Path Engine P0 Implementation

## Implemented

- Cloudflare email-obfuscation exclusion around the shared page body.
- Regression check that fails if `/cdn-cgi/l/email-protection` appears.
- Recursive static crawl that validates every generated internal `<a>` target.
- Config-driven Logistics Path Engine with Back, Restart, progress, multiple equipment selection, non-sensitive session recovery, stable result URLs, and analytics events without PII.
- Logistics roles: carrier, owner-operator, fleet owner, shipper, dealer, private customer, broker, driver, agency partner, and unsure.
- Equipment: car hauling, hotshot, box truck, cargo van, power only, dry van, reefer, flatbed, step deck, and other.
- 23 new Logistics routes: one flow entry and 22 substantive recommendation pages.
- Carrier two-department positioning, approximately 90-day direct-freight development language, qualification-based Trusted Carrier Network, and safe-claim boundaries.
- Anonymized 1961 Maserati inbound-request example without claiming completion.
- Canonical Service/WebPage structured data and sitemap entries.
- Canonical CRM lead draft with routing queues and PII-free analytics dimensions.
- FMCSA provider boundary with official API → official dataset → fallback priority and graceful manual-review status.
- Manual/mock load-offer normalization, duplicate grouping without source deletion, total-mile economics, stale/expired suppression, and verified/public lane publication rule.

## Current boundaries

- No external load board is claimed as connected.
- The first provider remains a manual/approved CSV adapter until Hermes confirms licensed API, TMS, webhook, export, or email-ingestion access.
- No automated booking, negotiation, external message, or load-board UI automation is enabled.
- The existing Cloudflare lead receiver remains disabled until its approved KV and Email Sending bindings are configured.
- FMCSA enrichment adapters contain no credentials and make no external call until an approved provider is configured.

## Validation

- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Static build: 44 public Astro routes.
- Full generated HTML inventory: 47 pages including product demos.
- Broken internal links: 0.
- Path resolution, sitemap, CRM payload, FMCSA priority, offer normalization, duplicate grouping, rate math, stale data, publication rules, contact handoff, load board, and sales receiver tests pass.

## Production blocker

The source is ready, but this session is not authenticated to the production Cloudflare account and the connected GitHub app currently exposes no repositories. Publishing to `hermeslogisticsus.com` requires one of:

1. approved access through the Cloudflare dashboard; or
2. the production repository connected to GitHub; or
3. an authenticated Wrangler environment on the production computer.

Do not create a second website or replace the existing domain architecture to work around this access boundary.
