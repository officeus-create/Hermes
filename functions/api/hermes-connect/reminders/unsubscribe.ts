import {
  ensureAccountEngagementSchema,
  normalizeEngagementLocale,
  verifyReminderUnsubscribe,
} from "../../_lib/account-engagement.mjs";

type Env = {
  DB?: any;
  HERMES_CONNECT_REMINDER_JOB_TOKEN?: string;
};

const COPY = {
  en: { title: "Weekly reminders are off", body: "Hermes Connect will no longer send weekly inactivity reminders to this account.", action: "Return to Repair Shops" },
  ru: { title: "Еженедельные напоминания отключены", body: "Hermes Connect больше не будет отправлять этому аккаунту еженедельные напоминания о неактивности.", action: "Вернуться к СТО" },
  uk: { title: "Щотижневі нагадування вимкнено", body: "Hermes Connect більше не надсилатиме цьому акаунту щотижневі нагадування про неактивність.", action: "Повернутися до СТО" },
  es: { title: "Los recordatorios semanales están desactivados", body: "Hermes Connect ya no enviará recordatorios semanales de inactividad a esta cuenta.", action: "Volver a Talleres" },
  it: { title: "I promemoria settimanali sono disattivati", body: "Hermes Connect non invierà più promemoria settimanali di inattività a questo account.", action: "Torna alle Officine" },
  fr: { title: "Les rappels hebdomadaires sont désactivés", body: "Hermes Connect n'enverra plus de rappels hebdomadaires d'inactivité à ce compte.", action: "Retour aux ateliers" },
};

function htmlResponse(status: number, title: string, body: string, action: string, locale: string) {
  const lang = normalizeEngagementLocale(locale);
  return new Response(`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font-family:system-ui,sans-serif;background:#f8f6f0;color:#111827;padding:40px 20px"><main style="max-width:620px;margin:auto;background:white;border:1px solid #e5e7eb;border-radius:18px;padding:28px"><h1 style="margin-top:0">${title}</h1><p>${body}</p><p><a href="/services/hermes-connect/repair-shops/${lang === "en" ? "" : `?lang=${lang}`}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111827;color:white;text-decoration:none;font-weight:700">${action}</a></p></main></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB || !env.HERMES_CONNECT_REMINDER_JOB_TOKEN) {
    return new Response("Reminder preferences are unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL(request.url);
  const specialistId = String(url.searchParams.get("sid") || "").trim();
  const signature = String(url.searchParams.get("sig") || "").trim();
  const locale = normalizeEngagementLocale(url.searchParams.get("lang"));
  const copy = COPY[locale as keyof typeof COPY] || COPY.en;

  if (!(await verifyReminderUnsubscribe(specialistId, signature, env.HERMES_CONNECT_REMINDER_JOB_TOKEN))) {
    return new Response("Invalid or incomplete reminder preference link.", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  await ensureAccountEngagementSchema(env.DB);
  const nowIso = new Date().toISOString();
  const existing = await env.DB.prepare("SELECT specialist_id, last_active_at FROM account_engagement WHERE specialist_id = ? LIMIT 1")
    .bind(specialistId)
    .first() as { specialist_id?: string; last_active_at?: string } | null;

  if (existing?.specialist_id) {
    await env.DB.prepare("UPDATE account_engagement SET email_enabled = 0, updated_at = ? WHERE specialist_id = ?")
      .bind(nowIso, specialistId)
      .run();
  } else {
    await env.DB.prepare(`
      INSERT INTO account_engagement
        (specialist_id, last_active_at, last_reminder_at, email_enabled, locale, updated_at)
      VALUES (?, ?, NULL, 0, ?, ?)
    `).bind(specialistId, nowIso, locale, nowIso).run();
  }

  return htmlResponse(200, copy.title, copy.body, copy.action, locale);
}
