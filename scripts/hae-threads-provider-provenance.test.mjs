import assert from "node:assert/strict";
import {
  claimPublicationForProvider,
  readPublicationProviderClaim,
  readbackThreadsByClaimedProvider,
  selectedThreadsProvider,
} from "../workers/automation-engine/src/index.mjs";
import { HERMES_THREADS_ID } from "../workers/automation-engine/src/meta-threads.mjs";

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}
async function withFetch(stubs, fn) {
  const oldFetch = globalThis.fetch;
  const calls = [];
  let index = 0;
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const next = stubs[index++];
    if (!next) throw new Error("unexpected_fetch");
    return next;
  };
  try {
    return { result: await fn(), calls };
  } finally {
    globalThis.fetch = oldFetch;
  }
}

function claimDb({ claimChanges = 1, provenanceChanges = 1 } = {}) {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      const normalized = String(sql).replace(/\s+/g, " ").trim();
      return {
        bind(...args) {
          calls.push({ sql: normalized, args });
          return {
            async run() {
              if (normalized.startsWith("UPDATE hermes_automation_publications")) {
                return { meta: { changes: claimChanges } };
              }
              if (normalized.includes("INSERT INTO hermes_automation_runtime_events")) {
                return { meta: { changes: provenanceChanges } };
              }
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
  };
}

function provenanceDb(claims) {
  return {
    prepare(sql) {
      assert.match(String(sql), /publication\.provider_claimed/);
      return {
        bind(contentId) {
          assert.equal(contentId, "content-1");
          return { all: async () => ({ results: claims }) };
        },
      };
    },
  };
}

const candidate = {
  idempotency_key: "hae:hermes_logistics:threads:2026-10-29T12",
  content_id: "content-1",
  account_key: "hermes_logistics",
  platform: "threads",
  slot_key: "2026-10-29T12",
};

assert.equal(selectedThreadsProvider({ HERMES_THREADS_PROVIDER: "meta_direct" }), "meta_direct");
assert.equal(selectedThreadsProvider({}), "windsor");

{
  const db = claimDb();
  assert.equal(await claimPublicationForProvider(db, candidate, "meta_direct"), true);
  const evidence = db.calls.find((entry) => entry.sql.includes("INSERT INTO hermes_automation_runtime_events"));
  assert.ok(evidence, "provider claim evidence must be persisted before provider dispatch");
  assert.equal(evidence.args[0], "provider-claim:" + candidate.idempotency_key);
  assert.equal(evidence.args[1], "meta_direct");
  assert.equal(evidence.args[2], candidate.content_id);
}
{
  const db = claimDb({ claimChanges: 0 });
  assert.equal(await claimPublicationForProvider(db, candidate, "meta_direct"), false);
  assert.equal(db.calls.some((entry) => entry.sql.includes("INSERT INTO hermes_automation_runtime_events")), false);
}
{
  const db = claimDb({ provenanceChanges: 0 });
  await assert.rejects(
    () => claimPublicationForProvider(db, candidate, "meta_direct"),
    /provider_provenance_persist_failed/,
  );
}
await assert.rejects(
  () => claimPublicationForProvider(claimDb(), candidate, "unknown"),
  /publication_provider_invalid/,
);

assert.deepEqual(
  await readPublicationProviderClaim(provenanceDb([]), "content-1"),
  { ok: false, error_class: "publication_provider_provenance_missing" },
);
assert.deepEqual(
  await readPublicationProviderClaim(provenanceDb([{message_type:"meta_direct"},{message_type:"windsor"}]), "content-1"),
  { ok: false, error_class: "publication_provider_provenance_ambiguous" },
);
assert.deepEqual(
  await readPublicationProviderClaim(provenanceDb([{message_type:"legacy"}]), "content-1"),
  { ok: false, error_class: "publication_provider_provenance_invalid" },
);
assert.deepEqual(
  await readPublicationProviderClaim(provenanceDb([{message_type:"meta_direct"}]), "content-1"),
  { ok: true, provider_transport: "meta_direct" },
);

const metaEnvAfterSwitch = {
  HERMES_THREADS_PROVIDER: "windsor",
  HERMES_THREADS_ACCESS_TOKEN: "synthetic-meta-token-testing-only-not-real",
  HERMES_THREADS_META_ACCOUNT_ID: HERMES_THREADS_ID,
};
const body = "Provider provenance regression body";
{
  const row = {
    id: "18190933357397406",
    text: body,
    timestamp: "2026-10-28T05:00:00Z",
    media_type: "TEXT_POST",
    permalink: "https://www.threads.com/@hermes.logistics/post/Dd2dlMnjCwo",
  };
  const {result,calls} = await withFetch(
    [
      response({ id: HERMES_THREADS_ID, username: "hermes.logistics" }),
      response({ data: [row] }),
    ],
    () => readbackThreadsByClaimedProvider("meta_direct", metaEnvAfterSwitch, body),
  );
  assert.equal(result.found, true);
  assert.equal(result.provider_post_id, row.id);
  assert.equal(calls.length, 2);
  assert.ok(calls.every((call) => call.url.startsWith("https://graph.threads.net/v1.0/")));
}

const windsorEnvAfterSwitch = {
  HERMES_THREADS_PROVIDER: "meta_direct",
  WINDSOR_API_KEY: "synthetic-windsor-key",
  WINDSOR_THREADS_ACCOUNT_ID: HERMES_THREADS_ID,
};
{
  const {result,calls} = await withFetch(
    [response({ data: [{
      post_id: "windsor-provider-id",
      post_text: body,
      post_permalink: "https://www.threads.com/@hermes.logistics/post/Dd2dlMnjCwo",
      post_timestamp: "2026-10-28T05:00:00Z",
    }] })],
    () => readbackThreadsByClaimedProvider("windsor", windsorEnvAfterSwitch, body),
  );
  assert.equal(result.found, true);
  assert.equal(result.provider_post_id, "windsor-provider-id");
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.startsWith("https://connectors.windsor.ai/"));
}
{
  const {result,calls} = await withFetch([], () => readbackThreadsByClaimedProvider("legacy", {}, body));
  assert.equal(result.error_class, "publication_provider_provenance_invalid");
  assert.equal(calls.length, 0);
}

console.log("HAE Threads provider provenance PASS (immutable claim + provider-switch readback; fake network only)");
