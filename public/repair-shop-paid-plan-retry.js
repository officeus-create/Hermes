(() => {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path !== "/services/hermes-connect/repair-shops/plan") return;
  if (window.__hermesPaidPlanRetryGuardInstalled) return;
  window.__hermesPaidPlanRetryGuardInstalled = true;

  const nativeFetch = window.fetch.bind(window);
  let pending = null;

  const makeRequestId = () => `repair_paid_${Date.now().toString(36)}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const isPaidActivation = (payload) => typeof payload?.message === "string"
    && payload.message.startsWith("PAID ACTIVATION REQUEST — Hermes Connect Repair Shops Founding Shop Plan");

  const fingerprintPayload = (payload) => JSON.stringify({
    source_path: payload.source_path ?? "",
    name: payload.name ?? "",
    email: payload.email ?? "",
    interest: payload.interest ?? "",
    consent: payload.consent === true,
    message: payload.message ?? "",
    direction_fields: payload.direction_fields ?? null,
  });

  window.fetch = async (input, init) => {
    const url = typeof input === "string" || input instanceof URL
      ? new URL(String(input), window.location.origin)
      : new URL(input.url, window.location.origin);
    const method = String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();

    if (url.origin !== window.location.origin || url.pathname !== "/api/logistics-lead" || method !== "POST" || typeof init?.body !== "string") {
      return nativeFetch(input, init);
    }

    let payload;
    try { payload = JSON.parse(init.body); }
    catch { return nativeFetch(input, init); }
    if (!isPaidActivation(payload)) return nativeFetch(input, init);

    const fingerprint = fingerprintPayload(payload);
    if (!pending || pending.fingerprint !== fingerprint) {
      pending = {
        fingerprint,
        requestId: makeRequestId(),
        submittedAt: new Date().toISOString(),
      };
    }

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("Content-Type", "application/json");
    headers.set("Idempotency-Key", pending.requestId);

    const nextPayload = {
      ...payload,
      request_id: pending.requestId,
      submitted_at: pending.submittedAt,
    };

    const response = await nativeFetch(input, {
      ...init,
      headers,
      body: JSON.stringify(nextPayload),
    });

    if (response.ok) pending = null;
    return response;
  };
})();
