const SHA40 = /^[0-9a-f]{40}$/;
const HOUR_MS = 3600000;

function parsedIso(value) {
  const raw = String(value || "").trim();
  const ms = Date.parse(raw);
  return raw && Number.isFinite(ms) ? ms : null;
}

function cleanJobType(value) {
  return String(value || "").replace(/[^a-z0-9._:-]/gi, "").slice(0, 120);
}

export function scheduledReceiptFreshnessFindings(input = {}) {
  const scheduledAt = parsedIso(input.scheduled_at);
  const deploymentFirstObservedAt = parsedIso(input.deployment_first_observed_at);
  const sourceSha = String(input.source_sha || "").trim().toLowerCase();
  if (scheduledAt === null || deploymentFirstObservedAt === null || !SHA40.test(sourceSha)) return [];

  const latest = input.latest_receipts && typeof input.latest_receipts === "object"
    ? input.latest_receipts
    : {};
  const contracts = Array.isArray(input.contracts) ? input.contracts : [];
  const findings = [];

  for (const item of contracts) {
    const jobType = cleanJobType(item?.job_type);
    const cadenceHours = Number(item?.cadence_hours || 0);
    if (!jobType || !Number.isInteger(cadenceHours) || cadenceHours < 1 || cadenceHours > 24) continue;
    if (item?.owner_managed === true) continue;

    const graceHours = Math.max(12, cadenceHours * 2);
    const deploymentAgeHours = (scheduledAt - deploymentFirstObservedAt) / HOUR_MS;
    if (deploymentAgeHours < graceHours) continue;

    const latestReceiptMs = parsedIso(latest[jobType]);
    const receiptAgeHours = latestReceiptMs === null
      ? Number.POSITIVE_INFINITY
      : (scheduledAt - latestReceiptMs) / HOUR_MS;
    if (receiptAgeHours <= graceHours && receiptAgeHours >= 0) continue;

    findings.push({
      finding_id: `scheduled-receipt-stale:${jobType}`,
      source_ref: `github://officeus-create/Hermes/runtime/scheduled-role/${jobType}`,
      category: "TEST_GAP",
      severity: "P1",
      status: "BLOCKED",
      artifact_key: "workers/automation-engine/src/index.mjs",
      verified: true,
      writer_active: false,
      writer_state_verified: false,
      observed_at: new Date(scheduledAt).toISOString(),
    });
  }

  return findings;
}
