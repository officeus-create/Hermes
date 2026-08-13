// Core Domain & State Engine Tests

import assert from 'node:assert';
import { store } from '../src/core/store.js';
import { AuthController } from '../src/core/auth.js';

export async function runCoreTests() {
  console.log('🧪 Running Core Domain & State Engine Tests...');

  const state = store.getState();

  // Test 1: Workspace Initial State
  assert.strictEqual(state.workspace.id, 'ws_hermes_fit_01', 'Workspace ID match');
  assert.strictEqual(state.workspace.category, 'fitness_coaching', 'Workspace category match');

  // Test 2: Users & Roles
  const trainer = store.getActiveUser();
  assert.strictEqual(trainer.role, 'trainer', 'Default active user is trainer');
  assert.strictEqual(AuthController.canManageWorkspace(), false, 'Trainer cannot manage workspace billing');
  assert.strictEqual(AuthController.canReviewClients(), true, 'Trainer can review clients');

  // Test 3: Task Completion
  const initialTask = state.tasks[0];
  const initialStatus = initialTask.isCompleted;
  store.toggleTaskCompletion(initialTask.id);
  assert.strictEqual(state.tasks[0].isCompleted, !initialStatus, 'Task completion status toggled');

  console.log('✅ Core Domain & State Engine Tests Passed!\n');
}
