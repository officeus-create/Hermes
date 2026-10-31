import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { onRequestPost as bootstrapOwner } from "../functions/api/internal-ai/bootstrap-owner.ts";

// Synthetic local SQLite only. No production session, credentials, or D1 writes.
class Statement {
  constructor(statement, args = []) { this.statement = statement; this.args = args; }
  bind(...args) { return new Statement(this.statement, args); }
  async run() {
    const info = this.statement.run(...this.args);
    return { success: true, meta: { changes: Number(info.changes ?? 0) } };
  }
  async first() { return this.statement.get(...this.args) ?? null; }
  async all() { return { results: this.statement.all(...this.args) }; }
}
const sqlite = new DatabaseSync(":memory:");
const db = { prepare: sql => new Statement(sqlite.prepare(sql)) };
sqlite.exec("CREATE TABLE sessions (token TEXT, specialist_id TEXT, expires_at TEXT); CREATE TABLE specialists (id TEXT, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);");
const expiry = new Date(Date.now() + 3600000).toISOString();
for (const id of ["owner-a", "owner-b"]) {
  sqlite.prepare("INSERT INTO specialists VALUES (?,?,?,?,?,?)").run(id, id + "@example.invalid", id, "Owner", "", "");
  sqlite.prepare("INSERT INTO sessions VALUES (?,?,?)").run("session-" + id, id, expiry);
}
await ensureInternalAiSchema(db);
const secret = "synthetic-local-test-only-owner-bootstrap-token-1234567890";
const env = { DB: db, HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN: secret };
function request(id, token = secret, options = {}) {
  return new Request("https://example.invalid/api/internal-ai/bootstrap-owner", {
    method: "POST",
    headers: {
      Cookie: id ? "hermes_session=session-" + id : "",
      Origin: options.origin || "https://example.invalid",
      "Sec-Fetch-Site": options.secFetchSite || "same-origin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bootstrap_token: token }),
  });
}
const anonymous = await bootstrapOwner({ request: request(null), env });
assert.equal(anonymous.status, 401, "anonymous bootstrap must fail before claiming");
const crossSite = await bootstrapOwner({ request: request("owner-a", secret, { origin: "https://evil.invalid" }), env });
assert.equal(crossSite.status, 403, "cross-origin bootstrap must fail");
const invalid = await bootstrapOwner({ request: request("owner-a", "invalid-token"), env });
assert.equal(invalid.status, 403, "incorrect bootstrap secret must fail");
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_internal_owner_access WHERE active=1").get().n, 0);

// Both requests can pass the preflight read before either write. The D1/SQLite
// INSERT ... WHERE NOT EXISTS must permit only one atomic first-owner claim.
const responses = await Promise.all(["owner-a", "owner-b"].map(id => bootstrapOwner({ request: request(id), env })));
assert.deepEqual(responses.map(r => r.status).sort((a,b) => a-b), [201, 409], "exactly one concurrent first-owner activation succeeds");
const active = sqlite.prepare("SELECT specialist_id FROM hermes_internal_owner_access WHERE active=1 AND capability='HERMES_INTERNAL_OWNER'").all();
assert.equal(active.length, 1, "two sessions must never claim first-owner capability");
const winner = active[0].specialist_id;
const loser = winner === "owner-a" ? "owner-b" : "owner-a";
const rejected = responses.find(r => r.status === 409);
assert.equal((await rejected.json()).error, "internal_owner_already_provisioned");
const sameOwner = await bootstrapOwner({ request: request(winner, ""), env });
assert.equal(sameOwner.status, 200, "already-active owner replay remains idempotent");
assert.equal((await sameOwner.json()).state, "already_active");
const secondOwner = await bootstrapOwner({ request: request(loser), env });
assert.equal(secondOwner.status, 409, "fresh second-owner activation still denied");
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_internal_owner_access WHERE active=1").get().n, 1);
for (const response of [...responses, sameOwner, secondOwner]) {
  assert.match(response.headers.get("Cache-Control") || "", /no-store/, "bootstrap response must not be cached");
}
sqlite.close();
console.log("Hermes owner bootstrap atomic one-time claim: synthetic concurrent owners PASS");
