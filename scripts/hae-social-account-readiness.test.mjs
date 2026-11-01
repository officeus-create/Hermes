import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { socialAccountReadinessSnapshot } from "../workers/automation-engine/src/social-account-readiness.mjs";
import {
  redactResolvedSocialCredential,
  resolveProgressoproThreadsCredential,
} from "../workers/automation-engine/src/social-credential-bridge.mjs";

function bytesToBase64(bytes){
  let raw="";
  for(const byte of bytes)raw+=String.fromCharCode(byte);
  return btoa(raw);
}
async function encryptPayload(keyBytes,payload){
  const key=await crypto.subtle.importKey("raw",keyBytes,{name:"AES-GCM"},false,["encrypt"]);
  const iv=new Uint8Array(12);iv.fill(7);
  const plaintext=new TextEncoder().encode(JSON.stringify(payload));
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plaintext);
  return "v1."+bytesToBase64(iv)+"."+bytesToBase64(new Uint8Array(encrypted));
}

function dbWith(row){
  return {
    prepare(sql){
      const normalized=String(sql).replace(/\s+/g," ").trim();
      return {
        async first(){
          if(normalized.includes("FROM hermes_social_threads_connections")) return row;
          throw new Error("unexpected_unbound_sql");
        },
        bind(...args){
          return {
            async first(){
              if(normalized.includes("FROM sqlite_master")) return {name:args[0]};
              if(normalized.includes("FROM hermes_social_threads_connections")) return row;
              throw new Error("unexpected_bound_sql");
            },
          };
        },
      };
    },
  };
}

const keyBytes=new Uint8Array(32);keyBytes.fill(9);
const bridgeKey=bytesToBase64(keyBytes);
const progressoproToken="synthetic-progressopro-access-token-never-returned";
const ciphertext=await encryptPayload(keyBytes,{
  access_token:progressoproToken,
  user_id:"12345678901234567",
});
const row={
  brand_key:"progressopro",
  state:"connected_verified",
  threads_user_id:"12345678901234567",
  username:"progressopro",
  token_ciphertext:ciphertext,
  token_expires_at:"2026-12-01T00:00:00Z",
  granted_scope:"threads_basic threads_content_publish threads_read_replies threads_manage_replies threads_manage_mentions",
  identity_verified:1,
  last_error_class:null,
  updated_at:"2026-10-29T01:00:00Z",
};

const env={
  DB:dbWith(row),
  HERMES_THREADS_PROVIDER:"meta_direct",
  HERMES_THREADS_META_ACCOUNT_ID:"28419597014385166",
  HERMES_THREADS_ACCESS_TOKEN:"synthetic-hermes-token-that-is-never-returned",
};

const snapshot=await socialAccountReadinessSnapshot(env,{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.equal(snapshot.success,true);
assert.deepEqual(snapshot.social_business_lanes,["HERMES_LOGISTICS","PROGRESSOPRO"]);
assert.equal(snapshot.tokens_returned,false);
assert.equal(snapshot.external_write_performed,false);
assert.equal(snapshot.hermes_logistics.ready_for_provider_preflight,true);
assert.equal(snapshot.progressopro.identity_verified,true);
assert.equal(snapshot.progressopro.required_write_scopes_present,true);
assert.equal(snapshot.progressopro.token_ciphertext_present,true);
assert.equal(snapshot.progressopro.hae_token_key_present,false);
assert.equal(snapshot.progressopro.ready_for_hae_write_bridge,false);
assert.equal(snapshot.hae_write_bridge_ready,false);
assert.equal(snapshot.manual_social_studio_provider_converged,false);
assert.ok(snapshot.blockers.includes("progressopro_hae_token_key_bridge_missing"));
assert.ok(snapshot.blockers.includes("progressopro_provider_transport_not_converged"));
assert.ok(snapshot.blockers.includes("manual_social_studio_provider_not_converged"));
assert.equal(snapshot.write_convergence_ready,false);

const serialized=JSON.stringify(snapshot);
assert.doesNotMatch(serialized,/synthetic-hermes-token/);
assert.doesNotMatch(serialized,/synthetic-progressopro-access-token/);
assert.equal(serialized.includes(ciphertext),false);

const bridgedEnv={...env,THREADS_BRAND_TOKEN_KEY:bridgeKey};
const resolved=await resolveProgressoproThreadsCredential(bridgedEnv,{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.equal(resolved.ok,true);
assert.equal(resolved.accountId,"12345678901234567");
assert.equal(resolved.username,"progressopro");
assert.equal(resolved.accessToken,progressoproToken);
const redacted=redactResolvedSocialCredential(resolved);
assert.equal(redacted.ok,true);
assert.equal(redacted.access_token_returned,false);
assert.equal("accessToken" in redacted,false);

const bridged=await socialAccountReadinessSnapshot(bridgedEnv,{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.equal(bridged.progressopro.hae_token_key_present,true);
assert.equal(bridged.progressopro.credential_bridge_resolves,true);
assert.equal(bridged.progressopro.ready_for_hae_write_bridge,true);
assert.equal(bridged.progressopro.provider_transport,"shared_meta_threads_provider");
assert.equal(bridged.hae_write_bridge_ready,true);
assert.ok(bridged.blockers.includes("manual_social_studio_provider_not_converged"));
assert.equal(bridged.write_convergence_ready,false);
assert.doesNotMatch(JSON.stringify(bridged),/synthetic-progressopro-access-token/);

const missing=await socialAccountReadinessSnapshot({
  DB:dbWith(null),
},{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.ok(missing.blockers.includes("hermes_logistics_meta_credentials_not_ready"));
assert.ok(missing.blockers.includes("progressopro_threads_connection_missing"));
assert.ok(missing.blockers.includes("manual_social_studio_provider_not_converged"));

const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/GET" && url\.pathname === "\/v1\/social-account-readiness"/);
assert.match(worker,/authorized\(request, env\)/);
assert.match(worker,/socialAccountReadinessSnapshot\(env\)/);

console.log("HAE social account readiness PASS — two lanes, credential bridge internal, manual provider path still blocks convergence");
