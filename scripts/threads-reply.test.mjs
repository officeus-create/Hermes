import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publishThreadsReply } from "../functions/api/_lib/threads-brand-connector.mjs";

const core=await readFile(new URL("../functions/api/_lib/threads-brand-connector.mjs",import.meta.url),"utf8");
const reply=await readFile(new URL("../functions/api/internal/social/threads/reply.ts",import.meta.url),"utf8");

assert.equal(typeof publishThreadsReply,"function");
assert.match(core,/reply_to_id/);
assert.match(core,/replied_to,root_post/);
assert.match(reply,/threads_manage_replies/);
assert.match(reply,/threads_read_replies/);
assert.match(reply,/reply_target_must_be_inbound_reply/);
assert.match(reply,/self_reply_not_allowed/);
assert.match(reply,/reply_target_not_under_owned_root/);
assert.match(reply,/INSERT OR IGNORE INTO hermes_social_threads_publications/);
assert.match(reply,/'REPLY'/);
assert.match(reply,/idempotency_key_already_used/);
assert.match(reply,/retry_allowed:false/);
assert.match(reply,/reply_parent_mismatch/);
assert.doesNotMatch(reply,/setInterval|setTimeout|cron|schedule|bulk|mass/i);
console.log("threads bounded owned-root reply contract: PASS");
