import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const wrangler = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");

test("pins the public MCP SDK and zod", () => {
  assert.equal(pkg.dependencies["@modelcontextprotocol/server"], "2.3.1");
  assert.equal(pkg.dependencies.zod, "4.6.5");
});

test("exposes only the intended public read-only tool names", () => {
  for (const tool of [
    "get_product_overview",
    "get_business_review_framework",
    "get_hermes_business_routes",
    "get_public_trust_links",
    "get_product_learning_policy",
  ]) {
    assert.match(source, new RegExp(`"${tool}"`));
  }
  assert.doesNotMatch(source, /arbitrary SQL|merge_pull|deploy|other tenant/i);
});

test("hard-codes public trust boundaries before customer auth exists", () => {
  assert.match(source, /Never claim private CRM access/i);
  assert.match(source, /Do not request or reconstruct complete raw ChatGPT history/i);
  assert.match(source, /Do not invent pricing, availability, licensing/i);
  assert.match(source, /raw full conversations/);
});

test("supports the OpenAI domain challenge without leaking a default token", () => {
  assert.match(source, /\.well-known\/openai-apps-challenge/);
  assert.match(source, /OPENAI_APPS_CHALLENGE_TOKEN/);
  assert.doesNotMatch(source, /OPENAI_APPS_CHALLENGE_TOKEN\s*=\s*["'][^"']+/);
});

test("uses a dedicated Worker with observability", () => {
  assert.match(wrangler, /"name"\s*:\s*"hermes-connect-mcp"/);
  assert.match(wrangler, /"observability"/);
});
