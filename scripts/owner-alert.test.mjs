import assert from "node:assert/strict";
import { cleanOwnerAlert, ownerAlertText, authorizedOwnerAlert } from "../functions/api/_lib/owner-alert.mjs";
import { onRequestPost } from "../functions/api/internal/owner-alert.ts";

const token = "a".repeat(48);
const key = "alert_20260924_0001";
const body = { source: "email", code: "REPLY_DUE", reference: "mail_00001", idempotency_key: key };
assert.equal(cleanOwnerAlert({ ...body, reference: "client@example.com" }), null);
assert.equal(cleanOwnerAlert({ ...body, code: "SEND_GROUP_POST" }), null);
assert.match(ownerAlertText(cleanOwnerAlert(body)), /REPLY_DUE/);
assert.equal(await authorizedOwnerAlert(new Request("https://example.com", { headers: { Authorization: `Bearer ${token}` } }), token), true);
assert.equal(await authorizedOwnerAlert(new Request("https://example.com", { headers: { Authorization: "Bearer invalid" } }), token), false);

const rows = new Map();
const db = {
  prepare(sql) {
    const statement = {
      values: [], bind(...values) { this.values = values; return this; },
      async run() {
        if (sql.startsWith("INSERT")) {
          if (rows.has(this.values[0])) return { meta: { changes: 0 } };
          rows.set(this.values[0], { status: "reserved" });
          return { meta: { changes: 1 } };
        }
        if (sql.includes("status='sent'")) rows.get(this.values[2]).status = "sent";
        if (sql.includes("status='uncertain'")) rows.get(this.values[0]).status = "uncertain";
        return { meta: { changes: 1 } };
      },
    };
    return statement;
  },
};
const env = {
  DB: db,
  HERMES_OWNER_ALERT_SERVICE_TOKEN: token,
  HERMES_OWNER_ALERT_BOT_TOKEN: "mock-bot-token",
  HERMES_OWNER_ALERT_CHAT_ID: "123456",
};
const request = (data = body, auth = token) => new Request("https://example.com/api/internal/owner-alert", {
  method: "POST",
  headers: { Authorization: `Bearer ${auth}` },
  body: JSON.stringify(data),
});
let sends = 0;
globalThis.fetch = async (_url, options) => {
  sends++;
  const payload = JSON.parse(options.body);
  assert.equal(payload.chat_id, "123456");
  assert.equal(payload.protect_content, true);
  return new Response(JSON.stringify({ ok: true, result: { message_id: 12 } }), { status: 200 });
};
assert.equal((await onRequestPost({ request: request(body, "wrong"), env })).status, 401);
assert.equal((await onRequestPost({ request: request({ ...body, reference: "private@email.com" }), env })).status, 400);
assert.equal((await onRequestPost({ request: request(), env })).status, 200);
assert.equal((await onRequestPost({ request: request(), env })).status, 200);
assert.equal(sends, 1);
assert.equal(rows.get(key).status, "sent");

globalThis.fetch = async () => { sends++; throw new Error("ambiguous network failure"); };
const second = { ...body, idempotency_key: "alert_20260924_0002" };
assert.equal((await onRequestPost({ request: request(second), env })).status, 502);
assert.equal((await onRequestPost({ request: request(second), env })).status, 200);
assert.equal(sends, 2);
assert.equal(rows.get(second.idempotency_key).status, "uncertain");
console.log("owner alert contract PASS");
