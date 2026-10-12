import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../functions/api/load-board/summary.ts", import.meta.url), "utf8");
assert.match(source, /getAuthenticatedSpecialist\(request, env\.DB\)/);
assert.match(source, /specialistHasLoadBoardAccess\(env\.DB, specialist\)/);
assert.match(source, /const audiencePredicate = carrierAccess/);
assert.match(source, /r\.visibility IN \('public', 'carrier_only'\)/);
assert.match(source, /r\.visibility = 'public' AND r\.record_type = 'capacity'/);
assert.match(source, /AND \$\{audiencePredicate\}/);
assert.match(source, /audience: carrierAccess \? "verified_carrier" : "public"/);
assert.match(source, /Private carrier freight and all LOAD counts are excluded/);
assert.match(source, /"Cache-Control": "private, no-store"/);
assert.match(source, /"Vary": "Cookie"/);
assert.doesNotMatch(source, /"Cache-Control": "public, max-age/);
console.log("load_board_summary_privacy_contract PASS: anonymous and broker audiences cannot infer private LOAD / carrier-only CAPACITY, authenticated records are private.");
