import assert from "node:assert/strict";
import {
  META_THREADS_GRAPH_BASE,
  createMetaThreadsTransport,
  normalizeThreadsText,
  safeThreadsPermalink,
  validateThreadsText,
} from "../shared/social/meta-threads-provider.mjs";

const accountId="28419597014385166";
const username="hermes.logistics";
const token="synthetic-meta-token-testing-only-not-real";

function response(payload,status=200){
  return {ok:status>=200&&status<300,status,json:async()=>payload};
}
function row(id,index=0){
  return {
    id:String(id),
    text:"Older carrier post "+index,
    permalink:"https://www.threads.com/@hermes.logistics/post/P"+index,
    timestamp:new Date(Date.parse("2026-10-20T05:00:00Z")+index*1000).toISOString(),
    media_type:"TEXT_POST",
    username,
  };
}

const calls=[];
const queue=[
  response({id:accountId,username}),
  response({data:[row("18190933357397406",1)]}),
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
assert.equal(validateThreadsText("A".repeat(500)).ok,true);
assert.equal(validateThreadsText("A".repeat(501)).error_class,"meta_threads_text_too_long");
assert.equal(validateThreadsText("😀".repeat(126)).error_class,"meta_threads_text_too_long");
assert.equal(safeThreadsPermalink("https://www.threads.com/@hermes.logistics/post/A"),"https://www.threads.com/@hermes.logistics/post/A");
assert.equal(safeThreadsPermalink("https://evil.invalid/post/A"),null);

assert.deepEqual(await transport.verifyIdentity(),{ok:true,account_id:accountId,username});
const recent=await transport.listRecentAuthored({limit:50});
assert.equal(recent.ok,true);
assert.equal(recent.complete,true);
assert.equal(recent.history_exhausted,true);
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

for(const call of calls){
  const url=new URL(call.url);
  assert.equal(url.hostname,"graph.threads.net");
  assert.equal(url.searchParams.has("access_token"),false);
  assert.equal(call.options?.headers?.authorization,"Bearer "+token);
}
const replyCall=calls.find(call=>String(call.options?.body||"").includes("reply_to_id="));
assert.ok(replyCall);
assert.match(String(replyCall.options.body),/auto_publish_text=true/);

// Regression: approved payloads are never silently truncated before a provider write.
let overlongCalls=0;
const overlong=createMetaThreadsTransport({
  accessToken:token,accountId,expectedUsername:username,
  fetchImpl:async()=>{overlongCalls+=1;return response({});},
});
assert.equal((await overlong.publishText("A".repeat(501))).error_class,"meta_threads_text_too_long");
assert.equal((await overlong.publishText("😀".repeat(126))).error_class,"meta_threads_text_too_long");
assert.equal(overlongCalls,0);

// Regression: a partial first page must be paginated before it can be called complete.
const first30=Array.from({length:30},(_,i)=>row(String(18191000000000000n+BigInt(i)),i));
const next20=Array.from({length:20},(_,i)=>row(String(18192000000000000n+BigInt(i)),30+i));
let pageCall=0;
const paginated=createMetaThreadsTransport({
  accessToken:token,accountId,expectedUsername:username,
  fetchImpl:async(url)=>{
    pageCall+=1;
    const parsed=new URL(url);
    if(pageCall===1){
      assert.equal(parsed.searchParams.get("after"),null);
      return response({data:first30,paging:{cursors:{after:"cursor-1"},next:"https://graph.threads.net/v1.0/me/threads?after=cursor-1"}});
    }
    assert.equal(parsed.searchParams.get("after"),"cursor-1");
    return response({data:next20,paging:{cursors:{}}});
  },
});
const paged=await paginated.listRecentAuthored({limit:50});
assert.equal(paged.ok,true);
assert.equal(paged.complete,true);
assert.equal(paged.rows.length,50);
assert.equal(pageCall,2);

const incomplete=createMetaThreadsTransport({
  accessToken:token,accountId,expectedUsername:username,
  fetchImpl:async()=>response({data:first30,paging:{next:"https://graph.threads.net/v1.0/me/threads?after=missing-cursor"}}),
});
const incompleteResult=await incomplete.listRecentAuthored({limit:50});
assert.equal(incompleteResult.ok,false);
assert.equal(incompleteResult.error_class,"meta_threads_history_incomplete");

assert.equal(createMetaThreadsTransport({accessToken:"short",accountId,expectedUsername:username,fetchImpl}),null);
// Read-only Social Inbox primitives: mentions/search/replies/conversation.
const discoveryCalls=[];
const discoveryQueue=[
  response({data:[{...row("18193000000000001",51),username:"carrier.owner",is_reply:false}],paging:{}}),
  response({data:[{...row("18193000000000002",52),username:"dealer.group",is_reply:false}]}),
  response({data:[{...row("18193000000000003",53),username:"carrier.reply",is_reply:true,replied_to:{id:"18170000000000001"},root_post:{id:"18170000000000001"}}],paging:{}}),
  response({data:[{...row("18193000000000004",54),username:"carrier.reply2",is_reply:true,replied_to:{id:"18193000000000003"},root_post:{id:"18170000000000001"}}],paging:{}}),
];
const discovery=createMetaThreadsTransport({
  accessToken:token,accountId,expectedUsername:username,
  fetchImpl:async(url,options={})=>{
    discoveryCalls.push({url:String(url),options});
    const next=discoveryQueue.shift();
    if(!next)throw new Error("unexpected_discovery_fetch");
    return next;
  },
});
const mentions=await discovery.listMentions({limit:20});
assert.equal(mentions.ok,true);
assert.equal(mentions.rows[0].username,"carrier.owner");
const search=await discovery.searchPublic("car hauler",{limit:20});
assert.equal(search.ok,true);
assert.equal(search.complete,false);
assert.equal(search.ranked_results,true);
const replies=await discovery.listReplies("18170000000000001",{limit:20});
assert.equal(replies.ok,true);
assert.equal(replies.rows[0].replied_to.id,"18170000000000001");
const conversation=await discovery.listConversation("18170000000000001",{limit:20});
assert.equal(conversation.ok,true);
assert.equal(conversation.rows[0].root_post.id,"18170000000000001");
for(const call of discoveryCalls){
  const url=new URL(call.url);
  assert.equal(url.hostname,"graph.threads.net");
  assert.equal(url.searchParams.has("access_token"),false);
  assert.equal(call.options?.headers?.authorization,"Bearer "+token);
  assert.equal(call.options?.method,"GET");
}
assert.match(discoveryCalls[0].url,/\/me\/mentions/);
assert.match(discoveryCalls[1].url,/\/keyword_search/);
assert.match(discoveryCalls[2].url,/18170000000000001\/replies/);
assert.match(discoveryCalls[3].url,/18170000000000001\/conversation/);

assert.equal(createMetaThreadsTransport({accessToken:token,accountId:"wrong",expectedUsername:username,fetchImpl}),null);

console.log("shared Meta Threads provider PASS — exact text, bounded pagination, identity, publish/reply/readback, no token in URL");
