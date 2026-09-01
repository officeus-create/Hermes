const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MINUTES = 7 * 24 * 60;
const ACTIVITY_WRITE_INTERVAL_MS = 15 * 60 * 1000;
const INACTIVITY_THRESHOLD_MS = 7 * DAY_MS;
const REMINDER_COOLDOWN_MS = 6 * DAY_MS + 20 * 60 * 60 * 1000;
const REMINDER_TIME_WINDOW_MINUTES = 20;
const SUPPORTED_LOCALES = new Set(["en", "ru", "uk", "es", "it", "fr"]);
const WEEKDAY_INDEX = new Map([["Sun", 0], ["Mon", 1], ["Tue", 2], ["Wed", 3], ["Thu", 4], ["Fri", 5], ["Sat", 6]]);

export const ACCOUNT_REMINDER_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
export const ACCOUNT_REMINDER_SUBJECTS = {
  en: "Your Hermes Connect shop is waiting for you",
  ru: "Ваш кабинет Hermes Connect ждёт вас",
  uk: "Ваш кабінет Hermes Connect чекає на вас",
  es: "Tu taller en Hermes Connect te espera",
  it: "La tua officina Hermes Connect ti aspetta",
  fr: "Votre atelier Hermes Connect vous attend",
};

const COPY = {
  en: {
    hello: "Hello",
    inactive: "It has been about a week since you last used your Hermes Connect Repair Shop workspace.",
    reason: "Your shop profile, services, booking hours, appointments, customers, and booking link are still available.",
    action: "Open your shop dashboard:",
    unsubscribe: "Stop weekly inactivity reminders:",
  },
  ru: {
    hello: "Здравствуйте",
    inactive: "Прошла примерно неделя с тех пор, как вы последний раз открывали кабинет СТО в Hermes Connect.",
    reason: "Ваш профиль СТО, услуги, часы записи, заявки, клиенты и ссылка для онлайн-записи остаются доступны.",
    action: "Открыть кабинет СТО:",
    unsubscribe: "Отключить еженедельные напоминания о неактивности:",
  },
  uk: {
    hello: "Вітаємо",
    inactive: "Минув приблизно тиждень відтоді, як ви востаннє відкривали кабінет СТО в Hermes Connect.",
    reason: "Профіль СТО, послуги, години запису, заявки, клієнти та посилання для онлайн-запису залишаються доступними.",
    action: "Відкрити кабінет СТО:",
    unsubscribe: "Вимкнути щотижневі нагадування про неактивність:",
  },
  es: {
    hello: "Hola",
    inactive: "Ha pasado aproximadamente una semana desde la última vez que usaste el espacio de tu taller en Hermes Connect.",
    reason: "Tu perfil, servicios, horarios, citas, clientes y enlace de reservas siguen disponibles.",
    action: "Abrir el panel del taller:",
    unsubscribe: "Desactivar los recordatorios semanales de inactividad:",
  },
  it: {
    hello: "Ciao",
    inactive: "È passata circa una settimana dall'ultima volta che hai usato l'area officina di Hermes Connect.",
    reason: "Profilo, servizi, orari, appuntamenti, clienti e link di prenotazione restano disponibili.",
    action: "Apri il pannello dell'officina:",
    unsubscribe: "Disattiva i promemoria settimanali di inattività:",
  },
  fr: {
    hello: "Bonjour",
    inactive: "Cela fait environ une semaine que vous n'avez pas utilisé l'espace de votre atelier Hermes Connect.",
    reason: "Votre profil, vos services, horaires, rendez-vous, clients et lien de réservation restent disponibles.",
    action: "Ouvrir le tableau de bord de l'atelier :",
    unsubscribe: "Désactiver les rappels hebdomadaires d'inactivité :",
  },
};

export function normalizeEngagementLocale(value) {
  const locale = String(value || "").trim().toLowerCase();
  return SUPPORTED_LOCALES.has(locale) ? locale : "en";
}

function localeFromRequest(request) {
  const referer = request?.headers?.get?.("Referer") || request?.headers?.get?.("referer") || "";
  if (!referer) return "en";
  try {
    return normalizeEngagementLocale(new URL(referer).searchParams.get("lang"));
  } catch {
    return "en";
  }
}

export async function ensureAccountEngagementSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS account_engagement (
      specialist_id TEXT PRIMARY KEY,
      last_active_at TEXT NOT NULL,
      last_reminder_at TEXT,
      email_enabled INTEGER NOT NULL DEFAULT 1,
      locale TEXT NOT NULL DEFAULT 'en',
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_account_engagement_due ON account_engagement(email_enabled, last_active_at, last_reminder_at)").run();
}

export async function touchSpecialistActivity(db, specialistId, request, now = new Date()) {
  if (!db || !specialistId) return;
  await ensureAccountEngagementSchema(db);
  const nowIso = now.toISOString();
  const writeCutoff = new Date(now.getTime() - ACTIVITY_WRITE_INTERVAL_MS).toISOString();
  const locale = localeFromRequest(request);

  await db.prepare(`
    INSERT OR IGNORE INTO account_engagement
      (specialist_id, last_active_at, last_reminder_at, email_enabled, locale, updated_at)
    VALUES (?, ?, NULL, 1, ?, ?)
  `).bind(specialistId, nowIso, locale, nowIso).run();

  await db.prepare(`
    UPDATE account_engagement
    SET last_active_at = ?, locale = ?, updated_at = ?
    WHERE specialist_id = ? AND last_active_at <= ?
  `).bind(nowIso, locale, nowIso, specialistId, writeCutoff).run();
}

function localParts(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  const zone = String(timeZone || "UTC");
  const formatter = (tz) => new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let parts;
  try {
    parts = formatter(zone).formatToParts(date);
  } catch {
    parts = formatter("UTC").formatToParts(date);
  }
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = byType.weekday || "";
  return {
    weekday,
    weekdayIndex: WEEKDAY_INDEX.get(weekday) ?? -1,
    hour: Number(byType.hour || 0),
    minute: Number(byType.minute || 0),
  };
}

export function isWeeklyInactivityReminderDue({ createdAt, lastActiveAt, lastReminderAt, timeZone = "UTC", emailEnabled = true }, now = new Date()) {
  if (!emailEnabled || !createdAt) return false;
  const created = new Date(createdAt);
  const active = new Date(lastActiveAt || createdAt);
  if (!Number.isFinite(created.getTime()) || !Number.isFinite(active.getTime())) return false;
  if (now.getTime() - active.getTime() < INACTIVITY_THRESHOLD_MS) return false;

  if (lastReminderAt) {
    const lastReminder = new Date(lastReminderAt);
    if (Number.isFinite(lastReminder.getTime()) && now.getTime() - lastReminder.getTime() < REMINDER_COOLDOWN_MS) return false;
  }

  const anchor = localParts(created, timeZone);
  const current = localParts(now, timeZone);
  if (anchor.weekdayIndex < 0 || current.weekdayIndex < 0) return false;

  const anchorMinuteOfWeek = anchor.weekdayIndex * 24 * 60 + anchor.hour * 60 + anchor.minute;
  const currentMinuteOfWeek = current.weekdayIndex * 24 * 60 + current.hour * 60 + current.minute;
  const minutesAfterRegistrationTime = (currentMinuteOfWeek - anchorMinuteOfWeek + WEEK_MINUTES) % WEEK_MINUTES;

  return minutesAfterRegistrationTime >= 0 && minutesAfterRegistrationTime < REMINDER_TIME_WINDOW_MINUTES;
}

export function canonicalRepairShopDashboardUrl(locale = "en") {
  const url = new URL("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/dashboard/");
  const normalized = normalizeEngagementLocale(locale);
  if (normalized !== "en") url.searchParams.set("lang", normalized);
  return url.toString();
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function signReminderUnsubscribe(specialistId, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(secret || "")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`weekly-inactivity:v1:${specialistId}`));
  return toBase64Url(new Uint8Array(signature));
}

export async function verifyReminderUnsubscribe(specialistId, signature, secret) {
  if (!specialistId || !signature || !secret) return false;
  const expected = await signReminderUnsubscribe(specialistId, secret);
  if (expected.length !== String(signature).length) return false;
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) diff |= expected.charCodeAt(index) ^ String(signature).charCodeAt(index);
  return diff === 0;
}

export async function canonicalReminderUnsubscribeUrl(specialistId, secret, locale = "en") {
  const url = new URL("https://hermeslogisticsus.com/api/hermes-connect/reminders/unsubscribe");
  url.searchParams.set("sid", specialistId);
  url.searchParams.set("sig", await signReminderUnsubscribe(specialistId, secret));
  const normalized = normalizeEngagementLocale(locale);
  if (normalized !== "en") url.searchParams.set("lang", normalized);
  return url.toString();
}

export function weeklyInactivityEmailText({ name, dashboardUrl, unsubscribeUrl, locale = "en" }) {
  const normalized = normalizeEngagementLocale(locale);
  const copy = COPY[normalized] || COPY.en;
  return [
    `${copy.hello}${name ? ` ${String(name).trim()}` : ""},`,
    "",
    copy.inactive,
    copy.reason,
    "",
    copy.action,
    dashboardUrl,
    "",
    copy.unsubscribe,
    unsubscribeUrl,
    "",
    "Hermes Connect",
  ].join("\n");
}
