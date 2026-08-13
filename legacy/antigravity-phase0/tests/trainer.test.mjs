// Trainer & Fitness Vertical Tests

import assert from 'node:assert';
import { store } from '../src/core/store.js';

export async function runTrainerTests() {
  console.log('🧪 Running Trainer & Fitness Vertical Tests...');

  const state = store.getState();

  // Test 1: Client Roster Filtering
  const atRiskClients = state.clients.filter(c => c.status === 'at_risk');
  assert.ok(atRiskClients.length > 0, 'At-risk clients exist in demo dataset');
  assert.strictEqual(atRiskClients[0].name, 'David Chen', 'David Chen identified as at-risk');

  // Test 2: Check-in Review
  const pendingCheckIn = state.checkIns.find(c => !c.trainerReviewed);
  assert.ok(pendingCheckIn, 'Pending unreviewed check-in found');

  store.reviewCheckIn(pendingCheckIn.id, 'Great effort on maintaining consistency!');
  const reviewed = store.getState().checkIns.find(c => c.id === pendingCheckIn.id);
  assert.strictEqual(reviewed.trainerReviewed, true, 'Check-in review status updated');
  assert.strictEqual(reviewed.trainerFeedback, 'Great effort on maintaining consistency!', 'Trainer feedback saved');

  // Test 3: Exercise Library Integrity
  assert.ok(state.exercises.length >= 5, 'Exercise library has at least 5 exercises');
  const squat = state.exercises.find(e => e.id === 'ex_squat');
  assert.strictEqual(squat.category, 'legs', 'Squat category is legs');

  console.log('✅ Trainer & Fitness Vertical Tests Passed!\n');
}
