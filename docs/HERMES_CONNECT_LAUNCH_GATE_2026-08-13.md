# Hermes Connect Launch Gate — 2026-08-13

Status: OWNER REQUESTED LAUNCH / CANONICAL CI REQUIRED

## Release scope

Ship the Hermes Connect Web product experience now across the public Hermes Connect service page, interactive desktop workspace, and responsive/mobile Web surfaces. Iterate through user testing after release.

## Truth boundary

The interactive product may use synthetic/demo business data, simulated actions, and local prototype adapters. Those surfaces must remain identifiable as Demo, Simulated, Visual prototype, or Connector not configured where external execution is implied.

This release does not by itself prove that Cal.com, FMCSA, Stripe, WhatsApp, Fleetbase, voice AI, shipping providers, SMS, email, or other external systems are connected or that an external action was actually sent/completed.

## Launch gate

1. Canonical Hermes GitHub Actions must pass on this PR head.
2. No credentials or private operational data may enter the release.
3. Existing SEO/privacy/accessibility/commercial-path tests remain authoritative.
4. Responsive/mobile Web ships with the same product truth boundary.
5. Native iOS/Android remains a later delivery phase; do not represent Mobile Web as an App Store/Google Play release.

After launch, product testing and connector implementation continue incrementally without blocking the visual/product release.