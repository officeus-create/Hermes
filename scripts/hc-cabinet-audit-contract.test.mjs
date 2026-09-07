import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/hc-cabinet-audit.yml", import.meta.url), "utf8");

assert.match(workflow, /github\.event\.issue\.number == 671/);
assert.match(workflow, /github\.event\.comment\.body == '\/audit-hc-cabinets'/);
assert.match(workflow, /OWNER.*MEMBER.*COLLABORATOR/);
assert.match(workflow, /environment:\s*production/);
assert.match(workflow, /CLOUDFLARE_D1_API_TOKEN/);
assert.match(workflow, /pages\/projects\/hermes/);
assert.match(workflow, /deployment_configs\.production\.d1_databases\.DB\.id/);
assert.match(workflow, /d1\/database\/\$\{DB_ID\}\/query/);
assert.match(workflow, /SELECT[\s\S]*FROM specialists s/);
assert.match(workflow, /LEFT JOIN repair_shops rs/);
assert.match(workflow, /LEFT JOIN repair_shop_sales_attribution a/);
assert.match(workflow, /Vadym-sheet \/ Vadim-attribution candidates/);
assert.match(workflow, /mask_email/);
assert.match(workflow, /Raw D1 response is kept only in the ephemeral runner/);
assert.doesNotMatch(workflow, /actions\/artifacts/);
assert.doesNotMatch(workflow, /api\/auth\/login/);
assert.doesNotMatch(workflow, /\b(?:INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE)\s+(?:INTO|FROM|TABLE|repair_|specialists|sessions)/i);

console.log("Hermes Connect cabinet audit contract passed: owner-command gated, production D1 read-only, sanitized, and mutation-free.");
