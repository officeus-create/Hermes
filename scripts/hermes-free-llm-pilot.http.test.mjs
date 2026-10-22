import assert from "node:assert/strict";
import {createServer} from "node:http";
import {test} from "node:test";
import {callHermesFreeLlm} from "./hermes-free-llm-pilot.mjs";

const env = {
  HERMES_FREE_LLM_ENABLED: "true",
  HERMES_FREE_LLM_BASE_URL: "http://127.0.0.1:3001/v1",
  HERMES_FREE_LLM_API_KEY: "freellmapi-SYNTHETIC-NEVER-USE-IN-PROD"
};
const input = {
  department: "academy", dataClass: "SYNTHETIC",
  purpose: "synthetic-regression-example",
  messages: [{role: "user",content: "Write an imaginary, non-commercial training example."}]
};

function localFixture(onRequest) {
  const server = createServer(async (req,res)=>{
    let body="";
    for await (const chunk of req) body+=chunk;
    onRequest({method:req.method,url:req.url,headers:req.headers,body});
    res.writeHead(200,{"content-type":"application/json","x-routed-via":"mock/example"});
    res.end(JSON.stringify({model:"mock-model",choices:[{message:{content:"Safe local synthetic reply"}}]}));
  });
  return server;
}

test("real TCP loopback exchange with mock upstream, no provider keys",async()=>{
  const observed=[];
  const server=localFixture(req=>observed.push(req));
  await new Promise((resolve,reject)=>{
    server.once("error",reject);
    // Fail loudly if occupied; never send a bearer key to an existing listener.
    server.listen(3001,"127.0.0.1",resolve);
  });
  try {
    const result=await callHermesFreeLlm(input,{env,timeoutMs:1500});
    assert.equal(result.status,"INTERNAL_DRAFT_ONLY");
    assert.equal(result.model,"mock-model");
    assert.equal(result.text,"Safe local synthetic reply");
    assert.equal(result.routedVia,"mock/example");
    assert.equal(observed.length,1);
    assert.equal(observed[0].method,"POST");
    assert.equal(observed[0].url,"/v1/chat/completions");
    assert.equal(observed[0].headers.authorization,"Bearer "+env.HERMES_FREE_LLM_API_KEY);
    const body=JSON.parse(observed[0].body);
    assert.equal(body.stream,false);
    assert.equal(body.model,"auto:fast");
    assert.deepEqual(body.messages,input.messages);
  } finally {
    await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  }
});
