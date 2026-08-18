import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../public/demos/hermes-connect/', import.meta.url);

async function load(name) {
  return readFile(new URL(name, root), 'utf8');
}

test('Academy V1 keeps training evidence and human review boundaries explicit', async () => {
  const html = await load('academy.html');
  assert.match(html, /Awareness/);
  assert.match(html, /Understanding/);
  assert.match(html, /Assessment/);
  assert.match(html, /Supervised Practice/);
  assert.match(html, /Application/);
  assert.match(html, /DAILY CONTROL LOOP/);
  assert.match(html, /REVIEWER QUEUE/);
  assert.match(html, /Cohort boundary:/);
  assert.match(html, /Human review remains the gate/i);
  assert.match(html, /access to the next risk level is granted by an authorized reviewer/i);
  assert.match(html, /private candidate data, reviewer notes and employment decisions stay permission-controlled/i);
  assert.match(html, /no automated hiring, firing, job guarantee/i);
  assert.match(html, /sales-roleplay\.html/);
  assert.match(html, /workspace\.html/);
});

test('Academy V1 represents established and preparing tracks honestly', async () => {
  const html = await load('academy.html');
  assert.match(html, /U\.S\. Logistics Operations/);
  assert.match(html, /Marketing & SMM/);
  assert.match(html, /Beauty Salon Growth & Front Desk/);
  assert.match(html, /Web Design/);
  assert.match(html, /IT & Automation/);
  assert.match(html, /SEO & Website Promotion/);
  assert.match(html, /Preparing tracks are product structure only/i);
});

test('Beauty V1 uses the shared operating-system workflow instead of a disconnected product', async () => {
  const html = await load('beauty-salon.html');
  assert.match(html, /LEAD → CLIENT PIPELINE/i);
  assert.match(html, /New inquiry/);
  assert.match(html, /Booked/);
  assert.match(html, /Service workflow/);
  assert.match(html, /Retention & content/);
  assert.match(html, /Client profile/);
  assert.match(html, /Appointments/);
  assert.match(html, /Hermes Intelligence/);
  assert.match(html, /TEAM & CAPACITY/);
  assert.match(html, /Permission model:/);
  assert.match(html, /MONEY & SUPPLIES/);
  assert.match(html, /consumables below demo reorder threshold/i);
  assert.match(html, /data-workspace-entry/);
  assert.match(html, /source_direction=beauty/);
  assert.match(html, /business_type=beauty/);
  assert.match(html, /business_subtype=salon/);
  assert.match(html, /module=home/);
});

test('Beauty V1 preserves approval, consent and prototype safety boundaries', async () => {
  const html = await load('beauty-salon.html');
  assert.match(html, /Human review required before any external send/i);
  assert.match(html, /consent state needs verification/i);
  assert.match(html, /does not infer professional qualifications/i);
  assert.match(html, /no purchase is sent automatically/i);
  assert.match(html, /all clients, metrics, services and actions on this page are synthetic/i);
  assert.match(html, /does not replace professional clinical judgment/i);
  assert.match(html, /noindex,nofollow/i);
});

test('Canonical workspace keeps Academy and Beauty inside one Hermes Connect shell', async () => {
  const [html, js, enhancements] = await Promise.all([
    load('workspace.html'),
    load('workspace.js'),
    load('workspace-enhancements.js')
  ]);

  assert.match(html, /data-view="academy"/);
  assert.match(html, /data-view-panel="academy"/);
  assert.match(html, /data-onboarding-type="beauty"/);
  assert.match(html, /data-vertical="beauty"/);
  assert.match(html, /Aurelia Studio/);
  assert.match(js, /beauty:\s*\{[\s\S]*?name:\s*'Aurelia Studio'/);
  assert.match(js, /beauty:\s*'beauty'/);
  assert.match(js, /hermes_business_type/);
  assert.match(js, /startupTypeParam/);
  assert.match(js, /hasControlledContext[\s\S]*source_direction[\s\S]*business_type[\s\S]*business_subtype[\s\S]*module/);
  assert.match(enhancements, /verticalModuleEntries/);
  assert.match(enhancements, /beauty-salon\.html/);
  assert.match(enhancements, /data-vertical-module-entry/);
  assert.match(enhancements, /syncVerticalModuleEntry/);
  assert.match(enhancements, /academy\.html/);
  assert.match(enhancements, /data-academy-hub-entry/);
});

test('Shared vertical module stylesheet exists and preserves Hermes brand tokens', async () => {
  const css = await load('vertical-modules.css');
  assert.match(css, /--pearl:#F7F6F3/);
  assert.match(css, /--obsidian:#0B0D12/);
  assert.match(css, /--iris:#7C5CFF/);
  assert.match(css, /--ocean:#5AC8FA/);
  assert.match(css, /--sage:#7FD1B6/);
});
