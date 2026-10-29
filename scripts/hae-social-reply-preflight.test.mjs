import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { socialReplyPreflight } from "../workers/automation-engine/src/social-reply-preflight.mjs";

const accountId="28419597014385166";
const own="hermes.logistics";
const env={
  HERMES_THREADS_META_ACCOUNT_ID:accountId,
  HERMES_THREADS_ACCESS_TOKEN:"synthetic-hermes-logistics-access-token",
};

function response(payload,status=200){
  return {ok:status>=200&&status<300,status,json:async()=>payload};
}
function fetchSequence(items,calls){
  let i=0;
  return async(url,options={})=>{
    calls.push({url:String(url),options});
    const next=items[i++];
    if(!next) throw new Error("unexpected_fetch");
    return next;
  };
}
const targetId="18180000000000001";
const rootId="18170000000000001";
const text="Thanks for the question.";

{
  const calls=[];
  const fetchImpl=fetchSequence([
    response({id:accountId,username:own}),
    response({
      id:targetId,username:"carrier.owner",text:"Do you dispatch car haulers?",
      timestamp:"2026-10-29T01:00:00Z",media_type:"TEXT_POST",is_reply:true,
      replied_to:{id:rootId},root_post:{id:rootId},
      permalink:"https://www.threads.com/@carrier.owner/post/Inbound1",
    }),
    response({
      id:rootId,username:own,text:"Carrier dispatch discussion",
      timestamp:"2026-10-29T00:00:00Z",media_type:"TEXT_POST",is_reply:false,
      permalink:"https://www.threads.com/@hermes.logistics/post/Root1",
    }),
  ],calls);
  const result=await socialReplyPreflight(env,{
    business_lane:"HERMES_LOGISTICS",
    reply_to_id:targetId,
    root_post_id:rootId,
    text,
  },{fetchImpl});
  assert.equal(result.ok,true);
  assert.equal(result.safe_to_submit_job,true);
  assert.equal(result.account_key,"hermes_logistics");
  assert.equal(result.provider_readback_verified,true);
  assert.equal(result.provider_write_performed,false);
  assert.equal(calls.length,3);
  assert.ok(calls.every(call=>String(call.options?.method||"GET").toUpperCase()!=="POST"));
  assert.ok(calls.every(call=>!new URL(call.url).searchParams.has("access_token")));
}

{
  const calls=[];
  const fetchImpl=fetchSequence([
    response({id:accountId,username:own}),
    response({
      id:targetId,username:own,text:"self",
      timestamp:"2026-10-29T01:00:00Z",media_type:"TEXT_POST",is_reply:true,
      root_post:{id:rootId},
    }),
  ],calls);
  const result=await socialReplyPreflight(env,{
    business_lane:"HERMES_LOGISTICS",reply_to_id:targetId,root_post_id:rootId,text,
  },{fetchImpl});
  assert.equal(result.ok,false);
  assert.equal(result.error_class,"social_reply_self_reply_not_allowed");
  assert.equal(result.provider_write_performed,false);
  assert.equal(calls.length,2);
}

{
  const calls=[];
  const fetchImpl=fetchSequence([
    response({id:accountId,username:own}),
    response({
      id:targetId,username:"carrier.owner",text:"question",
      timestamp:"2026-10-29T01:00:00Z",media_type:"TEXT_POST",is_reply:true,
      root_post:{id:"18170000000000009"},
    }),
  ],calls);
  const result=await socialReplyPreflight(env,{
    business_lane:"HERMES_LOGISTICS",reply_to_id:targetId,root_post_id:rootId,text,
  },{fetchImpl});
  assert.equal(result.ok,false);
  assert.equal(result.error_class,"social_reply_root_mismatch");
  assert.equal(result.provider_write_performed,false);
}

assert.equal((await socialReplyPreflight(env,{
  business_lane:"ACADEMY",reply_to_id:targetId,root_post_id:rootId,text,
})).error_class,"social_business_lane_invalid");
assert.equal((await socialReplyPreflight(env,{
  business_lane:"HERMES_LOGISTICS",reply_to_id:"bad",root_post_id:rootId,text,
})).error_class,"social_reply_target_invalid");

const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/POST" && url\.pathname === "\/v1\/social-reply-preflight"/);
assert.match(worker,/socialReplyPreflight\(env, body\)/);

console.log("HAE social reply preflight PASS — provider-read only, owned root, self/root negatives, no POST");
