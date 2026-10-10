import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet, onRequestPost, onRequestPatch } from '../functions/api/hermes-connect/dealer/crm.ts';
import { ensureHermesCompanyProfilesSchema } from '../functions/api/_lib/hermes-company-profiles.mjs';

// Exercise the real handlers and SQL, using the repository's SQLite-backed D1 pattern.
class Statement {
  constructor(statement, args = []) { this.statement = statement; this.args = args; }
  bind(...args) { return new Statement(this.statement, args); }
  async run() { this.statement.run(...this.args); return { success: true }; }
  async first() { return this.statement.get(...this.args) ?? null; }
  async all() { return { results: this.statement.all(...this.args) }; }
}
const sqlite = new DatabaseSync(':memory:');
const db = { prepare: sql => new Statement(sqlite.prepare(sql)) };
sqlite.exec(`CREATE TABLE sessions (token TEXT, specialist_id TEXT, expires_at TEXT);
  CREATE TABLE specialists (id TEXT, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);`);
await ensureHermesCompanyProfilesSchema(db);
for (const id of ['a', 'b', 'nondealer']) {
  sqlite.prepare('INSERT INTO specialists VALUES (?,?,?,?,?,?)').run(id, `${id}@example.invalid`, 'Synthetic acceptance owner', 'Dealer', '', '');
  sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(`synthetic-${id}`, id, new Date(Date.now() + 3600000).toISOString());
  sqlite.prepare(`INSERT INTO hermes_company_profiles (id,owner_specialist_id,company_name,slug,company_type,city,state,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(id, id, 'Synthetic fixture', id, id === 'nondealer' ? 'other' : 'dealer', 'Fixture', 'AR', '2026-09-30', '2026-09-30');
}
const request = (owner = 'a', module = 'intelligence', method = 'GET', body, headers = {}) => new Request(`https://example.invalid/api/hermes-connect/dealer/crm?module=${module}`, {
  method, headers: { ...(owner ? { Cookie: `hermes_session=synthetic-${owner}` } : {}), Origin: 'https://example.invalid', 'Content-Type': 'application/json', ...headers },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
const get = async owner => {
  const response = await onRequestGet({ request: request(owner), env: { DB: db } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control'), /private, no-store/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  return response.json();
};
const create = async (fields, owner = 'a') => {
  const response = await onRequestPost({ request: request(owner, 'leads', 'POST', { module: 'leads', subject: 'SYNTHETIC ACCEPTANCE ONLY', ...fields }), env: { DB: db } });
  assert.equal(response.status, 201);
  return (await response.json()).id;
};
const hasWarning = payload => payload.intelligence.next_actions.some(action => action.code === 'lead_follow_up_incomplete');
assert.equal(hasWarning(await get('a')), false);
const future = new Date(Date.now() + 86400000).toISOString();
const past = new Date(Date.now() - 86400000).toISOString();
const incompleteIds = [
  await create({}),
  await create({ stage: 'contacted', next_action: '   ', follow_up_at: future }),
  await create({ stage: 'qualified', next_action: 'Review evidence' }),
];
await create({ stage: 'appointment', next_action: 'Review evidence', follow_up_at: future });
await create({ stage: 'contacted', next_action: 'Review evidence', follow_up_at: past });
await create({ stage: 'won' });
await create({ stage: 'lost' });
await create({}, 'b');
let payload = await get('a');
assert.equal(payload.intelligence.metrics.incomplete_lead_followups, 3);
assert.equal(payload.intelligence.metrics.overdue_lead_followups, 1);
assert.equal(hasWarning(payload), true);
assert(payload.intelligence.next_actions.some(action => action.code === 'lead_follow_up_due'));
assert.equal((await get('b')).intelligence.metrics.incomplete_lead_followups, 1);

// Legacy whitespace-only values also count; terminal rows remain exempt.
sqlite.prepare('UPDATE hermes_dealer_leads SET next_action=? WHERE id=?').run('    ', incompleteIds[1]);
assert.equal((await get('a')).intelligence.metrics.incomplete_lead_followups, 3);
const update = async (id, fields, owner = 'a') => onRequestPatch({ request: request(owner, 'leads', 'PATCH', { module: 'leads', id, subject: 'SYNTHETIC ACCEPTANCE ONLY', ...fields }), env: { DB: db } });
for (const id of incompleteIds) assert.equal((await update(id, { next_action: 'Review evidence', follow_up_at: future })).status, 200);
payload = await get('a');
assert.equal(payload.intelligence.metrics.incomplete_lead_followups, 0);
assert.equal(hasWarning(payload), false);
assert.equal(payload.intelligence.metrics.overdue_lead_followups, 1);
assert.equal((await update(incompleteIds[0], { stage: 'lost' })).status, 200);
assert.equal(hasWarning(await get('a')), false);
assert.equal((await update(incompleteIds[0], { stage: 'new' })).status, 200);
assert.equal((await get('a')).intelligence.metrics.incomplete_lead_followups, 1);
assert.equal((await update(incompleteIds[0], {}, 'b')).status, 404);
assert.equal((await onRequestGet({ request: request(null), env: { DB: db } })).status, 401);
assert.equal((await onRequestGet({ request: request('nondealer'), env: { DB: db } })).status, 403);
assert.equal((await onRequestPost({ request: request('a', 'leads', 'POST', { module: 'leads', subject: 'SYNTHETIC' }, { 'Sec-Fetch-Site': 'cross-site' }), env: { DB: db } })).status, 403);
// A dependency-selected regression must reach the shared business-event adapter.
// Exercise the activity consumer, not only the intelligence/follow-up branch.
const getActivity = async owner => {
  const response = await onRequestGet({ request: request(owner, 'activity'), env: { DB: db } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control'), /private, no-store/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  const body = await response.json();
  assert(body.activity.length > 0, 'fixture must contain dealer activity');
  assert.equal(body.events.length, body.activity.length, 'valid activity rows must retain normalized business events');
  assert.deepEqual(body.events.map(event => event.event_id).sort(), body.activity.map(row => row.id).sort());
  assert(body.events.every(event => event.company_id === owner && event.visibility === 'company' && event.source === 'dealer_crm'));
  return body;
};
const activityA = await getActivity('a');
const activityB = await getActivity('b');
const activityIdsA = new Set(activityA.events.map(event => event.event_id));
assert(activityB.events.every(event => !activityIdsA.has(event.event_id)), 'company activity must remain isolated');

sqlite.close();
console.log('dealer-crm-followup: real handler/SQLite missing action/date, terminal exceptions, tenant isolation, repair/reload and existing overdue warning PASS');
