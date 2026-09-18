type Env = {
  TURNSTILE_REPAIR_BOOKING_MODE?: string;
  TURNSTILE_REPAIR_BOOKING_SITE_KEY?: string;
  TURNSTILE_REPAIR_BOOKING_SECRET?: string;
};

const text = (value: unknown) => String(value ?? "").trim();
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function onRequestGet({ env }: { env: Env }) {
  const mode = text(env.TURNSTILE_REPAIR_BOOKING_MODE).toLowerCase() || "off";
  if (!["off", "enforce"].includes(mode)) {
    return new Response(JSON.stringify({ success: false, error: "turnstile_not_configured" }), { status: 503, headers });
  }

  const required = mode === "enforce";
  const sitekey = text(env.TURNSTILE_REPAIR_BOOKING_SITE_KEY);
  const secretReady = Boolean(text(env.TURNSTILE_REPAIR_BOOKING_SECRET));
  const ready = !required || Boolean(sitekey && secretReady);

  return new Response(JSON.stringify({
    success: true,
    required,
    ready,
    sitekey: required && ready ? sitekey : null,
    action: "repair_booking",
  }), { status: 200, headers });
}
