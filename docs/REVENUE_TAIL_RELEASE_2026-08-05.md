# Revenue-tail release — 2026-08-05

Status: `REPOSITORY IMPLEMENTATION / PRODUCTION ANALYTICS VERIFICATION REQUIRED`

## Existing specialized SEO intake protected

The following commercial entry variants continue to use the dedicated reviewed supporting SEO intake already present in the repository:

- `service=local_seo`;
- `service=logistics_seo`;
- `service=auto_dealer_seo`.

Those original query values remain authoritative. The specialized intake creates its own controlled form group, applies the approved vertical or search-scope preset, routes the request to ProgressoPro, and records privacy-safe funnel events. No second URL-normalization or competing variant handler is introduced.

Submitted website, company, contact, market, budget, problem, route, carrier, vehicle, or free-text values remain prohibited from analytics.

## Mobile quick-action scope

The fixed mobile action is intentionally limited to nine priority commercial pages:

- Car Hauling Dispatch;
- Dealer Vehicle Transportation;
- Auction Vehicle Pickup;
- SEO Services;
- Local SEO;
- SEO for Logistics Companies;
- SEO for Independent Auto Dealers;
- Website Development;
- Website Redesign.

It is not rendered on the homepage or general non-commercial routes. Logistics pages use the approved U.S. Logistics phone fallback. Marketing and IT pages remain email-only.

## Controlled analytics additions

`commercial_cta_click` may now include these additional controlled values when applicable:

- `request_type`: a controlled request enum already present in the approved vehicle-transport URL;
- page-specific `service_group` values for dealer and auction entry pages.

The existing specialized SEO intake continues to use controlled `service_group` values for `local_seo`, `logistics_seo`, and `auto_dealer_seo` together with its established `seo_intake_start`, `seo_intake_preview_ready`, and `seo_handoff_ready` events.

These values describe the public route and selected commercial path. They must never contain submitted form values or private operating data.

## Production verification still required

Repository and CI evidence do not prove GA4 receipt. In the authenticated production property, use synthetic interactions to verify that:

1. each CTA click appears once;
2. each specialized SEO route keeps its correct controlled `service_group`;
3. dealer and auction clicks remain separate from carrier-dispatch clicks;
4. mobile and hero CTAs do not create duplicate events for one trusted click;
5. no identity, company, MC/USDOT, route, vehicle, VIN, message, budget, rate, or contact value is transmitted.

Synthetic tests must remain excluded from business KPI reporting.
