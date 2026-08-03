# SEO Content Distribution Pipeline

Reviewed: 2026-08-03
Status: planning contract; no external accounts, APIs, credentials, publishing, registrations or messages are authorized by this document.

## Goal

Every approved SEO, product, logistics, marketing, Academy or website-development task should produce reusable content outputs instead of ending only as code or an internal document.

The operating loop is:

`approved source → privacy and rights review → topic classification → SEO owner check → content drafts → approval queue → platform-specific distribution → measurement → reuse`

The primary business objective remains qualified inquiries and revenue. Social reach, page views and publication volume are supporting metrics, not the final KPI.

## Trigger rule for every SEO task

When an agent starts work on a topic, page, market, service, feature or research area, it must also evaluate whether the task can safely produce:

1. an update to an existing canonical page;
2. an article, guide, FAQ, glossary item or analytical note;
3. platform-specific social drafts;
4. Academy learning material;
5. a sales enablement asset;
6. a future research brief.

Do not create all outputs automatically. Record only the outputs that have a distinct audience, useful intent and approved evidence.

## Source access gate

Before requesting access to a group, Drive folder, document collection, exported chat, video archive or other source, record:

- source owner;
- business purpose;
- exact folders/channels/files required;
- minimum permission needed, preferably read-only;
- whether the source contains PII, customer data, contracts, rates, credentials or private operations;
- permitted outputs and prohibited outputs;
- retention and deletion requirement;
- approval status and review date.

Never request broad account-wide access when one folder, export or read-only source is sufficient. Never register accounts, create mailboxes, enable APIs or store credentials without separate owner approval.

## Allowed source classes

Preferred sources:

- current public website pages;
- approved public research and official sources;
- repository documentation and public-safe SOPs;
- owner-approved Google Drive folders;
- exported project chats supplied for this purpose;
- approved videos, transcripts and training materials;
- approved customer questions and anonymized FAQ patterns;
- published cases with documented permission.

Blocked by default:

- CRM records;
- Shipment History and load-board observations;
- names, emails, phones, MC/USDOT, exact addresses and live positions;
- contracts, invoices, BOL/POD, rates, commissions and payment data;
- private employee evaluations or personal conversations;
- credentials, API keys and security data;
- unsupported business results, rankings, capacity or availability claims.

## Content object contract

Every source-derived content object must include:

- `source_id` and source link/location;
- source date and freshness date;
- brand: Hermes Logistics, ProgressoPRO or Academy;
- topic and commercial owner page;
- audience and funnel stage;
- language;
- privacy classification;
- evidence status;
- allowed channels;
- prohibited claims;
- reviewer and approval state;
- duplicate fingerprint;
- target URL and UTM campaign when distribution is approved.

Suggested states:

`raw → classified → needs_evidence → reviewed → approved → generated → scheduled → published → measured → refreshed_or_retired`

## SEO integration

For every SEO implementation package:

1. preserve canonical query ownership;
2. decide whether new content strengthens an existing owner or requires a distinct page;
3. avoid thin variants, doorway pages, keyword stuffing and bulk location replacement;
4. generate a content-distribution brief alongside the SEO brief;
5. link social and educational outputs back to the most relevant canonical page, not automatically to the homepage;
6. use UTM parameters and duplicate-link protection;
7. measure CTA, intake, preview, handoff and qualified inquiry events in addition to clicks.

## Platform outputs

Generate distinct drafts rather than identical cross-posts:

- Facebook: context, practical value, discussion prompt and canonical link;
- Threads: hook, strong observation, short explanation and question;
- Instagram: carousel/reel/story concept, caption and approved link path;
- LinkedIn: professional insight, evidence, operational implication and CTA;
- X: concise claim-safe insight and link;
- YouTube: short/video outline, description and source link;
- Academy groups: lesson, checklist, quiz, assignment or discussion prompt.

All drafts remain in an approval queue until the platform, account, permissions, content policy and responsible owner are confirmed.

## News and analytics rule

A development task may become a news or analytical item when it answers at least one of these questions:

- What problem was identified?
- What changed and why?
- What does the change mean for carriers, dealers, customers, marketers or learners?
- What evidence or official source supports it?
- What action can the reader take next?

Do not publish internal implementation details, security boundaries or unfinished experiments merely because work occurred.

## Academy reuse

Approved operational knowledge should be evaluated for:

- lesson updates;
- new quizzes;
- practical assignments;
- objection-handling examples;
- common-error reviews;
- checklists and SOP summaries.

Academy content must retain provenance and version history so that outdated procedures can be refreshed or retired.

## MVP sequence

### Phase 1 — planning and approval

- source registry;
- access-request template;
- content object schema;
- privacy and evidence gate;
- channel registry;
- UTM taxonomy;
- manual approval queue.

### Phase 2 — public-site distribution

- detect approved new or materially updated public URLs;
- generate platform-specific drafts;
- prevent duplicate publication;
- log publication status and failures;
- measure clicks and qualified funnel events.

### Phase 3 — knowledge and Academy

- ingest only owner-approved folders and exports;
- generate draft lessons, tests and FAQ updates;
- require human approval before release to learning groups.

### Phase 4 — optional official API publishing

Only after separate approval for each account and platform:

- official API documentation and permissions review;
- least-privilege tokens stored outside GitHub;
- sandbox/test publication;
- rate-limit and retry handling;
- deletion and revocation process;
- audit log;
- emergency disable switch.

## KPI

Track:

- approved source-to-content conversion rate;
- unique drafts and duplicate rejection rate;
- published content by channel;
- social sessions and engaged sessions;
- canonical-page clicks;
- CTA, intake, preview and handoff events;
- qualified inquiries, proposals, contracts and revenue;
- Academy material updates and learner completion;
- stale content identified and retired;
- privacy, rights or unsupported-claim incidents, target zero.

## Explicit non-goals for the first release

- no automatic reading of all personal chats;
- no mass registration on directories or social networks;
- no creation of email accounts;
- no automatic posting with live credentials;
- no scraping of private groups or protected platforms;
- no programmatic ads on commercial pages;
- no use of private operational data as public SEO evidence;
- no merge, deployment or external-account changes without owner approval.

## Required deliverable for future SEO briefs

Every future SEO brief should end with a `Content Distribution` section containing:

- approved source set;
- access still required;
- canonical target page;
- proposed site content;
- proposed social drafts by platform;
- proposed Academy outputs;
- evidence and privacy blockers;
- approval owner;
- measurement plan;
- next review date.
