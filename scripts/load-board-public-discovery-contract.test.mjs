import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/components/LoadBoardCapacityEnhancer.astro", import.meta.url), "utf8");

assert.match(source, /const externalPublicLoads = Object\.freeze\(\[/, "public discovery must use a bounded source snapshot");
assert.match(source, /Atlantic Logistics/, "current public source must be named");
assert.match(source, /https:\/\/lb\.shipatlantic\.com\/atlantic-logistics-load-board\//, "source link must remain first-party");
assert.match(source, /expiresAt:/, "public discovery rows must expire");
assert.match(source, /Date\.parse\(String\(item\?\.expiresAt/, "expired source rows must fail closed");
assert.match(source, /data-public-discovery/, "signed-in discovery surface must exist");
assert.match(source, /\/api\/hermes-connect\/account/, "discovery must check the existing Hermes session");
assert.match(source, /account\?\.success === true && account\?\.identity\?\.id/, "anonymous visitors must not receive the signed-in discovery UI");
assert.match(source, /EXTERNAL PUBLIC SOURCE/, "source-backed rows must not be presented as Hermes-owned freight");
assert.match(source, /not Hermes inventory/, "source ownership boundary must be explicit");
assert.match(source, /Verify availability at source/, "availability must be rechecked before action");
assert.match(source, /noopener noreferrer nofollow/, "external source links must be safe and non-endorsement");
assert.match(source, /void renderPublicDiscovery\(\)/, "discovery renderer must run on the canonical Load Board");
assert.doesNotMatch(source, /externalPublicLoads[^\n]*available_loads/, "public discovery must never be merged into LIVE inventory counts");

console.log("load-board-public-discovery-contract: signed-in public-source discovery stays separate from LIVE inventory and expires safely");
