import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  CARRIER_TYPES,PARTNER_TYPES,carrierSafeLoad,workspaceSameOrigin,authorizedCarrier,
} from "../functions/api/_lib/carrier-dispatch-workspace.mjs";

const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const pageRoot="src/pages/services/hermes-connect/load-board/";
for(const [name,script] of Object.entries({
  carrier:"carrier-workspace",dispatcher:"dispatcher-workspace",
  partners:"partner-workspace",operations:"dispatch-admin",
})){
 const page=read(pageRoot+name+"/index.astro");
 assert.match(page,/noindex,nofollow/);
 assert.match(page,new RegExp("/scripts/workspaces/"+script+"\\.js"));
 execFileSync(process.execPath,["--check",new URL("../public/scripts/workspaces/"+script+".js",import.meta.url).pathname]);
}
assert(CARRIER_TYPES.has("carrier")&&CARRIER_TYPES.has("fleet")&&CARRIER_TYPES.has("owner_operator"));
assert(!CARRIER_TYPES.has("broker")&&!CARRIER_TYPES.has("dealer"));
assert(PARTNER_TYPES.has("dealer")&&PARTNER_TYPES.has("shipper"));
assert(!workspaceSameOrigin(new Request("https://example.org/",{headers:{"Origin":"https://evil.invalid"}})));
assert(workspaceSameOrigin(new Request("https://example.org/",{headers:{"Origin":"https://example.org"}})));

const view=carrierSafeLoad({id:"hlr_1",origin_city:"Chicago",origin_state:"IL",
 destination_city:"Dallas",destination_state:"TX",equipment:"car_hauler",
 vehicle_count:2,pickup_window:null,rate_amount:1500,rate_currency:"USD",
 distance_miles:912,observed_at:"2026-10-11T00:00:00Z",expires_at:"2026-10-12T00:00:00Z",
 source_name:"SECRET DEALER",provider_url:"https://private.example",origin_zip:"60101",
 contact_phone:"1234567890",visibility:"carrier_only"});
assert(!JSON.stringify(view).includes("SECRET DEALER"));
assert(!JSON.stringify(view).includes("private.example"));
assert(!JSON.stringify(view).includes("60101"));
assert(!JSON.stringify(view).includes("1234567890"));
assert.equal(view.bookingAvailable,false);

const scripted={
  carrier:read("functions/api/load-board/carrier-workspace.ts"),
  dispatcher:read("functions/api/load-board/dispatcher-workspace.ts"),
  admin:read("functions/api/load-board/dispatch-admin.ts"),
  access:read("functions/api/_lib/hermes-company-profiles.mjs"),
  active:read("functions/api/load-board/active.ts"),
  opportunities:read("functions/api/load-board/opportunities.ts"),
  plan:read("functions/api/load-board/dispatch-plan.ts"),
  interest:read("functions/api/load-board/interest.ts"),
  dealers:read("functions/api/load-board/posts.ts"),
};
assert.match(scripted.carrier,/authorizedCarrier/);
assert.match(scripted.carrier,/verifiedAssignment/);
assert.match(scripted.dispatcher,/dispatcher_specialist_id/);
assert.match(scripted.admin,/specialistHasInternalOwnerCapability/);
assert.match(scripted.admin,/identityVerified/);
assert.match(scripted.access,/entitlement==='active'/);
for(const key of ["active","opportunities","plan"]){
 assert.match(scripted[key],/specialistHasLoadBoardAccess/);
 assert.match(scripted[key],/redistribution_permission/);
 assert.match(scripted[key],/carrier_only/);
}
assert.match(scripted.active,/r\\.record_type = 'capacity' AND r\\.visibility = 'public'/,
  "Guests and brokers cannot read any live LOAD record through the active feed.");
assert.match(scripted.opportunities,/no freight inventory for guest or broker/,
  "Guests and brokers cannot read real LOAD records through opportunities.");
assert.match(scripted.interest,/carrierPost/);
assert.match(scripted.dealers,/rights_attested/);

const calls=[];
const db={
 prepare(sql){calls.push(sql);return {
   run:async()=>({}),
   all:async()=>({results:[]}),
   bind(...args){return {
     run:async()=>({}),
     all:async()=>({results:[]}),
     first:async()=>sql.includes("SELECT c.id,c.company_name")?
       {id:"c_1",company_type:"carrier",company_name:"Test",load_board_access:1,entitlement_status:"revoked"}:null,
   }}};
 }};
assert.equal(await authorizedCarrier(db,{id:"owner_1"}),null);
assert(calls.some(sql=>sql.includes("hermes_carrier_board_entitlements")));
console.log("load_board_workspaces_contract PASS");
