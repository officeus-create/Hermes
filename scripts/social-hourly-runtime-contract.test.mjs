import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  socialAcquisitionV2Enabled,
  socialAcquisitionWritesEnabled,
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
assert.match(runtime,/meta_threads_history_incomplete/);
assert.match(runtime,/meta_threads_duplicate_existing_post/);
assert.match(runtime,/meta_threads_recent_authored_cooldown/);
assert.match(runtime,/publication\.provider_claimed/);
assert.match(runtime,/provider_accepted_readback_pending/);
assert.match(runtime,/unknown_outcome_readback_pending/);
assert.match(runtime,/published_verified/);
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
