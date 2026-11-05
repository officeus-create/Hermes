// Historical owner backlog import for the canonical Command Center D1 queue.
// This is NOT a second task registry. It idempotently seeds recovered work into
// hermes_owner_work_items, where owner edits, AI dispatch, acceptance and receipts live.
//
// Source precedence remains AGENTS.md. Historical chat/Drive items are planning evidence;
// old tasks that require freshness checks are explicitly blocked until revalidated.

export const COMMAND_CENTER_HISTORY_BACKLOG = Object.freeze([
  {
    id:"hcwi_hist_20261105_001", project_id:"hermes-command-center", workstream:"technology", priority:"p0",
    title:"Unify the last three months of owner tasks in Command Center",
    details:"Recover and deduplicate work from ChatGPT history, GitHub, One Brain/Drive, Automations and local Windows/Mac handoffs. Keep one surviving work item per real outcome and preserve provenance.",
    status:"in_progress", created_at:"2026-11-05T10:30:00.000Z",
    source_kind:"chat_history", source_label:"Owner directive · 2026-11-05", source_ref:"Chat history · Aug 5–Nov 5 2026",
    next_action:"Keep harvesting canonical sources and reconcile imported rows against fresh GitHub/Drive/runtime evidence."
  },
  {
    id:"hcwi_hist_20261105_002", project_id:"hermes-command-center", workstream:"technology", priority:"p0",
    title:"Release Command Center closure PR #2236",
    details:"Close remaining owner workspace and report gaps on the canonical Command Center branch. Current source evidence had exact-head CI green but no independent submitted approval.",
    status:"blocked", created_at:"2026-11-01T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2236", source_ref:"https://github.com/officeus-create/Hermes/pull/2236",
    blocked_reason:"Independent current-head APPROVED review is required before protected merge/deploy.",
    next_action:"Obtain independent approval, re-read exact-head CI/mergeability, then owner-authorized protected merge/deploy and production readback."
  },
  {
    id:"hcwi_hist_20261105_003", project_id:"hae-runtime", workstream:"technology", priority:"p0",
    title:"Release HAE auditor/runtime registry contracts PR #2270",
    details:"Bind ecosystem auditors into HAE runtime contracts while preserving the fresh private-plugin registry and default-deny capability policy.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2270", source_ref:"https://github.com/officeus-create/Hermes/pull/2270",
    blocked_reason:"Independent current-head APPROVED review is missing.",
    next_action:"Keep provider/runtime registry fresh, obtain independent approval, then protected merge and merge-SHA acceptance."
  },
  {
    id:"hcwi_hist_20261105_004", project_id:"plugin-workforce", workstream:"operations", priority:"p0",
    title:"Complete selected plugin → HAE → D1 receipt bridge",
    details:"Prove selected specialist plugin routing through the canonical HAE runtime to a durable D1 receipt and Command Center readback. PLUGIN_REGISTERED must not be treated as LIVE_VERIFIED.",
    status:"blocked", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2283", source_ref:"https://github.com/officeus-create/Hermes/pull/2283",
    blocked_reason:"PR #2283 depends on accepted #2270/#2236 ancestry and is currently not release-ready.",
    next_action:"Stabilize accepted parent ancestry, resync #2283, rerun bridge/HAE checks, obtain independent review and prove a real WORK_ID→job→receipt→owner readback."
  },
  {
    id:"hcwi_hist_20261105_005", project_id:"windows-ai", workstream:"technology", priority:"p0",
    title:"Connect Hermes AI on Windows to HAE with one real read-only job",
    details:"Use the Windows Hermes AI/DeepSeek node as execution capacity while cloud HAE remains the only queue, scheduler and evidence owner.",
    status:"blocked", created_at:"2026-11-02T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2250", source_ref:"https://github.com/officeus-create/Hermes/pull/2250",
    blocked_reason:"Signed Windows edge/custom-domain release and independent approval remain required before the first canonical HAE canary.",
    next_action:"Release #2250 through the protected path, verify DNS/TLS and signed node status, then run exactly one READ_ONLY $0 frozen-contract job with D1 receipt and independent QA."
  },
  {
    id:"hcwi_hist_20261105_006", project_id:"windows-ai", workstream:"technology", priority:"p1",
    title:"Make Windows Hermes AI survive unattended reboot/login gaps",
    details:"Ensure watchdog/startup and local Hermes AI services recover without creating a second cloud scheduler or storing production HAE credentials on Windows.",
    status:"blocked", created_at:"2026-11-04T00:00:00.000Z",
    source_kind:"chat_history", source_label:"Audit & Order / Windows handoff", source_ref:"HERMES_US_WINDOWS_CODEX_HANDOFF_2026-10-28.md",
    blocked_reason:"Unattended pre-login behavior has not been accepted with fresh runtime evidence.",
    next_action:"Prove boot/startup/watchdog recovery on the authorized Windows endpoint and record a sanitized receipt."
  },
  {
    id:"hcwi_hist_20261105_007", project_id:"windows-ai", workstream:"technology", priority:"p1",
    title:"Add DeepSeek validator, quarantine and fallback routing",
    details:"Keep DeepSeek read-only by default; reject empty/raw-reasoning outputs from final evidence, quarantine invalid results and route only verified semantic output through Hermes AI/HAE.",
    status:"ready", created_at:"2026-11-04T00:00:00.000Z",
    source_kind:"chat_history", source_label:"Hermes AI / DeepSeek audit", source_ref:"Chat history · Nov 2–5 2026",
    next_action:"Implement validator/quarantine/fallback contract and test it before DeepSeek can feed HAE evidence."
  },
  {
    id:"hcwi_hist_20261105_008", project_id:"free-ai", workstream:"technology", priority:"p1",
    title:"Verify and activate free Cloudflare AI capacity",
    details:"Preserve $0 fail-closed behavior. Unknown provider plan must never silently fall back to paid inference.",
    status:"blocked", created_at:"2026-10-27T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2137", source_ref:"https://github.com/officeus-create/Hermes/pull/2137",
    blocked_reason:"Authenticated provider-plan readback is still required.",
    next_action:"Read the actual provider plan/capacity, prove a bounded free inference path, then enable only that verified route."
  },
  {
    id:"hcwi_hist_20261105_009", project_id:"self-learning", workstream:"technology", priority:"p1",
    title:"Promote HAE self-improvement from source-scheduled to LIVE_VERIFIED",
    details:"hae.self.improvement.audit is scheduled every six hours in the existing HAE Cron, but a natural fresh job-level D1 receipt is still required before claiming live autonomy.",
    status:"in_progress", created_at:"2026-11-05T01:00:00.000Z",
    source_kind:"github_issue", source_label:"HAE canonical issue #2033", source_ref:"https://github.com/officeus-create/Hermes/issues/2033",
    next_action:"Capture a natural fresh D1 receipt, produce HAE-SELF WORK_ID→repair packet→independent QA, then show the evidence in Command Center."
  },
  {
    id:"hcwi_hist_20261105_010", project_id:"hae-runtime", workstream:"operations", priority:"p1",
    title:"Keep system.health.snapshot as the first official 24/7 action",
    details:"Hourly Cloudflare Cron → HAE Queue → Worker → D1 receipt → independent QA is the accepted always-on read-only baseline.",
    status:"done", created_at:"2026-11-05T01:00:00.000Z",
    source_kind:"github_issue", source_label:"HAE #2033 / Command Center #2106", source_ref:"https://github.com/officeus-create/Hermes/issues/2033",
    next_action:"Use this live baseline as the health gate for additional bounded autonomous capabilities."
  },
  {
    id:"hcwi_hist_20261105_011", project_id:"plugin-workforce", workstream:"operations", priority:"p1",
    title:"Make Agent Coordinator route owner tasks automatically",
    details:"Route each owner task to the existing capable specialist plugin without duplicate agents, while preserving one canonical writer and independent QA.",
    status:"ready", created_at:"2026-10-29T00:00:00.000Z",
    source_kind:"plugin", source_label:"hermes-agent-coordinator", source_ref:"Plugin Creator · hermes-agent-coordinator",
    next_action:"Bind Command Center task classification to the current plugin runtime registry and record selected-role receipts."
  },
  {
    id:"hcwi_hist_20261105_012", project_id:"plugin-workforce", workstream:"operations", priority:"p1",
    title:"Run GitHub, Website, Cloudflare and Drive auditors through HAE",
    details:"Use the existing auditor plugins as read-only specialist sources; do not create parallel schedulers or duplicate source polling.",
    status:"in_progress", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"github_pr", source_label:"PRs #2272 #2273 #2281 #2282", source_ref:"https://github.com/officeus-create/Hermes/pull/2272",
    next_action:"Release each source adapter on accepted HAE ancestry and surface the latest verified result/age in Command Center."
  },
  {
    id:"hcwi_hist_20261105_013", project_id:"one-brain", workstream:"operations", priority:"p1",
    title:"Prove One Brain lessons are consumed by real runtime work",
    details:"One Brain remains the single reviewed knowledge source. A proposed lesson is not complete until a later runtime task demonstrates reuse.",
    status:"ready", created_at:"2026-11-01T00:00:00.000Z",
    source_kind:"one_brain", source_label:"One Brain · reviewed lesson promotion", source_ref:"LESSON-PROPOSAL-HCC-TEST-COPY-20261101",
    next_action:"Promote only an accepted evidence-backed lesson, then capture a later HAE job proving the rule was applied."
  },
  {
    id:"hcwi_hist_20261105_014", project_id:"plugin-workforce", workstream:"operations", priority:"p2",
    title:"Finish Work Passport runtime governance",
    details:"Keep agent/task provenance, ownership and evidence portable across ChatGPT/Codex/Claude without creating a second task registry.",
    status:"blocked", created_at:"2026-10-29T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2166", source_ref:"https://github.com/officeus-create/Hermes/pull/2166",
    blocked_reason:"Historical branch still requires fresh current-main reconciliation and review.",
    next_action:"Re-read current PR state and either rebuild the bounded passport delta on current main or close it as superseded."
  },
  {
    id:"hcwi_hist_20261105_015", project_id:"plugin-workforce", workstream:"operations", priority:"p2",
    title:"Close Unlazy completion-discipline rollout",
    details:"Use the adapted Unlazy method as completion discipline in existing Hermes roles without importing unsafe external scripts or creating duplicate plugins.",
    status:"in_progress", created_at:"2026-10-29T00:00:00.000Z",
    source_kind:"github_pr", source_label:"GitHub PR #2175", source_ref:"https://github.com/officeus-create/Hermes/pull/2175",
    next_action:"Reconcile current branch/release truth and verify the skill is applied by the intended plugin/runtime roles."
  },
  {
    id:"hcwi_hist_20261105_016", project_id:"hermes-command-center", workstream:"technology", priority:"p2",
    title:"Add attention/decision UI for blocked and owner-gated work",
    details:"Command Center should make the small set of decisions, blockers and next actions obvious rather than forcing the owner to inspect raw logs.",
    status:"in_progress", created_at:"2026-11-03T00:00:00.000Z",
    source_kind:"github_issue", source_label:"GitHub #2271", source_ref:"https://github.com/officeus-create/Hermes/issues/2271",
    next_action:"Reconcile #2271 with the current Today/Tasks/Evidence views and keep only non-duplicative owner-attention behavior."
  },
  {
    id:"hcwi_hist_20261105_017", project_id:"hermes-command-center", workstream:"technology", priority:"p2",
    title:"Verify private Command Center owner access and all seven sections in production",
    details:"Today, Projects, Tasks, Automations, Agents, Evidence and Access must work under server-verified HERMES_INTERNAL_OWNER access; no plaintext credential storage.",
    status:"in_progress", created_at:"2026-10-30T00:00:00.000Z",
    source_kind:"chat_history", source_label:"Command Center owner access", source_ref:"Chat history · Oct 30–Nov 2 2026",
    next_action:"After the current release train is accepted, perform an authenticated production owner readback of all seven sections."
  },
  {
    id:"hcwi_hist_20261105_018", project_id:"hermes-command-center", workstream:"technology", priority:"p2",
    title:"Keep public demo and private owner Command Center on one shared product",
    details:"Public mode must use sanitized sample data; private mode must use owner-gated live data. Do not create a second admin center.",
    status:"done", created_at:"2026-10-30T00:00:00.000Z",
    source_kind:"github_pr", source_label:"Command Center foundation / public-private unification", source_ref:"https://github.com/officeus-create/Hermes/issues/2106",
    next_action:"Preserve the shared-shell architecture during future task/backlog changes."
  },
  {
    id:"hcwi_hist_20261105_019", project_id:"ai-operations", workstream:"technology", priority:"p1",
    title:"Canonicalize AI Operations without a second runtime",
    details:"Show runner health, current work, Team View and plugin capability while preserving HAE as the only execution control plane.",
    status:"in_progress", created_at:"2026-10-27T00:00:00.000Z",
    source_kind:"github_pr", source_label:"AI Operations #2159 / architecture #2125", source_ref:"https://github.com/officeus-create/Hermes/pull/2159",
    next_action:"Re-read current main and accepted descendants, close stale overlap, and retain only the canonical implementation."
  },
  {
    id:"hcwi_hist_20261105_020", project_id:"mac-ai", workstream:"technology", priority:"p2",
    title:"Finish historical Hermes AI context import and keep Mac as optional capacity",
    details:"Historical plan included importing 641 fragments and using local semantic capacity, but cloud HAE must remain independent of Mac power or browser state.",
    status:"ready", created_at:"2026-10-26T00:00:00.000Z",
    source_kind:"chat_history", source_label:"Hermes AI Mac plan", source_ref:"Chat history · Oct 26 2026",
    next_action:"Revalidate whether the 641-fragment import is still missing; if so, ingest only deduplicated durable lessons into One Brain rather than raw chat dumps."
  },
  {
    id:"hcwi_hist_20261105_021", project_id:"one-brain", workstream:"operations", priority:"p2",
    title:"Finish Telegram corpus knowledge extraction into One Brain",
    details:"Classify historical Telegram material into HR, Academy, Sales and Logistics, exclude secrets, and promote only confirmed reusable rules.",
    status:"ready", created_at:"2026-09-03T00:00:00.000Z",
    source_kind:"one_brain", source_label:"Source Manifest D009–D017", source_ref:"One Brain / Telegram corpus handoff · 2026-09-03",
    next_action:"Resume from the existing Source Manifest and extract repeated knowledge with confirmed/historical/hypothesis labels."
  },
  {
    id:"hcwi_hist_20261105_022", project_id:"plugin-workforce", workstream:"sales", priority:"p1",
    title:"Connect the two sales trainer plugins to Command Center execution",
    details:"ProgressoPro Sales Team Coach and Hermes Logistics Sales-to-Carrier Trainer already exist as private plugins; they still need automatic routing and operating visibility.",
    status:"ready", created_at:"2026-11-04T12:00:00.000Z",
    source_kind:"one_brain", source_label:"WORK_ID W-20261104-125", source_ref:"W-20261104-125",
    next_action:"Route through Agent Coordinator, Sales/Academy and Telegram Growth Manager as appropriate, then show actual task/result receipts in Command Center."
  },
  {
    id:"hcwi_hist_20261105_023", project_id:"plugin-workforce", workstream:"sales", priority:"p2",
    title:"Create the two dedicated sales trainer plugins",
    details:"Create one coach for ProgressoPro Marketing & IT sales and one sequential Hermes Logistics trainer for shipper/dealer → loads → carriers → agreements.",
    status:"done", created_at:"2026-11-04T11:00:00.000Z",
    source_kind:"plugin", source_label:"Plugin Creator releases", source_ref:"ProgressoPro Sales Team Coach v0.1.0 + Hermes Logistics Sales-to-Carrier Trainer v0.1.0",
    next_action:"Keep plugin creation closed; continue only integration/runtime evidence under W-20261104-125."
  },
  {
    id:"hcwi_hist_20261105_024", project_id:null, workstream:"marketing", priority:"p1",
    title:"Finish Meta/Threads production OAuth and narrow canary",
    details:"The unified Meta/Threads provider and DRAFT_ONLY social.reply.prepare path are in main, but unattended production replies remain off until production OAuth/readback and owner-approved canary evidence exist.",
    status:"blocked", created_at:"2026-11-01T20:00:00.000Z",
    source_kind:"github_pr", source_label:"Merged social PR #2229 / canonical #1018", source_ref:"https://github.com/officeus-create/Hermes/issues/1018",
    blocked_reason:"Production OAuth/readback and approved canary are not proven.",
    next_action:"Verify provider permissions/readback, run one bounded owner-approved canary, then widen only the explicitly accepted capability."
  },
  {
    id:"hcwi_hist_20261105_025", project_id:null, workstream:"marketing", priority:"p1",
    title:"Build Unified Inbox/CRM and VIKTOR reply preparation",
    details:"Aggregate owned conversations/mentions safely and let Hermes AI classify/prepare responses while keeping consequential external sends human-gated.",
    status:"ready", created_at:"2026-11-01T00:00:00.000Z",
    source_kind:"github_issue", source_label:"Social canonical issue #1018", source_ref:"https://github.com/officeus-create/Hermes/issues/1018",
    next_action:"Connect read-only inbox evidence to CRM state and add draft reply preparation with SAFE_AUTO/HUMAN_REVIEW policy receipts."
  },
  {
    id:"hcwi_hist_20261105_026", project_id:null, workstream:"marketing", priority:"p2",
    title:"Resolve X / LinkedIn / TikTok / Telegram social connector gaps",
    details:"X remains entitlement/cost-gated; LinkedIn account access and TikTok provider are not verified; Telegram should reuse the existing plugin path rather than inventing another publisher.",
    status:"blocked", created_at:"2026-11-01T00:00:00.000Z",
    source_kind:"chat_history", source_label:"Social connector backlog", source_ref:"Chat history · Oct 29–Nov 1 2026",
    blocked_reason:"Provider/account/entitlement evidence is incomplete across the remaining channels.",
    next_action:"Handle each provider as a separate verified connector gate; prioritize Telegram reuse and defer paid/unknown entitlements."
  },
  {
    id:"hcwi_hist_20261105_027", project_id:null, workstream:"operations", priority:"p2",
    title:"Run weekly Hermes Catalog report through HAE",
    details:"Friday 12:00 Europe/Kyiv report should deliver only into Hermes Command Center with no paid AI/token dependency; Monday notification remains part of the accepted cadence.",
    status:"blocked", created_at:"2026-11-01T05:00:00.000Z",
    source_kind:"github_pr", source_label:"Catalog report PR #2210", source_ref:"https://github.com/officeus-create/Hermes/pull/2210",
    blocked_reason:"Historical writer collision/release state requires fresh reconciliation before activation.",
    next_action:"Re-read #2210/current main, rebuild only missing non-conflicting report logic, then prove HAE schedule and Command Center delivery."
  },
  {
    id:"hcwi_hist_20261105_028", project_id:null, workstream:"operations", priority:"p2",
    title:"Run weekly HR-tech Radar through HAE",
    details:"Every Monday 10:00 Europe/Kyiv, use deterministic RSS/API/changelog analysis without LLM calls or AI-token spend and deliver into Command Center.",
    status:"in_progress", created_at:"2026-11-01T06:00:00.000Z",
    source_kind:"chat_history", source_label:"HR-tech Radar owner directive", source_ref:"Chat history · 2026-11-01",
    next_action:"Verify the source adapter, HAE schedule and first Command Center receipt; keep $0 deterministic execution."
  },
  {
    id:"hcwi_hist_20261105_029", project_id:null, workstream:"marketing", priority:"p2",
    title:"Establish authoritative 28-day lead registry for SEO outcome proof",
    details:"Search work must not claim qualified outcomes or revenue without a privacy-safe authoritative 28-day lead registry.",
    status:"blocked", created_at:"2026-08-31T00:00:00.000Z",
    source_kind:"audit", source_label:"Audit & Order · SEO-5", source_ref:"Audit/Order · 2026-08-31",
    blocked_reason:"Authoritative aggregated lead evidence was not available in the historical audit.",
    next_action:"Recheck whether a canonical privacy-safe lead registry now exists; if not, create one only in the approved private CRM/One Brain owner path."
  },
  {
    id:"hcwi_hist_20261105_030", project_id:"one-brain", workstream:"sales", priority:"p2",
    title:"Resolve One Brain Sales Brain access/source-of-truth gap",
    details:"Historical audit could not access Global Core/03_SALES_BRAIN. Do not create a duplicate sales brain.",
    status:"blocked", created_at:"2026-08-31T00:00:00.000Z",
    source_kind:"one_brain", source_label:"One Brain / Drive audit", source_ref:"Global Core/03_SALES_BRAIN · 2026-08-31",
    blocked_reason:"Approved canonical access/readback was missing in the historical evidence.",
    next_action:"Check current Drive access; locate the one canonical private registry, record evidence and link it into Command Center."
  },
  {
    id:"hcwi_hist_20261105_031", project_id:null, workstream:"marketing", priority:"p2",
    title:"Close GA4 key-event and qualified-outcome evidence gap",
    details:"GA4 transport was historically proven, but DebugView/key events, receiver delivery, qualification and revenue were not all proven.",
    status:"blocked", created_at:"2026-08-31T00:00:00.000Z",
    source_kind:"audit", source_label:"GA4 Audit & Order", source_ref:"Audit/Order · 2026-08-31",
    blocked_reason:"Business-result evidence is incomplete; synthetic or transport evidence is insufficient.",
    next_action:"Re-read current GA4/receiver/CRM evidence and close only the still-missing links in the discovery→qualified outcome chain."
  },
  {
    id:"hcwi_hist_20261105_032", project_id:null, workstream:"technology", priority:"p2",
    title:"Repair Hermes AI phone companion Android build",
    details:"Historical Android debug/private HTTPS companion build was blocked by android-build failure. Treat as a secondary interface, not another AI runtime.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"github_ci", source_label:"Hermes AI phone companion", source_ref:"GitHub Actions · 2026-10-20",
    blocked_reason:"Historical android-build failed; current relevance and branch state require revalidation.",
    next_action:"Re-read current phone-companion source/PR; either repair on current main or close as superseded if Command Center mobile web now covers the need."
  },
  {
    id:"hcwi_hist_20261105_033", project_id:"one-brain", workstream:"technology", priority:"p3",
    title:"Reconcile Paperclip synthetic One Brain review bridge",
    details:"Historical review-only Paperclip bridge failed actual-server smoke tests. It must not become another production task queue.",
    status:"blocked", created_at:"2026-10-20T00:00:00.000Z",
    source_kind:"github_ci", source_label:"One Brain Paperclip bridge", source_ref:"GitHub Actions · 2026-10-20",
    blocked_reason:"Smoke tests failed and the design may now be superseded by HAE/Command Center.",
    next_action:"Compare against current HAE/One Brain contracts; salvage only a unique review primitive or close the old bridge."
  },
  {
    id:"hcwi_hist_20261105_034", project_id:null, workstream:"technology", priority:"p3",
    title:"Reconcile historical 122-item website QA matrix against current main",
    details:"The Aug 16 matrix contained 122 requirements marked To Verify. Old checkboxes must not be restarted blindly after months of main-branch changes.",
    status:"blocked", created_at:"2026-08-16T00:00:00.000Z",
    source_kind:"file", source_label:"Hermes Website Master Execution QA Matrix · 2026-08-16", source_ref:"Hermes_Website_Master_Execution_QA_Matrix_2026-08-16.xlsx",
    blocked_reason:"Historical matrix is stale until reconciled against current main/live evidence.",
    next_action:"Diff each requirement against current code/live behavior, close superseded items, and promote only surviving P0/P1 gaps into the active backlog."
  },
  {
    id:"hcwi_hist_20261105_035", project_id:null, workstream:"operations", priority:"p2",
    title:"Close Repair Shop production proof gaps without false completion",
    details:"Repair Shop historical work repeatedly required production proof before completion claims. Preserve owner-only CRM and exact delivery/booking evidence boundaries.",
    status:"blocked", created_at:"2026-08-14T00:00:00.000Z",
    source_kind:"github_issue", source_label:"Repair Shop closure history", source_ref:"https://github.com/officeus-create/Hermes/issues/960",
    blocked_reason:"Historical code-side progress did not by itself prove the full production customer loop.",
    next_action:"Re-read current issue/main/live evidence and keep only unresolved production proofs as active tasks."
  },
  {
    id:"hcwi_hist_20261105_036", project_id:null, workstream:"logistics", priority:"p1",
    title:"Move Carrier Master Sheet into Hermes Operations OS",
    details:"Carrier Master Data should remain the canonical logistics operating dataset, with Atlas/visual indexes and One Brain decisions referencing it rather than duplicating carrier truth.",
    status:"blocked", created_at:"2026-09-04T00:00:00.000Z",
    source_kind:"one_brain", source_label:"Carrier Master / Operations architecture", source_ref:"Chat + One Brain · 2026-09-04",
    blocked_reason:"Fresh current-state readback of the canonical Carrier Master Sheet was not recovered in this pass.",
    next_action:"Locate the canonical Carrier Master Sheet, verify current schema/owners and map surviving fields/tasks into Hermes Operations OS without copying the dataset into another registry."
  },
  {
    id:"hcwi_hist_20261105_037", project_id:null, workstream:"finance", priority:"p1",
    title:"Reconcile carrier invoices and payment truth",
    details:"Historical carrier operations evidence showed 79 invoices across 7 carriers and $18,804.81 billed revenue, but payment verification was incomplete.",
    status:"blocked", created_at:"2026-09-05T12:00:00.000Z",
    source_kind:"finance_evidence", source_label:"Carrier Operations invoice audit · 2026-09-05", source_ref:"Corporate email/invoices · 2026-09-05",
    blocked_reason:"Billed revenue is not the same as collected cash; payment evidence remained incomplete.",
    next_action:"Reconcile invoice→payment status in the approved finance source, then rank warm-carrier reactivation using verified payment/relationship evidence."
  },
  {
    id:"hcwi_hist_20261105_038", project_id:null, workstream:"logistics", priority:"p0",
    title:"Finalize production Carrier Agreement and e-sign gate",
    details:"Carrier agreement/onboarding supports 6%, 8% and custom plans, but production signing must wait for the approved final agreement and legal/compliance acceptance.",
    status:"blocked", created_at:"2026-08-29T23:00:00.000Z",
    source_kind:"github_issue", source_label:"Carrier Agreement legal gate #280", source_ref:"https://github.com/officeus-create/Hermes/issues/280",
    blocked_reason:"Wisconsin transportation counsel/final legal terms and production signing approval remain the historical gate.",
    next_action:"Re-read current #280/#2252 agreement evidence, obtain required legal review, freeze the approved PDF/hash/Appendix A and only then enable production signing."
  },
  {
    id:"hcwi_hist_20261105_039", project_id:null, workstream:"logistics", priority:"p0",
    title:"Prove carrier revenue loop: Qualified → Signed → Activated → Completed → Invoiced → Collected",
    details:"The logistics outcome is not a signed document alone. Activate real carriers, move real loads, invoice the accepted plan and verify collection.",
    status:"blocked", created_at:"2026-08-29T23:00:00.000Z",
    source_kind:"chat_history", source_label:"Carrier revenue loop", source_ref:"Chat history · 2026-08-29",
    blocked_reason:"Depends on production agreement/access, qualified carrier activation and verified financial receipts.",
    next_action:"After agreement gate, activate 3–5 qualified carriers and track the full evidence chain through collection."
  },
  {
    id:"hcwi_hist_20261105_040", project_id:null, workstream:"logistics", priority:"p0",
    title:"Finish Load Board trusted-source intake and real role workflows",
    details:"Automatic load acquisition is only partial infrastructure. Carrier/Dispatcher/Dealer-Shipper/Broker role workflows and approved external source trust must be verified end to end.",
    status:"blocked", created_at:"2026-10-07T00:00:00.000Z",
    source_kind:"file", source_label:"Hermes Load Board Audit · 2026-10-07", source_ref:"Hermes_Load_Board_Audit_2026-10-07.md",
    blocked_reason:"Approved live provider/source rights and complete production role-flow evidence remain incomplete.",
    next_action:"Reconcile current Project31/#1074/#1296 ownership, verify source trust before ingest, then prove delivery/QA/receiver flow for real carrier leads."
  },
  {
    id:"hcwi_hist_20261105_041", project_id:null, workstream:"sales", priority:"p1",
    title:"Build the first 10 Account Intelligence Packs for load-list relationships",
    details:"Prioritize companies already sending load lists, then historical relationships, then new dealers. Each pack should support a personalized reusable Hermes Connect pilot rather than a one-off free build.",
    status:"ready", created_at:"2026-09-16T03:00:00.000Z",
    source_kind:"one_brain", source_label:"Broker Email/API → Hermes Connect plan", source_ref:"One Brain · 2026-09-16",
    next_action:"Rank the warmest ten accounts, capture permissions/source format/relationship history and prepare bounded reusable pilot offers."
  },
  {
    id:"hcwi_hist_20261105_042", project_id:null, workstream:"academy", priority:"p2",
    title:"Complete three logistics sales-training videos",
    details:"Training assignment: email/manual shipper-dealer intake, Hermes Load Board workflow, and CRM/TMS/API integration. These are reusable onboarding assets for the sales-to-carrier training sequence.",
    status:"ready", created_at:"2026-09-10T11:00:00.000Z",
    source_kind:"chat_history", source_label:"Logistics training team assignment", source_ref:"Chat history · 2026-09-10",
    next_action:"Record and review the three videos, then attach them to the existing Academy/trainer-plugin learning path."
  },
  {
    id:"hcwi_hist_20261105_043", project_id:null, workstream:"operations", priority:"p1",
    title:"Enforce US-calling Telegram quiet hours in every sender path",
    details:"Proactive Telegram sends for US-calling groups are allowed Mon–Fri 06:00–17:45 America/Chicago; 17:46–05:59 must fail closed. Rule already exists in One Brain/boards.",
    status:"blocked", created_at:"2026-09-17T08:00:00.000Z",
    source_kind:"one_brain", source_label:"Telegram quiet-hours rule", source_ref:"One Brain / ClickUp · 2026-09-17",
    blocked_reason:"Historical production sender-path implementation was pending because the local runtime was unavailable.",
    next_action:"Implement the guard in every current sender path and verify Central Time/DST/weekend boundary tests plus logs."
  },
  {
    id:"hcwi_hist_20261105_044", project_id:null, workstream:"academy", priority:"p1",
    title:"Define and activate Academy commercial access",
    details:"A1–A4 learning foundation was historically complete; A5 commercial access requires explicit offer terms before payment/access can be implemented.",
    status:"blocked", created_at:"2026-08-29T23:00:00.000Z",
    source_kind:"chat_history", source_label:"Academy A5 commercial gate", source_ref:"Chat history · 2026-08-29",
    blocked_reason:"Price, currency, billing, duration, capacity, eligibility, inclusions/exclusions, refund/cancellation and tax/waiver terms were not all owner-approved.",
    next_action:"Reconcile current Academy offers, obtain one approved commercial contract per program, then implement bounded payment/access."
  },
  {
    id:"hcwi_hist_20261105_045", project_id:null, workstream:"sales", priority:"p0",
    title:"Run ProgressoPro funnel: Lead → Media Plan → Feedback → Social Proof → Contract",
    details:"The intended ProgressoPro sales system is diagnostic/media-plan value first, then feedback/review, social proof and larger U.S. contracts. Proof must come from real outcomes.",
    status:"ready", created_at:"2026-08-16T00:00:00.000Z",
    source_kind:"business_backlog", source_label:"ProgressoPro sales funnel", source_ref:"Marketing QA + owner operating model",
    next_action:"Connect lead intake to a standardized media-plan deliverable, capture feedback permission, publish only verified proof and route qualified accounts to contract follow-up."
  },
  {
    id:"hcwi_hist_20261105_046", project_id:null, workstream:"sales", priority:"p1",
    title:"Unify website/marketing/business-lead intake into one Sales disposition truth",
    details:"Historical website evidence had separate website brief, marketing CTA and /api/business-lead paths without one authoritative Sales outcome/disposition view.",
    status:"ready", created_at:"2026-09-05T12:00:00.000Z",
    source_kind:"audit", source_label:"Website/SEO sales intake audit", source_ref:"Chat history · 2026-09-05",
    next_action:"Map all intake paths to the same CRM disposition model and require evidence for qualified, proposal, contract and closed outcomes."
  },
  {
    id:"hcwi_hist_20261105_047", project_id:null, workstream:"logistics", priority:"p0",
    title:"Close Carrier release gate #2251/#2252/#2253",
    details:"Carrier release package covers commercial plan truth, public inquiry vs contracted-carrier access and exact agreement PDF/hash/server validation.",
    status:"blocked", created_at:"2026-11-02T00:00:00.000Z",
    source_kind:"file", source_label:"HERMES_CARRIER_RELEASE_GATE_2026-11-02", source_ref:"HERMES_CARRIER_RELEASE_GATE_2026-11-02.md",
    blocked_reason:"Current exact-head PR/review/production evidence must be re-read before release.",
    next_action:"Re-read #2251, #2252 and #2253, keep 6%/8%/Custom and route ownership consistent, then require exact-head CI/review/prod verification."
  },
  {
    id:"hcwi_hist_20261105_048", project_id:null, workstream:"logistics", priority:"p1",
    title:"Confirm Central Dispatch entitlement before any live connector",
    details:"Central Dispatch must not be treated as a live API/source until the actual account/plan, written rights, users, frequency and launch window are verified.",
    status:"blocked", created_at:"2026-09-21T00:00:00.000Z",
    source_kind:"provider_gate", source_label:"Central Dispatch connector gate", source_ref:"Chat/email history · Sep–Oct 2026",
    blocked_reason:"Provider entitlement/written rights were not proven.",
    next_action:"Verify account/plan and permitted integration method; only then design the bounded source adapter."
  },
  {
    id:"hcwi_hist_20261105_049", project_id:null, workstream:"marketing", priority:"p1",
    title:"Reconcile carrier Search/GSC growth backlog against current query evidence",
    details:"Historical carrier search work included Logistics cluster, Load Board SEO, desktop gap, route intelligence, Search Opportunity Radar and SEO→Lead→Revenue measurement. No mass city-page expansion.",
    status:"blocked", created_at:"2026-08-13T00:00:00.000Z",
    source_kind:"github_issue", source_label:"GSC/search issues #462 #464 #465 #467 #470 #472", source_ref:"https://github.com/officeus-create/Hermes/issues/462",
    blocked_reason:"Historical issue state is stale and must be reconciled with current GSC/Bing/GA4 evidence before execution.",
    next_action:"Refresh current query/page/indexation evidence, close superseded issues and promote only the strongest existing-owner opportunities tied to qualified carrier demand."
  },
  {
    id:"hcwi_hist_20261105_050", project_id:null, workstream:"marketing", priority:"p2",
    title:"Reconcile London/UK workstream and remaining production measurement",
    details:"The historical London marketing/IT/U.S.-logistics-training workstream reached substantial code progress but retained CI/production analytics/GSC follow-up.",
    status:"blocked", created_at:"2026-08-30T20:00:00.000Z",
    source_kind:"github_issue", source_label:"London backlog #914", source_ref:"https://github.com/officeus-create/Hermes/issues/914",
    blocked_reason:"Historical ~85–96/100 progress is not current completion evidence.",
    next_action:"Read current main/live London routes and production measurement, close already-delivered items and retain only surviving gaps."
  },
  {
    id:"hcwi_hist_20261105_051", project_id:null, workstream:"operations", priority:"p1",
    title:"Revalidate load-planner hiring lane and define current requisition",
    details:"Load-planner hiring remains a management priority, but this history pass did not recover a trustworthy current owner/status/KPI record. Do not invent candidate progress.",
    status:"blocked", created_at:"2026-09-04T00:00:00.000Z",
    source_kind:"management_backlog", source_label:"Hermes Logistics staffing layer", source_ref:"Owner operating backlog",
    blocked_reason:"Current requisition, funnel state and evidence were not recovered from the canonical recruiting source.",
    next_action:"Locate the canonical HR/recruiting record, define role scorecard/KPIs and active-candidate state, then link that record into Command Center."
  },
  {
    id:"hcwi_hist_20261105_052", project_id:null, workstream:"operations", priority:"p1",
    title:"Revalidate sales-rep hiring lane and current performance scorecard",
    details:"Sales-rep hiring is a management priority; recruiting must use recent concrete verifiable performance metrics rather than unsupported claims.",
    status:"blocked", created_at:"2026-08-12T12:00:00.000Z",
    source_kind:"management_backlog", source_label:"Hermes/ProgressoPro recruiting", source_ref:"Owner recruiting standard · Aug–Nov 2026",
    blocked_reason:"No single fresh requisition/candidate pipeline source was recovered in this pass.",
    next_action:"Find the canonical HR pipeline, enforce the 3–6 month verifiable-metrics requirement and surface qualified candidates/status in Command Center."
  },
  {
    id:"hcwi_hist_20261105_053", project_id:null, workstream:"finance", priority:"p1",
    title:"Define the current Hermes finance automation backlog",
    details:"Finance automation remains a management layer, but the recovered history did not contain one trustworthy current owner/status record. Preserve it as an explicit gap instead of pretending it is complete.",
    status:"blocked", created_at:"2026-09-04T00:00:00.000Z",
    source_kind:"management_backlog", source_label:"Hermes finance automation", source_ref:"Owner operating backlog",
    blocked_reason:"Canonical current finance-automation task source was not recovered.",
    next_action:"Locate current AP/AR/invoice/payment sources with Finance Accounting, deduplicate existing automations and define the smallest evidence-backed automation sequence."
  },
  {
    id:"hcwi_hist_20261105_054", project_id:"hermes-command-center", workstream:"technology", priority:"p1",
    title:"Restore Hermes Connect CRM/Operator as the Command Center product specialist",
    details:"Recover the existing Hermes Connect plugin lineage instead of recreating it. Historical private packages include Hermes Connect Operator v1.0/v1.2 and Hermes Connect CRM v1.3/v1.4, while the current 34-plugin inventory no longer exposes a Hermes Connect role. Use it as the CRM/product workflow specialist for Command Center together with Agent Coordinator, Technology Developer, Design Hub/UX, COO, HAE and independent QA; do not make it a second CRM, scheduler, runtime or receipt store.",
    status:"ready", created_at:"2026-11-05T10:45:00.000Z",
    source_kind:"plugin_recovery", source_label:"Hermes Connect CRM / Operator historical private packages", source_ref:"Library · /00 · C-level — CEO/hermes-connect-crm-v1.4.0.zip",
    next_action:"Validate the latest recoverable internal Hermes Connect package against the current plugin schema and security boundaries, restore/update it as a private plugin, bind Agent Coordinator routing for Command Center/CRM tasks, and expose selected-role plus execution-receipt truth in Command Center."
  }
]);

const clean=(value,max=10000)=>String(value??"").replace(/\u0000/g,"").trim().slice(0,max);

const IMPORT_KEY="owner_history_backlog_2026-11-05_v2";

export async function seedHistoricalCommandCenterBacklog(db){
  if(!db?.prepare)return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_command_center_imports (
    import_key TEXT PRIMARY KEY,
    imported_at TEXT NOT NULL
  )`).run();
  const already=await db.prepare("SELECT import_key FROM hermes_command_center_imports WHERE import_key=? LIMIT 1").bind(IMPORT_KEY).first();
  if(already)return;
  for(const item of COMMAND_CENTER_HISTORY_BACKLOG){
    const completed=item.status==="done"?item.created_at:null;
    const acceptance=item.status==="done"?"accepted":"not_required";
    await db.prepare(`INSERT OR IGNORE INTO hermes_owner_work_items
      (id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,
       completed_at,acceptance_status,blocked_reason,source_kind,source_label,source_ref,next_action)
      VALUES (?,'hermes_internal',?,?,?,?,'imported',?,'history_backlog_import',?,?,?,?,?,?,?,?,?,?)`)
      .bind(
        item.id,item.workstream,item.priority,clean(item.title,160),clean(item.details),item.status,
        item.created_at,item.created_at,item.project_id??null,completed,acceptance,item.blocked_reason??null,
        item.source_kind??"history",clean(item.source_label,240),clean(item.source_ref,1000),clean(item.next_action,2000)
      ).run();
  }
  await db.prepare("INSERT OR IGNORE INTO hermes_command_center_imports (import_key,imported_at) VALUES (?,?)")
    .bind(IMPORT_KEY,"2026-11-05T10:30:00.000Z").run();
}
