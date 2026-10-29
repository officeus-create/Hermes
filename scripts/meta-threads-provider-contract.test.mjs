import assert from "node:assert/strict";
import {
  META_THREADS_GRAPH_BASE,
  createMetaThreadsTransport,
  normalizeThreadsText,
  safeThreadsPermalink,
} from "../shared/social/meta-threads-provider.mjs";

const accountId="28419597014385166";
const username="hermes.logistics";
const token="synthetic-meta-token-testing-only-not-real";
const calls=[];

function response(payload,status=200){
  return {ok:status>=200&&status<300,status,json:async()=>payload};
}
const queue=[
  response({id:accountId,username}),
  response({data:[{
    id:"18190933357397406",
    text:"Older carrier post",
    permalink:"https://www.threads.com/@hermes.logistics/post/Dd2dlMnjCwo",
    timestamp:"2026-10-28T05:00:00Z",
    media_type:"TEXT_POST",
  }]}),
  response({id:"18190000000000001"}),
  response({id:"18190000000000002"}),
  response({id:"18190000000000003"}),
  response({
    id:"18190000000000003",
    media_product_type:"THREADS",
    media_type:"TEXT_POST",
    permalink:"https://www.threads.com/@hermes.logistics/post/Reply123",
    username,
    text:"Thanks for asking.",
    timestamp:"2026-10-29T01:00:00Z",
    is_reply:true,
    replied_to:{id:"18180000000000001"},
    root_post:{id:"18170000000000001"},
  }),
];
async function fetchImpl(url,options={}){
  calls.push({url:String(url),options});
  const next=queue.shift();
  if(!next) throw new Error("unexpected_fetch");
  return next;
}

const transport=createMetaThreadsTransport({accessToken:token,accountId,expectedUsername:username,fetchImpl});
assert.ok(transport);
assert.equal(META_THREADS_GRAPH_BASE,"https://graph.threads.net/v1.0/");
assert.equal(normalizeThreadsText("  hello\r\nworld  "),"hello\nworld");
assert.equal(safeThreadsPermalink("https://www.threads.com/@hermes.logistics/post/A"),"https://www.threads.com/@hermes.logistics/post/A");
assert.equal(safeThreadsPermalink("https://evil.invalid/post/A"),null);

assert.deepEqual(await transport.verifyIdentity(),{ok:true,account_id:accountId,username});
const recent=await transport.listRecentAuthored({limit:50});
assert.equal(recent.ok,true);
assert.equal(recent.rows.length,1);

const authored=await transport.publishText("Carrier availability update");
assert.equal(authored.ok,true);
assert.equal(authored.provider_object_id,"18190000000000002");

const reply=await transport.publishReply({text:"Thanks for asking.",replyToId:"18180000000000001"});
assert.equal(reply.ok,true);
assert.equal(reply.provider_object_id,"18190000000000003");
assert.equal(reply.reply_to_id,"18180000000000001");

const media=await transport.readMedia(reply.provider_object_id);
assert.equal(media.ok,true);
assert.equal(media.media.is_reply,true);
assert.equal(media.media.replied_to.id,"18180000000000001");
assert.equal(media.media.root_post.id,"18170000000000001");

assert.ok(calls.length>=6);
for(const call of calls){
  const url=new URL(call.url);
  assert.equal(url.hostname,"graph.threads.net");
  assert.equal(url.searchParams.has("access_token"),false);
  assert.equal(call.options?.headers?.authorization,"Bearer "+token);
}
const replyCall=calls.find(call=>String(call.options?.body||"").includes("reply_to_id="));
assert.ok(replyCall);
assert.match(String(replyCall.options.body),/auto_publish_text=true/);
assert.match(String(replyCall.options.body),/reply_to_id=18180000000000001/);

assert.equal(createMetaThreadsTransport({
  accessToken:"short",accountId,expectedUsername:username,fetchImpl,
}),null);
assert.equal(createMetaThreadsTransport({
  accessToken:token,accountId:"wrong",expectedUsername:username,fetchImpl,
}),null);

console.log("shared Meta Threads provider PASS — identity, authored publish, reply, readback, no token in URL");
