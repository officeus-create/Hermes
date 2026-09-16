import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const EXPECTED_COMPATIBILITY_DATE = "2026-08-04";

const pagesExample = readJson("wrangler.jsonc.example");
const emailWorkerExample = readJson("workers/lead-email/wrangler.jsonc.example");
const emailWorkerProduction = readJson("workers/lead-email/wrangler.production.jsonc");

assert.equal(
  pagesExample.compatibility_date,
  EXPECTED_COMPATIBILITY_DATE,
  "Pages compatibility date drifted from the reviewed runtime baseline.",
);

for (const [label, config] of [
  ["lead-email example", emailWorkerExample],
  ["lead-email production", emailWorkerProduction],
]) {
  assert.equal(
    config.compatibility_date,
    EXPECTED_COMPATIBILITY_DATE,
    `${label} compatibility date drifted from the reviewed runtime baseline.`,
  );
  assert.equal(config.workers_dev, false, `${label} must not expose a workers.dev hostname.`);
  assert.equal(config.preview_urls, false, `${label} must not expose Worker preview URLs.`);
  assert.equal("routes" in config, false, `${label} must remain private and route-free.`);
}

assert.equal(
  emailWorkerProduction.observability?.enabled,
  true,
  "The private production mail Worker must keep observability enabled.",
);

console.log(
  "Cloudflare production hardening contract passed: Pages runtime baseline is pinned and hermes-lead-email remains private-only.",
);
