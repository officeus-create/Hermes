import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { socialAccountReadinessSnapshot } from "../workers/automation-engine/src/social-account-readiness.mjs";

function dbWith(row){
  return {
    prepare(sql){
      const normalized=String(sql).replace(/\s+/g," ").trim();
      return {
        bind(...args){
          return {
            async first(){
              if(normalized.includes("FROM sqlite_master")) return {name:args[0]};
              if(normalized.includes("FROM hermes_social_threads_connections")) return row;
              throw new Error("unexpected_sql");
            },
          };
        },
      };
    },
  };
}

const env={
  DB:dbWith({
    brand_key:"progressopro",
    state:"connected_verified",
    threads_user_id:"12345678901234567",
    username:"progressopro",
    token_ciphertext:"v1.synthetic.encrypted.payload",
    token_expires_at:"2026-12-01T00:00:00Z",
    granted_scope:"threads_basic threads_content_publish threads_read_replies threads_manage_replies threads_manage_mentions",
    identity_verified:1,
    last_error_class:null,
    updated_at:"2026-10-29T01:00:00Z",
  }),
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
assert.ok(snapshot.blockers.includes("progressopro_hae_token_key_bridge_missing"));
assert.ok(snapshot.blockers.includes("progressopro_provider_transport_not_converged"));
assert.equal(snapshot.write_convergence_ready,false);

const serialized=JSON.stringify(snapshot);
assert.doesNotMatch(serialized,/synthetic-hermes-token/);
assert.doesNotMatch(serialized,/v1\.synthetic\.encrypted\.payload/);

const bridged=await socialAccountReadinessSnapshot({
  ...env,
  THREADS_BRAND_TOKEN_KEY:"synthetic-key-present-for-readiness-only",
},{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.equal(bridged.progressopro.hae_token_key_present,true);
assert.equal(bridged.progressopro.ready_for_hae_write_bridge,true);
assert.ok(bridged.blockers.includes("progressopro_provider_transport_not_converged"));
assert.equal(bridged.write_convergence_ready,false);

const missing=await socialAccountReadinessSnapshot({
  DB:dbWith(null),
},{nowMs:Date.parse("2026-10-29T02:00:00Z")});
assert.ok(missing.blockers.includes("hermes_logistics_meta_credentials_not_ready"));
assert.ok(missing.blockers.includes("progressopro_threads_connection_missing"));

const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/GET" && url\.pathname === "\/v1\/social-account-readiness"/);
assert.match(worker,/authorized\(request, env\)/);
assert.match(worker,/socialAccountReadinessSnapshot\(env\)/);

console.log("HAE social account readiness PASS — two lanes, no tokens, fail-closed convergence blockers");
