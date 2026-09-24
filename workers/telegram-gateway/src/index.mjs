// Cloud replacement for the existing ProgressoPro group bot's Mac-hosted sender.
// No bot token, group ID, or owner identity is compiled into this worker.
const chicago = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const response = (status, payload) => Response.json(payload, {
  status, headers: { "Cache-Control": "no-store" },
});

export function insideGroupWindow(date) {
  const p = Object.fromEntries(chicago.formatToParts(date).map(({ type, value }) => [type, value]));
  return ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(p.weekday)
    && Number(p.hour) * 60 + Number(p.minute) >= 540
    && Number(p.hour) * 60 + Number(p.minute) < 1065;
}

async function equal(a, b) {
  const digest = async s => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = a.length ^ b.length;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function configured(env) {
  return env.DB && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_WEBHOOK_SECRET
    && env.PRODUCER_SECRET && /^-100\d+$/.test(String(env.GROUP_CHAT_ID || ""))
    && /^\d+$/.test(String(env.OWNER_USER_ID || ""));
}

async function telegram(env, method, data) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok || body.ok !== true) throw new Error(`telegram_${method}_failed`);
  return body.result;
}

const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
const validId = s => typeof s === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,35}$/.test(s);
const safeText = s => typeof s === "string" && s.length > 0 && s.length <= 3000
  && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s)
  && !/(password|парол[ья]|api[_ -]?key|bot[_ -]?token|секрет|одноразов[а-я]* код|\b\d{6}\b)/i.test(s);

async function propose(req, env) {
  if (!await equal(req.headers.get("Authorization") || "", `Bearer ${env.PRODUCER_SECRET}`)) {
    return response(401, { error: "unauthorized" });
  }
  let data;
  try {
    const raw = await req.text();
    if (raw.length > 4096) return response(413, { error: "too_large" });
    data = JSON.parse(raw);
  } catch { return response(400, { error: "bad_json" }); }
  if (!validId(data?.id) || !safeText(data?.text) || data?.kind !== "client_progress") {
    return response(400, { error: "invalid_proposal" });
  }
  const nonce = hex(crypto.getRandomValues(new Uint8Array(8)));
  const result = await env.DB.prepare(
    "INSERT OR IGNORE INTO telegram_outbox (id, kind, text, nonce, status) VALUES (?, ?, ?, ?, 'pending')"
  ).bind(data.id, data.kind, data.text, nonce).run();
  if (!result.meta?.changes) return response(409, { error: "duplicate_id" });
  // The owner reviews exact content in private DM. Failure leaves a visible pending record.
  try {
    const preview = await telegram(env, "sendMessage", {
      chat_id: env.OWNER_USER_ID,
      text: `Hermes · ${data.kind}\nID: ${data.id}\n\n${data.text}`,
      reply_markup: { inline_keyboard: [[
        { text: "Approve", callback_data: `a:${data.id}:${nonce}` },
        { text: "Reject", callback_data: `r:${data.id}:${nonce}` },
      ]] },
    });
    await env.DB.prepare("UPDATE telegram_outbox SET preview_message_id=? WHERE id=?")
      .bind(preview.message_id, data.id).run();
  } catch {
    return response(502, { id: data.id, status: "pending", error: "preview_unconfirmed" });
  }
  return response(202, { id: data.id, status: "pending" });
}

async function webhook(req, env) {
  if (!await equal(req.headers.get("X-Telegram-Bot-Api-Secret-Token") || "", env.TELEGRAM_WEBHOOK_SECRET)) {
    return response(401, { error: "unauthorized" });
  }
  let update;
  try { update = await req.json(); } catch { return response(400, { error: "bad_json" }); }
  const message = update?.message;
  if (message) {
    if (String(message.from?.id) !== String(env.OWNER_USER_ID)
        || String(message.chat?.id) !== String(env.OWNER_USER_ID)
        || message.chat?.type !== "private") return response(403, { error: "wrong_owner" });
    const command = String(message.text || "").split("@")[0];
    if (["/pause", "/resume"].includes(command)) {
      const paused = command === "/pause" ? 1 : 0;
      await env.DB.prepare("UPDATE telegram_gateway_control SET paused=? WHERE id=1").bind(paused).run();
      await telegram(env, "sendMessage", { chat_id: env.OWNER_USER_ID, text: paused ? "Group delivery paused." : "Group delivery enabled (subject to deploy switch and working hours)." });
    }
    return response(200, { ok: true });
  }
  const cb = update?.callback_query;
  if (!cb) return response(200, { ok: true });
  if (String(cb.from?.id) !== String(env.OWNER_USER_ID)
      || String(cb.message?.chat?.id) !== String(env.OWNER_USER_ID)) {
    return response(403, { error: "wrong_owner" });
  }
  const match = /^([ar]):([a-zA-Z0-9][a-zA-Z0-9_-]{7,35}):([0-9a-f]{16})$/.exec(cb.data || "");
  if (!match) return response(400, { error: "invalid_callback" });
  const [, action, id, nonce] = match;
  const status = action === "a" ? "approved" : "rejected";
  const row = await env.DB.prepare(
    "UPDATE telegram_outbox SET status=?, reviewed_at=datetime('now') WHERE id=? AND nonce=? AND preview_message_id=? AND status='pending' RETURNING id"
  ).bind(status, id, nonce, cb.message.message_id).first();
  // Replays cannot approve a rejected/sent row or trigger delivery again.
  if (row) await telegram(env, "answerCallbackQuery", { callback_query_id: cb.id, text: status });
  return response(200, { ok: true, changed: Boolean(row) });
}

async function verifyDestination(env) {
  const me = await telegram(env, "getMe", {});
  if (me.username?.toLowerCase() !== String(env.EXPECTED_BOT_USERNAME || "").replace(/^@/, "").toLowerCase()) {
    throw new Error("bot_identity_mismatch");
  }
  const member = await telegram(env, "getChatMember", { chat_id: env.GROUP_CHAT_ID, user_id: me.id });
  if (!["administrator", "creator"].includes(member.status)) throw new Error("bot_not_admin");
}

export async function deliver(env, now = new Date()) {
  if (!configured(env) || env.TELEGRAM_SEND_ENABLED !== "true" || env.GROUP_PAUSED !== "false"
      || !env.EXPECTED_BOT_USERNAME || !insideGroupWindow(now)) return { skipped: true };
  const control = await env.DB.prepare("SELECT paused FROM telegram_gateway_control WHERE id=1").first();
  if (!control || control.paused !== 0) return { skipped: true };
  // Verify identity and group rights before claiming. Any failure leaves the row approved.
  await verifyDestination(env);
  const row = await env.DB.prepare(
    "UPDATE telegram_outbox SET status='sending', attempted_at=datetime('now') WHERE id=(SELECT id FROM telegram_outbox WHERE status='approved' AND kind='client_progress' ORDER BY created_at, id LIMIT 1) AND status='approved' RETURNING id, text"
  ).first();
  if (!row) return { empty: true };
  try {
    const sent = await telegram(env, "sendMessage", {
      chat_id: env.GROUP_CHAT_ID, text: row.text, disable_web_page_preview: true,
    });
    if (String(sent.chat?.id) !== String(env.GROUP_CHAT_ID) || !Number.isInteger(sent.message_id)) {
      throw new Error("receipt_mismatch");
    }
    await env.DB.prepare("UPDATE telegram_outbox SET status='sent', telegram_message_id=?, sent_at=datetime('now') WHERE id=? AND status='sending'")
      .bind(sent.message_id, row.id).run();
    return { id: row.id, message_id: sent.message_id };
  } catch {
    // Telegram may have accepted a request despite a timeout: never automatically replay it.
    await env.DB.prepare("UPDATE telegram_outbox SET status='ambiguous' WHERE id=? AND status='sending'")
      .bind(row.id).run();
    return { id: row.id, ambiguous: true };
  }
}

export default {
  async fetch(req, env) {
    if (!configured(env)) return response(503, { error: "not_configured" });
    const path = new URL(req.url).pathname;
    if (req.method === "POST" && path === "/proposals") {
      if (Number(req.headers.get("Content-Length") || "0") > 4096) return response(413, { error: "too_large" });
      return propose(req, env);
    }
    if (req.method === "POST" && path === "/telegram/webhook") return webhook(req, env);
    return response(404, { error: "not_found" });
  },
  async scheduled(_event, env) { await deliver(env); },
};
