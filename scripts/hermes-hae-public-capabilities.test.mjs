import assert from "node:assert/strict";
import {test} from "node:test";
import {verifyStatusUrl,readHaECapabilities} from "./hermes-hae-public-capabilities.mjs";
const host="example.workers.dev",url="https://example.workers.dev/v1/capabilities";
const response={success:true,engine:"hermes-automation-engine",version:"v1",
  generic_job_executor:true,read_only_job_types:["system.health.snapshot","history.coverage.audit","unsafe"],
  publication_enabled:false};
test("off by default",async()=>{
  await assert.rejects(readHaECapabilities({url,allowedHost:host,
    fetchImpl:()=>{throw Error("should never execute")}}),/DISABLED/);
});
test("only exact HTTPS host and route allowed",()=>{
  assert.equal(verifyStatusUrl(url,host),url);
  for(const candidate of [
    "http://example.workers.dev/v1/capabilities","https://evil.workers.dev/v1/capabilities",
    "https://example.workers.dev.evil.net/v1/capabilities",
    "https://user:pass@example.workers.dev/v1/capabilities",
    "https://example.workers.dev/v1/jobs","https://example.workers.dev/v1/health",
    "https://example.workers.dev/v1/capabilities?k=1","https://example.workers.dev:8443/v1/capabilities"
  ]) assert.throws(()=>verifyStatusUrl(candidate,host),/DISALLOWED_URL/);
  for(const candidate of ["","localhost","127.0.0.1"])
    assert.throws(()=>verifyStatusUrl(url,candidate),/HOST_REQUIRED/);
});
test("GET, no key, no writes, no redirect",async()=>{
  let calls=0;
  const v=await readHaECapabilities({enabled:true,url,allowedHost:host,fetchImpl:async(u,opts)=>{
    calls++;assert.equal(u,url);assert.equal(opts.method,"GET");
    assert.equal(opts.redirect,"error");assert.equal(opts.headers.authorization,undefined);
    return {ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(response)};
  }});
  assert.equal(calls,1);assert.equal(v.health,"UNVERIFIED");
  assert.deepEqual(v.readOnlyTypes,["system.health.snapshot","history.coverage.audit"]);
  assert.equal(JSON.stringify(v).includes("unsafe"),false);
});
test("unexpected engine and oversized answer are not trusted",async()=>{
  const base={enabled:true,url,allowedHost:host};
  await assert.rejects(readHaECapabilities({...base,fetchImpl:async()=>({ok:false})}),/NOT_READY/);
  await assert.rejects(readHaECapabilities({...base,fetchImpl:async()=>({
    ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({...response,engine:"other"})})}),/WRONG_ENGINE/);
  await assert.rejects(readHaECapabilities({...base,fetchImpl:async()=>({
    ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(response)+"x".repeat(9000)})}),/RESPONSE_TOO_LARGE/);
});

test("CLI is fail-closed when imported code is launched as executable",async()=>{
  const {spawnSync}=await import("node:child_process");
  const {fileURLToPath}=await import("node:url");
  const res=spawnSync(process.execPath,[fileURLToPath(new URL("./hermes-hae-public-capabilities.mjs",import.meta.url))],{
    env:{PATH:process.env.PATH||""},encoding:"utf8",timeout:4000
  });
  assert.equal(res.status,1);
  assert.match(res.stderr,/HERMES_HAE_STATUS_DISABLED/);
});
