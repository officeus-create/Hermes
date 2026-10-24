function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function finiteNonnegativeInteger(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.trunc(numeric) : null;
}

function finiteNonnegativeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

export async function ensureAiUsageLedgerSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_ai_usage (
      usage_id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      contract_version TEXT NOT NULL,
      contract_sha256 TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      model TEXT NOT NULL,
      budget_usd REAL NOT NULL,
      cost_usd REAL NOT NULL,
      input_tokens INTEGER,
      output_tokens INTEGER,
      input_chars INTEGER NOT NULL,
      output_chars INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hae_ai_usage_job_created ON hermes_automation_ai_usage(job_id,created_at)"
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hae_ai_usage_provider_created ON hermes_automation_ai_usage(provider_id,created_at)"
  ).run();
}

export async function recordAiUsage(env, {
  job_id,
  role_id,
  contract_version,
  contract_sha256,
  provider_id,
  model,
  budget_usd,
  cost_usd,
  usage,
  status = "PROVIDER_RETURNED",
}) {
  if (!env?.DB) throw new Error("database_not_configured");
  const jobId = clean(job_id, 160);
  const roleId = clean(role_id, 160);
  const contractVersion = clean(contract_version, 160);
  const contractSha = clean(contract_sha256, 64);
  const providerId = clean(provider_id, 120);
  const modelId = clean(model, 200);
  const budget = finiteNonnegativeNumber(budget_usd);
  const cost = finiteNonnegativeNumber(cost_usd);
  if (!jobId || !roleId || !contractVersion || !/^[0-9a-f]{64}$/.test(contractSha)) throw new Error("ai_usage_contract_identity_invalid");
  if (!providerId || !modelId) throw new Error("ai_usage_provider_identity_invalid");
  if (budget === null || cost === null) throw new Error("ai_usage_cost_invalid");
  if (cost > budget + 1e-9) throw new Error("ai_budget_exceeded");

  const receipt = usage && typeof usage === "object" ? usage : {};
  const inputTokens = finiteNonnegativeInteger(receipt.input_tokens);
  const outputTokens = finiteNonnegativeInteger(receipt.output_tokens);
  const inputChars = finiteNonnegativeInteger(receipt.input_chars);
  const outputChars = finiteNonnegativeInteger(receipt.output_chars);
  if (inputChars === null || outputChars === null) throw new Error("ai_usage_character_counts_required");

  await ensureAiUsageLedgerSchema(env.DB);
  const createdAt = new Date().toISOString();
  const usageId = `ai:${jobId}:${crypto.randomUUID()}`;
  await env.DB.prepare(`
    INSERT INTO hermes_automation_ai_usage (
      usage_id,job_id,role_id,contract_version,contract_sha256,provider_id,model,
      budget_usd,cost_usd,input_tokens,output_tokens,input_chars,output_chars,status,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    usageId,
    jobId,
    roleId,
    contractVersion,
    contractSha,
    providerId,
    modelId,
    budget,
    cost,
    inputTokens,
    outputTokens,
    inputChars,
    outputChars,
    clean(status, 80) || "PROVIDER_RETURNED",
    createdAt,
  ).run();
  return {
    usage_id: usageId,
    budget_usd: budget,
    cost_usd: cost,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    input_chars: inputChars,
    output_chars: outputChars,
    created_at: createdAt,
  };
}

export async function aiUsageLedgerSnapshot(env, limit = 50) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureAiUsageLedgerSchema(env.DB);
  const totals = await env.DB.prepare(`
    SELECT
      COUNT(*) AS calls,
      COALESCE(SUM(cost_usd),0) AS cost_usd,
      COALESCE(SUM(input_tokens),0) AS input_tokens,
      COALESCE(SUM(output_tokens),0) AS output_tokens,
      COALESCE(SUM(input_chars),0) AS input_chars,
      COALESCE(SUM(output_chars),0) AS output_chars
    FROM hermes_automation_ai_usage
  `).first();
  const byProvider = await env.DB.prepare(`
    SELECT provider_id,model,COUNT(*) AS calls,COALESCE(SUM(cost_usd),0) AS cost_usd
    FROM hermes_automation_ai_usage
    GROUP BY provider_id,model
    ORDER BY calls DESC,provider_id,model
  `).all();
  const recent = await env.DB.prepare(`
    SELECT usage_id,job_id,role_id,contract_version,contract_sha256,provider_id,model,
           budget_usd,cost_usd,input_tokens,output_tokens,input_chars,output_chars,status,created_at
    FROM hermes_automation_ai_usage
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(Math.max(1, Math.min(100, Number(limit) || 50))).all();
  return {
    totals: totals || {
      calls: 0,
      cost_usd: 0,
      input_tokens: 0,
      output_tokens: 0,
      input_chars: 0,
      output_chars: 0,
    },
    by_provider: byProvider?.results || [],
    recent: recent?.results || [],
  };
}