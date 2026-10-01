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
  assert.match(html,/PUBLIC OPERATING SIGNALS/);
  assert.match(html,/4-рівнева система продажів/);
  assert.match(html,/Керівник відділу маркетингу/);
  assert.match(html,/Менеджер з продажу \/ куратор/);
  assert.match(html,/Рекрутер/);
  assert.match(html,/vacancy11308040/);
  assert.match(html,/vacancy11308016/);
  assert.match(html,/vacancy11196301/);
  assert.match(html,/vacancy11342667/);
  assert.match(html,/no live customer data/i);
  assert.match(html,/no claim of CRM activation/i);
  assert.match(html,/noindex,nofollow/i);
});


const concept=await readFile(new URL('../src/pages/businesses/concepts/kons-na-bis/index.astro',import.meta.url),'utf8');
test('KNB Catalog concept turns the candidate brief into a source-bounded marketing showcase',()=>{
  assert.match(concept,/Social → CRM → Revenue/);
  assert.match(concept,/77\.1K/);
  assert.match(concept,/19\.6K/);
  assert.match(concept,/5,971/);
  assert.match(concept,/64\.2K/);
  assert.match(concept,/TASK 1 · INSTAGRAM AUDIT/);
  assert.match(concept,/TASK 2 · 7-WEEK PROGRAM FUNNEL/);
  assert.match(concept,/6-point Diagnostic/);
  assert.match(concept,/Qualified attention/);
  assert.match(concept,/CAC · LTV \/ renewal · ROMI/);
  assert.match(concept,/DIAGNOSTIC LENSES · PROVIDED TRAINING/);
  assert.match(concept,/Overthinking/);
  assert.match(concept,/Human capital/);
  assert.match(concept,/CANDIDATE ASSESSMENT|Candidate Assessment/);
  assert.match(concept,/DIAGNOSTIC → PROGRAM FIT/);
  assert.match(concept,/Key business metrics/);
  assert.match(concept,/Hiring system/);
  assert.match(concept,/Sales system/);
  assert.match(concept,/Online packaging/);
  assert.match(concept,/source_channel/);
  assert.match(concept,/campaign_id/);
  assert.match(concept,/diagnostic_primary_gap/);
  assert.match(concept,/recommended_module/);
  assert.match(concept,/cohort/);
  assert.match(concept,/renewal/);
  assert.match(concept,/request_same_audit/);
  assert.match(concept,/trackCaseOpened\("knb_marketing_case"\)/);
  assert.match(concept,/trackEvent\("case_study_cta"/);
  assert.match(concept,/request_similar_audit/);
  assert.match(concept,/type=marketing-package&months=3/);
  assert.match(concept,/data-lang="uk"/);
  assert.match(concept,/data-lang="en"/);
  assert.match(concept,/noindex,nofollow/);
  assert.match(concept,/client-owned claims/i);
  assert.match(concept,/не офіційний сайт КНБ/);
});


const genericCase=await readFile(new URL('../src/pages/businesses/marketing-growth-audit-example/index.astro',import.meta.url),'utf8');
test('Catalog exposes a reusable indexable marketing growth strategy example',()=>{
  assert.match(genericCase,/Marketing Growth Audit Example/);
  assert.match(genericCase,/Social → CRM → Revenue/);
  assert.match(genericCase,/90-DAY OPERATING PLAN/);
  assert.match(genericCase,/Qualified attention/);
  assert.match(genericCase,/CAC · LTV\/retention · ROMI/);
  assert.match(genericCase,/CANDIDATE ASSESSMENT/);
  assert.match(genericCase,/PROOF GOVERNANCE/);
  assert.match(genericCase,/type=marketing-package&months=3/);
  assert.doesNotMatch(genericCase,/robots="noindex/);
});
