import { classifyDlqDisposition } from "./dlq-policy.mjs";

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export async function ensureDlqRuntimeSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_dlq_items (
      dlq_item_id TEXT PRIMARY KEY,
      source_queue_message_id TEXT,
      message_type TEXT NOT NULL,
      job_id TEXT,
      content_id TEXT,
      body_sha256 TEXT NOT NULL,
      d1_state TEXT,
      idempotency_key TEXT,
      disposition TEXT NOT NULL,
      reason TEXT NOT NULL,
      action_status TEXT NOT NULL,
      alert_status TEXT NOT NULL,
      alert_attempt_count INTEGER NOT NULL DEFAULT 0,
      alert_claimed_at TEXT,
      alert_delivered_at TEXT,
      alert_provider_message_id TEXT,
      alert_last_error_class TEXT,
      redrive_count INTEGER NOT NULL DEFAULT 0,
      first_seen_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_error_class TEXT
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hae_dlq_disposition_updated ON hermes_automation_dlq_items(disposition,updated_at)"
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hae_dlq_alert_status ON hermes_automation_dlq_items(alert_status,updated_at)"
  ).run();
}

async function loadDlqContext(env, body) {
  const messageType = clean(body?.type, 80);
  if (messageType === "job.execute") {
    const jobId = clean(body?.job_id, 160);
    const row = jobId
      ? await env.DB.prepare(
          "SELECT job_id,state,idempotency_key FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
        ).bind(jobId).first()
      : null;
    return {
      message_type: messageType,
      job_id: jobId || null,
      content_id: null,
      d1_state: clean(row?.state, 80) || null,
      idempotency_key: clean(row?.idempotency_key, 240) || null,
      provider_outcome: null,
      external_effect: false,
    };
  }

  if (messageType === "publication.readback" || messageType === "publication.write") {
    const contentId = clean(body?.content_id, 200);
    const row = contentId
      ? await env.DB.prepare(
          "SELECT content_id,status,idempotency_key,attempt_count,provider_post_id FROM hermes_automation_publications WHERE content_id=? LIMIT 1"
        ).bind(contentId).first()
      : null;
    let providerOutcome = null;
    if (messageType === "publication.write") {
      if (row?.provider_post_id) providerOutcome = "VERIFIED";
      else if (Number(row?.attempt_count || 0) === 0) providerOutcome = "NONE";
      else providerOutcome = "UNKNOWN";
    }
    return {
      message_type: messageType,
      job_id: null,
      content_id: contentId || null,
      d1_state: clean(row?.status, 80) || null,
      idempotency_key: clean(row?.idempotency_key, 240) || null,
      provider_outcome: providerOutcome,
      external_effect: messageType === "publication.write",
    };
  }

  return {
    message_type: messageType,
    job_id: clean(body?.job_id, 160) || null,
    content_id: clean(body?.content_id, 200) || null,
    d1_state: null,
    idempotency_key: null,
    provider_outcome: null,
    external_effect: false,
  };
}

function nextActionForDisposition(disposition) {
  if (disposition === "SAFE_REDRIVE") return "REDRIVE_PENDING";
  if (disposition === "READBACK_ONLY") return "READBACK_ROUTE_PENDING";
  if (disposition === "QUARANTINE") return "QUARANTINED";
  return "OWNER_ACTION_PENDING";
}

function alertStatusForDisposition(disposition) {
  return ["OWNER_ACTION", "QUARANTINE"].includes(disposition)
    ? "PENDING_OWNER_ALERT"
    : "NOT_REQUIRED";
}

async function upsertClassification(env, record) {
  const now = new Date().toISOString();
  await ensureDlqRuntimeSchema(env.DB);
  await env.DB.prepare(`
    INSERT INTO hermes_automation_dlq_items (
      dlq_item_id,source_queue_message_id,message_type,job_id,content_id,body_sha256,
      d1_state,idempotency_key,disposition,reason,action_status,alert_status,
      redrive_count,first_seen_at,updated_at,last_error_class
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,NULL)
    ON CONFLICT(dlq_item_id) DO UPDATE SET
      d1_state=excluded.d1_state,
      idempotency_key=COALESCE(excluded.idempotency_key,hermes_automation_dlq_items.idempotency_key),
      action_status=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.action_status
        ELSE excluded.action_status
      END,
      alert_status=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_status
        ELSE excluded.alert_status
      END,
      alert_attempt_count=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_attempt_count
        ELSE 0
      END,
      alert_claimed_at=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_claimed_at
        ELSE NULL
      END,
      alert_delivered_at=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_delivered_at
        ELSE NULL
      END,
      alert_provider_message_id=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_provider_message_id
        ELSE NULL
      END,
      alert_last_error_class=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.alert_last_error_class
        ELSE NULL
      END,
      last_error_class=CASE
        WHEN hermes_automation_dlq_items.disposition=excluded.disposition
         AND hermes_automation_dlq_items.reason=excluded.reason
        THEN hermes_automation_dlq_items.last_error_class
        ELSE NULL
      END,
      disposition=excluded.disposition,
      reason=excluded.reason,
      updated_at=excluded.updated_at
  `).bind(
    record.dlq_item_id,
    record.source_queue_message_id,
    record.message_type,
    record.job_id,
    record.content_id,
    record.body_sha256,
    record.d1_state,
    record.idempotency_key,
    record.disposition,
    record.reason,
    nextActionForDisposition(record.disposition),
    alertStatusForDisposition(record.disposition),
    now,
    now,
  ).run();

  return env.DB.prepare(
    "SELECT * FROM hermes_automation_dlq_items WHERE dlq_item_id=? LIMIT 1"
  ).bind(record.dlq_item_id).first();
}

async function markAction(env, dlqItemId, {
  actionStatus,
  incrementRedrive = false,
  lastErrorClass = null,
}) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hermes_automation_dlq_items
    SET action_status=?,
        redrive_count=redrive_count+?,
        last_error_class=?,
        updated_at=?
    WHERE dlq_item_id=?
  `).bind(
    actionStatus,
    incrementRedrive ? 1 : 0,
    clean(lastErrorClass, 160) || null,
    now,
    dlqItemId,
  ).run();
}

function ownerAlertConfig(env) {
  const botToken = clean(
    env?.HERMES_HAE_TELEGRAM_BOT_TOKEN || env?.HERMES_CONNECT_TELEGRAM_BOT_TOKEN,
    300,
  );
  const ownerChatId = clean(
    env?.HERMES_HAE_TELEGRAM_OWNER_CHAT_ID || env?.HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID,
    120,
  );
  return botToken && ownerChatId ? { botToken, ownerChatId } : null;
}

function ownerAlertText(row) {
  return [
    "HAE OWNER ACTION REQUIRED",
    "",
    `DLQ item: ${clean(row?.dlq_item_id, 200) || "—"}`,
    `Type: ${clean(row?.message_type, 80) || "—"}`,
    row?.job_id ? `Job: ${clean(row.job_id, 160)}` : "",
    row?.content_id ? `Content: ${clean(row.content_id, 200)}` : "",
    `D1 state: ${clean(row?.d1_state, 80) || "UNKNOWN"}`,
    `Disposition: ${clean(row?.disposition, 80) || "UNKNOWN"}`,
    `Reason: ${clean(row?.reason, 160) || "UNKNOWN"}`,
    "",
    "Open HAE DLQ runtime receipt before taking action. Do not blindly redrive an external write.",
  ].filter(Boolean).join("\n");
}

async function setAlertState(env, dlqItemId, {
  status,
  incrementAttempt = false,
  claimedAt = null,
  deliveredAt = null,
  providerMessageId = null,
  lastErrorClass = null,
}) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hermes_automation_dlq_items
    SET alert_status=?,
        alert_attempt_count=alert_attempt_count+?,
        alert_claimed_at=?,
        alert_delivered_at=?,
        alert_provider_message_id=?,
        alert_last_error_class=?,
        updated_at=?
    WHERE dlq_item_id=?
  `).bind(
    status,
    incrementAttempt ? 1 : 0,
    claimedAt,
    deliveredAt,
    providerMessageId === null ? null : clean(String(providerMessageId), 120),
    clean(lastErrorClass, 160) || null,
    now,
    dlqItemId,
  ).run();
}

async function deliverOwnerAlert(env, row, {
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!row || row.alert_status !== "PENDING_OWNER_ALERT") {
    return { attempted: false, status: row?.alert_status || "NOT_REQUIRED" };
  }
  const config = ownerAlertConfig(env);
  if (!config) {
    await setAlertState(env, row.dlq_item_id, {
      status: "PENDING_OWNER_ALERT",
      lastErrorClass: "owner_alert_not_configured",
    });
    return { attempted: false, status: "PENDING_OWNER_ALERT", error_class: "owner_alert_not_configured" };
  }

  const claimedAt = new Date().toISOString();
  const claim = await env.DB.prepare(`
    UPDATE hermes_automation_dlq_items
    SET alert_status='ALERT_SENDING',
        alert_attempt_count=alert_attempt_count+1,
        alert_claimed_at=?,
        alert_last_error_class='delivery_claimed_reconcile_before_retry',
        updated_at=?
    WHERE dlq_item_id=?
      AND alert_status='PENDING_OWNER_ALERT'
      AND alert_claimed_at IS NULL
  `).bind(claimedAt, claimedAt, row.dlq_item_id).run();
  if (Number(claim?.meta?.changes || 0) !== 1) {
    const current = await env.DB.prepare(
      "SELECT alert_status,alert_claimed_at,alert_provider_message_id FROM hermes_automation_dlq_items WHERE dlq_item_id=? LIMIT 1"
    ).bind(row.dlq_item_id).first();
    return {
      attempted: false,
      status: clean(current?.alert_status, 80) || "UNKNOWN",
      claimed: Boolean(current?.alert_claimed_at),
      provider_message_id: clean(current?.alert_provider_message_id, 120) || null,
    };
  }

  try {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.ownerChatId,
          text: ownerAlertText(row),
          disable_web_page_preview: true,
        }),
      },
    );
    let payload = null;
    try { payload = await response.json(); } catch {}

    if (!response.ok || payload?.ok === false) {
      await setAlertState(env, row.dlq_item_id, {
        status: "PENDING_OWNER_ALERT",
        claimedAt: null,
        lastErrorClass: `telegram_http_${Number(response.status || 0) || "rejected"}`,
      });
      return { attempted: true, delivered: false, status: "PENDING_OWNER_ALERT", provider_rejected: true };
    }

    const messageId = payload?.result?.message_id;
    if (messageId === undefined || messageId === null || messageId === "") {
      await setAlertState(env, row.dlq_item_id, {
        status: "ALERT_DELIVERY_AMBIGUOUS",
        claimedAt,
        lastErrorClass: "delivery_ambiguous_manual_review",
      });
      return { attempted: true, delivered: false, status: "ALERT_DELIVERY_AMBIGUOUS" };
    }

    const deliveredAt = new Date().toISOString();
    await setAlertState(env, row.dlq_item_id, {
      status: "DELIVERED",
      claimedAt,
      deliveredAt,
      providerMessageId: messageId,
      lastErrorClass: null,
    });
    return {
      attempted: true,
      delivered: true,
      status: "DELIVERED",
      provider_message_id: String(messageId),
      delivered_at: deliveredAt,
    };
  } catch {
    await setAlertState(env, row.dlq_item_id, {
      status: "ALERT_DELIVERY_AMBIGUOUS",
      claimedAt,
      lastErrorClass: "delivery_ambiguous_manual_review",
    }).catch(() => {});
    return { attempted: true, delivered: false, status: "ALERT_DELIVERY_AMBIGUOUS" };
  }
}

export async function recoverPendingDlqOwnerAlerts(env, limit = 20, options = {}) {
  if (!env?.DB) return 0;
  await ensureDlqRuntimeSchema(env.DB);
  const rows = await env.DB.prepare(`
    SELECT *
    FROM hermes_automation_dlq_items
    WHERE alert_status='PENDING_OWNER_ALERT'
      AND alert_claimed_at IS NULL
    ORDER BY updated_at ASC
    LIMIT ?
  `).bind(Math.max(1, Math.min(50, Number(limit) || 20))).all();
  let delivered = 0;
  for (const row of rows?.results || []) {
    const outcome = await deliverOwnerAlert(env, row, options);
    if (outcome?.delivered) delivered += 1;
  }
  return delivered;
}

function safeOriginalBody(body) {
  const messageType = clean(body?.type, 80);
  if (messageType === "job.execute") {
    const jobId = clean(body?.job_id, 160);
    if (!jobId) throw new Error("dlq_job_id_missing");
    return { type: "job.execute", job_id: jobId };
  }
  if (messageType === "publication.readback") {
    const contentId = clean(body?.content_id, 200);
    if (!contentId) throw new Error("dlq_content_id_missing");
    return { type: "publication.readback", content_id: contentId };
  }
  throw new Error("dlq_redrive_message_type_unsupported");
}

export async function processDlqMessage(env, item, {
  mainQueueName = "hermes-automation",
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!env?.DB || !env?.AUTOMATION_QUEUE) throw new Error("dlq_runtime_not_configured");
  const body = item?.body || {};
  const context = await loadDlqContext(env, body);
  const disposition = classifyDlqDisposition(context);
  const bodySha256 = await sha256Hex(JSON.stringify(body));
  const sourceMessageId = clean(item?.id, 200) || null;
  const dlqItemId = sourceMessageId
    ? `dlq:${sourceMessageId}`
    : `dlq:${bodySha256}`;

  const persisted = await upsertClassification(env, {
    dlq_item_id: dlqItemId,
    source_queue_message_id: sourceMessageId,
    message_type: context.message_type || "UNKNOWN",
    job_id: context.job_id,
    content_id: context.content_id,
    body_sha256: bodySha256,
    d1_state: context.d1_state,
    idempotency_key: context.idempotency_key,
    disposition: disposition.disposition,
    reason: disposition.reason,
  });

  if (persisted?.action_status === "REDRIVE_SENT" || persisted?.action_status === "READBACK_ROUTE_SENT") {
    return {
      dlq_item_id: dlqItemId,
      disposition: disposition.disposition,
      action_status: persisted.action_status,
      duplicate_suppressed: true,
    };
  }

  if (disposition.disposition === "SAFE_REDRIVE") {
    const redriveBody = safeOriginalBody(body);
    try {
      await env.AUTOMATION_QUEUE.send(redriveBody);
      await markAction(env, dlqItemId, {
        actionStatus: "REDRIVE_SENT",
        incrementRedrive: true,
      });
      return {
        dlq_item_id: dlqItemId,
        disposition: disposition.disposition,
        action_status: "REDRIVE_SENT",
        target_queue: mainQueueName,
      };
    } catch {
      await markAction(env, dlqItemId, {
        actionStatus: "REDRIVE_FAILED_RETRYABLE",
        lastErrorClass: "dlq_redrive_send_failed",
      });
      throw new Error("dlq_redrive_send_failed");
    }
  }

  if (disposition.disposition === "READBACK_ONLY") {
    const contentId = context.content_id;
    if (!contentId) {
      await markAction(env, dlqItemId, {
        actionStatus: "OWNER_ACTION_PENDING",
        lastErrorClass: "dlq_readback_content_id_missing",
      });
      return {
        dlq_item_id: dlqItemId,
        disposition: "OWNER_ACTION",
        action_status: "OWNER_ACTION_PENDING",
      };
    }
    try {
      await env.AUTOMATION_QUEUE.send({ type: "publication.readback", content_id: contentId });
      await markAction(env, dlqItemId, {
        actionStatus: "READBACK_ROUTE_SENT",
        incrementRedrive: true,
      });
      return {
        dlq_item_id: dlqItemId,
        disposition: disposition.disposition,
        action_status: "READBACK_ROUTE_SENT",
        target_queue: mainQueueName,
      };
    } catch {
      await markAction(env, dlqItemId, {
        actionStatus: "READBACK_ROUTE_FAILED_RETRYABLE",
        lastErrorClass: "dlq_readback_route_failed",
      });
      throw new Error("dlq_readback_route_failed");
    }
  }

  const alert = await deliverOwnerAlert(env, persisted, { fetchImpl });
  return {
    dlq_item_id: dlqItemId,
    disposition: disposition.disposition,
    action_status: nextActionForDisposition(disposition.disposition),
    alert_status: alert?.status || alertStatusForDisposition(disposition.disposition),
    alert_delivery_attempted: Boolean(alert?.attempted),
    alert_delivered: Boolean(alert?.delivered),
    alert_provider_message_id: alert?.provider_message_id || null,
  };
}

export async function dlqRuntimeSnapshot(env, limit = 50) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureDlqRuntimeSchema(env.DB);
  const counts = await env.DB.prepare(`
    SELECT disposition,action_status,alert_status,COUNT(*) AS count
    FROM hermes_automation_dlq_items
    GROUP BY disposition,action_status,alert_status
    ORDER BY disposition,action_status,alert_status
  `).all();
  const items = await env.DB.prepare(`
    SELECT dlq_item_id,message_type,job_id,content_id,d1_state,disposition,reason,
           action_status,alert_status,alert_attempt_count,alert_claimed_at,alert_delivered_at,
           alert_provider_message_id,alert_last_error_class,redrive_count,first_seen_at,updated_at,last_error_class
    FROM hermes_automation_dlq_items
    ORDER BY updated_at DESC
    LIMIT ?
  `).bind(Math.max(1, Math.min(100, Number(limit) || 50))).all();
  const normalizedCounts = counts?.results || [];
  return {
    counts: normalizedCounts,
    items: items?.results || [],
    external_alert_delivery_verified: normalizedCounts.some(
      (row) => row?.alert_status === "DELIVERED" && Number(row?.count || 0) > 0,
    ),
  };
}
