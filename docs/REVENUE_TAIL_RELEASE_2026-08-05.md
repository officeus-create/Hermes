# Revenue-tail release — 2026-08-05

Status: `REPOSITORY IMPLEMENTATION / PRODUCTION ANALYTICS VERIFICATION REQUIRED`

## Revenue paths repaired

The following commercial entry variants now resolve into an existing reviewed intake instead of remaining unsupported query states:

- `service=local_seo`;
- `service=logistics_seo`;
- `service=auto_dealer_seo`.

The browser normalizes those routes to the established `service=seo` intake while retaining a controlled `seo_variant` value. The form receives only controlled prefill context. Submitted website, company, contact, market, budget, problem, route, carrier, vehicle, or free-text values remain prohibited from analytics.

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

- `seo_service_variant`: `local_seo`, `logistics_seo`, or `auto_dealer_seo`;
- `request_type`: a controlled request enum already present in the approved vehicle-transport URL;
- page-specific `service_group` values for dealer and auction entry pages.

These values describe the public route and selected commercial path. They must never contain submitted form values or private operating data.

## Production verification still required

Repository and CI evidence do not prove GA4 receipt. In the authenticated production property, use synthetic interactions to verify that:

1. each CTA click appears once;
2. the specialized SEO variant is preserved without private parameters;
3. dealer and auction clicks remain separate from carrier-dispatch clicks;
4. mobile and hero CTAs do not create duplicate events for one trusted click;
5. no identity, company, MC/USDOT, route, vehicle, VIN, message, budget, rate, or contact value is transmitted.

Synthetic tests must remain excluded from business KPI reporting.
