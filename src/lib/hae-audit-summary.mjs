const AUDIT_JOB_LABELS = Object.freeze({
  "audit.github.snapshot": "GitHub",
  "audit.cloudflare.runtime": "Cloudflare",
  "audit.drive.truth": "Drive",
  "audit.website.journey": "Website",
});
export const HAE_AUDIT_JOB_TYPES = Object.freeze(Object.keys(AUDIT_JOB_LABELS));

function finiteCount(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 100000 ? n : 0;
}
function safeIso(value) {
  const s = typeof value === "string" ? value : "";
  return Number.isFinite(Date.parse(s)) ? s : null;
}
function parseResult(value) {
  if (typeof value !== "string" || !value || value.length > 100000) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
export function summarizeHaeAudits(rows = [], nowIso = new Date().toISOString(), staleHours = 30) {
  const now = Date.parse(nowIso);
  if (!Number.isFinite(now)) throw new Error("audit_summary_now_invalid");
  // Rows arrive newest-first. A newer QUEUED/RUNNING row without a result
  // must not hide the latest proven P0/P1 from an older terminal receipt.
  const proven = new Map();
  const fallback = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const jobType = String(row?.job_type || "");
    if (!HAE_AUDIT_JOB_TYPES.includes(jobType)) continue;
    if (!fallback.has(jobType)) fallback.set(jobType, row);
    if (proven.has(jobType)) continue;
    const state = String(row?.state || "").toUpperCase();
    const envelope = parseResult(row?.result_json);
    const hasResult = envelope?.result && typeof envelope.result === "object" && !Array.isArray(envelope.result);
    if (state === "FAILED" || hasResult) proven.set(jobType, row);
  }

  const auditors = HAE_AUDIT_JOB_TYPES.map((jobType) => {
    const row = proven.get(jobType) || fallback.get(jobType);
    if (!row) return {
      job_type: jobType, label: AUDIT_JOB_LABELS[jobType], state: "NOT_RUN",
      coverage: "NOT_RUN", open_count: 0, p0_count: 0, p1_count: 0,
      observed_at: null, stale: true,
    };
    const envelope = parseResult(row.result_json);
    const result = envelope?.result && typeof envelope.result === "object" && !Array.isArray(envelope.result)
      ? envelope.result
      : null;
    const observedAt = safeIso(result?.observed_at) || safeIso(envelope?.observed_at) || safeIso(row.completed_at) || safeIso(row.updated_at);
    const stale = !observedAt || (now - Date.parse(observedAt)) > staleHours * 3600000 || (now - Date.parse(observedAt)) < 0;
    // Only the public Website probe may use trusted-but-unauthenticated
    // provenance. GitHub, Cloudflare and Drive must be authenticated.
    const sourceVerified = jobType === "audit.website.journey"
      ? (result?.source_authenticated === true || result?.source_trusted === true)
      : result?.source_authenticated === true;
    const coverage = result?.coverage_complete === true && sourceVerified
      ? "COMPLETE"
      : "PARTIAL";
    return {
      job_type: jobType,
      label: AUDIT_JOB_LABELS[jobType],
      state: String(row.state || "UNKNOWN").slice(0, 40),
      coverage,
      open_count: finiteCount(result?.open_count),
      p0_count: finiteCount(result?.p0_count),
      p1_count: finiteCount(result?.p1_count),
      observed_at: observedAt,
      stale,
      execution_failed: String(row.state || "").toUpperCase() === "FAILED",
    };
  });

  const totals = auditors.reduce((acc, item) => {
    acc.open_count += item.open_count;
    acc.p0_count += item.p0_count;
    acc.p1_count += item.p1_count;
    acc.stale_count += item.stale ? 1 : 0;
    acc.not_run_count += item.coverage === "NOT_RUN" ? 1 : 0;
    acc.partial_count += item.coverage === "PARTIAL" ? 1 : 0;
    acc.execution_failed_count += item.execution_failed ? 1 : 0;
    return acc;
  }, { open_count: 0, p0_count: 0, p1_count: 0, stale_count: 0, not_run_count: 0, partial_count: 0, execution_failed_count: 0 });

  let status = "HEALTHY";
  if (totals.p0_count > 0) status = "P0";
  else if (totals.p1_count > 0 || totals.execution_failed_count > 0) status = "P1";
  else if (totals.not_run_count > 0) status = "NOT_RUN";
  else if (totals.partial_count > 0 || totals.stale_count > 0) status = "PARTIAL";

  return { status, ...totals, auditors, raw_result_exposed: false };
}
