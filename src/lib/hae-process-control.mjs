const PROCESS_STATES = new Set(["paused", "active", "blocked"]);

export const HAE_OWNER_PROCESS_TEMPLATES = Object.freeze([
  Object.freeze({
    job_type: "logistics.source.freshness.audit",
    role_id: "hermes-dispatch-os",
    business_lane: "logistics",
    workstream: "logistics",
    label: "Logistics source freshness",
    label_ru: "Свежесть источников логистики",
    allowed_cadence_hours: Object.freeze([1, 6, 12, 24]),
  }),
  Object.freeze({
    job_type: "ai.gateway.readiness.audit",
    role_id: "hermes-automatic-engineer",
    business_lane: "automation",
    workstream: "technology",
    label: "AI gateway readiness",
    label_ru: "Готовность AI gateway",
    allowed_cadence_hours: Object.freeze([6, 12, 24]),
  }),
  Object.freeze({
    job_type: "hae.self.improvement.audit",
    role_id: "hermes-automatic-engineer",
    business_lane: "automation",
    workstream: "technology",
    label: "HAE self-improvement audit",
    label_ru: "Аудит самоулучшения HAE",
    allowed_cadence_hours: Object.freeze([6, 12, 24]),
  }),
  Object.freeze({
    job_type: "marketing.content.dedupe.audit",
    role_id: "hermes-marketing-growth",
    business_lane: "marketing",
    workstream: "marketing",
    label: "Marketing content duplicate audit",
    label_ru: "Проверка дублей маркетинг-контента",
    allowed_cadence_hours: Object.freeze([6, 12, 24]),
  }),
  Object.freeze({
    job_type: "search.snapshot.evaluate",
    role_id: "hermes-search-growth",
    business_lane: "search",
    workstream: "marketing",
    label: "Search health snapshot",
    label_ru: "Снимок состояния поиска",
    allowed_cadence_hours: Object.freeze([24, 168]),
  }),
  Object.freeze({
    job_type: "academy.english.practice.build",
    role_id: "hermes-academy",
    business_lane: "academy",
    workstream: "academy",
    label: "Daily work-English practice",
    label_ru: "Ежедневная практика рабочего английского",
    allowed_cadence_hours: Object.freeze([24]),
  }),
]);

export function haeProcessTemplate(jobType) {
  const normalized = String(jobType || "").trim();
  return HAE_OWNER_PROCESS_TEMPLATES.find((template) => template.job_type === normalized) || null;
}

export function normalizeHaeProcessCadence(jobType, value) {
  const template = haeProcessTemplate(jobType);
  const cadence = Number(value);
  return template && Number.isInteger(cadence) && template.allowed_cadence_hours.includes(cadence)
    ? cadence
    : null;
}

export function normalizeHaeProcessName(value, fallback = "") {
  const normalized = String(value || fallback || "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized && normalized.length <= 160 ? normalized : null;
}

export function newHaeProcessId() {
  return `haep_${crypto.randomUUID()}`;
}

export async function ensureHaeProcessSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_automation_processes (
    process_id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    business_lane TEXT NOT NULL,
    workstream TEXT NOT NULL,
    role_id TEXT NOT NULL,
    cadence_hours INTEGER NOT NULL CHECK (cadence_hours IN (1,6,12,24,168)),
    timezone TEXT NOT NULL DEFAULT 'UTC' CHECK (timezone = 'UTC'),
    status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('paused','active','blocked')),
    max_cost_usd_cents INTEGER NOT NULL DEFAULT 0 CHECK (max_cost_usd_cents = 0),
    next_run_at TEXT,
    lease_until TEXT,
    last_run_at TEXT,
    last_job_id TEXT,
    last_error_class TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(organization_scope, job_type)
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_processes_due ON hermes_automation_processes(organization_scope,status,next_run_at)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_automation_process_events (
    event_id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor_specialist_id TEXT,
    from_status TEXT,
    to_status TEXT,
    job_id TEXT,
    error_class TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(process_id) REFERENCES hermes_automation_processes(process_id)
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_process_events_process_created ON hermes_automation_process_events(process_id,created_at)").run();
}

/**
 * @param {any} db
 * @param {{
 *   processId: string,
 *   eventType: string,
 *   actorSpecialistId?: string | null,
 *   fromStatus?: string | null,
 *   toStatus?: string | null,
 *   jobId?: string | null,
 *   errorClass?: string | null,
 *   createdAt?: string,
 *   onlyIfPreviousStatementChanged?: boolean,
 * }} input
 */
export function haeProcessEventStatement(db, {
  processId,
  eventType,
  actorSpecialistId = null,
  fromStatus = null,
  toStatus = null,
  jobId = null,
  errorClass = null,
  createdAt = new Date().toISOString(),
  onlyIfPreviousStatementChanged = false,
}) {
  const values = [
    `haepe_${crypto.randomUUID()}`,
    processId,
    eventType,
    actorSpecialistId,
    fromStatus,
    toStatus,
    jobId,
    errorClass,
    createdAt,
  ];
  if (onlyIfPreviousStatementChanged) {
    return db.prepare(`INSERT INTO hermes_automation_process_events
      (event_id,process_id,event_type,actor_specialist_id,from_status,to_status,job_id,error_class,created_at)
      SELECT ?,?,?,?,?,?,?,?,? WHERE changes() = 1`).bind(...values);
  }
  return db.prepare(`INSERT INTO hermes_automation_process_events
    (event_id,process_id,event_type,actor_specialist_id,from_status,to_status,job_id,error_class,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).bind(...values);
}

function safeReceiptObject(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function boundedCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 && count <= 1000000 ? count : null;
}

export function publicHaeAuditSummary(resultJson, fallbackCapability = "") {
  const receipt = safeReceiptObject(resultJson);
  if (!receipt) return null;
  const result = receipt.result && typeof receipt.result === "object" && !Array.isArray(receipt.result)
    ? receipt.result
    : {};
  const sourceStatus = ["VERIFIED", "PARTIAL", "ACCESS_GAP"].includes(String(result.source_status || ""))
    ? String(result.source_status)
    : null;
  const summary = {
    capability: String(receipt.capability || fallbackCapability || "").slice(0, 120) || null,
    observed_at: typeof receipt.observed_at === "string" ? receipt.observed_at : null,
    source_status: sourceStatus,
    coverage_complete: typeof result.coverage_complete === "boolean" ? result.coverage_complete : null,
    access_gap: result.access_gap === true,
    p0_count: boundedCount(result.p0_count),
    open_count: boundedCount(result.open_count),
    unowned_count: boundedCount(result.unowned_count),
    repeated_regression_count: boundedCount(result.repeated_regression_count),
    http_error_count: boundedCount(result.http_error_count),
    canonical_defect_count: boundedCount(result.canonical_defect_count),
    redirect_drift_count: boundedCount(result.redirect_drift_count),
  };
  const hasEvidence = Object.entries(summary).some(([key, value]) => key !== "capability" && value !== null && value !== false);
  return hasEvidence ? summary : null;
}

export function haeAuditAttentionRequired(row, summary = publicHaeAuditSummary(row?.result_json, row?.job_type)) {
  const state = String(row?.last_job_state || row?.state || "").toUpperCase();
  if (["FAILED", "DEAD_LETTER", "QUARANTINED"].includes(state)) return true;
  if (row?.last_error_class || row?.last_job_error_class) return true;
  if (!summary) return false;
  if (summary.access_gap || summary.source_status === "ACCESS_GAP") return true;
  if (summary.source_status === "PARTIAL" || summary.coverage_complete === false) return true;
  return [
    summary.p0_count,
    summary.unowned_count,
    summary.repeated_regression_count,
    summary.http_error_count,
    summary.canonical_defect_count,
    summary.redirect_drift_count,
  ].some((value) => Number(value || 0) > 0);
}

export function publicHaeSystemJob(row) {
  if (!row) return null;
  const summary = publicHaeAuditSummary(row.result_json, row.job_type);
  const roleContract = safeReceiptObject(row.result_json)?.role_contract;
  return {
    id: `system:${String(row.job_type)}`,
    name: String(row.job_type),
    job_type: String(row.job_type),
    business_lane: String(row.business_lane || "automation"),
    workstream: String(row.business_lane || "automation"),
    role_id: roleContract && typeof roleContract.role_id === "string" ? roleContract.role_id : null,
    cadence_hours: null,
    timezone: "UTC",
    status: haeAuditAttentionRequired(row, summary) ? "blocked" : "active",
    managed_by: "system",
    last_run_at: row.created_at || null,
    last_job_id: row.job_id || null,
    last_job_state: row.state || null,
    last_job_completed_at: row.completed_at || null,
    last_error_class: row.last_error_class || null,
    audit_summary: summary,
    attention_required: haeAuditAttentionRequired(row, summary),
    template_label: String(row.job_type),
    template_label_ru: String(row.job_type),
  };
}

export function publicHaeProcess(row) {
  if (!row) return null;
  const template = haeProcessTemplate(row.job_type);
  const status = PROCESS_STATES.has(String(row.status)) ? String(row.status) : "blocked";
  return {
    id: String(row.process_id),
    name: String(row.name),
    job_type: String(row.job_type),
    business_lane: String(row.business_lane),
    workstream: String(row.workstream),
    role_id: String(row.role_id),
    cadence_hours: Number(row.cadence_hours),
    timezone: "UTC",
    status,
    max_cost_usd: 0,
    next_run_at: row.next_run_at || null,
    last_run_at: row.last_run_at || null,
    last_job_id: row.last_job_id || null,
    last_job_state: row.last_job_state || null,
    last_job_completed_at: row.last_job_completed_at || null,
    last_error_class: row.last_error_class || row.last_job_error_class || null,
    audit_summary: publicHaeAuditSummary(row.last_job_result_json, row.job_type),
    attention_required: haeAuditAttentionRequired(row, publicHaeAuditSummary(row.last_job_result_json, row.job_type)),
    managed_by: "owner",
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
    template_label: template?.label || String(row.job_type),
    template_label_ru: template?.label_ru || String(row.job_type),
  };
}
