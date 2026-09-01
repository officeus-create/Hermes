import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const switcherUrl = new URL('../src/components/HermesConnectAccountSwitcher.astro', import.meta.url);

async function loadSwitcher() {
  return readFile(switcherUrl, 'utf8');
}

test('account switcher uses one unified authenticated portfolio endpoint', async () => {
  const source = await loadSwitcher();
  assert.equal(source.split('/api/hermes-connect/account').length - 1, 1);
  assert.match(source, /const accountRequest = \(async \(\) => \{/);
  assert.match(source, /fetch\("\/api\/hermes-connect\/account"/);
  assert.match(source, /roots\.forEach/);
  assert.match(source, /accountRequest\.then/);
  assert.doesNotMatch(source, /\/api\/auth\/me/);
  assert.doesNotMatch(source, /\/api\/repair-shop\/profile/);
  assert.doesNotMatch(source, /\/api\/internal-ai\/status/);
});

test('owned Repair Shop and shared Academy come only from the account portfolio payload', async () => {
  const source = await loadSwitcher();
  assert.match(source, /payload\.owned_businesses/);
  assert.match(source, /item\?\.key === "repair_shop"/);
  assert.match(source, /payload\.workspaces/);
  assert.match(source, /item\?\.key === "academy"/);
  assert.match(source, /runtimeCopy\.setup/);
  assert.match(source, /current === "repair"/);
});

test('internal AI stays fail-closed to the capability workspace returned by the backend', async () => {
  const source = await loadSwitcher();
  assert.match(source, /item\?\.key === "internal_ai"/);
  assert.match(source, /if \(aiWorkspace && ai\) ai\.hidden = false/);
  assert.doesNotMatch(source, /\|\|\s*current\s*===\s*"ai"/);
});

test('owned Beauty opens only the canonical private foundation and keeps a neutral accent', async () => {
  const source = await loadSwitcher();
  assert.match(source, /item\?\.key === "beauty_salon"/);
  assert.match(source, /data-workspace-beauty data-hc-workspace-link="beauty" hidden/);
  assert.match(source, /beauty:\s*"\/services\/hermes-connect\/beauty\/workspace\/"/);
  assert.match(source, /current === "beauty"/);
  assert.match(source, /--workspace-accent:#7c8798/);
  assert.doesNotMatch(source, /--hermes-beauty/);
});

test('switcher consumes canonical Design OS accents and preserves locale on real workspace links', async () => {
  const source = await loadSwitcher();
  assert.match(source, /var\(--hermes-repair,#1e88ff\)/);
  assert.match(source, /var\(--hermes-academy,#7c5cff\)/);
  assert.match(source, /var\(--hermes-ai-product,#ff7a00\)/);
  assert.match(source, /url\.searchParams\.set\("lang", locale\)/);
  assert.match(source, /data-hc-workspace-link="repair"/);
  assert.match(source, /data-hc-workspace-link="academy"/);
  assert.match(source, /data-hc-workspace-link="ai"/);
  assert.match(source, /data-hc-workspace-link="beauty"/);
});

test('account switcher remains fail-closed until a valid account payload is loaded', async () => {
  const source = await loadSwitcher();
  assert.match(source, /data-hc-account-switcher[^>]*hidden/);
  assert.match(source, /if \(!response\.ok \|\| !payload\?\.success \|\| !payload\.identity\) throw new Error\("account_unavailable"\)/);
  assert.match(source, /root\.hidden = false/);
  assert.match(source, /\.catch\(\(\) => \{\s*root\.hidden = true;/);
});
