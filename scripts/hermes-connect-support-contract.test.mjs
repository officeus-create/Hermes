import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const support = await readFile(new URL('../src/pages/services/hermes-connect/support.astro', import.meta.url), 'utf8');
const hub = await readFile(new URL('../src/pages/services/hermes-connect/index.astro', import.meta.url), 'utf8');
const mcp = await readFile(new URL('../functions/api/hermes-connect/mcp.ts', import.meta.url), 'utf8');
const privacy = await readFile(new URL('../src/pages/privacy.astro', import.meta.url), 'utf8');

for (const text of [
  'Hermes Connect Support',
  'Account & access',
  'CRM setup & business workflow',
  'Product feedback & feature requests',
  'Privacy & data requests',
  '/privacy/',
  '/terms/',
]) assert.ok(support.includes(text), `support missing ${text}`);

assert.ok(hub.includes('/services/hermes-connect/support/'), 'product hub must link support');
assert.ok(mcp.includes('https://hermeslogisticsus.com/services/hermes-connect/support/'), 'MCP support URL must be canonical');
assert.ok(!support.includes('password='));


for (const text of [
  'Hermes Connect ChatGPT/Codex plugin and product learning',
  'explicitly agrees to share structured product feedback',
  'raw or complete chat history',
  'rolling 24-month retention cleanup',
  'Product-learning consent is not testimonial',
]) assert.ok(privacy.includes(text), `privacy disclosure missing ${text}`);

console.log('HERMES_CONNECT_SUPPORT_CONTRACT_PASS=YES');
