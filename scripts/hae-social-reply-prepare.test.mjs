import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  runSocialReplyPrepare,
  validateSocialReplyPrepareInput,
} from "../workers/automation-engine/src/social-reply-prepare.mjs";

const accountId="28419597014385166";
const rootId="18170000000000001";
const replyId="18180000000000001";
const input={
  platform:"threads",
  business_lane:"HERMES_LOGISTICS",
  reply_to_id:replyId,
  root_post_id:rootId,
  text:"Thanks for the question.",
  requested_by:"owner-1",
  approval_class:"OWNER_APPROVED",
  source:"threads_owned_reply",
  text_fingerprint:"sha256:synthetic",
};

assert.equal(validateSocialReplyPrepareInput(input).business_lane,"HERMES_LOGISTICS");
assert.throws(()=>validateSocialReplyPrepareInput({...input,business_lane:"ACADEMY"}),/social_business_lane_invalid/);
assert.throws(()=>validateSocialReplyPrepareInput({...input,approval_class:"AI_APPROVED"}),/social_reply_owner_approval_required/);
assert.throws(()=>validateSocialReplyPrepareInput({...input,source:"keyword_search"}),/social_reply_source_not_allowed/);
assert.throws(()=>validateSocialReplyPrepareInput({...input,platform:"facebook"}),/social_reply_platform_not_allowed/);

const calls=[];
const responses=[
  {id:accountId,username:"hermes.logistics"},
  {
    id:replyId,username:"carrier.owner",text:"Do you dispatch car haulers?",
    timestamp:"2026-10-29T01:00:00Z",media_type:"TEXT_POST",is_reply:true,
    replied_to:{id:rootId},root_post:{id:rootId},
    permalink:"https://www.threads.com/@carrier.owner/post/Inbound1",
  },
  {
    id:rootId,username:"hermes.logistics",text:"Carrier dispatch discussion",
    timestamp:"2026-10-29T00:00:00Z",media_type:"TEXT_POST",is_reply:false,
    permalink:"https://www.threads.com/@hermes.logistics/post/Root1",
  },
];
const fetchImpl=async(url,options={})=>{
  calls.push({url:String(url),options});
  const payload=responses.shift();
  if(!payload) throw new Error("unexpected_fetch");
  return {ok:true,status:200,json:async()=>payload};
};
const result=await runSocialReplyPrepare({
  HERMES_THREADS_META_ACCOUNT_ID:accountId,
  HERMES_THREADS_ACCESS_TOKEN:"synthetic-hermes-logistics-access-token",
},input,{nowMs:Date.parse("2026-10-29T02:00:00Z"),fetchImpl});

assert.equal(result.capability,"social.reply.prepare");
assert.equal(result.permission_class,"DRAFT_ONLY");
assert.equal(result.external_write,false);
assert.equal(result.provider_write_performed,false);
assert.equal(result.draft_status,"PREPARED_FOR_EXPLICIT_WRITE_GATE");
assert.equal(result.provider_readback_verified,true);
assert.equal(result.reply_to_id,replyId);
assert.equal(result.root_post_id,rootId);
assert.equal(result.next_action,"explicit_social_reply_write_capability_review");
assert.equal(calls.length,3);
assert.ok(calls.every(call=>String(call.options?.method||"GET").toUpperCase()!=="POST"));
assert.ok(calls.every(call=>!new URL(call.url).searchParams.has("access_token")));

const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/const DRAFT_ONLY_GENERIC_JOB_TYPES = new Set\(\[/);
assert.match(worker,/"social\.reply\.prepare"/);
assert.match(worker,/draft_only_max_attempts_must_be_one/);
assert.match(worker,/validateSocialReplyPrepareInput\(payload\)/);
assert.match(worker,/social_reply_business_lane_mismatch/);
assert.match(worker,/runSocialReplyPrepare\(env, payload\)/);
assert.doesNotMatch(worker,/"social\.reply",\s*\n/);

console.log("HAE social.reply.prepare PASS — durable draft-only capability, provider reads only, no Threads write");
