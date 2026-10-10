import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../functions/api/hermes-connect/home-services/crm.ts", import.meta.url), "utf8");
const postStart = source.indexOf("export async function onRequestPost");
assert.ok(postStart >= 0, "POST handler missing");
const post = source.slice(postStart);

assert.match(
  post,
  /const ownerId = String\(ctx\.dataOwnerId \|\| ctx\.specialist\.id\);/,
  "managed POST must use the same canonical data owner as managed GET",
);
assert.doesNotMatch(
  post,
  /const ownerId = String\(ctx\.specialist\.id\);/,
  "POST must not collapse managed writes onto the authenticated operator identity",
);
assert.match(post, /id,ownerId,companyId,value\.source/);
assert.match(post, /WHERE id=\? AND owner_specialist_id=\?/);
assert.match(post, /bind\(id,ownerId\)\.first\(\)/);

console.log("home-service-managed-write-owner: ok");
