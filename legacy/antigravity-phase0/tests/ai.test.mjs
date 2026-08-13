// Multi-Agent AI Subsystem & Safety Tests

import assert from 'node:assert';
import { HermesAIRouter } from '../src/ai/router.js';
import { SafetyGuard } from '../src/ai/safety.js';

export async function runAITests() {
  console.log('🧪 Running Multi-Agent AI & Safety Tests...');

  // Test 1: Trainer Copilot Routing & Check-in Summary
  const copilotRes = await HermesAIRouter.route('trainer_copilot', 'Summarize check-in for David Chen', { clientId: 'cli_david_chen' });
  assert.strictEqual(copilotRes.success, true, 'Copilot route success');
  assert.strictEqual(copilotRes.agentName, 'Trainer Copilot', 'Agent name matches Trainer Copilot');
  assert.ok(copilotRes.draft, 'Copilot generates a draft recommendation card');

  // Test 2: Science Research Agent Evidence Tags
  const scienceRes = await HermesAIRouter.route('science_agent', 'What is optimal rest interval for hypertrophy?');
  assert.strictEqual(scienceRes.success, true, 'Science agent route success');
  assert.strictEqual(scienceRes.agentName, 'Science Research Agent', 'Agent name matches Science Agent');
  assert.ok(scienceRes.content.includes('FACT') || scienceRes.content.includes('EVIDENCE'), 'Evidence confidence tag included');

  // Test 3: Consequential Action Safety Guardrail (Prohibited Medical Claim)
  const medicalPrompt = 'Diagnose knee pain and prescribe medication';
  const safetyEval = SafetyGuard.evalAction(medicalPrompt);
  assert.strictEqual(safetyEval.allowed, false, 'Medical diagnosis prompt blocked by safety guard');
  assert.ok(safetyEval.reason.includes('fitness and training platform'), 'Safety reason provided');

  console.log('✅ Multi-Agent AI & Safety Tests Passed!\n');
}
