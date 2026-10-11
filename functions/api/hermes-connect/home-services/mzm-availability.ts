type Context = { request: Request };

const TIMEZONE = "America/Los_Angeles";
const BUSINESS_HOURS = { opens: "03:00", closes: "19:00" };

const WINDOWS = [
  { key: "morning", label: "Morning", startMinutes: 8 * 60 },
  { key: "day", label: "Afternoon", startMinutes: 12 * 60 },
  { key: "evening", label: "Evening", startMinutes: 16 * 60 },
] as const;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=30",
  "Content-Type": "application/json; charset=utf-8",
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers });

function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  const hourRaw = Number(value("hour"));
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    weekday: value("weekday"),
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute: Number(value("minute")),
  };
}

function isoDate(parts: ReturnType<typeof localParts>) {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function longLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers });
}

export async function onRequestGet({ request }: Context) {
  const nowParam = new URL(request.url).searchParams.get("now");
  const allowTestClock = request.headers.get("X-Hermes-Synthetic-Test") === "1";
  const parsed = allowTestClock && nowParam ? new Date(nowParam) : new Date();
  const now = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const today = localParts(now);
  const todayIso = isoDate(today);
  const currentMinutes = today.hour * 60 + today.minute;

  const days = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    const parts = localParts(date);
    const dateIso = isoDate(parts);
    const isToday = dateIso === todayIso;
    return {
      date: dateIso,
      weekday: parts.weekday,
      label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : longLabel(date),
      windows: WINDOWS.map((window) => ({
        key: window.key,
        label: window.label,
        // These are requestable preference windows derived from first-party
        // operating hours, not a claim that a live calendar slot is free.
        available: !isToday || currentMinutes < window.startMinutes,
      })),
    };
  });

  return json(200, {
    ok: true,
    timezone: TIMEZONE,
    generatedAt: now.toISOString(),
    mode: "preference_windows_no_calendar",
    businessHours: BUSINESS_HOURS,
    confirmationRequired: true,
    days,
  });
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions();
  if (context.request.method === "GET") return onRequestGet(context);
  return json(405, { ok: false, error: "method_not_allowed" });
}