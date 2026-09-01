import {
  ACCOUNT_REMINDER_EMAIL_PATH,
  ACCOUNT_REMINDER_SUBJECTS,
  canonicalReminderUnsubscribeUrl,
  canonicalRepairShopDashboardUrl,
  ensureAccountEngagementSchema,
  isWeeklyInactivityReminderDue,
  normalizeEngagementLocale,
  weeklyInactivityEmailText,
} from "../../_lib/account-engagement.mjs";
import { ensureRepairShopProfileSchema } from "../../_lib/repair-shop-schema.mjs";
import { jsonResponse } from "../../_lib/session.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = {
  DB?: any;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_SERVICE_TOKEN?: string;
  HERMES_CONNECT_REMINDER_JOB_TOKEN?: string;
};

type ReminderRow = {
  id: string;
  email: string;
  name?: string | null;
  created_at: string;
  timezone?: string | null;
  last_active_at?: string | null;
  last_reminder_at?: string | null;
  email_enabled?: number | null;
  locale?: string | null;
};

function authorized(request: Request, token: string) {
  const header = request.headers.get("Authorization") || "";
  return Boolean(token) && header === `Bearer ${token}`;
}

async function deliverReminder(env: Env, row: ReminderRow, dashboardUrl: string, unsubscribeUrl: string, locale: string) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  const subject = ACCOUNT_REMINDER_SUBJECTS[locale as keyof typeof ACCOUNT_REMINDER_SUBJECTS] || ACCOUNT_REMINDER_SUBJECTS.en;
  const text = weeklyInactivityEmailText({
    name: row.name || "",
    dashboardUrl,
    unsubscribeUrl,
    locale,
  });

  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_REMINDER_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: `weekly_inactivity_${row.id}_${crypto.randomUUID()}`,
        subject,
        text,
        recipient_email: row.email,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!env.HERMES_CONNECT_REMINDER_JOB_TOKEN) {
    return jsonResponse(503, { success: false, error: "reminder_job_not_configured" });
  }
  if (!authorized(request, env.HERMES_CONNECT_REMINDER_JOB_TOKEN)) {
    return jsonResponse(401, { success: false, error: "not_authorized" });
  }
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) {
    return jsonResponse(503, { success: false, error: "email_service_not_configured" });
  }

  await ensureAccountEngagementSchema(env.DB);
  await ensureRepairShopProfileSchema(env.DB);

  const query = await env.DB.prepare(`
    SELECT
      s.id,
      s.email,
      s.name,
      s.created_at,
      r.timezone,
      e.last_active_at,
      e.last_reminder_at,
      e.email_enabled,
      e.locale
    FROM specialists s
    LEFT JOIN repair_shops r ON r.owner_specialist_id = s.id
    LEFT JOIN account_engagement e ON e.specialist_id = s.id
    WHERE s.role = 'Shop Owner'
      AND COALESCE(e.email_enabled, 1) = 1
    ORDER BY s.created_at ASC
  `).all();

  const rows = (query?.results || []) as ReminderRow[];
  const now = new Date();
  let due = 0;
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const isDue = isWeeklyInactivityReminderDue({
      createdAt: row.created_at,
      lastActiveAt: row.last_active_at || row.created_at,
      lastReminderAt: row.last_reminder_at,
      timeZone: row.timezone || "UTC",
      emailEnabled: Number(row.email_enabled ?? 1) === 1,
    }, now);
    if (!isDue) continue;
    due += 1;

    const locale = normalizeEngagementLocale(row.locale);
    const dashboardUrl = canonicalRepairShopDashboardUrl(locale);
    const unsubscribeUrl = await canonicalReminderUnsubscribeUrl(
      row.id,
      env.HERMES_CONNECT_REMINDER_JOB_TOKEN,
      locale,
    );

    const delivered = await deliverReminder(env, row, dashboardUrl, unsubscribeUrl, locale);
    if (!delivered) {
      failed += 1;
      continue;
    }

    const nowIso = now.toISOString();
    await env.DB.prepare(`
      INSERT INTO account_engagement
        (specialist_id, last_active_at, last_reminder_at, email_enabled, locale, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
      ON CONFLICT(specialist_id) DO UPDATE SET
        last_reminder_at = excluded.last_reminder_at,
        updated_at = excluded.updated_at
    `).bind(row.id, row.last_active_at || row.created_at, nowIso, locale, nowIso).run();
    sent += 1;
  }

  return jsonResponse(200, {
    success: true,
    scanned: rows.length,
    due,
    sent,
    failed,
  }, { "Cache-Control": "no-store" });
}
