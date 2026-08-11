# Compliance PR Summary

This repository contains a reusable U.S. and international privacy/compliance baseline for the Hermes website, focused on public disclosures, privacy request routing, company identity boundaries, commercial-term boundaries, tracking choices, asset governance, and release gates for new data flows. It is intentionally framed as a conservative engineering baseline rather than a universal legal-compliance claim.

## Business lead data-flow update — 2026-08-11

The paid-search business lead workflow now has an explicit public disclosure in the Privacy Policy. The notice identifies the direct contact and qualification fields used by the form, including WhatsApp or Telegram, company/project, city/country, website/social profile, preferred language/contact time, selected services, and the desired result.

The notice also distinguishes consent-gated GA4 from attribution values attached to a deliberately submitted lead. When present in the landing URL, UTM parameters and Google click identifiers such as GCLID, GBRAID, and WBRAID may be included with the submitted inquiry so Hermes can understand lead source and campaign performance. Their inclusion in the lead record does not itself enable analytics cookies, remarketing, advertising storage, or ad personalization.

Regression coverage in `scripts/compliance-layer.test.mjs` locks these disclosures to the generated privacy page so later form or tracking changes cannot silently remove them.
