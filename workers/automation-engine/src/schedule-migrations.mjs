const MIGRATIONS = [
  ["dispatch-daily-closeout", "Dispatch Daily Closeout", "hermes-dispatch-os", ["dispatch.daily.closeout.audit"], "SOURCE_ADAPTER_REQUIRED"],
  ["knowledge-mining", "Hermes Knowledge Mining", "hermes-connect-operator", ["knowledge.evidence.audit"], "SOURCE_ADAPTER_REQUIRED"],
  ["web-technology-radar", "Hermes Web Technology Radar", "hermes-automatic-engineer", ["technology.release.radar"], "SOURCE_ADAPTER_REQUIRED"],
  ["ai-gateway-readiness", "Hermes AI Gateway readiness", "hermes-automatic-engineer", ["ai.gateway.readiness.audit"], "READY_ZERO_TOKEN"],
  ["growth-error-closure", "Hermes Growth + Error Closure", "hermes-marketing-growth", ["growth.error.closure.audit"], "SOURCE_ADAPTER_REQUIRED"],
  ["ecosystem-watch", "Hermes Ecosystem Watch · Read-only Monitor", "hermes-qa-evidence-auditor", ["system.health.snapshot", "growth.error.closure.audit"], "SOURCE_ADAPTER_REQUIRED"],
  ["hae-autonomy-checkpoint", "HAE · Autonomy Checkpoints · HOLD", "hermes-qa-evidence-auditor", ["system.health.snapshot"], "READY_ZERO_TOKEN"],
  ["social-publisher", "Hermes Social Publisher", "hermes-marketing-growth", ["marketing.content.dedupe.audit"], "OWNER_GATED_WRITE_NOT_MIGRATED"],
  ["search-ai-visibility-weekly", "HERMES SEARCH & AI VISIBILITY weekly", "hermes-marketing-growth", ["search.snapshot.evaluate", "work.portfolio.reconcile"], "SOURCE_ADAPTER_REQUIRED"],
  ["car-hauling-market-weekly", "Weekly US car-hauling market review", "hermes-dispatch-os", ["market.car-hauling.snapshot.evaluate"], "SOURCE_ADAPTER_REQUIRED"],
  ["one-brain-weekly-priorities", "Weekly Hermes One Brain priorities", "hermes-agent-coordinator", ["work.portfolio.reconcile"], "SOURCE_ADAPTER_REQUIRED"],
  ["internet-mentions", "Hermes internet mentions", "hermes-marketing-growth", ["marketing.mentions.audit"], "SOURCE_ADAPTER_REQUIRED"],
  ["work-english-daily", "Conversational English for work", "hermes-academy", ["academy.english.practice.build"], "READY_ZERO_TOKEN"],
  ["seo-recovery", "Search traffic recovery", "hermes-marketing-growth", ["search.snapshot.evaluate"], "READY_ZERO_TOKEN"],
].map(([task_key, legacy_title, plugin_owner, job_types, activation_state]) => Object.freeze({
  task_key,
  legacy_title,
  plugin_owner,
  job_types: Object.freeze(job_types),
  activation_state,
  runtime_owner: "hermes-automation-engine",
  normal_loop_requires_chatgpt_task: false,
  max_cost_usd: 0,
  automatic_paid_fallback: false,
}));

export const CHATGPT_TASK_MIGRATIONS = Object.freeze(MIGRATIONS);

export function taskMigrationSnapshot(allowedJobTypes = []) {
  const allowed = new Set([
    "system.health.snapshot",
    "history.coverage.audit",
    ...allowedJobTypes,
  ]);
  const unsupported = [];
  for (const migration of CHATGPT_TASK_MIGRATIONS) {
    for (const jobType of migration.job_types) {
      if (!allowed.has(jobType)) unsupported.push(`${migration.task_key}:${jobType}`);
    }
  }
  const byState = {};
  for (const migration of CHATGPT_TASK_MIGRATIONS) {
    byState[migration.activation_state] = (byState[migration.activation_state] || 0) + 1;
  }
  return {
    recovered_task_count: CHATGPT_TASK_MIGRATIONS.length,
    activation_states: byState,
    unsupported_capability_count: unsupported.length,
    unsupported_capabilities: unsupported,
    normal_loop_requires_chatgpt_task: false,
    maximum_automatic_ai_cost_usd: 0,
    migrations: CHATGPT_TASK_MIGRATIONS,
  };
}
