import assert from "node:assert/strict";
import {
  HERMES_THREADS_ID,
  metaThreadsMode, metaThreadsConfig, metaThreadsPreflight,
  publishThreadsTextViaMeta, readbackThreadsTextViaMeta,
} from "../workers/automation-engine/src/meta-threads.mjs";

const env = {
  HERMES_THREADS_PROVIDER: "meta_direct",
  HERMES_THREADS_ACCESS_TOKEN: "synthetic-meta-token-testing-only-not-real",
  HERMES_THREADS_META_ACCOUNT_ID: HERMES_THREADS_ID,
};
const post = "Car haulers: find compatible loads, check deadhead, then compare operating fit.";
const now = Date.parse("2026-10-28T15:00:00.000Z");
const old = "2026-10-27T05:00:00Z";
const fresh = "2026-10-28T14:30:00Z";
let count = 0;
function response(data, status = 200) { return { ok: status >= 200 && status < 300, status, json: async () => data }; }
function profile(username = "hermes.logistics", id = HERMES_THREADS_ID) { return response({ id, username }); }
function feed(rows = []) { return response({ data: rows }); }
function row(txt = "Other useful carrier content", stamp = old, id = "18190933357397406") {
  return { id, text: txt, timestamp: stamp, media_type: "TEXT_POST",
           permalink: "https://www.threads.com/@hermes.logistics/post/Dd2dlMnjCwo" };
}
function establishedHistory(count = 30) {
  return Array.from({length: count}, (_, index) =>
    row(`Historical carrier post ${index + 1}`, old, String(18190933357397000n + BigInt(index)))
  );
}
async function withFetch(stubs, fn) {
  let called = 0;
  const oldFetch = globalThis.fetch;
  const args = [];
  globalThis.fetch = async (url, opts = {}) => {
    args.push({url: String(url), method: opts.method || "GET", headers: opts.headers, body: opts.body});
    const chosen = stubs[called++];
    if (chosen instanceof Error) throw chosen;
    if (!chosen) throw Error("unexpected fetch");
    return chosen;
  };
  try {
    const result = await fn();
    return { result, called, args };
  } finally { globalThis.fetch = oldFetch; }
}
function assertTokenNeverInUrl(calls) {
  for (const c of calls) {
    assert.equal(c.url.includes(env.HERMES_THREADS_ACCESS_TOKEN), false);
    assert.ok(c.url.startsWith("https://graph.threads.net/v1.0/"));
    assert.equal(c.headers.authorization, `Bearer ${env.HERMES_THREADS_ACCESS_TOKEN}`);
  }
}
assert.equal(metaThreadsMode({}), false);
assert.equal(metaThreadsConfig({}), null);
assert.equal(metaThreadsConfig({...env, HERMES_THREADS_META_ACCOUNT_ID: "wrong"}), null);
assert.equal(metaThreadsConfig({...env, HERMES_THREADS_ACCESS_TOKEN: ""}), null);
{
  const { result, called } = await withFetch([], () => metaThreadsPreflight({}));
  assert.equal(called, 0);
  assert.equal(result.error_class, "meta_threads_not_configured");
  count++;
}
{
  const {result,called,args} = await withFetch([profile(), feed([])], () => metaThreadsPreflight(env, post, now));
  assert.equal(result.ok,false);
  assert.equal(result.error_class,"meta_threads_history_incomplete");
  assert.equal(result.observed_rows,0);
  assert.equal(result.minimum_required_rows,30);
  assert.equal(called,2);assertTokenNeverInUrl(args);count++;
}
{
  const {result,called,args} = await withFetch([profile(), feed(establishedHistory())], () => metaThreadsPreflight(env, post, now));
  assert.deepEqual(result, {ok:true,account_id_verified:true,last_50_checked:30,safe_to_reserve:true});
  assert.equal(called,2);assertTokenNeverInUrl(args);count++;
}
{
  const {result,called} = await withFetch([profile("someone_else")], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_wrong_account");assert.equal(called,1);count++;
}
{
  const {result,called} = await withFetch([profile(),feed([row(post,old)])], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_duplicate_existing_post");assert.equal(called,2);count++;
}
{
  const {result} = await withFetch([profile(),feed([row("Something else",fresh)])], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_recent_authored_cooldown");count++;
}
{
  const {result} = await withFetch([profile(),feed([row("Something else","2026-10-29T04:00:00Z")])], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_future_provider_timestamp");count++;
}
{
  const {result} = await withFetch([profile(),response({data:[{id:"not-real",text:"fake",timestamp:old}]})], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_invalid_feed");count++;
}
{
  const {result} = await withFetch([response({error:{message:"Invalid OAuth"}},401)], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_auth_rejected");count++;
}
{
  const {result,called} = await withFetch([], () => publishThreadsTextViaMeta({...env,HERMES_THREADS_PROVIDER:"disabled"},post));
  assert.equal(result.error_class,"meta_threads_not_configured");assert.equal(called,0);count++;
}
{
  const {result,called,args} = await withFetch([response({id:"178888800001111"}),response({id:"18199228382828"})], () => publishThreadsTextViaMeta(env,post));
  assert.equal(called,2);
  assert.equal(result.ok,true);
  assert.equal(result.provider_post_id,"18199228382828");
  assert.ok(args[0].url.endsWith(`/${HERMES_THREADS_ID}/threads`));
  assert.ok(args[1].url.endsWith(`/${HERMES_THREADS_ID}/threads_publish`));
  assert.equal(new URLSearchParams(args[0].body).get("text"),post);
  assert.equal(new URLSearchParams(args[1].body).get("creation_id"),"178888800001111");
  assertTokenNeverInUrl(args);count++;
}
{
  const {result,called} = await withFetch([response({error:"not_allowed"},403)], () => publishThreadsTextViaMeta(env,post));
  assert.equal(result.error_class,"meta_threads_auth_rejected");assert.equal(called,1);count++;
}
{
  const {result,called} = await withFetch([response({id:"178888800001111"}),new Error("uncertain publish")], () => publishThreadsTextViaMeta(env,post));
  assert.equal(result.error_class,"provider_outcome_unknown");assert.equal(called,2);count++;
}
{
  const {result,called} = await withFetch([new Error("uncertain create")], () => publishThreadsTextViaMeta(env,post));
  assert.equal(result.error_class,"provider_outcome_unknown");assert.equal(called,1);count++;
}
{
  const {result,called} = await withFetch([response({id:"178888800001111"}),response({})], () => publishThreadsTextViaMeta(env,post));
  assert.equal(result.error_class,"provider_outcome_unknown");assert.equal(called,2);count++;
}
{
  const switchedEnv = {...env,HERMES_THREADS_PROVIDER:"windsor"};
  const {result} = await withFetch([profile(),feed([row(post)])], () => readbackThreadsTextViaMeta(switchedEnv,post));
  assert.equal(result.found,true);
  assert.equal(result.provider_post_id,"18190933357397406");count++;
}
{
  const {result} = await withFetch([profile(),feed([row()])], () => readbackThreadsTextViaMeta(env,post));
  assert.equal(result.found,false);count++;
}
{
  const {result} = await withFetch([profile(),feed([row(post,old,"184444441111111")])], () => readbackThreadsTextViaMeta(env,"different"));
  assert.equal(result.found,false);count++;
}
{
  const repost = {id:"18112994300212", media_type:"REPOST_FACADE", timestamp:old, text:null};
  const {result} = await withFetch([profile(),feed([repost,...establishedHistory(29)])], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.ok,true);count++;
}
{
  const repost = {id:"18112994300212", media_type:"REPOST_FACADE", timestamp:fresh, text:null};
  const {result} = await withFetch([profile(),feed([repost])], () => metaThreadsPreflight(env,post,now));
  assert.equal(result.error_class,"meta_threads_recent_authored_cooldown");count++;
}
console.log(`Meta direct HAE Threads transport PASS (${count} scenarios; fake network only, no publication)`);