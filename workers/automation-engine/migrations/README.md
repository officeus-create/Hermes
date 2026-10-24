# HAE D1 migrations

This directory is the versioned schema-evolution gate for Hermes Automation Engine.

Current status: **PENDING_RUNTIME_SNAPSHOT**.

Do not add or apply a SQL migration until the accepted #557 runtime evidence is followed by a separate authenticated snapshot of the exact deployed schema for the existing canonical Hermes Connect D1.

Rules:

1. Never create a second HAE database.
2. The canonical database is discovered from the existing `hermes` Pages production `DB` binding.
3. Current V1 additive `ensureSchema` behavior remains unchanged until the deployed schema snapshot is captured and this migration baseline is explicitly promoted from PENDING_RUNTIME_SNAPSHOT.
4. After the authenticated schema snapshot, change `baseline_status` to `VERIFIED`, record the exact deployed source SHA, the immutable evidence reference, and the deterministic `sha256:` schema fingerprint; only then may numbered forward migrations be introduced.
5. Every migration must be listed in `manifest.json` in execution order.
6. Destructive migrations require explicit owner confirmation and a separate restore/rollback plan.
7. D1 Time Travel/restore is a production action; never invoke it from CI or a normal migration test.

## Authenticated read-only schema snapshot

After the snapshot source change is independently reviewed, merged, and separately owner-authorized for execution, use the existing HAE release workflow operation:

`schema_snapshot <exact-current-main-sha>`

The issue-command form is:

`HAE_SCHEMA_SNAPSHOT <exact-current-main-sha>`

The snapshot operation is evidence-only. It must:
- target the exact current `main` SHA;
- discover the existing canonical production D1 binding;
- issue only the bounded read-only `sqlite_master` schema query;
- upload only the sanitized normalized schema artifact and deterministic `sha256:` fingerprint;
- keep Queue provisioning, Worker composition/deployment, provider writes, D1 writes, and migration mutation disabled.

An accepted snapshot artifact does **not** edit `manifest.json`. Promotion from `PENDING_RUNTIME_SNAPSHOT` to `VERIFIED` remains a separate bounded source change after artifact readback and independent QA.

The repository contract test fails if SQL migration files appear while the baseline is still pending.
