# SEO 72-hour traffic batch release notes — 2026-08-02

This file intentionally separates release notes from implementation code so the pull request can be reviewed without relying on conversation history.

## Visitor-facing changes

- A new homepage section links directly to the Appleton vehicle transport guide and two practical logistics checklists.
- The Logistics hub now links to five Wisconsin service-intent pages and twelve Wisconsin city guides.
- The existing Logistics resources fragment now resolves to a real section target.

## Search discovery changes

- Priority pages are reachable through normal HTML links from the homepage or Logistics hub.
- The existing sitemap union remains the source of declared canonical URLs.
- An IndexNow key file and manual submission workflow are included for post-deployment use.

## Operational boundary

The IndexNow workflow must not be run from a branch preview. It is intended only after an owner-approved merge and confirmed production deployment.

Google Search Console requests remain manual because access, quota, and URL Inspection ownership are account-controlled.
