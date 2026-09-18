const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const clean = (value) => String(value ?? "").trim();

export async function verifyTurnstileToken({
  secret,
  token,
  request,
  expectedAction,
  expectedHostnames,
  fetchImpl = fetch,
  timeoutMs = 5000,
}) {
  const cleanSecret = clean(secret);
  const cleanToken = clean(token);
  if (!cleanSecret) return { ok: false, status: 503, error: "verification_not_configured" };
  if (!cleanToken || cleanToken.length > 2048) {
    return { ok: false, status: 400, error: "verification_required" };
  }

  let requestHostname = "";
  try {
    requestHostname = new URL(request.url).hostname.toLowerCase();
  } catch {
    return { ok: false, status: 403, error: "verification_failed" };
  }

  const allowedHostnames = new Set(
    (expectedHostnames ?? []).map((hostname) => clean(hostname).toLowerCase()).filter(Boolean),
  );
  if (!allowedHostnames.has(requestHostname)) {
    return { ok: false, status: 403, error: "verification_failed" };
  }

  const payload = {
    secret: cleanSecret,
    response: cleanToken,
    idempotency_key: crypto.randomUUID(),
  };
  const remoteIp = clean(request.headers.get("CF-Connecting-IP"));
  if (remoteIp) payload.remoteip = remoteIp;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, status: 503, error: "verification_unavailable" };
    }

    const result = await response.json();
    if (result?.success !== true) {
      return { ok: false, status: 403, error: "verification_failed" };
    }

    const verifiedHostname = clean(result?.hostname).toLowerCase();
    const verifiedAction = clean(result?.action);
    if (
      !allowedHostnames.has(verifiedHostname) ||
      verifiedHostname !== requestHostname ||
      verifiedAction !== expectedAction
    ) {
      return { ok: false, status: 403, error: "verification_failed" };
    }

    return { ok: true, status: 200, error: null };
  } catch {
    return { ok: false, status: 503, error: "verification_unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
