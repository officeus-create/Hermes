#!/usr/bin/env node
/**
 * Hermes -> optional Paperclip task-candidate preview.
 * No Paperclip API, credentials, external writes or agent execution.
 * Output is a Hermes interchange format, NOT a Paperclip API schema.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const ALLOWED_DEPARTMENTS = new Set(['TECHNOLOGY', 'DESIGN', 'SEO', 'QA']);
export const ALLOWED_CLASSES = new Set(['PUBLIC', 'SYNTHETIC']);
export const COST_CEILING_USD = 0;

export function projectCandidate(task) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) throw new Error('task_object_required');
  const { source_id, source_url, title, department, data_classification, owner, qa_owner, acceptance, approved } = task;
  if (typeof source_id !== 'string' || !/^HERMES-PILOT-[A-Z0-9-]{1,50}$/.test(source_id)) throw new Error('invalid_source_id');
  if (typeof source_url !== 'string' || !/^https:\/\/github\.com\/officeus-create\/Hermes\/(issues|pull)\/\d+$/.test(source_url)) throw new Error('noncanonical_source_url');
  if (typeof title !== 'string' || title.length < 8 || title.length > 150) throw new Error('invalid_title');
  if (!ALLOWED_DEPARTMENTS.has(department)) throw new Error('invalid_department');
  if (!ALLOWED_CLASSES.has(data_classification)) throw new Error('nonpublic_data_rejected');
  if (approved !== true) throw new Error('owner_approval_required');
  if (!['codex', 'claude'].includes(owner) || qa_owner !== 'qa-independent' || owner === qa_owner) throw new Error('independent_qa_required');
  if (!Array.isArray(acceptance) || !acceptance.length || acceptance.length > 8 || acceptance.some(a => typeof a !== 'string' || a.length < 8 || a.length > 240)) throw new Error('acceptance_required');
  // Intentional allow-list, never serialize unexpected input fields.
  return Object.freeze({
    contract: 'hermes-paperclip-candidate-v1',
    source_id, source_url, title, department, data_classification,
    execution: 'REVIEW_ONLY',
    approved, owner, qa_owner, acceptance,
    api_writes_enabled: false,
    outbound_messages_enabled: false,
    scheduled_agents_enabled: false,
    estimated_external_cost_usd: COST_CEILING_USD,
  });
}

export function buildBatch(tasks) {
  if (!Array.isArray(tasks) || !tasks.length || tasks.length > 3) throw new Error('pilot_limited_to_three_tasks');
  const ids = new Set();
  return tasks.map(task => {
    const result = projectCandidate(task);
    if (ids.has(result.source_id)) throw new Error('duplicate_source_id');
    ids.add(result.source_id);
    return result;
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) {
    console.error('Usage: node scripts/paperclip-pilot-candidates.mjs <reviewed-synthetic-task-json>');
    process.exitCode = 2;
  } else {
    try {
      const input = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
      console.log(JSON.stringify({ integration: 'OFF', validated_candidates: buildBatch(input) }, null, 2));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
