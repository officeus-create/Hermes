import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ACCOUNT_KEY,
  PLATFORM,
  CARRIER_THEMES,
  buildCarrierThreadsPost,
  buildTrackedUrl,
  publicationEnabled,
} from "../workers/automation-engine/src/index.mjs";
import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorThreadsConfig,
  WINDSOR_THREADS_DEFAULT_ACCOUNT_ID,
} from "../workers/automation-engine/src/windsor-threads.mjs";

assert.equal(ACCOUNT_KEY, "hermes_logistics");
assert.equal(PLATFORM, "threads");
assert.ok(CARRIER_THEMES.length >= 6, "Pilot needs enough carrier themes to avoid a tiny rotation");

for (const theme of CARRIER_THEMES) {
  assert.ok(theme.destination.startsWith("/"), "All destinations must be owned Hermes paths");
  assert.ok(
    theme.destination.includes("load-board") || theme.destination.includes("car-hauling"),
    `Non-car-hauling destination leaked into Hermes Logistics pilot: ${theme.destination}`,
  );
}

for (const slot of [
  "2026-10-13T06",
  "2026-10-13T07",
  "2026-10-13T12",
  "2026-10-13T23",
  "2026-10-14T00",
  "2026-10-14T01",
]) {
  const candidate = buildCarrierThreadsPost(slot);
  assert.equal(candidate.account_key, "hermes_logistics");
  assert.equal(candidate.platform, "threads");
  assert.ok(candidate.body.length <= 500, `Threads post exceeded 500 chars for ${slot}`);
  assert.match(candidate.body, /https:\/\/hermeslogisticsus\.com\//);
  assert.match(candidate.body, /utm_source=threads/);
  assert.match(candidate.body, /utm_campaign=car_hauler_carrier_growth/);
  assert.ok(!/marketing|academy|repair shop|beauty salon/i.test(candidate.body), "Unrelated business direction leaked into carrier-only account");
}

const tracked = new URL(buildTrackedUrl("/load-board/#carrier-access", "TEST Content"));
assert.equal(tracked.hostname, "hermeslogisticsus.com");
assert.equal(tracked.searchParams.get("utm_source"), "threads");
assert.equal(tracked.searchParams.get("utm_medium"), "organic_social");
assert.equal(tracked.hash, "#carrier-access");

assert.equal(publicationEnabled({}), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_MODE: "live" }), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_PUBLISH: "enabled" }), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_MODE: "live", HERMES_AUTOMATION_PUBLISH: "enabled" }), true);

const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const windsorAdapter = readFileSync(new URL("../workers/automation-engine/src/windsor-threads.mjs", import.meta.url), "utf8");
const wrangler = readFileSync(new URL("../workers/automation-engine/wrangler.jsonc.example", import.meta.url), "utf8");
const migration = readFileSync(new URL("../workers/automation-engine/migrations/0001_init.sql", import.meta.url), "utf8");

assert.ok(worker.includes("AUTOMATION_QUEUE.send"), "Cron must enqueue work instead of doing a heavy task inline");
assert.ok(worker.includes("unknown_outcome"), "Ambiguous provider outcome must be terminal/fail-closed");
assert.ok(worker.includes("INSERT OR IGNORE"), "Idempotency reservation must be persisted before work");
assert.ok(worker.includes("normal_loop_requires_chatgpt_task: false"), "Capabilities must state that ChatGPT scheduled tasks are not runtime dependencies");
assert.ok(!worker.includes("api.openai.com"), "V1 pilot must not call OpenAI per post");
assert.ok(!worker.includes("chatgpt.com"), "V1 pilot must not depend on ChatGPT web runtime");
assert.match(worker, /provider_accepted_readback_pending/, "Accepted Windsor writes must remain unverified until readback");
assert.match(worker, /url\.pathname === "\/v1\/health"[\s\S]*authorized\(request, env\)/, "Operational health must require the private control token");
assert.doesNotMatch(worker, /provider_account:/, "Public capabilities must not expose the provider account id");
assert.match(worker, /publication\.readback/, "Worker must schedule delayed provider readback");
assert.match(worker, /delaySeconds: 4200/, "First Windsor readback must be delayed past the one-hour refresh boundary");
assert.match(windsorAdapter, /connectors\.windsor\.ai/, "Pilot must use the Windsor Connectors API directly");
assert.match(windsorAdapter, /create_text_post/, "Windsor adapter must use the exact Threads text action");
assert.match(windsorAdapter, /refresh_interval.*1h/s, "Readback must use the documented hourly refresh envelope");
assert.ok(!windsorAdapter.includes("console.log"), "Provider URL containing API key must never be logged");
assert.equal(WINDSOR_THREADS_DEFAULT_ACCOUNT_ID, "28419597014385166");
assert.equal(windsorThreadsConfig({}), null);
assert.deepEqual(windsorThreadsConfig({ WINDSOR_API_KEY: "synthetic-key" }), { apiKey: "synthetic-key", accountId: "28419597014385166" });
assert.ok(wrangler.includes('"HERMES_AUTOMATION_MODE": "dry_run"'), "Example config must default to dry-run");
assert.ok(wrangler.includes('"HERMES_AUTOMATION_PUBLISH": "disabled"'), "Example config must default publication off");
assert.ok(wrangler.includes('"WINDSOR_THREADS_ACCOUNT_ID": "28419597014385166"'), "Example must pin the verified Hermes Threads account");
assert.ok(wrangler.includes("WINDSOR_API_KEY"), "Windsor secret activation step must be documented");
assert.ok(!wrangler.includes('"WINDSOR_API_KEY":'), "Windsor API key must never be committed as a Wrangler var");
assert.ok(wrangler.includes('"dead_letter_queue": "hermes-automation-dlq"'), "Queue must have a DLQ");
assert.ok(wrangler.includes('"workers_dev": false'), "Worker must not expose workers.dev by default");
assert.ok(wrangler.includes('"preview_urls": false'), "Preview URLs must remain disabled by default");
for (const table of ["hermes_automation_runs", "hermes_automation_content", "hermes_automation_publications", "hermes_automation_jobs", "hermes_automation_job_events"]) {
  assert.ok(migration.includes(table), `Missing durable D1 table: ${table}`);
}
assert.match(migration, /FOREIGN KEY\(job_id\)/, "Job events must remain attached to a durable job id");


const originalFetch = globalThis.fetch;
try {
  let actionBody = null;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.hostname, "connectors.windsor.ai");
    assert.equal(parsed.searchParams.get("api_key"), "synthetic-key");
    if (parsed.pathname === "/threads/actions") {
      actionBody = JSON.parse(String(options.body || "{}"));
      return new Response(JSON.stringify({ result: "Accepted" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (parsed.pathname === "/threads") {
      assert.equal(parsed.searchParams.get("select_accounts"), "28419597014385166");
      assert.equal(parsed.searchParams.get("refresh_since"), "3d");
      assert.equal(parsed.searchParams.get("refresh_interval"), "1h");
      return new Response(JSON.stringify([{
        post_id: "post-123",
        post_text: "carrier test body",
        post_permalink: "https://www.threads.com/@hermes.logistics/post/example",
        post_timestamp: "2026-10-13T00:00:00+0000",
      }]), { status: 200, headers: { "content-type": "application/json" } });
    }
    throw new Error("unexpected mock URL");
  };

  const write = await publishThreadsTextViaWindsor({ WINDSOR_API_KEY: "synthetic-key" }, "carrier test body");
  assert.equal(write.ok, true);
  assert.equal(write.accepted, true);
  assert.equal(actionBody.account, "28419597014385166");
  assert.equal(actionBody.action, "create_text_post");
  assert.equal(actionBody.params.text, "carrier test body");

  const readback = await readbackThreadsTextViaWindsor({ WINDSOR_API_KEY: "synthetic-key" }, "carrier test body");
  assert.equal(readback.ok, true);
  assert.equal(readback.found, true);
  assert.equal(readback.provider_post_id, "post-123");
  assert.equal(readback.permalink, "https://www.threads.com/@hermes.logistics/post/example");
} finally {
  globalThis.fetch = originalFetch;
}

for (const secretPattern of ["sk-", "ghp_", "AIza", "Bearer eyJ"]) {
  assert.ok(!worker.includes(secretPattern) && !wrangler.includes(secretPattern), `No committed secret-like value: ${secretPattern}`);
}

console.log("Hermes Automation Engine V1 contract: ok");
