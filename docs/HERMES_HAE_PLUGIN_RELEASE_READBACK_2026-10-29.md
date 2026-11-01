# Hermes HAE Plugin Release Readback — 2026-10-29

Status: **PROVIDER_READBACK_UPDATED / RUNTIME_COMPATIBILITY_HOLD**

Source: authenticated Plugin Creator current-release metadata plus package readback after the 2026-10-29 Completion Truth training update.

This document records provider release truth only. It does **not** prove that a plugin release is loaded by a running HAE node, that a role contract executed, or that Command Center runtime telemetry is live.

## Runtime-allowed registry roles

| HAE role | Provider version observed 2026-10-29 |
| --- | --- |
| hermes-automatic-engineer | 0.1.34 |
| hermes-agent-coordinator | 0.1.80 |
| hermes-technology-developer | 0.1.60 |
| hermes-qa-evidence-auditor | 0.1.16 |
| hermes-knowledge-curator | 0.1.88 |
| hermes-marketing-growth | 0.1.13 |
| hermes-search-growth | 0.1.12 |
| hermes-academy | 0.1.14 |
| hermes-dispatch-os | 0.1.26 |

The HAE registry remains intentionally bounded to these nine roles. Other private Hermes plugins are not added merely because they exist or were updated.

## Completion Truth training receipt

All 27 Hermes private plugins (excluding personal-health-os) now received and package-read back the `skills/completion-truth-gates/SKILL.md` package layer. The HAE runtime registry remains intentionally bounded to the nine roles below. First-wave/core training included:

- hermes-agent-coordinator 0.1.80
- hermes-automatic-engineer 0.1.34
- hermes-qa-evidence-auditor 0.1.16
- hermes-knowledge-curator 0.1.88
- hermes-technology-developer 0.1.60
- hermes-sales 0.1.22
- hermes-marketing-growth 0.1.13
- hermes-search-growth 0.1.12
- hermes-dispatch-os 0.1.26
- hermes-coo 0.1.7
- hermes-security-engineering 0.1.4
- hermes-access-identity-governor 0.1.4

Package readback verified the skill exists in every listed current release and contains the release-state ladder plus `UNKNOWN != 0` rule.

## Durable rules promoted

1. `CODED -> EXACT_HEAD_CI_GREEN -> INDEPENDENT_QA -> MERGED -> DEPLOYED -> LIVE_VERIFIED -> BUSINESS_VERIFIED/MONETIZED` are distinct states.
2. Stale PR replay requires both changed-file overlap review and semantic dependency ordering.
3. `UNKNOWN` / `ACCESS_GAP` must not become zero, success or failure.
4. Real-world evidence progresses separately: `REAL_INBOUND_SIGNAL -> IDENTITY_VERIFIED -> QUALIFIED -> REAL_USER_USED -> CUSTOMER/AGREEMENT -> MONETIZED`.
5. Synthetic QA never proves a real customer/business outcome.
6. Obsolete or artificial backlog/CI artifacts should be closed as superseded while provenance is retained.
7. One writer per artifact and one HAE/control plane remain mandatory.
8. Security owner bootstrap is a one-time authenticated binding process; bootstrap secrets are never knowledge records and owner activation is distinct from runner activation.

## Runtime compatibility gate

The registry update changes provider-version evidence only. Existing `plugin-release-drift-preflight.mjs` continues to require independent contract/runtime proof and explicitly forbids automatic registry/plugin update, dispatch, One Brain write or new scheduler creation.

No plugin was automatically added to the HAE runtime and no production command, Queue/D1 write, deploy or provider action is authorized by this readback.


## Full Hermes plugin training completion

After the core/runtime update, the remaining 15 Hermes roles were updated and package-read back without adding them to HAE runtime:

- hermes-geo-ai-visibility-specialist 0.1.4
- hermes-seo-organic-specialist 0.1.4
- hermes-investor-relations 0.1.6
- hermes-workforce-enablement 0.1.6
- hermes-compliance-operations 0.1.4
- hermes-finance-accounting 0.1.5
- hermes-ceo 0.1.3
- hermes-recruiter 0.1.5
- hermes-telegram-growth-manager 0.3.3
- hermes-news 0.1.4
- hermes-catalog 0.1.7
- hermes-academy 0.1.14
- hermes-hr 0.1.14
- hermes-private-network 0.1.2
- hermes-design-hub 0.2.67

Package readback for every updated release verified the Completion Truth skill, the exact release-state ladder, `UNKNOWN != 0`, and real-signal/customer separation. `personal-health-os` was deliberately excluded because this is a Hermes business/runtime governance lesson.

## 2026-11-01 authenticated provider version refresh (supersedes only version snapshot)

Source: Plugin Creator current-release readback, 2026-11-01. Existing historical 2026-10-29 training versions are preserved above as dated evidence.

| Runtime-allowed role | Current provider version |
| --- | --- |
| hermes-automatic-engineer | 0.1.34 |
| hermes-agent-coordinator | 0.1.82 |
| hermes-technology-developer | 0.1.60 |
| hermes-qa-evidence-auditor | 0.1.17 |
| hermes-knowledge-curator | 0.1.89 |
| hermes-marketing-growth | 0.1.14 |
| hermes-search-growth | 0.1.13 |
| hermes-academy | 0.1.14 |
| hermes-dispatch-os | 0.1.26 |

**Delta since previous HAE snapshot (five roles only):** Coordinator 0.1.80 to 0.1.82 (new task-specific ChatGPT/Hermes routing skill), QA 0.1.16 to 0.1.17, Curator 0.1.88 to 0.1.89, Marketing 0.1.13 to 0.1.14, Search 0.1.12 to 0.1.13. Four other identities unchanged. No additional runtime role admitted.

Current coordinator provider release: pluginrel_6ae6794228848191b2aa8e2144a4712c. CEO directive: https://docs.google.com/document/d/1-F1QU6EKQEdoK0jQucIEabqJ_PUsVIQ5zWiws-BgAQc/edit

Only the registry observed_at and nine existing role version identities, plus matching 17 capability-policy plugin_version fields, change. No job type, permission, input, provider write, publication gate, trigger, retention, AI spending, runtime execution or approval bypass. Source evidence is not deployed package or executing HAE job.

Review gates: exact-head HAE contracts/Website/quality CI, independent QA and reviewer approval, protected merge, production/runtime readback, followed by controlled #2067 -> #2070 -> #2068 -> #2069. Chat routing skill cannot globally hook ChatGPT, retrain model weights, or start a daemon by itself.

Work passport: ChatGPT / 2026-11-01 / PR #2190 / provider evidence sync / reviewer progressopro / HOLD_RELEASE until independent QA.


## 2026-11-01 00:39:08.064Z — exact new provider readback provenance

Authenticated `Plugin_Creator.list_owned_personal_plugins(limit=50)` completed at UTC `2026-11-01T00:39:08.064Z`. Response inventory had **28** plugins total, **27** Hermes plugins. Comparison to the runtime allowlist gives **9/9 exact role IDs and versions matched**, no new roles and no missing roles. This timestamp is the actual completed connector response observation, superseding the earlier synthetic-looking `2026-10-31T23:35:25.000Z`; do not use the latter as a factual provider timestamp.

| HAE runtime role | Provider release ID | Version |
| --- | --- | --- |
| hermes-automatic-engineer | pluginrel_6ae3b4334288819187d3babb65723545 | 0.1.34 |
| hermes-agent-coordinator | pluginrel_6ae6794228848191b2aa8e2144a4712c | 0.1.82 |
| hermes-technology-developer | pluginrel_6ae3b45bf9d881919d1ae2bd207f46ea | 0.1.60 |
| hermes-qa-evidence-auditor | pluginrel_6ae6758821048191a9999fb60f5570da | 0.1.17 |
| hermes-knowledge-curator | pluginrel_6ae675a3ef9881919df6264fdcb1ed9c | 0.1.89 |
| hermes-marketing-growth | pluginrel_6ae63cc17d2c8191bc07f876956b17d1 | 0.1.14 |
| hermes-search-growth | pluginrel_6ae6750b30a48191863239618c5eabd5 | 0.1.13 |
| hermes-academy | pluginrel_6ae3ba1061f0819183d0b1216f1365b7 | 0.1.14 |
| hermes-dispatch-os | pluginrel_6ae3b49243648191a085db018d74e22c | 0.1.26 |

The exact UTC instant is a **snapshot timestamp**, not an automatically refreshing feed. After the existing 24-hour freshness bound, the registry truth is `STALE_OR_FUTURE` until a new authenticated provider readback is accepted, not `LIVE`. This source sync makes no claim that the plugins are loaded by a 24/7 HAE Worker. No provider permission change, plugin update, Cloudflare deployment, Queue/D1 write or paid model invocation.


## 2026-11-01 00:46:39.120Z — plugin routing and independent QA release drift correction

A second authenticated Plugin Creator current-release listing (28 owned plugins, 9 HAE-allowed role identities) showed **two** versions advanced since the earlier 00:39Z snapshot:
- `hermes-agent-coordinator` **0.1.82 → 0.1.83**, provider release `pluginrel_6ae68b167ccc8191841b547dc4f3bb30`.
- `hermes-qa-evidence-auditor` **0.1.17 → 0.1.18**, provider release `pluginrel_6ae68b2776ac81919aaa7f0bee272115`.

The other seven roles and all 23 capability records remain unchanged apart from those **two version-only fields**. Existing `chatgpt-request-router`, `resume-after-pause`, `free-24x7-digital-workforce`, `ci-cascade-root-cause`, `viktor-hae-truth-gates`, `completion-truth-gates` and `closed-loop-work-cell` plugin skills were actually **READ and APPLIED as skill-level routing/assurance instructions** in the task session, not called as remote, executing Hermes agents. They are already installed in the plugin releases, so no duplicate skill/plugin is needed. User's instruction to route each business task through these roles is a default handling policy when skills are loaded, **not a guarantee that ChatGPT silently calls all private plugins in every unrelated/new chat**. All 28 plugins being present is only an inventory fact. A running HAE Worker consuming these versioned contracts still requires an exact deployed SHA, D1/Queue job receipt, independent QA and approval.

The signed-off workflow for repeated business tasks: Coordinator (route + one owner + skill/tool receipt) → specialized HAE/Technology/Business skills as applicable → actual connector/source write only if authorized → *different* QA verifier → accepted lesson via Knowledge Curator/One Brain → reviewed Plugin Creator release → subsequent real HAE job proves consumption. Default NO_PAID_AI / NO_OUTBOUND / NO_AUTO_MERGE / PUBLICATION_OFF. Group tasks by real capability and use progressive disclosure; never call 28 plugins as a ritual.


## 2026-11-01 task-specific training: Coordinator 0.1.84 published/read back

The owner requested active plugin cooperation and a bounded 50-task priority closeout. The existing `hermes-agent-coordinator` was updated in Plugin Creator (not cloned) from **0.1.83 to 0.1.84**, release `pluginrel_6ae68cfdb7948191aaba16e655c92e36`; new `skills/priority50-execution-campaign/SKILL.md` was independently fetched/read back by exact Plugin Creator backend ID `plugins_6acf865dbc3c8191a21ca0da11dfb094`. It implements P0→P1 selection of 50 nonterminal canonical WORK_IDs, source-checked stage transitions, one writer + domain owner + separate QA, no false DONE, ru_RU Sheets formula/readback safety and lesson promotion only after reviewed evidence.

Canonical ledger remains `1Ya2fgHZVISV3XHd_w9JHSJBrizCy-LeKczD9H_qJErc`, now with formula-referenced `PRIORITY50_20261101` view (`gid=1731142026`). Actual task ownership/status remain in `LEDGER`; no second board. The new Coordinator 0.1.84 is a **real installed skill update** but is not evidence of a running HAE worker, continuous ChatGPT auto-routing across new chats or a HAE D1 runtime contract. New registry and the single existing coordinator capability `plugin_version` project the authentic release version for future reviewed HAE compatibility, not current production consumption. Independent QA and exact-head CI remain separate; no automatic merge/deploy/paid inference/outbound.


### Final UTC provenance after actual Coordinator release

The `0.1.84` Coordinator release was created **after** the earlier `2026-11-01T00:46:39.120Z` provider inventory. Therefore that older time is not the observation of v0.1.84. A **new** authenticated 28-plugin listing completed `2026-11-01T00:52:46.408Z`, confirming coordinator `0.1.84` release `pluginrel_6ae68cfdb7948191aaba16e655c92e36` and QA Auditor `0.1.18` release `pluginrel_6ae68b2776ac81919aaa7f0bee272115`. The registry timestamp is now bound only to this newer readback. No automatic plugin update/agent execution inference follows.


## 2026-11-01 04:43:48Z — default plugin routing + hourly social factory refresh

Authenticated Plugin Creator updates and immediate package readback confirmed two HAE-allowed role releases created for the owner's explicit social/default-plugin directive:

- `hermes-agent-coordinator` **0.1.85**, release `pluginrel_6ae6c32705388191ada207438ad88a6a`: added discovery keywords/capabilities/default prompts and strengthened `chatgpt-request-router` so every accessible Hermes/ProgressoPro task must read/apply the smallest relevant private specialist set before substantive execution; inaccessible specialist paths are reported as `PLUGIN_ACCESS_GAP`. This is discovery/routing metadata plus skill policy, not a global hidden ChatGPT hook.
- `hermes-marketing-growth` **0.1.15**, release `pluginrel_6ae6c3379da48191a012c9738f2de5cf`: added `social-hourly-content-factory` for the two canonical lanes `HERMES_LOGISTICS` and `PROGRESSOPRO`, generating platform-native Threads/Instagram/Facebook/X variants while preserving HAE as the sole durable scheduler/publisher.

Only existing role version identity fields and registry evidence time are refreshed in this PR. No permission class, job type, provider credential, external-write authority, scheduler, Queue/D1 shape, paid AI, merge/deploy or production publication is enabled by this version sync. Runtime consumption still requires exact-head CI, independent QA, protected merge/deploy and later HAE receipt/readback.
