# Hermes client ingestion pipeline

## Goal
A client in an existing vertical must not require a bespoke page, bespoke CRM, or bespoke release architecture.

Canonical flow:

`SOURCE INTAKE → HERMES COMPANY PROFILE → ENRICHMENT → CATALOG PUBLIC PROJECTION → CRM WORKSPACE → SEO/GEO → INSIGHTS REUSE → ATTRIBUTION → OUTCOME`

Catalog is the public discovery owner. Hermes Connect is the operating/company identity owner. Insights/News reuses generalized lessons only.

## Hard rule
**Existing vertical = data operation, not product development.**

Open product code only when:
1. the client introduces a genuinely new vertical;
2. the shared schema cannot represent an evidence-safe fact;
3. a reusable capability is missing for every client in that class.

Do not create a client-specific implementation branch for routine onboarding.

## One client record
Every client starts with one normalized intake record:
- legal/display business name;
- vertical/category;
- address/service area;
- website;
- public channels;
- owner-supplied facts;
- public-source facts with source + observed_at;
- facts requiring owner confirmation;
- business goal;
- access status;
- Catalog publication status;
- CRM workspace status;
- SEO/GEO status;
- digital-audit state;
- attribution fields.

Do not retype the same business data independently into Catalog, CRM, News and audit pages.

## Evidence states
Every enriched field is one of:
- VERIFIED_PUBLIC;
- OWNER_SUPPLIED;
- OWNER_CONFIRMED;
- INTERNAL_ANALYTICS_REQUIRED;
- OWNER_CONFIRMATION_REQUIRED;
- UNKNOWN.

UNKNOWN is not zero and must not be converted into a negative finding.

## Standard client pipeline

### 1. Intake
Accept a website, Google Business/Maps link, email thread, CRM submission, manager note, or owner-supplied source.

### 2. Normalize
Match or create one company identity. Deduplicate by normalized name/domain/phone/address before creating another company.

### 3. Enrich
Collect reusable facts from approved public/connected sources. Record provenance and observed_at.

### 4. Public projection
Publish only evidence-safe fields to the canonical Catalog page. The Catalog page owns SEO/GEO/entity discovery.

### 5. Digital health
Render the same reusable channel matrix:
Website · Google · Instagram · Facebook · Threads · TikTok · YouTube · Telegram.
No per-channel doorway pages.

### 6. Strategy
Attach a reusable client-strategy record only when relevant. It may contain audit, readiness sequence, channel roles, scope, CRM attribution, and evidence boundaries. It renders inside the canonical business page.

### 7. CRM
Choose the existing vertical workspace and configure modules/fields. Do not fork Hermes Connect per client.

### 8. SEO/GEO
Generate structured data, sitemap ownership, local/entity semantics, internal links, and evidence-safe FAQs from the normalized company record.

### 9. Insights reuse
Create an Insight only when the lesson has independent evergreen search value. Never create News × client × platform doorway content.

### 10. Attribution
Preserve source/channel/content/campaign/CTA into CRM and downstream consultation/sale/outcome. One human/company identity persists across channels.

## Social readiness
Canonical marketing sequence:
`Audit → Organic Programming → Stable Organic Baseline → Controlled Paid Learning → Signal Gate → Offer → Funnel → CRM → Sale → Outcome`

Do not recommend paid scaling or claim an offer winner from public social snapshots alone.

## Connector roles
- Google Drive / One Brain: client briefs, supplied files, canonical working context.
- Gmail: recover owner/client decisions and supplied business facts.
- GitHub: shared product code and release evidence only.
- Cloudflare: deployment/readback, not client data storage.
- Windsor.ai: connected Meta/Instagram/Threads/Facebook, Google Business Profile, GA4, GSC, YouTube and paid/organic data when the client grants access.
- Semrush: external SEO/keyword/competitor evidence where appropriate.
- Metricool: optional social scheduling/analytics operational layer when a client authorizes its social accounts.

## KPI
For an existing supported vertical:
- zero bespoke pages;
- zero duplicate company identities;
- zero client-specific CRM forks;
- one canonical public profile;
- one normalized company record;
- one evidence ledger;
- one release lane only when shared code actually changes.

A routine new client should be publishable by data/configuration after evidence review; engineering is an exception.
