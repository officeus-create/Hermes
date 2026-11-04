import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {laneFit,sortByLaneFit} from "../public/scripts/workspaces/carrier-lane-fit.mjs";

const prefs={originState:"IL",destinationState:"TX",equipment:"car_hauler",availableSlots:7};
const matching={id:"match",origin:"Chicago, IL",destination:"Dallas, TX",equipment:"car_hauler",vehicleCount:2};
const different={id:"mismatch",origin:"Phoenix, AZ",destination:"Miami, FL",equipment:"hotshot",vehicleCount:9};
const uncertain={id:"uncertain",origin:"Location under review",destination:"Not provided",
  equipment:null,vehicleCount:null};
const best=laneFit(matching,prefs),worst=laneFit(different,prefs),missing=laneFit(uncertain,prefs);
assert.equal(best.matching,4);
assert.equal(best.mismatched,0);
assert.equal(best.dispatchConfirmationRequired,true);
assert(worst.score < best.score);
assert.equal(worst.mismatched,4);
assert.equal(missing.unknown,4);
assert.equal(laneFit(matching,{}).configured,false);
assert.deepEqual(sortByLaneFit([different,uncertain,matching],prefs).map(x=>x.load.id),
  ["match","uncertain","mismatch"]);
assert.deepEqual(sortByLaneFit([different,matching],{}).map(x=>x.load.id),["mismatch","match"]);
assert.equal(best.details.some(x=>x.includes("within stated capacity")),true);
assert.equal(best.details.some(x=>x.includes("confirmed")),false);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const api=read("functions/api/load-board/carrier-lane-preferences.ts");
const ui=read("src/pages/services/hermes-connect/load-board/carrier/index.astro");
const client=read("public/scripts/workspaces/carrier-workspace.js");
for(const pattern of [/getAuthenticatedSpecialist/,/authorizedCarrier/,/workspaceSameOrigin/,
    /privateWorkspaceHeaders/,/carrier_company_id/,/US_STATES/,/available_slots/,
    /bookingCreated:false/,/alertsSent:false/,/sourceContacted:false/]) {
  assert.match(api,pattern);
}
assert.match(ui,/carrier-lane-preferences/);
assert.match(ui,/type="module"/);
assert.match(client,/sortByLaneFit/);
assert.match(client,/carrier-lane-preferences/);
assert(!api.includes("sender_email"),"No sourced sender identity in preference storage.");
assert(!client.includes("mailto:"),"No outbound messaging from preferences.");
execFileSync(process.execPath,["--check",decodeURIComponent(new URL("../public/scripts/workspaces/carrier-workspace.js",import.meta.url).pathname)]);
console.log("load_board_carrier_lane_preferences PASS");
