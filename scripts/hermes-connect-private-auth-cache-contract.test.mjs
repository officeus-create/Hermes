import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../functions/api/auth/me.ts", import.meta.url), "utf8");

assert.match(
  source,
  /Cache-Control["']?\s*:\s*["']private, no-store, no-cache, must-revalidate["']/,
  "/api/auth/me must mark private identity responses as private and uncacheable",
);
assert.match(source, /Pragma\s*:\s*["']no-cache["']/, "/api/auth/me must include Pragma: no-cache");
assert.match(source, /Expires\s*:\s*["']0["']/, "/api/auth/me must include Expires: 0");

for (const status of [200, 401, 503]) {
  const pattern = new RegExp(`jsonResponse\\(${status},[\\s\\S]*?PRIVATE_IDENTITY_HEADERS\\)`);
  assert.match(source, pattern, `/api/auth/me ${status} response must use the private cache boundary`);
}

console.log("Hermes Connect private auth cache contract: PASS");
