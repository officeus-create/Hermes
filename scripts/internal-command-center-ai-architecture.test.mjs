import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const get = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const owner = get("src/pages/services/hermes-connect/internal/command-center/index.astro");
const arch = get("src/components/HermesAiArchitecture.astro");
const docs = get("docs/HERMES_AI_ARCHITECTURE_COMMAND_CENTER.md");
const contract = get("scripts/internal-command-center-contract.test.mjs");

// P0: no second admin and no metadata exposed outside existing owner-gated shell.
assert.match(owner, /import HermesAiArchitecture/);
const guard = owner.indexOf("<div data-private hidden>");
const ui = owner.indexOf("<HermesAiArchitecture ru={ru}");
const close = owner.indexOf("</div>\n    </div>\n  </main>", guard);
assert.ok(guard >= 0 && ui > guard && close > ui, "architecture must be within the HERMES_INTERNAL_OWNER private view");
assert.match(owner, /const status=await jsonFetch\("\/api\/internal-ai\/status"\)/);
assert.match(owner, /if\(!status\.r\.ok\|\|!status\.d\.success\).*hidden=true/);
assert.match(owner, /data-ai-map-runner-time/);
assert.match(owner, /runtime\.last_seen_at/, "actual runner time derives from owner API");
assert.match(contract, /internal-command-center-ai-architecture\.test\.mjs/, "architecture QA must be in the existing canonical contract suite");

// Topology, roles, and links are explicit and maintainable.
for (const name of ["HAE · Worker + Queue + D1","Hermes AI · Mac","One Brain","GLM-4.7-Flash","Clef-flash","Clairic","Whisper Large V3 Turbo","WAITING_FREE_AI","Agent Coordinator","Technology Developer","Automatic Engineer","QA Auditor","Access Governor","Knowledge Curator","COO"]) {
  assert.ok(arch.includes(name), "missing documented role: " + name);
}
for (const section of ["flow","models","connections","rollout"]) {
  assert.match(arch, new RegExp('data-ai-map-panel="' + section + '"'));
  assert.match(arch, new RegExp('data-ai-map-tab="' + section + '"'));
}

// Connected ≠ in catalog; never claim live model or provider coverage by existence.
assert.match(arch, /No accepted inference receipt yet/);
assert.match(arch, /Status identifies a source-level observation|Each status identifies a source-level observation/);
assert.match(arch, /Source snapshot: 27 October 2026/);
assert.match(arch, /Created; live connector unverified/);
assert.match(arch, /no Hermes benchmark/i);

// The only interaction with actual work should fill the owner's pre-existing form.
assert.match(arch, /querySelector<HTMLFormElement>\("\[data-work-form\]"\)/);
assert.match(arch, /form\.closest\("\[data-private\]"\)\?\.hasAttribute\("hidden"\)/);
assert.match(arch, /title\.value = draft\.title/);
assert.match(arch, /details\.value = draft\.details/);
assert.doesNotMatch(arch, /form\.submit\(|requestSubmit\(|fetch\(|sendBeacon\(|\.post\(/i);
assert.doesNotMatch(arch, /localhost:8765|127\.0\.0\.1:8765\/api|GENUI|OPENAI_API_KEY|Cf-Access-Jwt-Assertion/);
assert.match(arch, /role="tablist"/);
assert.match(arch, /aria-selected/);
assert.match(arch, /aria-controls/);
assert.match(arch, /event\.key === "ArrowRight"/);

// No accidental second orchestrator in the durable description.
assert.match(docs, /one new \*\*AI System Architecture\*\* section/);
assert.match(docs, /no new planner, Worker, D1 database/i);
assert.match(docs, /no automatic production release/i);
console.log("Hermes AI owner architecture: existing owner gate, models, route diagram, real settings links, draft-only task controls, source proof PASS");

// Current release owners must replace historical merged PRs in the owner UI.
assert.match(arch, /officeus-create\/Hermes\/pull\/2137/);
assert.match(arch, /officeus-create\/Hermes\/pull\/2138/);
assert.doesNotMatch(arch, /officeus-create\/Hermes\/pull\/(2090|2123)/);
assert.match(docs, /#2090 source merged/);
assert.match(docs, /source safety gate #2123 is merged/);
