import assert from "node:assert/strict";
import {test} from "node:test";
import {validateLoopbackGateway,validatePilotRequest,callHermesFreeLlm} from "./hermes-free-llm-pilot.mjs";
const i={department:"academy",purpose:"sanitized-training-example",dataClass:"SYNTHETIC",messages:[{role:"user",content:"Synthetic exercise"}]};
const env={HERMES_FREE_LLM_ENABLED:"true",HERMES_FREE_LLM_BASE_URL:"http://127.0.0.1:3001/v1",HERMES_FREE_LLM_API_KEY:"freellmapi-TESTONLY"};
test("default off",async()=>assert.rejects(callHermesFreeLlm(i,{env:{...env,HERMES_FREE_LLM_ENABLED:"false"},fetchImpl:()=>{throw Error("unexpected")}}),/DISABLED/));
test("local URL only",()=>{
  for(const u of ["http://127.0.0.1:3001/v1","http://localhost:3001/v1","http://[::1]:3001/v1"])assert.equal(validateLoopbackGateway(u),u);
  for(const u of ["http://192.168.0.1:3001/v1","https://test.example/v1","http://localhost:3002/v1","http://user:pwd@localhost:3001/v1","http://localhost:3001/v1?q=1"])assert.throws(()=>validateLoopbackGateway(u),/NON_LOCAL_GATEWAY/);
});
test("scope and actions restricted",()=>{
  for(const p of [{dataClass:"CLIENT_PII"},{externalAction:true},{purpose:"send-email"},{model:"paid-pro"},{messages:[]},{department:"unknown"}])assert.throws(()=>validatePilotRequest({...i,...p}),/HERMES_FREE_LLM_/);
});
test("one synthetic completion, draft-only",async()=>{
  let n=0;const x=await callHermesFreeLlm(i,{env,fetchImpl:async(url,options)=>{n++;assert.equal(url,"http://127.0.0.1:3001/v1/chat/completions");assert.equal(options.redirect,"error");assert.equal(JSON.parse(options.body).model,"auto:fast");assert.equal(JSON.parse(options.body).max_tokens,640);return {ok:true,headers:{get:()=>"mock/provider"},json:async()=>({model:"mock",choices:[{message:{content:"safe"}}]})};}});
  assert.equal(n,1);assert.equal(x.status,"INTERNAL_DRAFT_ONLY");assert.equal(x.routedVia,"mock/provider");assert.deepEqual(x.usage,{promptTokens:null,completionTokens:null,totalTokens:null});
});
test("429 fails closed without retry",async()=>{
  let n=0;await assert.rejects(callHermesFreeLlm(i,{env,fetchImpl:async()=>{n++;return {ok:false,status:429}}}),/UPSTREAM_UNAVAILABLE/);assert.equal(n,1);
});
test("no key and transport failure are safe",async()=>{
  await assert.rejects(callHermesFreeLlm(i,{env:{...env,HERMES_FREE_LLM_API_KEY:""},fetchImpl:()=>{throw Error("unexpected")}}),/MISSING_KEY/);
  await assert.rejects(callHermesFreeLlm(i,{env,fetchImpl:()=>{throw Error("sensitive provider detail")}}),/TRANSPORT_ERROR/);
});
