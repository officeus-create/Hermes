# Hermes / ProgressoPro AI Video Factory — 2026-09-06

Status: foundation implementation / fresh-main slice
Owner: CEO / AI Infrastructure
Technical truth: GitHub (`officeus-create/Hermes`)
Business memory / orchestration truth: One Brain / AI MASTER OPERATING BOARD

## CEO decision

Do not install Anime.js, Motion, Kokonut UI, Bklit UI, Manus, Soup, Codex, Remotion, HyperFrames and HeyGen as equal production dependencies.

Use four layers:

1. AI media: HeyGen now; future providers through adapters.
2. Deterministic rendering: HyperFrames primary; Remotion benchmark/fallback.
3. Web control plane: Kokonut UI + Bklit UI + Motion when the Content Factory dashboard is built.
4. Developer/agent tooling: Codex for versioned templates/tests/PRs; Manus experimental pre-production research; Soup strategic local-model reserve; Anime.js optional scene-level animation only.

The canonical internal contract is `VideoJob / SceneSpec`. Provider IDs are metadata, never business truth.

## Why this is one system, not a second content stack

The repository already has `src/lib/content-pipeline.ts`, which classifies owner-approved sources, rights, evidence, privacy, canonical owner, CTA and publication readiness across Hermes Logistics, ProgressoPro Marketing, Hermes Academy and Hermes IT.

Video Factory extends that lifecycle rather than replacing it:

`source -> content review -> approval -> VideoJob -> provider adapters -> render -> QA -> storage -> publish -> measure`

No content job may bypass the existing rights/evidence/privacy truth just because it is a video.

## Business-lane coverage

The `video-factory/src/contracts.mjs` registry deliberately covers eight operating lanes:

- Logistics: carrier education, load-board explainers, evidence-backed market updates, onboarding/agreement explainers.
- ProgressoPro Marketing: Reels/TikTok, client case studies, KPI stories, multilingual variants.
- Academy: micro-lessons, roleplay explainers, course trailers, localized training clips.
- IT / Hermes Connect: product demos, release notes, repair-shop workflows, AI product walkthroughs.
- Sales: personalized audit follow-ups, proposal explainers, objection handling, proof-led outreach.
- HR / Recruiting: role explainers, candidate onboarding, training previews, recruiting-funnel content.
- SEO / GEO: canonical-page explainer videos, local-intent answers, FAQ derivatives, evidence-backed GEO content.
- CEO / Operations: internal briefs, process changes, KPI summaries and team updates.

Public brand ownership remains governed by the existing content-pipeline direction/canonical-owner logic. Internal operating lanes do not create new public entities.

## Neutral VideoJob v1

Required fields include:

- immutable `schemaVersion`, `jobId`, `templateId`, `templateVersion`;
- `businessLane` and `purpose`;
- `brandId`;
- 1080x1920 / 30 fps baseline;
- structured script and scenes;
- media/render provider preference;
- governance: privacy, avatar consent, current-claim evidence, private operational data;
- approval state;
- public-distribution intent.

The contract blocks:

- AI avatar scenes without a consent reference;
- public release of internal/restricted jobs;
- current market/performance claims without evidence;
- public release of private operational data;
- public distribution before approval;
- unversioned templates;
- unsupported providers/scene types;
- scene-duration drift from job duration.

## Provider policy

### HyperFrames — P0 primary renderer

Server-side adapter: `video-factory/src/providers.mjs`.

The implementation submits an already-approved uploaded template asset to `/v3/hyperframes/renders`, sets 9:16 / 1080p / MP4 / configured fps, passes runtime variables, callback tracking and an idempotency key derived from the neutral job.

Production rule: upload template once, render many. Do not generate arbitrary new production HTML for every Reel.

HyperFrames CLI requires Node 22+, while the main Hermes web repository currently permits Node >=20 <25. Therefore HyperFrames authoring/render-worker CI is isolated from the website runtime and must not force a risky Node-runtime change across the public site.

### HeyGen — P0 AI media

Server-side adapter: `video-factory/src/providers.mjs`.

The implementation creates a 9:16 1080p avatar asset through `/v3/videos`, requests SRT captions, carries a callback ID and uses the same deterministic job identity. API keys remain runtime-only.

HeyGen is a replaceable `MediaProvider`, not the system of record. Generated media and subtitles must be copied into Hermes-controlled object storage before vendor URLs expire.

### Remotion — P1 benchmark/fallback

The initial code exports a provider-neutral Remotion request shape with the same `VideoJob` data. Do not add Remotion to the main website dependency tree during this foundation slice.

Before production procurement, respect the current company/automation license model and benchmark it against HyperFrames on:

- quality;
- manual edit minutes;
- cost per approved video;
- throughput;
- operational complexity.

### Codex — P1 template engineer

Codex creates/repairs versioned templates, tests and CI in bounded branches. It does not invent new production code for every individual Reel and must not receive production provider secrets.

Target registry:

`video-factory/templates/<engine>/<template>/<version>`

Each template must have:

- a source-controlled design identity;
- a stable input contract;
- deterministic timing;
- lint/inspect/visual evidence;
- immutable production version;
- rollback path.

### Kokonut UI + Bklit UI + Motion — P1 control plane

Use for the internal Content Factory dashboard, not the render farm itself.

Planned surfaces:

- create VideoJob;
- source/evidence review;
- brand/template selector;
- batch status;
- render preview;
- KPI/data scenes;
- approval/reject;
- publish handoff;
- cost/time/automation metrics.

Do not add these libraries to the existing Astro marketing site merely because they are useful for the future dashboard. Build the dashboard as a bounded React/Next-style control plane or an intentionally isolated application slice.

### Anime.js — P2

Optional for special SVG/DOM animation inside a HyperFrames scene. Not a renderer and not a default dependency.

### Manus — P2

Use experimentally for research, hook/script ideation, source collection and first-draft scene planning. It must not own production orchestration, credentials, customer PII, finance exports or final publication state.

### Soup — P3 reserve

Return when content volume/cost/privacy justify a local specialized model for hook classification, script scoring, captions, brand compliance or content QA. It is not needed in the initial critical path.

## Brand system

`video-factory/brands/hermes/DESIGN.md` is bound to the canonical `docs/design/HERMES_UNIFIED_BRAND_SYSTEM.md`.

Core rule: Pearl Outside / Obsidian Inside / Violet Intelligence.

Video templates must not create a new Hermes visual language. Fake live signals, fake metrics and unlabeled demo values remain prohibited.

## Security and governance

Mandatory controls:

- provider keys only in backend/runtime secret storage;
- never in browser/mobile bundles or Git/Drive documents;
- separate dev/staging/prod credentials;
- idempotency for external mutations;
- avatar/voice consent record before generation;
- public/private/restricted classification;
- evidence reference for current market, rate, availability or performance claims;
- immutable template version per render;
- store source/generated/final assets in Hermes-controlled storage;
- record provider job IDs, retries, cost and failures;
- registered/signed webhook endpoints preferred for production callbacks;
- queue + timeout + retry + dead-letter handling before scale;
- no auto-publishing until explicit publication approval policy exists for that lane.

## Storage truth

Persist:

- `job_id`
- `brand_id`
- `business_lane`
- `purpose`
- `template_id`
- `template_version`
- `provider`
- `provider_job_id`
- `input_hash`
- `started_at`
- `completed_at`
- `render_duration`
- `output_duration`
- `provider_cost`
- `compute_cost`
- `retry_count`
- `status`
- `failure_code`
- `source_asset_keys`
- `subtitle_key`
- `output_object_key`
- `approval_state`
- `evidence_ref`
- `consent_ref`

Do not store “our video = vendor project ID” as the only durable representation.

## CI and runtime isolation

`.github/workflows/video-factory-contract.yml` runs the neutral contract on Node 22 without changing the public site runtime.

The foundation test locks:

- all eight business lanes have use-case mappings;
- avatar -> HeyGen media routing;
- default -> HyperFrames rendering;
- stable idempotency keys;
- 9:16/1080p HeyGen payload;
- 9:16 HyperFrames payload;
- Remotion fallback request shape;
- avatar consent gate;
- privacy gate;
- evidence gate;
- approval gate.

## Rollout order

### Slice A — foundation (this PR)

- neutral contracts;
- all-lane routing;
- HeyGen adapter;
- HyperFrames adapter;
- Remotion fallback contract;
- brand DESIGN binding;
- isolated CI;
- One Brain handoff.

### Slice B — first deterministic template

Build one Hermes 9:16 HyperFrames composition from the canonical DESIGN file. Required before render:

- layout-first implementation;
- no generic colors/fonts;
- deterministic timeline;
- no random/time-based logic;
- `hyperframes lint`;
- `hyperframes inspect`;
- contrast validation;
- preview evidence;
- owner/design acceptance before final render.

### Slice C — storage + queue + webhooks

Add:

- Hermes-controlled object storage;
- queued jobs;
- provider status state machine;
- signed webhook intake where supported;
- immediate vendor-result download;
- retry/dead-letter behavior;
- cost and duration telemetry.

### Slice D — real 30–50 video pilot

Run three cost classes separately:

- C1 programmatic-only;
- C2 + TTS;
- C3 + AI avatar / translation.

Decision metrics:

- automated completion >=98%;
- videos without manual timeline edit >=90%;
- human QA/edit <5 min per video;
- technical 9:16 compliance 100%;
- brand compliance >=95%;
- duplicate jobs from retries = 0;
- batch >=30;
- every production job auditable.

### Slice E — dashboard

Only after the pipeline is real, build the control plane with Kokonut/Bklit/Motion. UI must expose factual state from the job model rather than decorative fake progress.

## What is intentionally not done in the foundation slice

- No root-site dependency explosion.
- No Remotion commercial dependency before benchmark/procurement decision.
- No Manus/Soup critical-path dependency.
- No public Content Factory page.
- No automatic publishing.
- No invented HeyGen avatar/voice IDs.
- No creation or cloning of a person/avatar without explicit source and consent workflow.
- No claim that provider credentials, storage, queue or production webhooks exist until their runtime evidence is verified.

## Definition of done for the foundation

Foundation is complete only when:

1. branch is based on current main;
2. isolated contract CI is green;
3. normal repository checks remain green or failures are proven unrelated/pre-existing;
4. PR review shows no secrets and no public-runtime regression;
5. One Brain receives the exact handoff and follow-up order;
6. next slice starts from this contract instead of a parallel implementation.
