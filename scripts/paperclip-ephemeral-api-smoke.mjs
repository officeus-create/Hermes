#!/usr/bin/env node
/**
 * Model-free, throwaway Paperclip API interaction proof.
 * GitHub Actions ephemeral runner only; no real Hermes/One Brain tasks.
 * Creates a synthetic company + two idle agents and one synthetic issue.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildBatch } from './paperclip-pilot-candidates.mjs';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'ephemeral_github_actions_only');
assert.equal(process.env.CI, 'true', 'ci_only');
const origin = process.env.HERMES_PAPERCLIP_TEST_URL ?? 'http://127.0.0.1:3100';
assert.equal(origin, 'http://127.0.0.1:3100', 'loopback_only');
for (const key of ['OPENAI_API_KEY','ANTHROPIC_API_KEY','OPENROUTER_API_KEY']) {
  assert.equal(process.env[key], undefined, 'provider_credentials_prohibited');
}

async function api(path, method = 'GET', body) {
  const response = await fetch(new URL(path, origin), {
    method,
    headers: { accept: 'application/json', ...(body ? {'content-type': 'application/json'} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`paperclip_api_${method}_${path.split('?')[0]}_status_${response.status}`);
  return response.json();
}

const [candidate] = buildBatch(JSON.parse(readFileSync(new URL('../fixtures/paperclip-pilot/synthetic-candidates.json', import.meta.url), 'utf8')));
assert.equal(candidate.execution, 'REVIEW_ONLY');
const company = await api('/api/companies', 'POST', {
  name: 'HERMES SYNTHETIC QA ONLY',
  description: 'Ephemeral zero-cost API contract test; not the Hermes operating company',
});
assert.ok(company.id, 'company identifier required');
const common = {
  adapterType: 'claude_local',
  adapterConfig: {},
  runtimeConfig: { heartbeat: { enabled: false } },
  budgetMonthlyCents: 0,
};
const executor = await api(`/api/companies/${company.id}/agents`, 'POST', {
  ...common,
  name: 'Synthetic Executor No Inference',
  role: 'engineer',
  capabilities: 'Synthetic no-output role only',
});
const reviewer = await api(`/api/companies/${company.id}/agents`, 'POST', {
  ...common,
  name: 'Synthetic Independent Reviewer',
  role: 'researcher',
  capabilities: 'Independent synthetic QA role only',
});
assert.ok(executor.id && reviewer.id);
assert.notEqual(executor.id, reviewer.id);
const issue = await api(`/api/companies/${company.id}/issues`, 'POST', {
  title: candidate.title,
  description: 'SYNTHETIC / REVIEW ONLY. Source: ' + candidate.source_url + '\\nHermes ID: ' + candidate.source_id + '\\nAcceptance: ' + candidate.acceptance.join(' | '),
  status: 'todo',
  priority: 'low',
  assigneeAgentId: executor.id,
});
assert.ok(issue.id);
const items = await api(`/api/companies/${company.id}/issues`);
assert.ok(Array.isArray(items) || Array.isArray(items.issues), 'issue collection structure');
console.log('PAPERCLIP_EPHEMERAL_TWO_IDLE_ROLES_ONE_SYNTHETIC_TASK_OK');
console.log('NO_LLM_NO_HEARTBEAT_NO_CUSTOMER_DATA_ZERO_BUDGET');
