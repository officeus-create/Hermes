import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/components/LoadBoardCapacityEnhancer.astro", import.meta.url), "utf8");

assert.match(source, /const externalPublicBoards = Object\.freeze\(\[/, "public discovery must use a bounded source directory");
assert.match(source, /Atlantic Logistics/, "current public source must be named");
assert.match(source, /https:\/\/lb\.shipatlantic\.com\/atlantic-logistics-load-board\//, "Atlantic must deep-link to its first-party board");
assert.match(source, /FreightFinder Terms prohibit automated access\/use without written permission/, "restricted public sources must be explicitly manual-only");
assert.match(source, /data-public-discovery/, "signed-in discovery surface must exist");
assert.match(source, /\/api\/hermes-connect\/account/, "discovery must check the existing Hermes session");
assert.match(source, /account\?\.success === true && account\?\.identity\?\.id/, "anonymous visitors must not receive the signed-in discovery UI");
assert.match(source, /These are source links, not copied inventory/, "source ownership boundary must be explicit");
assert.match(source, /does not scrape, import contacts, or count these sources as LIVE freight/, "no-automation and no-live-count boundary must be visible");
assert.match(source, /noopener noreferrer nofollow/, "external source links must be safe and non-endorsement");
assert.match(source, /void renderPublicDiscovery\(\)/, "discovery renderer must run on the canonical Load Board");
assert.doesNotMatch(source, /ATL-0\d{6}/, "provider load rows must not be hardcoded without redistribution rights");
assert.doesNotMatch(source, /externalPublicLoads/, "public source directory must not carry copied third-party load inventory");
assert.doesNotMatch(source, /5,850 loads/, "restricted-source aggregate counts must not be copied into the Load Board");

console.log("load-board-public-discovery-contract: signed-in source hub deep-links without scraping or copied provider inventory");
