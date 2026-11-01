import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  socialAcquisitionV2Enabled,
  socialAcquisitionWritesEnabled,
  verifySocialSourcePage,
} from "../workers/automation-engine/src/social-hourly-runtime.mjs";

assert.equal(socialAcquisitionV2Enabled({}),false);
assert.equal(socialAcquisitionV2Enabled({HERMES_SOCIAL_ACQUISITION_V2:"enabled"}),true);
assert.equal(socialAcquisitionWritesEnabled({
  HERMES_SOCIAL_ACQUISITION_V2:"enabled",
  HERMES_AUTOMATION_MODE:"live",
  HERMES_AUTOMATION_PUBLISH:"enabled",
}),true);
assert.equal(socialAcquisitionWritesEnabled({
  HERMES_SOCIAL_ACQUISITION_V2:"enabled",
  HERMES_AUTOMATION_MODE:"dry_run",
  HERMES_AUTOMATION_PUBLISH:"enabled",
}),false);

function sourceResponse({status=200,contentType="text/html; charset=utf-8",body="<!doctype html><html><body>"+("verified source ".repeat(30))+"</body></html>"}={}){
  return {
    ok:status>=200&&status<300,
    status,
    headers:{get:(name)=>String(name).toLowerCase()==="content-type"?contentType:null},
    async text(){return body;},
  };
}
const validSource="https://hermeslogisticsus.com/logistics/car-hauling-dispatch/?utm_source=threads&utm_medium=organic_social";
assert.equal((await verifySocialSourcePage(
  {destination_url:validSource,body:"Current source "+validSource},
  {fetchImpl:async()=>sourceResponse()},
)).ok,true);
let externalFetches=0;
assert.equal((await verifySocialSourcePage(
  {destination_url:"https://example.com/path",body:"https://example.com/path"},
  {fetchImpl:async()=>{externalFetches+=1;return sourceResponse();}},
)).error_class,"social_source_not_canonical");
assert.equal(externalFetches,0);
assert.equal((await verifySocialSourcePage(
  {destination_url:validSource,body:"missing tracked URL"},
  {fetchImpl:async()=>sourceResponse()},
)).error_class,"social_source_link_mismatch");
assert.equal((await verifySocialSourcePage(
  {destination_url:validSource,body:"Current source "+validSource},
  {fetchImpl:async()=>sourceResponse({status:302})},
)).error_class,"social_source_http_status");
assert.equal((await verifySocialSourcePage(
  {destination_url:validSource,body:"Current source "+validSource},
  {fetchImpl:async()=>sourceResponse({contentType:"application/json"})},
)).error_class,"social_source_not_html");
assert.equal((await verifySocialSourcePage(
  {destination_url:validSource,body:"Current source "+validSource},
  {fetchImpl:async()=>{throw new Error("network");}},
)).error_class,"social_source_readback_unavailable");

const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
const runtime=await readFile(new URL("../workers/automation-engine/src/social-hourly-runtime.mjs",import.meta.url),"utf8");
const factory=await readFile(new URL("../workers/automation-engine/src/social-content-factory.mjs",import.meta.url),"utf8");
const businessSocial=await readFile(new URL("../functions/api/_lib/business-social.mjs",import.meta.url),"utf8");
const businessStudio=await readFile(new URL("../functions/api/_lib/business-social-studio.mjs",import.meta.url),"utf8");
const wrangler=await readFile(new URL("../workers/automation-engine/wrangler.jsonc.example",import.meta.url),"utf8");

assert.match(worker,/socialAcquisitionV2Enabled/);
assert.match(worker,/enqueueHourlySocialPlans/);
assert.match(worker,/messageType === "social\.threads\.plan"/);
assert.match(worker,/messageType === "social\.threads\.readback"/);
assert.match(worker,/url\.pathname === "\/v1\/social-account-readiness"/);
assert.match(worker,/cron\.social_v2_enqueue_failed/);
assert.match(worker,/cron\.social_v2_readback_recovery_failed/);
assert.match(worker,/social_business_lanes: \["HERMES_LOGISTICS", "PROGRESSOPRO"\]/);
assert.match(worker,/social_platforms: \["threads", "instagram", "facebook", "x"\]/);

assert.match(runtime,/HERMES_SOCIAL_ACQUISITION_V2/);
assert.match(runtime,/HERMES_AUTOMATION_MODE/);
assert.match(runtime,/HERMES_AUTOMATION_PUBLISH/);
assert.match(runtime,/unresolved_previous_publication/);
assert.match(runtime,/verifySocialSourcePage/);
assert.match(runtime,/social_source_not_canonical/);
assert.match(runtime,/social_source_link_mismatch/);
assert.match(runtime,/social_source_readback_unavailable/);
assert.match(runtime,/meta_threads_history_incomplete/);
assert.match(runtime,/meta_threads_duplicate_existing_post/);
assert.match(runtime,/meta_threads_recent_authored_cooldown/);
assert.match(runtime,/publication\.provider_claimed/);
assert.match(runtime,/provider_accepted_readback_pending/);
assert.match(runtime,/unknown_outcome_readback_pending/);
assert.match(runtime,/published_verified/);
assert.match(runtime,/pluginRuntimeVersion/);
assert.match(runtime,/social\.plugin_policy_bound/);
assert.match(runtime,/hermes-agent-coordinator/);
assert.match(runtime,/hermes-marketing-growth/);
assert.match(runtime,/social_plugin_policy_version_missing/);
assert.doesNotMatch(runtime,/WINDSOR_API_KEY/);
assert.doesNotMatch(runtime,/access_token/);

assert.match(factory,/DRAFT_REQUIRES_MEDIA/);
assert.match(factory,/HOLD_PAID_PROVIDER/);
assert.match(factory,/utm_medium/);
assert.match(factory,/organic_social/);
assert.doesNotMatch(factory,/guaranteed revenue|guaranteed loads|guaranteed results/i);

assert.match(businessSocial,/shared\/social\/meta-threads-provider\.mjs/);
assert.match(businessStudio,/shared\/social\/meta-threads-provider\.mjs/);
assert.doesNotMatch(businessStudio,/graph\.threads\.com\/v1\.0/);
assert.doesNotMatch(businessStudio,/access_token.*threads_publish/s);
assert.match(businessStudio,/verifyIdentity\(\)/);
assert.match(wrangler,/"HERMES_SOCIAL_ACQUISITION_V2": "disabled"/);
assert.doesNotMatch(wrangler,/"HERMES_SOCIAL_ACQUISITION_V2": "enabled"/);

console.log("social hourly HAE runtime contract PASS — V2 feature gate, one HAE, two lanes, readback and provider holds");
