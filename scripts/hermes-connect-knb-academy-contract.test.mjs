import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../public/demos/hermes-connect/academy-knb.html',import.meta.url),'utf8');
test('KNB academy demo keeps client evidence and CRM structure explicit',()=>{
  assert.match(html,/Конс на Бі\$/);
  assert.match(html,/CAC · LTV · ROMI/);
  assert.match(html,/Lead → consultation → enrollment → participation → continuation/);
  assert.match(html,/Brief recovered/);
  assert.match(html,/02\.10\.2026.*09:00/);
  assert.match(html,/Google Docs/);
  assert.match(html,/no live customer data/i);
  assert.match(html,/no claim of CRM activation/i);
  assert.match(html,/noindex,nofollow/i);
});

const concept=await readFile(new URL('../src/pages/businesses/concepts/kons-na-bis/index.astro',import.meta.url),'utf8');
test('KNB concept stays source-bounded and non-indexable',()=>{
  assert.match(concept,/Social → CRM → Revenue/);
  assert.match(concept,/TASK 1 · INSTAGRAM AUDIT/);
  assert.match(concept,/TASK 2 · 7-WEEK PROGRAM FUNNEL/);
  assert.match(concept,/DIAGNOSTIC → PROGRAM FIT/);
  assert.match(concept,/Google Form · reference only · not submitted/);
  assert.match(concept,/trackCaseOpened\("knb_marketing_case"\)/);
  assert.match(concept,/trackEvent\("case_study_cta"/);
  assert.match(concept,/noindex,nofollow/);
  assert.match(concept,/не офіційний сайт КНБ/);
});

const genericCase=await readFile(new URL('../src/pages/businesses/marketing-growth-audit-example/index.astro',import.meta.url),'utf8');
test('Catalog exposes a reusable indexable marketing growth strategy example',()=>{
  assert.match(genericCase,/Marketing Growth Audit Example/);
  assert.match(genericCase,/Social → CRM → Revenue/);
  assert.match(genericCase,/90-DAY OPERATING PLAN/);
  assert.match(genericCase,/EVIDENCE BOUNDARY/);
  assert.match(genericCase,/trackCaseOpened\("marketing_growth_audit_example"\)/);
  assert.match(genericCase,/trackEvent\("case_study_cta"/);
  assert.doesNotMatch(genericCase,/robots="noindex/);\n  assert.doesNotMatch(genericCase,/source_channel|owner \/ manager|CANDIDATE ASSESSMENT|reviewer score/);
});
