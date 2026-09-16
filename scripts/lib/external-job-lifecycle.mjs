const REMOVED_TEXT_PATTERNS = [
  /vacanc(?:y|ies)[\s\S]{0,80}(?:removed|hidden|deleted|not found)/i,
  /job[\s\S]{0,80}(?:removed|hidden|deleted|not found)/i,
  /вакансі(?:ю|я)[\s\S]{0,80}(?:не знайдено|видалена|прихована|закрита|неактивна)/i,
  /ваканси(?:я|ю)[\s\S]{0,80}(?:не найдена|удалена|скрыта|закрыта|неактивна)/i,
];

export function classifyExternalJobLifecycle({ expectedUrl, status, finalUrl, body = "", error = null }) {
  if (error) return { classification: "review_required", reason: "external_request_failed" };
  if (!Number.isInteger(status) || status < 200 || status >= 300) {
    return { classification: "review_required", reason: `external_http_${status ?? "unknown"}` };
  }

  let parsedExpected;
  let parsedFinal;
  try {
    parsedExpected = new URL(expectedUrl);
    parsedFinal = new URL(finalUrl || expectedUrl);
  } catch {
    return { classification: "review_required", reason: "external_url_invalid" };
  }

  const removedMarker = parsedFinal.searchParams.get("job_removed");
  if (removedMarker && removedMarker !== "0") {
    return { classification: "review_required", reason: "external_removed_redirect_marker" };
  }
  if (REMOVED_TEXT_PATTERNS.some((pattern) => pattern.test(body))) {
    return { classification: "review_required", reason: "external_removed_page_marker" };
  }
  if (parsedFinal.origin !== parsedExpected.origin || parsedFinal.pathname !== parsedExpected.pathname) {
    return { classification: "review_required", reason: "external_unexpected_redirect" };
  }

  return { classification: "verified_open", reason: "external_route_exact_and_active" };
}
export async function fetchExternalJobLifecycle(expectedUrl, { fetchImpl = fetch, timeoutMs = 20_000 } = {}) {
  try {
    const response = await fetchImpl(expectedUrl, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesJobLifecycleVerifier/2.0 (+read-only vacancy verification)",
        accept: "text/html,*/*;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.text();
    const evidence = {
      expectedUrl,
      status: response.status,
      finalUrl: response.url,
      body,
      error: null,
    };
    return { ...evidence, ...classifyExternalJobLifecycle(evidence) };
  } catch (error) {
    const evidence = {
      expectedUrl,
      status: null,
      finalUrl: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
    return { ...evidence, ...classifyExternalJobLifecycle(evidence) };
  }
}
