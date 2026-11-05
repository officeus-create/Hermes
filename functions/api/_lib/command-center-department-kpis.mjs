const KNOWN = "KNOWN";
const UNKNOWN = "UNKNOWN";

const cleanState = (value) => String(value || "UNKNOWN").toUpperCase().replace(/[^A-Z0-9_]/g, "_");

function unknownMetric(key, label, reason, source) {
  return { key, label, state: UNKNOWN, value: null, unit: null, currency: null, reason, source };
}

function knownMetric(key, label, value, { unit = "count", currency = null, source = null } = {}) {
  return { key, label, state: KNOWN, value, unit, currency, reason: null, source };
}

async function safeFirst(db, sql, bindings = []) {
  if (!db?.prepare) return { ok: false, state: "NOT_CONFIGURED", row: null };
  try {
    let statement = db.prepare(sql);
    if (bindings.length) statement = statement.bind(...bindings);
    const row = await statement.first();
    return { ok: true, state: "CONNECTED", row: row || {} };
  } catch (error) {
    return {
      ok: false,
      state: "SOURCE_UNAVAILABLE",
      row: null,
      error_class: String(error?.name || "Error"),
    };
  }
}

async function safeAll(db, sql, bindings = []) {
  if (!db?.prepare) return { ok: false, state: "NOT_CONFIGURED", rows: [] };
  try {
    let statement = db.prepare(sql);
    if (bindings.length) statement = statement.bind(...bindings);
    const result = await statement.all();
    return { ok: true, state: "CONNECTED", rows: result?.results || [] };
  } catch (error) {
    return {
      ok: false,
      state: "SOURCE_UNAVAILABLE",
      rows: [],
      error_class: String(error?.name || "Error"),
    };
  }
}

function sectionState(parts = []) {
  const ok = parts.filter((part) => part?.ok).length;
  if (ok === parts.length && parts.length) return "CONNECTED";
  if (ok > 0) return "PARTIAL_SCOPE";
  if (parts.some((part) => part?.state === "NOT_CONFIGURED")) return "NOT_CONFIGURED";
  return "SOURCE_UNAVAILABLE";
}

function numeric(row, key) {
  const value = row?.[key];
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function readDepartmentKpiSources(db, checkedAt = new Date().toISOString()) {
  const now = checkedAt;

  const marketingEvidence = await safeFirst(db, `
    SELECT COUNT(*) AS evidence_rows, MAX(observed_at) AS freshest_observed_at
    FROM hermes_academy_business_evidence
    WHERE archived_at IS NULL
  `);

  const logisticsLoadBoard = await safeFirst(db, `
    SELECT
      (SELECT COUNT(*) FROM hermes_load_sources WHERE status='active' AND ingest_enabled=1) AS active_sources,
      (SELECT COUNT(*) FROM hermes_load_records WHERE record_type='load' AND status='active' AND expires_at > ?) AS active_loads,
      (SELECT COUNT(*) FROM hermes_load_quarantine WHERE status='pending_review') AS quarantine_pending,
      (SELECT MAX(observed_at) FROM hermes_load_records) AS freshest_observed_at
  `, [now]);
  const logisticsCarriers = await safeFirst(db, `
    SELECT COUNT(*) AS active_carrier_entitlements
    FROM hermes_carrier_board_entitlements
    WHERE status='active'
  `);

  const salesHomeServices = await safeFirst(db, `
    SELECT
      COUNT(*) AS total_leads,
      SUM(CASE WHEN status IN ('booked','in_progress','completed') THEN 1 ELSE 0 END) AS progressed_leads,
      MAX(updated_at) AS freshest_updated_at
    FROM hermes_home_service_leads
  `);
  const salesDealer = await safeFirst(db, `
    SELECT COUNT(*) AS dealer_customers, MAX(updated_at) AS freshest_updated_at
    FROM hermes_dealer_customers
  `);

  const academy = await safeFirst(db, `
    SELECT
      (SELECT COUNT(*) FROM hermes_academy_business_leads WHERE archived_at IS NULL) AS active_leads,
      (SELECT COUNT(*) FROM hermes_academy_business_programs WHERE archived_at IS NULL AND status='active') AS active_programs,
      (SELECT COUNT(*) FROM hermes_academy_business_participants WHERE archived_at IS NULL AND state='active') AS active_participants,
      (SELECT COUNT(*) FROM hermes_academy_business_participants
        WHERE archived_at IS NULL AND state='completed' AND completion_state='completed'
          AND completion_source_ref IS NOT NULL AND TRIM(completion_source_ref) <> '') AS evidenced_completions
  `);

  const academyRevenue = await safeAll(db, `
    SELECT UPPER(TRIM(revenue_currency)) AS currency,
      SUM(sale_revenue_cents) AS cents,
      COUNT(*) AS evidence_rows
    FROM hermes_academy_business_leads
    WHERE archived_at IS NULL
      AND sale_revenue_cents IS NOT NULL
      AND sale_revenue_cents >= 0
      AND revenue_source_ref IS NOT NULL
      AND TRIM(revenue_source_ref) <> ''
      AND revenue_currency IS NOT NULL
      AND TRIM(revenue_currency) <> ''
    GROUP BY UPPER(TRIM(revenue_currency))
    ORDER BY UPPER(TRIM(revenue_currency))
  `);

  return {
    checked_at: checkedAt,
    marketing: {
      source_state: marketingEvidence.ok ? "PARTIAL_SCOPE" : marketingEvidence.state,
      scope: "ACADEMY_BUSINESS_MEASUREMENT_ONLY",
      evidence: marketingEvidence,
    },
    logistics: {
      source_state: sectionState([logisticsLoadBoard, logisticsCarriers]),
      scope: "LOAD_BOARD_AND_VERIFIED_CARRIER_ACCESS",
      load_board: logisticsLoadBoard,
      carriers: logisticsCarriers,
    },
    sales: {
      source_state: sectionState([salesHomeServices, salesDealer]),
      scope: "VERTICAL_CRM_PARTIAL_NO_GLOBAL_SALES_ROLLUP",
      home_services: salesHomeServices,
      dealer: salesDealer,
    },
    academy: {
      source_state: academy.ok ? "CONNECTED" : academy.state,
      scope: "ACADEMY_BUSINESS_CRM",
      evidence: academy,
    },
    finance: {
      source_state: academyRevenue.ok ? "PARTIAL_SCOPE" : academyRevenue.state,
      scope: "EVIDENCED_ACADEMY_REVENUE_NOT_RECEIVED_CASH",
      academy_revenue: academyRevenue,
    },
  };
}

function taskCount(tasks, workstream, predicate = () => true) {
  return (tasks || []).filter((task) => String(task?.workstream || "") === workstream && predicate(task)).length;
}

function dbMetric(part, rowKey, key, label, source) {
  if (!part?.ok) return unknownMetric(key, label, part?.state || "SOURCE_UNAVAILABLE", source);
  const value = numeric(part.row, rowKey);
  return value === null
    ? unknownMetric(key, label, "VALUE_UNAVAILABLE", source)
    : knownMetric(key, label, value, { source });
}

export function buildDepartmentKpis({
  sources = {},
  githubDevelopments = {},
  processes = [],
  runner = {},
  tasks = [],
  checkedAt = new Date().toISOString(),
} = {}) {
  const marketing = sources.marketing || {};
  const logistics = sources.logistics || {};
  const sales = sources.sales || {};
  const academy = sources.academy || {};
  const finance = sources.finance || {};

  const marketingMetrics = [
    dbMetric(marketing.evidence, "evidence_rows", "academy_measurement_evidence_rows", "Scoped measurement evidence", "hermes_academy_business_evidence"),
    unknownMetric("global_verified_marketing_kpis", "Global verified marketing KPI set", "NO_CANONICAL_GLOBAL_AGGREGATION", "canonical_marketing_sources"),
  ];

  const logisticsMetrics = [
    dbMetric(logistics.load_board, "active_sources", "active_load_sources", "Active load sources", "hermes_load_sources"),
    dbMetric(logistics.load_board, "active_loads", "active_loads", "Active loads", "hermes_load_records"),
    dbMetric(logistics.load_board, "quarantine_pending", "quarantine_pending", "Quarantine pending", "hermes_load_quarantine"),
    dbMetric(logistics.carriers, "active_carrier_entitlements", "verified_carrier_access", "Verified carrier access", "hermes_carrier_board_entitlements"),
  ];

  const salesMetrics = [
    dbMetric(sales.home_services, "total_leads", "home_service_leads", "Home-service CRM leads", "hermes_home_service_leads"),
    dbMetric(sales.home_services, "progressed_leads", "home_service_progressed", "Home-service progressed", "hermes_home_service_leads"),
    dbMetric(sales.dealer, "dealer_customers", "dealer_customers", "Dealer CRM customers", "hermes_dealer_customers"),
    unknownMetric("global_sales_pipeline", "Global Hermes sales pipeline", "NO_CANONICAL_GLOBAL_SALES_ROLLUP", "vertical_crm_sources"),
  ];

  const academyMetrics = [
    dbMetric(academy.evidence, "active_leads", "academy_active_leads", "Active Academy leads", "hermes_academy_business_leads"),
    dbMetric(academy.evidence, "active_programs", "academy_active_programs", "Active programs", "hermes_academy_business_programs"),
    dbMetric(academy.evidence, "active_participants", "academy_active_participants", "Active participants", "hermes_academy_business_participants"),
    dbMetric(academy.evidence, "evidenced_completions", "academy_evidenced_completions", "Evidenced completions", "hermes_academy_business_participants"),
  ];

  const financeMetrics = [];
  if (finance.academy_revenue?.ok) {
    for (const row of finance.academy_revenue.rows || []) {
      const currency = String(row.currency || "").trim().toUpperCase();
      const cents = numeric(row, "cents");
      if (!currency || cents === null) continue;
      financeMetrics.push(knownMetric(
        `academy_evidenced_revenue_${currency.toLowerCase()}`,
        `Academy evidenced revenue · ${currency}`,
        cents,
        { unit: "currency_cents", currency, source: "hermes_academy_business_leads.revenue_source_ref" },
      ));
    }
  }
  if (!financeMetrics.length) {
    financeMetrics.push(unknownMetric("academy_evidenced_revenue", "Academy evidenced revenue", finance.academy_revenue?.state || "SOURCE_UNAVAILABLE", "hermes_academy_business_leads"));
  }
  financeMetrics.push(unknownMetric("received_cash", "Received cash", "NO_CANONICAL_PAYMENT_LEDGER", "finance_payment_source"));
  financeMetrics.push(unknownMetric("forecast", "Forecast / pipeline money", "NO_VERIFIED_FINANCE_FORECAST_SOURCE", "finance_forecast_source"));

  const pulls = Array.isArray(githubDevelopments?.pulls) ? githubDevelopments.pulls : [];
  const openPulls = pulls.filter((pull) => String(pull?.state || "").toLowerCase() === "open");
  const approvedPulls = openPulls.filter((pull) => cleanState(pull?.review_state) === "APPROVED");
  const technologyMetrics = [
    knownMetric("open_prs", "Open developments", openPulls.length, { source: "github" }),
    knownMetric("approved_open_prs", "Approved open developments", approvedPulls.length, { source: "github" }),
    knownMetric("active_hae_processes", "Active HAE processes", (processes || []).filter((process) => process?.status === "active").length, { source: "hermes_automation_processes" }),
    knownMetric("technology_active_work", "Technology work in motion", taskCount(tasks, "technology", (task) => ["ASSIGNED","STARTED","OWNER_GATE","EXECUTED"].includes(String(task?.current_stage))), { source: "hermes_owner_work_items" }),
  ];

  const operationsMetrics = [
    knownMetric("operations_active_work", "Operations work in motion", taskCount(tasks, "operations", (task) => ["ASSIGNED","STARTED","OWNER_GATE","EXECUTED"].includes(String(task?.current_stage))), { source: "hermes_owner_work_items" }),
    knownMetric("operations_blocked_work", "Operations blocked", taskCount(tasks, "operations", (task) => String(task?.current_stage) === "BLOCKED"), { source: "hermes_owner_work_items" }),
    knownMetric("automation_processes", "HAE processes", (processes || []).length, { source: "hermes_automation_processes" }),
  ];

  const agentsMetrics = [
    knownMetric("linked_ai_work", "Linked AI work items", (tasks || []).filter((task) => Boolean(task?.work_id)).length, { source: "hermes_internal_ai_tasks" }),
    knownMetric("owner_gates", "Owner gates", (tasks || []).filter((task) => String(task?.current_stage) === "OWNER_GATE").length, { source: "hermes_internal_ai_tasks" }),
    knownMetric("runner_state", "Runner heartbeat", runner?.online ? "HEARTBEAT_FRESH" : "OFFLINE_OR_UNKNOWN", { unit: "state", source: "hermes_internal_ai_runner_state" }),
  ];

  return [
    {
      id: "marketing", label: "Marketing", source_state: marketing.source_state || "UNKNOWN",
      scope: marketing.scope || "UNKNOWN", checked_at: checkedAt, metrics: marketingMetrics,
      note: "Partial Academy measurement evidence is never promoted to a global Hermes marketing total.",
    },
    {
      id: "logistics", label: "Logistics", source_state: logistics.source_state || "UNKNOWN",
      scope: logistics.scope || "UNKNOWN", checked_at: checkedAt, metrics: logisticsMetrics,
      note: "Counts come only from canonical Load Board and verified carrier-access records.",
    },
    {
      id: "sales", label: "Sales", source_state: sales.source_state || "UNKNOWN",
      scope: sales.scope || "UNKNOWN", checked_at: checkedAt, metrics: salesMetrics,
      note: "Vertical CRM counts remain scoped; no synthetic lead or cross-vertical pipeline total is inferred.",
    },
    {
      id: "academy", label: "Academy", source_state: academy.source_state || "UNKNOWN",
      scope: academy.scope || "UNKNOWN", checked_at: checkedAt, metrics: academyMetrics,
      note: "Academy counts are read from the existing Academy business CRM only.",
    },
    {
      id: "finance", label: "Finance", source_state: finance.source_state || "UNKNOWN",
      scope: finance.scope || "UNKNOWN", checked_at: checkedAt, metrics: financeMetrics,
      note: "Evidenced revenue is not labeled as received cash. Cash and forecast remain UNKNOWN without canonical finance sources.",
    },
    {
      id: "technology", label: "Technology", source_state: githubDevelopments?.source_state || "UNKNOWN",
      scope: "GITHUB_DEVELOPMENTS_HAE_AND_OWNER_WORK", checked_at: checkedAt, metrics: technologyMetrics,
      note: "Technology health is a source projection; LIVE remains a separate production-evidence gate.",
    },
    {
      id: "operations", label: "Operations", source_state: "CONNECTED_READ_MODEL",
      scope: "OWNER_WORK_AND_HAE_PROCESS_CONTROL", checked_at: checkedAt, metrics: operationsMetrics,
      note: "Operations status reflects canonical owner work and HAE process records, not invented throughput.",
    },
    {
      id: "agents", label: "Agents", source_state: runner?.online ? "HEARTBEAT_FRESH" : "OFFLINE_OR_UNKNOWN",
      scope: "INTERNAL_AI_TASKS_RUNNER_AND_OWNER_GATES", checked_at: checkedAt, metrics: agentsMetrics,
      note: "A fresh heartbeat is runtime presence, not proof of task execution.",
    },
  ];
}
