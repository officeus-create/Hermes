// True offline integration: Hermes adapter -> real pinned FreeLLMAPI -> mock OpenAI provider.
// NEVER loads customer data, paid/free provider keys or a publicly listening socket.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {spawn} from "node:child_process";
import {createServer} from "node:http";
import {mkdtemp,mkdir,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {DatabaseSync} from "node:sqlite";
import {callHermesFreeLlm} from "./hermes-free-llm-pilot.mjs";

const upstream = process.env.HERMES_TEST_UPSTREAM_DIR;
if (!upstream) throw Error("HERMES_TEST_UPSTREAM_DIR must name the pinned offline upstream build");
const root = await mkdtemp(path.join(os.tmpdir(),"hermes-freellmapi-e2e-"));
const dbDir = path.join(root,"data");
await mkdir(dbDir,{recursive:true,mode:0o700});
const dbPath = path.join(dbDir,"pilot.db");
let child;
let forwarded = 0;
const mock = createServer(async (req,res) => {
  const url = new URL(req.url,"http://127.0.0.1:3999");
  if (req.method==="GET" && (url.pathname==="/v1/models"||url.pathname==="/models")) {
    res.writeHead(200,{"content-type":"application/json"});
    res.end(JSON.stringify({object:"list",data:[{id:"hermes-synthetic-model",object:"model"}]}));
    return;
  }
  if(req.method==="POST" && url.pathname==="/v1/chat/completions") {
    forwarded++;
    let raw="";
    for await(const part of req)raw+=part;
    const parsed=JSON.parse(raw);
    assert.equal(parsed.messages.at(-1).content,"Give a fictional non-sensitive sales training tagline.");
    res.writeHead(200,{"content-type":"application/json","x-request-id":"synthetic-fixture"});
    res.end(JSON.stringify({
      id:"chatcmpl-synthetic",object:"chat.completion",created:0,model:"hermes-synthetic-model",
      choices:[{index:0,finish_reason:"stop",message:{role:"assistant",content:"SYNTHETIC_HERMES_E2E_OK"}}],
      usage:{prompt_tokens:12,completion_tokens:5,total_tokens:17}
    }));
    return;
  }
  res.writeHead(404,{"content-type":"application/json"});
  res.end(JSON.stringify({error:"synthetic endpoint not implemented"}));
});
const waitFor = (condition,ms=25000)=>new Promise(async(resolve,reject)=>{
  const end=Date.now()+ms;
  while(Date.now()<end){
    try{if(await condition())return resolve();}catch{}
    await new Promise(r=>setTimeout(r,300));
  }
  reject(Error("Upstream localhost readiness timed out"));
});
try{
  await new Promise((ok,err)=>{mock.once("error",err);mock.listen(3999,"127.0.0.1",ok);});
  const adminPassword=crypto.randomBytes(28).toString("hex");
  const config={
    admin:{email:"qa-ephemeral@example.invalid",password:adminPassword},
    customProviders:[{baseUrl:"http://127.0.0.1:3999/v1",apiKey:"synthetic-not-secret",
      label:"Hermes mock provider",models:[{model:"hermes-synthetic-model",displayName:"Hermes Synthetic Fixture",fallbackEnabled:true}]}],
    fallback:[{platform:"custom",modelId:"hermes-synthetic-model",priority:1,enabled:true}],
    routing:{strategy:"priority"}
  };
  child=spawn(process.execPath,[path.join(upstream,"server/dist/index.js")],{
    cwd:upstream,stdio:"ignore",env:{...process.env,
      NODE_ENV:"production",PORT:"3001",HOST:"127.0.0.1",FREEAPI_DB_PATH:dbPath,
      ENCRYPTION_KEY:crypto.randomBytes(32).toString("hex"),
      FREEAPI_CONFIG_JSON:JSON.stringify(config),
      PROXY_RATE_LIMIT_RPM:"10",CATALOG_SYNC_INTERVAL_MS:"0"}
  });
  await waitFor(async()=>{
    if(child.exitCode!==null)throw Error("upstream exited before ready");
    const response=await fetch("http://127.0.0.1:3001/api/ping",{signal:AbortSignal.timeout(700)});
    return response.ok;
  });
  // Read the randomly generated unified API key only from this disposable local DB.
  const db=new DatabaseSync(dbPath,{readOnly:true});
  const row=db.prepare("SELECT value FROM settings WHERE key = 'unified_api_key'").get();
  db.close();
  assert.match(row?.value||"",/^freellmapi-[0-9a-f]{48}$/);
  const actual=await callHermesFreeLlm({
    department:"sales",purpose:"sanitized-training-example",dataClass:"SYNTHETIC",
    model:"auto",messages:[{role:"user",content:"Give a fictional non-sensitive sales training tagline."}]
  },{env:{HERMES_FREE_LLM_ENABLED:"true",HERMES_FREE_LLM_BASE_URL:"http://127.0.0.1:3001/v1",
    HERMES_FREE_LLM_API_KEY:row.value},timeoutMs:8000});
  assert.equal(actual.text,"SYNTHETIC_HERMES_E2E_OK");
  assert.equal(actual.status,"INTERNAL_DRAFT_ONLY");
  assert.ok(forwarded>=1,"real upstream must forward the completion to mocked provider");
  console.log("PASS: Hermes adapter → real pinned FreeLLMAPI → local-only synthetic provider → response");
  console.log(JSON.stringify({status:"PASS",forwardedRequests:forwarded,route:actual.routedVia,
    usage:actual.usage,customerData:false,realProviderKeys:false,production:false}));
} finally {
  if(child && child.exitCode===null)child.kill("SIGTERM");
  await new Promise(ok=>mock.close(()=>ok()));
  await rm(root,{recursive:true,force:true});
}