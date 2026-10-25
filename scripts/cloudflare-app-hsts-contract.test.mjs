import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/cloudflare-app-hsts.yml", "utf8");
const script = fs.readFileSync("scripts/cloudflare-app-hsts.sh", "utf8");

assert.match(workflow, /github\.event\.issue\.number == 1349/);
assert.match(workflow, /github\.event\.comment\.body == '\/apply-app-hsts'/);
assert.match(workflow, /OWNER","MEMBER","COLLABORATOR/);
assert.match(workflow, /environment: production/);
assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
assert.match(workflow, /bash scripts\/cloudflare-app-hsts\.sh/);
assert.match(workflow, /gh issue comment 1349/);

assert.match(script, /HOST="app\.hermeslogisticsus\.com"/);
assert.match(script, /ZONE_NAME="hermeslogisticsus\.com"/);
assert.match(script, /EXPECTED_HSTS="max-age=31536000"/);
assert.match(script, /http_response_headers_transform/);
assert.match(script, /Strict-Transport-Security/);
assert.match(script, /RULE_EXPRESSION='\(http\.host eq "app\.hermeslogisticsus\.com"\)'/);
assert.match(script, /blocked_zone_lookup/);
assert.match(script, /blocked_ruleset_read/);
assert.match(script, /blocked_ruleset_write/);
assert.match(script, /-X PATCH/);
assert.match(script, /ref:"hermes_app_hsts"/);
assert.match(script, /action_parameters\.headers\["Strict-Transport-Security"\]\.operation == "set"/);
assert.doesNotMatch(script, /-X PUT/);
assert.match(script, /mutation_applied_live_not_observed/);
assert.doesNotMatch(script, /includeSubDomains/i);
assert.doesNotMatch(script, /preload/i);
assert.doesNotMatch(script, /dns_records/i);
assert.doesNotMatch(script, /Always Use HTTPS/i);

console.log("Cloudflare app HSTS remediation contract passed.");
