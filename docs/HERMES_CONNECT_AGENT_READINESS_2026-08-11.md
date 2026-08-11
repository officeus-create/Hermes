# Hermes Connect Agent Readiness — 2026-08-11

Status: authenticated Cloudflare Agent Readiness evidence captured for both the preserved legacy prototype (`app.hermeslogisticsus.com`) and the approved current Hermes Connect Web App (`connect.hermeslogisticsus.com`). The current Connect host has now been re-scanned after the bounded Markdown-negotiation release and Cloudflare recognizes that implementation. This document exists to prevent score-chasing, fake protocol placeholders, model conflation, or duplicate work across concurrent SEO/Claude/Codex sessions.

## 1. Hostname boundary

Repository deployment ownership currently defines:

- `connect.hermeslogisticsus.com` — approved current Hermes Connect Web App, served by the main `hermes` Cloudflare Pages project and routed by `functions/_middleware.js` to `public/demos/hermes-connect/`;
- `app.hermeslogisticsus.com` — preserved legacy booking/profile prototype on the separate `hermes-connect-prototype` Pages project.

The owner first supplied a full authenticated scan of `app.` and then supplied authenticated scans of the correct current hostname `connect.hermeslogisticsus.com` before and after the Markdown-negotiation release.

The `connect.` scan is the authoritative Agent Readiness baseline for current Hermes Connect work.

## 2. Current authoritative Cloudflare diagnostics — `connect.hermeslogisticsus.com`

### Level 1 — Quick Wins: 4/5

PASS:

- `robots.txt` — valid format detected;
- AI Crawler Rules — AI crawler rules detected;
- Content Signals — signals detected in `robots.txt`;
- Markdown Negotiation — Cloudflare now recognizes the custom `Accept: text/markdown` implementation merged in PR #396.

FAIL:

- Sitemap — `sitemap.xml not found`.

Important result: Cloudflare accepted the repository-side Markdown implementation without requiring the managed Pro-only switch. The implementation preserves the existing noindex boundary and returns a reviewed machine-readable representation rather than scraping the browser HTML.

### Level 2 — Technical Groundwork: 0/3

- API Catalog — `API Catalog not found`;
- Link Headers — `No Link headers found on homepage`;
- `auth.md` — `auth.md not found`.

Important interpretation:

- Hermes already has real server endpoints in the repository, including `/api/connect-lead`, but those endpoints are not yet a public agent API contract. An API Catalog should describe only reviewed, stable machine-facing capabilities; it should not expose private operational or form-delivery endpoints merely to increase the score.
- `auth.md` should describe a real registration/sign-in contract and should not be fabricated before such a flow exists;
- Link Headers should point to real structured/API resources, not placeholders created only for the score.

### Level 3 — Advanced Integration: 0/8

- OAuth Discovery — no OAuth/OIDC discovery metadata found;
- OAuth Protected Resource — no protected-resource metadata found;
- A2A Agent Card — `A2A Agent Card not found`;
- Agent Skills Index — `Agent Skills Index not found`;
- MCP Server Card — `MCP Server Card not found`;
- Web Bot Auth — no usable verified outbound-agent discovery contract;
- WebMCP — `No WebMCP tools detected on page load`;
- DNS-AID — `DNS for AI Discovery (DNS-AID) well-known entrypoint records not found`.

These are not eight bugs. Most are capability-discovery checks that should pass only after Hermes Connect genuinely offers the corresponding capability.

### Commerce: 0/5 — Optional

- ACP — discovery document not found; scanner identifies the target as not a commerce site;
- AP2 — not detected / no A2A Agent Card; scanner identifies the target as not a commerce site;
- MPP — payment discovery not detected; scanner identifies the target as not a commerce site;
- UCP — profile not found; scanner identifies the target as not a commerce site;
- x402 — payment protocol not detected; scanner identifies the target as not a commerce site.

Commerce is not an implementation target merely to increase Agent Readiness score.

## 3. Historical comparison

### Legacy `app.` scan

- Quick Wins: 3/5;
- Technical Groundwork: 0/3;
- Advanced Integration: 0/8;
- Commerce: 0/5 optional.

### Current `connect.` before PR #396

- Quick Wins: 3/5;
- Technical Groundwork: 0/3;
- Advanced Integration: 0/8;
- Commerce: 0/5 optional.

### Current `connect.` after PR #396

- Quick Wins: **4/5**;
- Technical Groundwork: 0/3;
- Advanced Integration: 0/8;
- Commerce: 0/5 optional.

This is direct evidence that the custom Markdown-negotiation release changed the machine-readiness result without changing the browser product boundary.

## 4. Current `connect.` product boundary from repository

The approved Hermes Connect Web App is currently a controlled single-page access-request experience under `public/demos/hermes-connect/`.

Its reviewed public machine-readable representation says Hermes Connect is a web-first product for service businesses to present services, request windows, and a clear client request path. It explicitly says the public Web App does not automatically create an account, booking, payment, calendar event, subscription, or guaranteed service outcome, and that private carrier/shipment/account data are not part of the public representation.

The canonical product page describes Hermes Connect as a category-aware Web App for service businesses. Logistics and field services are one supported category, but the current product page does not promise carrier dispatch access, a dedicated dispatch manager, or 24/7 real-time carrier support through Hermes Connect.

The current Web App page also preserves:

- `meta robots="noindex,nofollow"`;
- canonical URL `https://hermeslogisticsus.com/demos/hermes-connect/`;
- current boundary that the page accepts Web App access requests only and does not automatically create an account, booking, payment, calendar event, or subscription.

This means publishing a `connect.hermeslogisticsus.com/sitemap.xml` that advertises the Connect root as an indexable canonical page would conflict with the present noindex/canonical contract. Do not add such a sitemap only to make Cloudflare show 5/5.

A sitemap becomes appropriate only after an explicit product/indexability decision defines which Connect URLs are intended to be public canonical discovery surfaces.

## 5. AI Playground finding — cross-model product conflation

After the 4/5 rescan, the authenticated Cloudflare AI Playground was used to compare multiple models on a product-boundary question equivalent to:

> Can carriers get real-time support through Hermes Logistics's team while using the Hermes Connect platform?

Observed behavior was materially inconsistent across models:

- some answers stayed close to the current Connect boundary and did not claim that Hermes Connect itself provides carrier real-time support;
- at least one answer asserted that carriers using Hermes Connect receive 24/7 real-time support from a dedicated dispatch manager.

The latter claim is **not supported by the current canonical Hermes Connect product page or its reviewed Markdown representation**. This is a useful AEO finding: external models can conflate general Hermes logistics/dispatch content with the separate Hermes Connect product when the prompt combines `carriers`, `Hermes Logistics`, and `Hermes Connect`.

### AEO implication

Do not solve this by inserting unsupported support promises into Connect. Instead, future public product clarification should separate three concepts explicitly:

1. what Hermes Connect currently does;
2. what Hermes Logistics carrier/dispatch services do separately;
3. whether any future integration between those products is actually live.

A safe future FAQ/structured-answer candidate is a direct boundary question such as "Does Hermes Connect include Hermes Logistics carrier dispatch support?" with a factual answer tied to the approved current product state. This should be coordinated with active SEO/AEO work before changing production copy.

## 6. Implementation decisions after the post-#396 rescan

### Completed safely

- preserve current `robots.txt`, AI Crawler Rules and Content Signals behavior;
- keep the correct-host baseline fixed at `connect.`;
- implement bounded Markdown content negotiation without changing browser HTML or the noindex boundary;
- verify Cloudflare recognizes that implementation: **PASS, Quick Wins now 4/5**.

### Safe next research

- inventory which existing `/api/*` routes are strictly internal/form-delivery versus candidates for a future public machine API;
- design an API Catalog schema only around real, reviewed, non-sensitive capabilities;
- define Link Headers only after a real discovery resource exists;
- keep root-site SEO/Agentic Browsing work separate from Hermes Connect product-agent work;
- use AI Playground as a repeatable AEO regression test for product-boundary questions.

### Do not create placeholders for score

Do not create:

- API Catalog that exposes private form delivery or unstable endpoints;
- Link Headers pointing to nonexistent catalogs or tools;
- `auth.md` without a real supported registration/login flow for agents;
- OAuth metadata without a working authorization server and protected-resource contract;
- A2A card before Hermes Connect actually exposes an agent endpoint;
- Skills Index before there are real, versioned agent skills;
- MCP Server Card before a live MCP server exists;
- WebMCP declarations before reviewed browser actions exist;
- DNS-AID before Hermes operates outbound/discoverable AI agents;
- ACP/AP2/MPP/UCP/x402 before an approved agent-commerce use case and payment backend exist.

## 7. Recommended execution order

### Phase A — Quick Win complete

1. Markdown-negotiation implementation merged in PR #396.
2. Normal browser HTML unchanged.
3. `noindex,nofollow` unchanged.
4. Correct-host re-scan completed.
5. Cloudflare recognition confirmed: **4/5**.

### Phase B — public discovery decision

Before adding a Connect sitemap or changing canonical/indexability, make one explicit product decision:

- remain a noindex controlled-access Web App; or
- make a defined subset of Connect public/indexable.

If the app remains noindex, a sitemap score is not worth contradicting the product boundary.

### Phase C — real machine capabilities

When Hermes Connect gains stable machine capabilities, use this sequence:

1. inventory and classify existing APIs;
2. approve a stable public tool/API contract;
3. publish API Catalog and truthful discovery Link headers for those real resources;
4. add authentication/authorization metadata if required;
5. add MCP or WebMCP only when corresponding tools exist;
6. add A2A/Skills/DNS-AID only when Hermes operates an actual discoverable agent;
7. add commerce protocols only when a real approved agent-payment flow exists.

## 8. Relationship to concurrent work

This Agent Readiness track must not overlap or override:

- SEO 10 / SEO 11 root-site measurement, performance or conversion work;
- root-site Agentic Browsing task #354;
- Bing/GSC/GA4 work;
- factoring calculator work;
- Casablanca Academy work;
- IndexNow/Crawler Hints work.

Tracking issue: #393.
