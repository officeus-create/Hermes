import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureRepairShopSalesAttributionSchema } from "./repair-shop-sales-attribution.mjs";

const ALERT_KINDS = new Set(["registration", "profile"]);
const ALERT_STATES = new Set(["pending", "sent", "failed", "skipped"]);
const MAX_ALERT_ATTEMPTS = 5;

const clean = (value, max = 180) => String(value ?? "").replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
const cleanEmail = (value) => clean(value, 160).toLowerCase();
const nowIso = () => new Date().toISOString();

export async function ensureRegistrationOpsSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_registration_flags (
    specialist_id TEXT PRIMARY KEY,
    synthetic INTEGER NOT NULL DEFAULT 0 CHECK (synthetic IN (0,1)),
    reviewed_at TEXT,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_registration_flags_synthetic ON hermes_registration_flags(synthetic, updated_at DESC)").run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_registration_alerts (
    id TEXT PRIMARY KEY,
    specialist_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('registration','profile')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sent_at TEXT,
    last_error TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_registration_alerts_status_created ON hermes_registration_alerts(status, created_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_registration_alerts_specialist ON hermes_registration_alerts(specialist_id, created_at DESC)").run();
}

function configuredSyntheticEmails(env) {
  return new Set(
    String(env?.HERMES_SYNTHETIC_ACCOUNT_EMAILS || "")
      .split(/[;,\n]/)
      .map((item) => cleanEmail(item))
      .filter(Boolean),
  );
}

export async function syncSyntheticFlagForAccount({ db, env, specialistId, email, createdAt }) {
  if (!db || !specialistId) return false;
  await ensureRegistrationOpsSchema(db);
  const synthetic = configuredSyntheticEmails(env).has(cleanEmail(email)) ? 1 : 0;
  const now = createdAt || nowIso();
  await db.prepare(`INSERT INTO hermes_registration_flags (specialist_id, synthetic, reviewed_at, updated_at)
    VALUES (?, ?, NULL, ?)
    ON CONFLICT(specialist_id) DO UPDATE SET synthetic=excluded.synthetic, updated_at=excluded.updated_at`)
    .bind(String(specialistId), synthetic, now)
    .run();
  return Boolean(synthetic);
}

export async function enqueueRegistrationAlert({ db, specialistId, kind, createdAt }) {
  if (!db || !specialistId || !ALERT_KINDS.has(kind)) return false;
  await ensureRegistrationOpsSchema(db);
  const id = `${kind}:${specialistId}`;
  const now = createdAt || nowIso();
  await db.prepare(`INSERT OR IGNORE INTO hermes_registration_alerts
    (id, specialist_id, kind, status, attempts, created_at, updated_at, sent_at, last_error)
    VALUES (?, ?, ?, 'pending', 0, ?, ?, NULL, NULL)`)
    .bind(id, String(specialistId), kind, now, now)
    .run();
  return true;
}

export async function getRegistrationRecord(db, specialistId) {
  if (!db || !specialistId) return null;
  await Promise.all([
    ensureRegistrationOpsSchema(db),
    ensureRepairShopProfileSchema(db),
    ensureRepairShopSalesAttributionSchema(db),
  ]);
  return db.prepare(`
    SELECT
      s.id, s.name, s.email, s.role, s.location, s.created_at,
      rs.name AS shop_name, rs.phone, rs.city, rs.state, rs.updated_at AS shop_updated_at,
      a.salesperson_code, a.source,
      COALESCE(f.synthetic, 0) AS synthetic, f.reviewed_at
    FROM specialists s
    LEFT JOIN repair_shops rs ON rs.owner_specialist_id = s.id
    LEFT JOIN repair_shop_sales_attribution a ON a.owner_specialist_id = s.id
    LEFT JOIN hermes_registration_flags f ON f.specialist_id = s.id
    WHERE s.id = ?
    LIMIT 1
  `).bind(String(specialistId)).first();
}

const locationText = (row) => {
  const cityState = [clean(row?.city, 80), clean(row?.state, 8)].filter(Boolean).join(", ");
  return cityState || clean(row?.location, 120) || "—";
};

export function registrationTelegramText(row, kind = "registration") {
  if (!row) return "";
  const isProfile = kind === "profile";
  return [
    isProfile ? "HERMES CONNECT PROFILE COMPLETED" : "NEW HERMES CONNECT REGISTRATION",
    "",
    `Time: ${clean(row.created_at, 40) || "—"}`,
    `Name: ${clean(row.name, 100) || "—"}`,
    `Company / Shop: ${clean(row.shop_name, 120) || "—"}`,
    `Role: ${clean(row.role, 120) || "—"}`,
    `Email: ${cleanEmail(row.email) || "—"}`,
    `Phone: ${clean(row.phone, 40) || "—"}`,
    `Location: ${locationText(row)}`,
    `Source: ${clean(row.source, 80) || "—"}`,
    `Sales owner: ${clean(row.salesperson_code, 40) || "—"}`,
    "",
    "Open Hermes Connect → Internal → Users / Registrations",
  ].join("\n");
}

async function updateAlertState(db, id, { status, attempts, sentAt = null, lastError = null }) {
  const safeStatus = ALERT_STATES.has(status) ? status : "failed";
  await db.prepare(`UPDATE hermes_registration_alerts
    SET status=?, attempts=?, sent_at=?, last_error=?, updated_at=?
    WHERE id=?`)
    .bind(safeStatus, attempts, sentAt, lastError, nowIso(), id)
    .run();
}

export async function deliverTelegramRegistrationAlert({ db, env, specialistId, kind }) {
  if (!db || !specialistId || !ALERT_KINDS.has(kind)) return { ok: false, error: "invalid_alert" };
  await ensureRegistrationOpsSchema(db);
  const id = `${kind}:${specialistId}`;
  let alert = await db.prepare("SELECT * FROM hermes_registration_alerts WHERE id = ? LIMIT 1").bind(id).first();
  if (!alert) {
    await enqueueRegistrationAlert({ db, specialistId, kind });
    alert = await db.prepare("SELECT * FROM hermes_registration_alerts WHERE id = ? LIMIT 1").bind(id).first();
  }
  if (!alert) return { ok: false, error: "alert_missing" };
  if (alert.status === "sent" || alert.status === "skipped") return { ok: true, status: alert.status };
  const attempts = Number(alert.attempts || 0);
  if (attempts >= MAX_ALERT_ATTEMPTS) return { ok: false, error: "retry_limit" };

  const row = await getRegistrationRecord(db, specialistId);
  if (!row) {
    await updateAlertState(db, id, { status: "failed", attempts: attempts + 1, lastError: "registration_missing" });
    return { ok: false, error: "registration_missing" };
  }
  if (Number(row.synthetic || 0) === 1) {
    await updateAlertState(db, id, { status: "skipped", attempts, lastError: "synthetic_excluded" });
    return { ok: true, status: "skipped" };
  }

  const botToken = String(env?.HERMES_CONNECT_TELEGRAM_BOT_TOKEN || "").trim();
  const ownerChatId = String(env?.HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID || "").trim();
  if (!botToken || !ownerChatId) {
    await updateAlertState(db, id, { status: "failed", attempts: attempts + 1, lastError: "telegram_not_configured" });
    return { ok: false, error: "telegram_not_configured" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ownerChatId,
        text: registrationTelegramText(row, kind),
        disable_web_page_preview: true,
      }),
    });
    let payload = null;
    try { payload = await response.json(); } catch {}
    if (!response.ok || !payload?.ok || !payload?.result?.message_id) {
      await updateAlertState(db, id, { status: "failed", attempts: attempts + 1, lastError: `telegram_http_${response.status}` });
      return { ok: false, error: "telegram_delivery_failed" };
    }
    const sentAt = nowIso();
    await updateAlertState(db, id, { status: "sent", attempts: attempts + 1, sentAt, lastError: null });
    return { ok: true, status: "sent", sent_at: sentAt };
  } catch {
    await updateAlertState(db, id, { status: "failed", attempts: attempts + 1, lastError: "telegram_network_error" });
    return { ok: false, error: "telegram_network_error" };
  }
}
