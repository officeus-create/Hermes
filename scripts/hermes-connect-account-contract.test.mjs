import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const apiUrl = new URL('../functions/api/hermes-connect/account.ts', import.meta.url);

async function loadApi() {
  return readFile(apiUrl, 'utf8');
}

test('Hermes Connect account portfolio reuses the authenticated Hermes identity', async () => {
  const source = await loadApi();
  assert.match(source, /getAuthenticatedSpecialist/);
  assert.match(source, /not_authenticated/);
  assert.match(source, /identity:\s*\{/);
  assert.match(source, /email:\s*specialist\.email/);
  assert.match(source, /name:\s*specialist\.name/);
  assert.doesNotMatch(source, /email\.includes|email\.endsWith|role\s*===\s*["'](?:owner|admin)/i);
});

test('owned business portfolio is proven by owner-scoped backend records', async () => {
  const source = await loadApi();
  assert.match(source, /repair_shops[\s\S]*owner_specialist_id\s*=\s*\?/);
  assert.match(source, /getOwnedBeautySalon\(env\.DB, specialist\.id\)/);
  assert.match(source, /key:\s*["']repair_shop["'][\s\S]*kind:\s*["']owned_business["']/);
  assert.match(source, /key:\s*["']beauty_salon["'][\s\S]*kind:\s*["']owned_business["']/);
});

test('Beauty is discoverable without exposing a fake canonical workspace', async () => {
  const source = await loadApi();
  assert.match(source, /key:\s*["']beauty_salon["'][\s\S]*href:\s*null/);
  assert.match(source, /backend_ready_no_canonical_ui/);
});

test('Academy is a shared workspace and preserves real learner state separately', async () => {
  const source = await loadApi();
  assert.match(source, /key:\s*["']academy["'][\s\S]*kind:\s*["']shared_workspace["']/);
  assert.match(source, /getAcademyLearnerProfile/);
  assert.match(source, /listAcademyEnrollments/);
  assert.match(source, /getAcademyReviewerAccess/);
  assert.match(source, /profile_exists/);
  assert.match(source, /reviewer_access/);
});

test('Internal AI appears only from the persisted HERMES_INTERNAL_OWNER capability', async () => {
  const source = await loadApi();
  assert.match(source, /hermes_internal_owner_access/);
  assert.match(source, /active\s*=\s*1/);
  assert.match(source, /capability\s*=\s*'HERMES_INTERNAL_OWNER'/);
  assert.match(source, /if \(internalAiAccess\)/);
  assert.match(source, /internal_ai:\s*Boolean\(internalAiAccess\)/);
});

test('private account portfolio responses are never browser-cacheable', async () => {
  const source = await loadApi();
  assert.match(source, /Cache-Control["']?:\s*["']no-store["']/);
  assert.match(source, /jsonResponse\(200,[\s\S]*privateHeaders\)/);
});
