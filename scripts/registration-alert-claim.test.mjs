import assert from "node:assert/strict";
import { deliverTelegramRegistrationAlert, enqueueRegistrationAlert } from "../functions/api/_lib/registration-ops.mjs";

const alerts = new Map();
const claims = new Set();
const db = {
  prepare(sql) {
    return {
      params: [],
      bind(...values) { this.params = values; return this; },
      async all() { return { results: [] }; },
      async first() {
        if (sql.includes("FROM hermes_registration_alerts WHERE id")) return alerts.get(this.params[0]);
        if (sql.includes("FROM specialists s")) return {
          id: this.params[0], name: "Test Owner", email: "test@example.invalid",
          role: "Shop Owner", created_at: "2026-09-24T00:00:00Z", synthetic: 0,
        };
        throw new Error(`Unexpected SELECT: ${sql}`);
      },
      async run() {
        if (sql.includes("INSERT OR IGNORE INTO hermes_registration_alerts")) {
          const [id, specialistId, kind] = this.params;
          if (!alerts.has(id)) alerts.set(id, { id, specialist_id: specialistId, kind, status: "pending", attempts: 0 });
        }
        if (sql.includes("INSERT OR IGNORE INTO hermes_registration_alert_claims")) {
          const id = this.params[0];
          if (claims.has(id)) return { meta: { changes: 0 } };
          claims.add(id);
          return { meta: { changes: 1 } };
        }
        if (sql.includes("DELETE FROM hermes_registration_alert_claims")) claims.delete(this.params[0]);
        if (sql.includes("UPDATE hermes_registration_alerts")) {
          const [status, attempts, sentAt, lastError, , id] = this.params;
          Object.assign(alerts.get(id), { status, attempts, sent_at: sentAt, last_error: lastError });
        }
        return { meta: { changes: 1 } };
      },
    };
  },
};
const env = { HERMES_CONNECT_TELEGRAM_BOT_TOKEN: "mock", HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID: "12345" };
let sends = 0;
globalThis.fetch = async () => {
  sends++;
  return new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 });
};
const send = (specialistId) => deliverTelegramRegistrationAlert({ db, env, specialistId, kind: "registration" });
await enqueueRegistrationAlert({ db, specialistId: "owner1", kind: "registration" });
const both = await Promise.all([send("owner1"), send("owner1")]);
assert.equal(sends, 1, "concurrent retries must send once");
assert.equal(both.filter(x => x.status === "sent").length, 1);
assert.equal(alerts.get("registration:owner1").status, "sent");

await enqueueRegistrationAlert({ db, specialistId: "owner2", kind: "registration" });
globalThis.fetch = async () => { sends++; throw new Error("timeout after request"); };
assert.equal((await send("owner2")).error, "delivery_ambiguous_manual_review");
assert.equal((await send("owner2")).error, "delivery_claimed_reconcile_before_retry");
assert.equal(sends, 2, "ambiguous result must not be sent a second time");
assert.equal(alerts.get("registration:owner2").last_error, "delivery_ambiguous_manual_review");

await enqueueRegistrationAlert({ db, specialistId: "owner3", kind: "registration" });
globalThis.fetch = async () => { sends++; return new Response(JSON.stringify({ ok: false }), { status: 429 }); };
assert.equal((await send("owner3")).error, "telegram_delivery_failed");
assert.equal(claims.has("registration:owner3"), false, "explicit rejection may be retried");
globalThis.fetch = async () => { sends++; return new Response(JSON.stringify({ ok: true, result: { message_id: 43 } }), { status: 200 }); };
assert.equal((await send("owner3")).status, "sent");
assert.equal(sends, 4);
console.log("Registration alert delivery claim: PASS");
