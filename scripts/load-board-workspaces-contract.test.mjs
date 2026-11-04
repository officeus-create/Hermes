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
 execFileSync(process.execPath,["--check",decodeURIComponent(new URL("../public/scripts/workspaces/"+script+".js",import.meta.url).pathname)]);
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
  workspaceLib:read("functions/api/_lib/carrier-dispatch-workspace.mjs"),
};
assert.match(scripted.carrier,/authorizedCarrier/);
assert.match(scripted.carrier,/verifiedAssignment/);
assert.match(scripted.carrier,/meta\?\.changes/);
assert.match(scripted.carrier,/queueState:"newly_queued"/);
assert.match(scripted.carrier,/queueState:"existing_pending"/);
assert.match(scripted.carrier,/existing_request_terminal/);
assert.match(scripted.carrier,/existing_request_dispatcher_changed/);
assert.match(scripted.carrier,/queuedForDispatcher:false/);
assert.match(scripted.dispatcher,/dispatcher_specialist_id/);
for(const key of ["active","opportunities","plan"]){
 assert.match(scripted[key],/r\.visibility='public' AND s\.redistribution_permission='public'/,
   key+" must require public/public for any broader visibility path");
 assert.match(scripted[key],/r\.visibility='carrier_only' AND s\.redistribution_permission IN/,
   key+" must pair restricted record visibility with source redistribution permission");
}
assert.match(scripted.admin,/specialistHasInternalOwnerCapability/);
assert.match(scripted.admin,/identityVerified/);
assert.match(scripted.workspaceLib,/PENDING_CONTRACT/);
assert.match(scripted.workspaceLib,/TRIAL_ACTIVE/);
assert.match(scripted.workspaceLib,/ONGOING_EFFECTIVE/);
assert.match(scripted.workspaceLib,/authority_status!==\"verified\"/);
assert.match(scripted.workspaceLib,/insurance_status!==\"verified\"/);
assert.match(scripted.workspaceLib,/source_rights_status!==\"verified\"/);
assert.match(scripted.workspaceLib,/verifiedAssignment\(db,company\.id\)/,
  "Restricted carrier access must require an active assigned dispatcher.");
assert.match(scripted.admin,/effective_agreement_state_required/);
assert.match(scripted.admin,/signed_agreement_authority_insurance_source_rights_evidence_required/);
assert.match(scripted.admin,/no_automatic_continuation_confirmation_required/);
assert.match(scripted.admin,/trial_not_current_or_not_14_days/);
assert.match(scripted.admin,/trialStartDate>now\.slice/,"Future trials must not grant early access.");
assert.match(scripted.admin,/effectiveMs>Date\.now/,"Future ongoing effective timestamps must fail closed.");
assert.match(scripted.workspaceLib,/trial_start_date\)\<=today/,"Runtime trial access must not begin before the trial start date.");
assert.match(scripted.workspaceLib,/effectiveAtMs\<=now\.getTime/,"Runtime ongoing access must not begin before the effective timestamp.");
assert.match(scripted.workspaceLib,/no_auto_continuation_confirmed/,"Trial no-auto-continuation confirmation must be durable.");
assert.match(scripted.workspaceLib,/validDateOnly/,"Runtime must reject impossible calendar dates.");
assert.match(scripted.workspaceLib,/expectedTrialEnd/,"Runtime must re-prove the exact 14-day trial window.");
assert.match(scripted.workspaceLib,/draft\|review/i,"Runtime must reject draft/review agreement versions.");
assert.match(scripted.admin,/noAutomaticContinuationConfirmed:Boolean/,"Owner readback must expose durable trial continuation evidence.");
assert.match(scripted.admin,/no_auto_continuation_confirmed=excluded\.no_auto_continuation_confirmed/,"Grant must persist trial continuation evidence.");
assert.match(scripted.admin,/Number\(entitlement\?\.no_auto_continuation_confirmed\)===1/,"Assignment must revalidate no-auto-continuation evidence.");
assert.match(scripted.admin,/expectedTrialEnd/,"Assignment must revalidate the exact 14-day trial window.");
assert.match(scripted.admin,/CARRIER_REVOKED/);
assert.match(scripted.admin,/effective_carrier_agreement_and_verification_required/);
assert.doesNotMatch(scripted.admin,/agreementState.*=\s*["']ONGOING_EFFECTIVE["']/,
  "No automatic post-trial conversion may be encoded.");
assert.match(scripted.access,/authorizedCarrier/);
for(const key of ["active","opportunities","plan"]){
 assert.match(scripted[key],/authorizedCarrier/);
 assert.match(scripted[key],/redistribution_permission/);
 assert.match(scripted[key],/carrier_only/);
}
assert.match(scripted.active,/r\.record_type = 'capacity' AND r\.visibility = 'public'/,
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
