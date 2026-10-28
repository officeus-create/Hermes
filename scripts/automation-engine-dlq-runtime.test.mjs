import assert from "node:assert/strict";
import { dlqRuntimeSnapshot, processDlqMessage, recoverPendingDlqOwnerAlerts } from "../workers/automation-engine/src/dlq-runtime.mjs";

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = String(sql).replace(/\s+/g, " ").trim();
    this.args = [];
  }
  bind(...args) { this.args = args; return this; }

  async run() {
    const sql = this.sql;
    if (sql.startsWith("CREATE TABLE") || sql.startsWith("CREATE INDEX")) return { meta: { changes: 0 } };

    if (sql.startsWith("INSERT INTO hermes_automation_dlq_items")) {
      const [
        id, sourceId, messageType, jobId, contentId, bodySha,
        d1State, idempotencyKey, disposition, reason, actionStatus,
        alertStatus, firstSeenAt, updatedAt,
      ] = this.args;
      const existing = this.db.dlq.get(id);
      if (existing) {
        const classificationChanged =
          existing.disposition !== disposition || existing.reason !== reason;
        existing.d1_state = d1State;
        existing.idempotency_key = idempotencyKey || existing.idempotency_key;
        if (classificationChanged) {
          existing.action_status = actionStatus;
          existing.alert_status = alertStatus;
          existing.alert_attempt_count = 0;
          existing.alert_claimed_at = null;
          existing.alert_delivered_at = null;
          existing.alert_provider_message_id = null;
          existing.alert_channel = null;
          existing.alert_receipt_ref = null;
          existing.alert_last_error_class = null;
          existing.last_error_class = null;
        }
        existing.disposition = disposition;
        existing.reason = reason;
        existing.updated_at = updatedAt;
      } else {
        this.db.dlq.set(id, {
          dlq_item_id: id,
          source_queue_message_id: sourceId,
          message_type: messageType,
          job_id: jobId,
          content_id: contentId,
          body_sha256: bodySha,
          d1_state: d1State,
          idempotency_key: idempotencyKey,
          disposition,
          reason,
          action_status: actionStatus,
          alert_status: alertStatus,
          alert_attempt_count: 0,
          alert_claimed_at: null,
          alert_delivered_at: null,
          alert_provider_message_id: null,
          alert_channel: null,
          alert_receipt_ref: null,
          alert_last_error_class: null,
          redrive_count: 0,
          first_seen_at: firstSeenAt,
          updated_at: updatedAt,
          last_error_class: null,
        });
      }
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE hermes_automation_dlq_items SET action_status=")) {
      const [actionStatus, increment, lastError, updatedAt, id] = this.args;
      const row = this.db.dlq.get(id);
      if (!row) return { meta: { changes: 0 } };
      row.action_status = actionStatus;
      row.redrive_count += Number(increment || 0);
      row.last_error_class = lastError;
      row.updated_at = updatedAt;
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE hermes_automation_dlq_items SET alert_status='ALERT_SENDING'")) {
      const [claimedAt, updatedAt, id] = this.args;
      const row = this.db.dlq.get(id);
      if (!row || row.alert_status !== "PENDING_OWNER_ALERT" || row.alert_claimed_at) {
        return { meta: { changes: 0 } };
      }
      row.alert_status = "ALERT_SENDING";
      row.alert_attempt_count += 1;
      row.alert_claimed_at = claimedAt;
      row.alert_last_error_class = "delivery_claimed_reconcile_before_retry";
      row.updated_at = updatedAt;
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE hermes_automation_dlq_items SET alert_status=?")) {
      const [status, increment, claimedAt, deliveredAt, providerMessageId, channel, receiptRef, lastError, updatedAt, id] = this.args;
      const row = this.db.dlq.get(id);
      if (!row) return { meta: { changes: 0 } };
      row.alert_status = status;
      row.alert_attempt_count += Number(increment || 0);
      row.alert_claimed_at = claimedAt;
      row.alert_delivered_at = deliveredAt;
      row.alert_provider_message_id = providerMessageId;
      row.alert_channel = channel;
      row.alert_receipt_ref = receiptRef;
      row.alert_last_error_class = lastError;
      row.updated_at = updatedAt;
      return { meta: { changes: 1 } };
    }
    throw new Error(`unexpected_run_sql: ${sql}`);
  }

  async first() {
    const sql = this.sql;
    if (sql.includes("FROM hermes_automation_jobs WHERE job_id=?")) return this.db.jobs.get(this.args[0]) || null;
    if (sql.includes("FROM hermes_automation_publications WHERE content_id=?")) return this.db.publications.get(this.args[0]) || null;
    if (sql.includes("FROM hermes_automation_dlq_items WHERE dlq_item_id=?")) return this.db.dlq.get(this.args[0]) || null;
    throw new Error(`unexpected_first_sql: ${sql}`);
  }

  async all() {
    const sql = this.sql;
    if (sql.includes("GROUP BY disposition,action_status,alert_status")) {
      const grouped = new Map();
      for (const row of this.db.dlq.values()) {
        const key = `${row.disposition}|${row.action_status}|${row.alert_status}`;
        const current = grouped.get(key) || {
          disposition: row.disposition,
          action_status: row.action_status,
          alert_status: row.alert_status,
          count: 0,
        };
        current.count += 1;
        grouped.set(key, current);
      }
      return { results: [...grouped.values()] };
    }
    if (sql.includes("WHERE alert_status='PENDING_OWNER_ALERT'")) {
      const limit = Number(this.args[0] || 20);
      return {
        results: [...this.db.dlq.values()]
          .filter((row) => row.alert_status === "PENDING_OWNER_ALERT" && !row.alert_claimed_at)
          .slice(0, limit),
      };
    }
    if (sql.includes("FROM hermes_automation_dlq_items ORDER BY updated_at DESC")) {
      const limit = Number(this.args[0] || 50);
      return { results: [...this.db.dlq.values()].slice(-limit).reverse() };
    }
    throw new Error(`unexpected_all_sql: ${sql}`);
  }
}

class FakeDB {
  constructor() {
    this.jobs = new Map();
    this.publications = new Map();
    this.dlq = new Map();
  }
  prepare(sql) { return new FakeStatement(this, sql); }
}

function message(id, body) {
  return { id, body, timestamp: new Date("2026-10-24T19:00:00Z"), attempts: 4 };
}

const DB = new FakeDB();
const sent = [];
const env = {
  DB,
  AUTOMATION_QUEUE: {
    async send(body) { sent.push(body); },
  },
};

DB.jobs.set("job:queued", {
  job_id: "job:queued",
  state: "QUEUED",
  idempotency_key: "job-key-queued",
});
let outcome = await processDlqMessage(env, message("m-job-1", { type: "job.execute", job_id: "job:queued" }));
assert.equal(outcome.disposition, "SAFE_REDRIVE");
assert.equal(outcome.action_status, "REDRIVE_SENT");
assert.deepEqual(sent, [{ type: "job.execute", job_id: "job:queued" }]);
assert.equal(DB.dlq.get("dlq:m-job-1").redrive_count, 1);

outcome = await processDlqMessage(env, message("m-job-1", { type: "job.execute", job_id: "job:queued" }));
assert.equal(outcome.duplicate_suppressed, true);
assert.equal(sent.length, 1, "Same DLQ item must not send a second redrive after REDRIVE_SENT");

// Authoritative D1 state can change after an earlier redrive. Reclassifying the
// same DLQ item must reset stale action/alert state rather than treating the old
// REDRIVE_SENT receipt as proof that the new terminal classification was handled.
DB.jobs.set("job:queued", {
  job_id: "job:queued",
  state: "SUCCEEDED",
  idempotency_key: "job-key-queued",
});
outcome = await processDlqMessage(env, message("m-job-1", { type: "job.execute", job_id: "job:queued" }));
assert.equal(outcome.disposition, "QUARANTINE");
assert.equal(outcome.action_status, "QUARANTINED");
assert.equal(outcome.alert_status, "PENDING_OWNER_ALERT");
assert.equal(outcome.duplicate_suppressed, undefined);
assert.equal(sent.length, 1, "Terminal reclassification must not redrive again");

DB.jobs.set("job:done", {
  job_id: "job:done",
  state: "SUCCEEDED",
  idempotency_key: "job-key-done",
});
outcome = await processDlqMessage(env, message("m-job-done", { type: "job.execute", job_id: "job:done" }));
assert.equal(outcome.disposition, "QUARANTINE");
assert.equal(outcome.action_status, "QUARANTINED");
assert.equal(outcome.alert_status, "PENDING_OWNER_ALERT");
assert.equal(sent.length, 1);

DB.publications.set("content:readback", {
  content_id: "content:readback",
  status: "provider_accepted_readback_pending",
  idempotency_key: "pub-key",
  attempt_count: 1,
  provider_post_id: null,
});
outcome = await processDlqMessage(env, message("m-readback", { type: "publication.readback", content_id: "content:readback" }));
assert.equal(outcome.disposition, "SAFE_REDRIVE");
assert.equal(outcome.action_status, "REDRIVE_SENT");
assert.deepEqual(sent.at(-1), { type: "publication.readback", content_id: "content:readback" });

outcome = await processDlqMessage(env, message("m-unknown", { type: "mystery.task", job_id: "unknown" }));
assert.equal(outcome.disposition, "QUARANTINE");
assert.equal(outcome.alert_status, "PENDING_OWNER_ALERT");

let snapshot = await dlqRuntimeSnapshot(env, 10);
assert.equal(snapshot.external_alert_delivery_verified, false, "T4 must not claim delivered owner alert before a real provider receipt exists");
assert.ok(snapshot.counts.some((row) => row.disposition === "QUARANTINE"));
assert.equal(snapshot.items.length, 4);
assert.ok([...DB.dlq.values()].some((row) => row.alert_last_error_class === "owner_alert_not_configured"));

const telegramCalls = [];
const alertEnv = {
  ...env,
  HERMES_HAE_TELEGRAM_BOT_TOKEN: "synthetic-bot-token",
  HERMES_HAE_TELEGRAM_OWNER_CHAT_ID: "123456",
};
const delivered = await recoverPendingDlqOwnerAlerts(alertEnv, 10, {
  fetchImpl: async (url, options) => {
    telegramCalls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() {
        return { ok: true, result: { message_id: 7000 + telegramCalls.length } };
      },
    };
  },
});
assert.equal(delivered, 3, "All three pending owner-action/quarantine receipts should be delivered");
assert.equal(telegramCalls.length, 3);
assert.ok(telegramCalls.every((call) => call.url.includes("api.telegram.org/bot")));
assert.ok(telegramCalls.every((call) => JSON.parse(call.options.body).chat_id === "123456"));

snapshot = await dlqRuntimeSnapshot(env, 10);
assert.equal(snapshot.external_alert_transport_accepted, true, "Provider message_id receipts should prove transport acceptance");
assert.equal(snapshot.external_alert_delivery_verified, false, "Provider acceptance alone must not promote T4 to LIVE_VERIFIED without independent owner-channel readback");
assert.equal(snapshot.items.filter((row) => row.alert_status === "DELIVERED").length, 3);
assert.ok(snapshot.items.filter((row) => row.alert_status === "DELIVERED").every((row) => row.alert_provider_message_id));

const deliveredAgain = await recoverPendingDlqOwnerAlerts(alertEnv, 10, {
  fetchImpl: async () => { throw new Error("delivered alerts must not be retried"); },
});
assert.equal(deliveredAgain, 0, "Delivered owner alerts must not be retried");

// Email is the preferred production delivery surface because it needs no API
// secret and is constrained by the Cloudflare binding to the canonical Hermes
// sender/recipient. The transport promise is an acceptance receipt; an inbox
// readback remains the LIVE verification layer.
outcome = await processDlqMessage(
  {
    DB,
    AUTOMATION_QUEUE: env.AUTOMATION_QUEUE,
    OWNER_ALERT_EMAIL: {
      async send(message) {
        assert.equal(message.to, "officeus@hermeslogisticsus.com");
        assert.equal(message.from, "website@hermeslogisticsus.com");
        assert.match(message.subject, /^\[HAE OWNER ACTION\]/);
        return {};
      },
    },
    HERMES_HAE_OWNER_ALERT_RECIPIENT: "officeus@hermeslogisticsus.com",
    HERMES_HAE_OWNER_ALERT_SENDER: "website@hermeslogisticsus.com",
  },
  message("m-email-alert", { type: "mystery.email", job_id: "unknown-email" }),
);
assert.equal(outcome.alert_delivered, true);
assert.equal(outcome.alert_channel, "cloudflare_email");
assert.match(outcome.alert_receipt_ref, /^cloudflare-email:\/\/accepted\//);
assert.equal(DB.dlq.get("dlq:m-email-alert").alert_status, "DELIVERED");
assert.equal(DB.dlq.get("dlq:m-email-alert").alert_channel, "cloudflare_email");
assert.match(DB.dlq.get("dlq:m-email-alert").alert_receipt_ref, /^cloudflare-email:\/\/accepted\//);

console.log("HAE DLQ runtime PASS: classify + safe redrive + quarantine + duplicate suppression + durable owner-alert delivery");
