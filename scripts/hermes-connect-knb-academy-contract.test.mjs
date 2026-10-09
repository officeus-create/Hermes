import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../public/demos/hermes-connect/academy-knb.html',import.meta.url),'utf8');
test('KNB academy demo keeps client evidence and CRM structure explicit',()=>{
  assert.match(html,/Конс на Бі\$/);
  assert.match(html,/CAC · LTV · ROMI/);
  assert.match(html,/Lead → consultation → enrollment → participation → continuation/);
  assert.match(html,/Brief recovered/);
  assert.match(html,/Reviewer truth gate/);
  assert.match(html,/organic programming → baseline → paid learning/);
  assert.match(html,/Метод 4 колонок/);
  assert.match(html,/Питання → Усвідомлення → Розуміння → Застосування/);
  assert.match(html,/02\.10\.2026.*09:00/);
  assert.match(html,/Google Docs/);
  assert.match(html,/no live customer data/i);
  assert.match(html,/no claim of CRM activation/i);
  assert.match(html,/noindex,nofollow/i);
});

const concept=await readFile(new URL('../src/pages/businesses/concepts/kons-na-bis/index.astro',import.meta.url),'utf8');
test('KNB concept stays source-bounded and non-indexable',()=>{
  assert.match(concept,/Organic → Paid Learning → Offer → CRM/);
  assert.match(concept,/TASK 1 · INSTAGRAM AUDIT/);
  assert.match(concept,/TASK 2 · 7-WEEK PROGRAM FUNNEL/);
  assert.match(concept,/ORGANIC BASELINE/);
  assert.match(concept,/PAID LEARNING/);
  assert.match(concept,/SIGNAL GATE/);
  assert.match(concept,/Readiness & offer hypothesis/);
  assert.match(concept,/Питання → Усвідомлення → Розуміння → Застосування/);
  assert.match(concept,/DIAGNOSTIC → PROGRAM FIT/);
  assert.match(concept,/Google Form · reference only · not submitted/);
  assert.match(concept,/trackCaseOpened\("knb_marketing_case"\)/);
  assert.match(concept,/trackEvent\("case_study_cta"/);
  assert.match(concept,/noindex,nofollow/);
  assert.match(concept,/не офіційний сайт КНБ/);
});

const genericCase=await readFile(new URL('../src/pages/businesses/marketing-growth-audit-example/index.astro',import.meta.url),'utf8');
test('Catalog keeps the reusable marketing growth strategy example public but outside the search index',()=>{
  assert.match(genericCase,/Marketing Growth Audit Example/);
  assert.match(genericCase,/Organic → Paid Learning → Offer → CRM/);
  assert.match(genericCase,/READINESS GATE/);
  assert.match(genericCase,/3–6 MONTH MEDIA PLAN/);
  assert.match(genericCase,/Питання → Усвідомлення → Розуміння → Застосування/);
  assert.match(genericCase,/PROOF GOVERNANCE/);
  assert.match(genericCase,/trackCaseOpened\("marketing_growth_audit_example"\)/);
  assert.match(genericCase,/trackEvent\("case_study_cta"/);
  assert.match(genericCase,/robots="noindex,follow"/);
});

const navigationSources = [
  'src/data/catalog-business-concepts.ts',
  'src/pages/businesses/concepts/kons-na-bis/index.astro',
  'src/pages/services/hermes-connect/academy/index.astro',
  'public/demos/hermes-connect/academy.html',
];
test('KNB public navigation uses the extensionless deployed URL while its physical demo stays noindex',async()=>{
  for (const path of navigationSources) {
    const source=await readFile(new URL('../'+path,import.meta.url),'utf8');
    assert.doesNotMatch(source,/academy-knb\.html/,path);
    assert.match(source,/academy-knb["']/ ,path);
  }
  assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(html,/data-language-route/);
});
