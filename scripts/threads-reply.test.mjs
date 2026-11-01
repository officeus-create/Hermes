import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reply=await readFile(new URL("../functions/api/internal/social/threads/reply.ts",import.meta.url),"utf8");
const publish=await readFile(new URL("../functions/api/internal/social/threads/publish.ts",import.meta.url),"utf8");
const page=await readFile(new URL("../src/pages/services/hermes-connect/internal/social-connections/threads-research.astro",import.meta.url),"utf8");

// Pages is approval/UI only. It must not decrypt Threads credentials or read/write
// Meta directly; HAE owns exact provider proof and eventual external execution.
assert.match(reply,/HERMES_AUTOMATION_BASE_URL/);
assert.match(reply,/HERMES_AUTOMATION_TOKEN/);
assert.match(reply,/haeJson\(env,"\/v1\/social-reply-preflight"/);
assert.match(reply,/safe_to_submit_job/);
assert.match(reply,/provider_write_performed !== false/);
assert.match(reply,/haeJson\(env,"\/v1\/jobs"/);
assert.match(reply,/job_type:"social\.reply\.prepare"/);
assert.match(reply,/business_lane:businessLane/);
assert.match(reply,/const businessLane="PROGRESSOPRO"/);
assert.match(reply,/max_attempts:1/);
assert.match(reply,/policy_version:"social-inbound-v1"/);
assert.match(reply,/approval_class:"OWNER_APPROVED"/);
assert.match(reply,/hae_social_reply_prepare_capability_not_ready/);
assert.match(reply,/preflight_verified:true/);
assert.match(reply,/provider_write_performed:false/);
assert.match(reply,/outcome:"queued_to_hae_prepare"/);
assert.match(reply,/published:false/);
assert.match(reply,/retry_allowed:false/);
assert.match(reply,/technical_canary_reply_handoff_not_supported/);

for(const forbidden of [
  /publishThreadsReply/,
  /readThreadsMedia/,
  /usableThreadsAccessToken/,
  /decryptThreadsTokenPayload/,
  /THREADS_BRAND_TOKEN_KEY/,
  /INSERT OR IGNORE INTO hermes_social_threads_publications/,
  /UPDATE hermes_social_threads_publications/,
  /status='published_readback_pending'/,
  /setInterval|setTimeout|cron|schedule|bulk|mass/i,
]){
  assert.doesNotMatch(reply,forbidden);
}

// UI must send the exact owned root ID into HAE preflight and must not offer the
// technical canary as a reply execution lane.
assert.match(page,/root_post_id:String\(post\.root_post_id\|\|post\.replied_to_id\|\|""\)/);
assert.match(page,/if\(val\("brand"\)!=="progressopro"\)return false/);
assert.match(page,/Approved reply queued to HAE/);
assert.doesNotMatch(page,/ProgressoPro · Academy\/training/);

// Legacy authored-post endpoint is disabled so the brand connector cannot become
// a second writer beside Social Studio / HAE.
assert.match(publish,/legacy_threads_brand_direct_publish_disabled/);
assert.match(publish,/provider_write_performed:false/);
assert.match(publish,/runtime_owner:"hae_2033"/);
assert.match(publish,/next_action:"use_owner_social_studio_or_approved_hae_job"/);
assert.doesNotMatch(publish,/publishThreadsText|readThreadsMedia|INSERT OR IGNORE INTO hermes_social_threads_publications|UPDATE hermes_social_threads_publications/);

console.log("threads reply handoff contract: PASS — Pages approval -> HAE preflight -> HAE job only");
