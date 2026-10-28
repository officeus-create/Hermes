import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const core=await readFile(new URL("../functions/api/_lib/threads-brand-connector.mjs",import.meta.url),"utf8");
const reply=await readFile(new URL("../functions/api/internal/social/threads/reply.ts",import.meta.url),"utf8");
const publish=await readFile(new URL("../functions/api/internal/social/threads/publish.ts",import.meta.url),"utf8");

assert.match(core,/reply_to_id/);
assert.match(core,/replied_to,root_post/);

// The owner endpoint may prove scope/identity/ownership, but it must not become a
// second provider writer. External reply execution is delegated to HAE only.
assert.match(reply,/threads_content_publish/);
assert.match(reply,/threads_manage_replies/);
assert.match(reply,/threads_read_replies/);
assert.match(reply,/reply_target_must_be_inbound_reply/);
assert.match(reply,/self_reply_not_allowed/);
assert.match(reply,/reply_target_not_under_owned_root/);
assert.match(reply,/brand_key='office_test' AND object_type='AUTHORED_POST' AND status='published'/);
assert.match(publish,/brand_key='office_test' AND object_type='AUTHORED_POST' AND status='published'/);

assert.match(reply,/HERMES_AUTOMATION_BASE_URL/);
assert.match(reply,/HERMES_AUTOMATION_TOKEN/);
assert.match(reply,/new URL\("\/v1\/jobs"/);
assert.match(reply,/job_type:"social\.reply"/);
assert.match(reply,/business_lane:businessLane/);
assert.match(reply,/max_attempts:1/);
assert.match(reply,/policy_version:"social-inbound-v1"/);
assert.match(reply,/approval_class:"OWNER_APPROVED"/);
assert.match(reply,/hae_social_reply_capability_not_ready/);
assert.match(reply,/provider_write_performed:false/);
assert.match(reply,/outcome:"queued_to_hae"/);
assert.match(reply,/published:false/);
assert.match(reply,/retry_allowed:false/);

assert.doesNotMatch(reply,/publishThreadsReply/);
assert.doesNotMatch(reply,/INSERT OR IGNORE INTO hermes_social_threads_publications/);
assert.doesNotMatch(reply,/UPDATE hermes_social_threads_publications/);
assert.doesNotMatch(reply,/status='published_readback_pending'/);
assert.doesNotMatch(reply,/setInterval|setTimeout|cron|schedule|bulk|mass/i);

// Legacy direct authored-post endpoint remains a separate donor surface and still
// has its own idempotency protections; this test does not authorize it for HAE.
assert.match(publish,/idempotency_key_scope_conflict/);
assert.match(publish,/object_type \|\| ""\) === "AUTHORED_POST"/);

console.log("threads reply handoff contract: PASS — owner proof -> HAE only, no direct Meta write");
