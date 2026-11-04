import assert from "node:assert/strict";
import { aiUsageLedgerSnapshot, recordAiUsage } from "../workers/automation-engine/src/ai-usage-ledger.mjs";

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = String(sql).replace(/\s+/g, " ").trim();
    this.args = [];
  }
  bind(...args) { this.args = args; return this; }
  async run() {
    if (this.sql.startsWith("CREATE TABLE") || this.sql.startsWith("CREATE INDEX")) return { meta: { changes: 0 } };
    if (this.sql.startsWith("INSERT INTO hermes_automation_ai_usage")) {
      const [
        usageId, jobId, roleId, contractVersion, contractSha, providerId, model,
        budgetUsd, costUsd, inputTokens, outputTokens, inputChars, outputChars, status, createdAt,
      ] = this.args;
      this.db.rows.push({
        usage_id: usageId,
        job_id: jobId,
        role_id: roleId,
        contract_version: contractVersion,
        contract_sha256: contractSha,
        provider_id: providerId,
        model,
        budget_usd: budgetUsd,
        cost_usd: costUsd,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        input_chars: inputChars,
        output_chars: outputChars,
        status,
        created_at: createdAt,
      });
      return { meta: { changes: 1 } };
    }
    throw new Error(`unexpected_run_sql: ${this.sql}`);
  }
  async first() {
    if (this.sql.includes("FROM hermes_automation_ai_usage")) {
      return {
        calls: this.db.rows.length,
        cost_usd: this.db.rows.reduce((sum, row) => sum + Number(row.cost_usd || 0), 0),
        input_tokens: this.db.rows.reduce((sum, row) => sum + Number(row.input_tokens || 0), 0),
        output_tokens: this.db.rows.reduce((sum, row) => sum + Number(row.output_tokens || 0), 0),
        input_chars: this.db.rows.reduce((sum, row) => sum + Number(row.input_chars || 0), 0),
        output_chars: this.db.rows.reduce((sum, row) => sum + Number(row.output_chars || 0), 0),
      };
    }
    throw new Error(`unexpected_first_sql: ${this.sql}`);
  }
  async all() {
    if (this.sql.includes("GROUP BY provider_id,model")) {
      const groups = new Map();
      for (const row of this.db.rows) {
        const key = `${row.provider_id}|${row.model}`;
        const current = groups.get(key) || { provider_id: row.provider_id, model: row.model, calls: 0, cost_usd: 0 };
        current.calls += 1;
        current.cost_usd += Number(row.cost_usd || 0);
        groups.set(key, current);
      }
      return { results: [...groups.values()] };
    }
    if (this.sql.includes("ORDER BY created_at DESC")) {
      const limit = Number(this.args[0] || 50);
      return { results: [...this.db.rows].reverse().slice(0, limit) };
    }
    throw new Error(`unexpected_all_sql: ${this.sql}`);
  }
}

class FakeDB {
  constructor() { this.rows = []; }
  prepare(sql) { return new FakeStatement(this, sql); }
}

const DB = new FakeDB();
const env = { DB };
const sha = "a".repeat(64);

const receipt = await recordAiUsage(env, {
  job_id: "job:semantic-1",
  role_id: "hermes-search-growth",
  contract_version: "search-defect-prioritize-v1",
  contract_sha256: sha,
  provider_id: "cloudflare-workers-ai",
  model: "@cf/test/free",
  budget_usd: 0,
  cost_usd: 0,
  usage: {
    input_tokens: 120,
    output_tokens: 40,
    input_chars: 800,
    output_chars: 300,
  },
});
assert.match(receipt.usage_id, /^ai:job:semantic-1:/);
assert.equal(receipt.budget_usd, 0);
assert.equal(receipt.cost_usd, 0);
assert.equal(DB.rows.length, 1);
assert.equal(DB.rows[0].provider_id, "cloudflare-workers-ai");
assert.equal(DB.rows[0].input_tokens, 120);

await assert.rejects(
  () => recordAiUsage(env, {
    job_id: "job:paid",
    role_id: "hermes-search-growth",
    contract_version: "search-defect-prioritize-v1",
    contract_sha256: sha,
    provider_id: "some-provider",
    model: "paid-model",
    budget_usd: 0,
    cost_usd: 0.01,
    usage: { input_chars: 1, output_chars: 1 },
  }),
  /ai_budget_exceeded/,
);
assert.equal(DB.rows.length, 1, "Over-budget usage must fail before ledger insert");

const snapshot = await aiUsageLedgerSnapshot(env, 20);
assert.equal(snapshot.totals.calls, 1);
assert.equal(snapshot.totals.cost_usd, 0);
assert.equal(snapshot.totals.input_tokens, 120);
assert.equal(snapshot.by_provider[0].calls, 1);
assert.equal(snapshot.recent[0].budget_usd, 0);

console.log("HAE AI usage ledger PASS: zero-dollar budget enforced and provider usage receipted");