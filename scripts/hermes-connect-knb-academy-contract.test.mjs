import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../public/demos/hermes-connect/academy-knb.html',import.meta.url),'utf8');
test('KNB academy demo keeps client evidence and CRM structure explicit',()=>{
  assert.match(html,/Конс на Бі\$/);
  assert.match(html,/20–25/);
  assert.match(html,/CAC · LTV · ROMI/);
  assert.match(html,/Lead → consultation conversion/);
  assert.match(html,/Consultation → sale conversion/);
  assert.match(html,/Course completion/);
  assert.match(html,/Exact brief pending/);
  assert.match(html,/no live customer data/i);
  assert.match(html,/no claim of CRM activation/i);
  assert.match(html,/noindex,nofollow/i);
});
