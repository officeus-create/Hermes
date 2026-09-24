import { authorizedOwnerAlert, cleanOwnerAlert, ownerAlertText } from "../_lib/owner-alert.mjs";

type Env = {
  DB?: any;
  HERMES_OWNER_ALERT_SERVICE_TOKEN?: string;
  HERMES_OWNER_ALERT_BOT_TOKEN?: string;
  HERMES_OWNER_ALERT_CHAT_ID?: string;
};

const json = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!await authorizedOwnerAlert(request, env.HERMES_OWNER_ALERT_SERVICE_TOKEN)) {
    return json(401, { success: false, error: "unauthorized" });
  }
  if (!env.DB || !env.HERMES_OWNER_ALERT_BOT_TOKEN || !env.HERMES_OWNER_ALERT_CHAT_ID) {
    return json(503, { success: false, error: "owner_alert_unconfigured" });
  }
  if (Number(request.headers.get("Content-Length") || 0) > 2048) {
    return json(413, { success: false, error: "request_too_large" });
  }
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 2048) return json(413, { success: false, error: "request_too_large" });
    input = JSON.parse(raw);
  } catch {
    return json(400, { success: false, error: "invalid_json" });
  }
  const alert = cleanOwnerAlert(input);
  if (!alert) return json(400, { success: false, error: "invalid_alert" });

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS hermes_owner_alerts (
    id TEXT PRIMARY KEY, source TEXT NOT NULL, code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('reserved','sent','uncertain')),
    created_at TEXT NOT NULL, sent_at TEXT, telegram_message_id INTEGER
  )`).run();
  const reserved = await env.DB.prepare(`INSERT OR IGNORE INTO hermes_owner_alerts
    (id, source, code, status, created_at) VALUES (?, ?, ?, 'reserved', ?)`)
    .bind(alert.key, alert.source, alert.code, new Date().toISOString()).run();
  if (Number(reserved?.meta?.changes || 0) !== 1) {
    return json(200, { success: true, status: "duplicate_or_pending" });
  }

  try {
    const result = await fetch(`https://api.telegram.org/bot${env.HERMES_OWNER_ALERT_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.HERMES_OWNER_ALERT_CHAT_ID,
        text: ownerAlertText(alert),
        disable_web_page_preview: true,
        protect_content: true,
      }),
    });
    const response = await result.json().catch(() => null) as { ok?: boolean; result?: { message_id?: number } } | null;
    if (!result.ok || !response?.ok || !Number.isSafeInteger(response.result?.message_id)) {
      throw new Error("delivery_unconfirmed");
    }
    await env.DB.prepare(`UPDATE hermes_owner_alerts SET status='sent', sent_at=?, telegram_message_id=? WHERE id=?`)
      .bind(new Date().toISOString(), response.result!.message_id, alert.key).run();
    return json(200, { success: true, status: "sent" });
  } catch {
    // Telegram may have accepted the request before a timeout. Keep the key reserved.
    await env.DB.prepare("UPDATE hermes_owner_alerts SET status='uncertain' WHERE id=? AND status='reserved'")
      .bind(alert.key).run().catch(() => {});
    return json(502, { success: false, error: "delivery_uncertain", retry_same_key: false });
  }
}

export const onRequestGet = () => json(405, { success: false, error: "method_not_allowed" });
