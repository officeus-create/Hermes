# HAE D1 migrations

This directory is the versioned schema-evolution gate for Hermes Automation Engine.

Current status: **PENDING_RUNTIME_SNAPSHOT**.

Do not add or apply a SQL migration until the #1872 runtime gate has produced an authenticated deployed-source/schema baseline for the existing canonical Hermes Connect D1.

Rules:

1. Never create a second HAE database.
2. The canonical database is discovered from the existing `hermes` Pages production `DB` binding.
3. Current V1 additive `ensureSchema` behavior remains unchanged while #1872 is open.
4. After the first verified runtime baseline, change `baseline_status` to `VERIFIED`, record the exact deployed source SHA, and introduce numbered forward migrations.
5. Every migration must be listed in `manifest.json` in execution order.
6. Destructive migrations require explicit owner confirmation and a separate restore/rollback plan.
7. D1 Time Travel/restore is a production action; never invoke it from CI or a normal migration test.

The repository contract test fails if SQL migration files appear while the baseline is still pending.
