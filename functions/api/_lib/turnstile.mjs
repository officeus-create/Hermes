const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TIMEOUT_MS = 5000;

const text = (value) => String(value ?? "").trim();

export async function validateTurnstileToken({
  token,
  secret,
  remoteIp,
  expectedHostname,
  expectedAction,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
}) {
  const cleanToken = text(token);
  const cleanSecret = text(secret);
  if (!cleanSecret) return { ok: false, reason: "not_configured" };
  if (!cleanToken || cleanToken.length > 2048) return { ok: false, reason: "invalid_token" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.max(1000, Number(timeoutMs) || DEFAULT_TIMEOUT_MS));

  try {
    const payload = {
      secret: cleanSecret,
      response: cleanToken,
      idempotency_key: crypto.randomUUID(),
    };
    if (text(remoteIp)) payload.remoteip = text(remoteIp);

    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response?.ok) return { ok: false, reason: "unavailable" };

    const result = await response.json().catch(() => null);
    if (!result?.success) return { ok: false, reason: "failed" };
    if (expectedAction && result.action !== expectedAction) return { ok: false, reason: "action_mismatch" };
    if (expectedHostname && result.hostname !== expectedHostname) return { ok: false, reason: "hostname_mismatch" };

    return {
      ok: true,
      hostname: result.hostname || null,
      action: result.action || null,
      challengeTs: result.challenge_ts || null,
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timeoutId);
  }
}
