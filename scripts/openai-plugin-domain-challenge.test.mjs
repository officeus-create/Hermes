import assert from "node:assert/strict";
import { onRequestGet } from "../functions/.well-known/openai-apps-challenge.ts";

{
  const response = await onRequestGet({ env: {} });
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Not configured");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
}

{
  const token = "openai-domain-challenge-example";
  const response = await onRequestGet({ env: { OPENAI_APPS_CHALLENGE_TOKEN: token } });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), token);
  assert.equal(response.headers.get("Content-Type"), "text/plain; charset=utf-8");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
}

console.log("OPENAI_PLUGIN_DOMAIN_CHALLENGE_CONTRACT_PASS=YES");
