import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet, onRequestPost, onRequestPatch, onRequestDelete } from '../functions/api/hermes-connect/dealer/crm.ts';
import { ensureHermesCompanyProfilesSchema } from '../functions/api/_lib/hermes-company-profiles.mjs';
import { ensureCompanyMembershipSchema } from '../functions/api/_lib/company-memberships.mjs';

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
await ensureCompanyMembershipSchema(db);
for (const id of ['a', 'b', 'nondealer']) {
  sqlite.prepare('INSERT INTO specialists VALUES (?,?,?,?,?,?)').run(id, `${id}@example.invalid`, 'Synthetic acceptance owner', 'Dealer', '', '');
  sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(`synthetic-${id}`, id, new Date(Date.now() + 3600000).toISOString());
  sqlite.prepare(`INSERT INTO hermes_company_profiles (id,owner_specialist_id,company_name,slug,company_type,city,state,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(id, id, 'Synthetic fixture', id, id === 'nondealer' ? 'other' : 'dealer', 'Fixture', 'AR', '2026-09-30', '2026-09-30');
}
// Delegated identities have a normal Hermes session but no owner row of their own.
for (const [id, role] of [['c', 'Dealer Staff'], ['d', 'Dealer Staff'], ['e', 'Dealer Staff'], ['f', 'Dealer Admin'], ['g', 'Dealer Staff'], ['roletext', 'Dealer Admin']]) {
  sqlite.prepare('INSERT INTO specialists VALUES (?,?,?,?,?,?)').run(id, `${id}@example.invalid`, 'Synthetic delegated specialist', role, '', '');
  sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(`synthetic-${id}`, id, new Date(Date.now() + 3600000).toISOString());
}
const insertMembership = (id, businessRef, specialistId, role, active = 1, revokedAt = null, grantedBy = 'a', workspaceRef = null) =>
  sqlite.prepare(`INSERT INTO hermes_company_memberships
    (id,business_ref,workspace_ref,specialist_id,role,active,grant_source,granted_by,created_at,updated_at,revoked_at,revoked_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, businessRef, workspaceRef, specialistId, role, active, 'synthetic_owner_grant', grantedBy,
      '2026-10-10T20:00:00Z', '2026-10-10T20:00:00Z', revokedAt, revokedAt ? grantedBy : null,
    );
insertMembership('mem-readonly-a', 'company:a', 'c', 'read_only');
insertMembership('mem-member-a', 'company:a', 'd', 'member');
insertMembership('mem-revoked-a', 'company:a', 'e', 'read_only', 0, '2026-10-10T20:30:00Z');
insertMembership('mem-admin-a', 'company:a', 'f', 'admin');
insertMembership('mem-wrong-workspace-a', 'company:a', 'g', 'read_only', 1, null, 'a', 'repair_crm:company:a');
assert.throws(() => insertMembership('mem-self', 'company:a', 'roletext', 'admin', 1, null, 'roletext'), /CHECK constraint failed/i, 'delegated storage must reject self-promotion when grantor equals subject');
assert.throws(() => insertMembership('mem-delegated-owner', 'company:a', 'roletext', 'owner'), /CHECK constraint failed/i, 'owner role must remain an authoritative owner relation, not a delegated membership');

const request = (owner = 'a', module = 'intelligence', method = 'GET', body, headers = {}, businessRef = '') => {
  const url = new URL('https://example.invalid/api/hermes-connect/dealer/crm');
  url.searchParams.set('module', module);
  if (businessRef) url.searchParams.set('business_ref', businessRef);
  return new Request(url, {
    method, headers: { ...(owner ? { Cookie: `hermes_session=synthetic-${owner}` } : {}), Origin: 'https://example.invalid', 'Content-Type': 'application/json', ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
};
const get = async (owner, businessRef = '') => {
  const response = await onRequestGet({ request: request(owner, 'intelligence', 'GET', undefined, {}, businessRef), env: { DB: db } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control'), /private, no-store/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  return response.json();
};
const create = async (fields, owner = 'a', businessRef = '') => {
  const response = await onRequestPost({ request: request(owner, 'leads', 'POST', { module: 'leads', subject: 'SYNTHETIC ACCEPTANCE ONLY', ...fields }, {}, businessRef), env: { DB: db } });
  assert.equal(response.status, 201);
  return (await response.json()).id;
};
const hasWarning = payload => payload.intelligence.next_actions.some(action => action.code === 'lead_follow_up_incomplete');

// Existing owner relation remains authoritative without any membership row.
const ownerPayload = await get('a');
assert.equal(ownerPayload.access.role, 'owner');
assert.equal(ownerPayload.access.source, 'owner_relation');
assert.equal(ownerPayload.access.business_ref, 'company:a');

// Read-only delegated membership can read only the exact requested dealer business.
const delegatedRead = await get('c', 'company:a');
assert.equal(delegatedRead.company.id, 'a');
assert.equal(delegatedRead.access.role, 'read_only');
assert.equal(delegatedRead.access.source, 'delegated_membership');
assert.equal(delegatedRead.access.business_ref, 'company:a');
assert.equal((await onRequestGet({ request: request('c'), env: { DB: db } })).status, 403, 'delegated access requires explicit business scope');
assert.equal((await onRequestGet({ request: request('c', 'dashboard', 'GET', undefined, {}, 'company:b'), env: { DB: db } })).status, 403, 'company A member cannot read company B');
assert.equal((await onRequestGet({ request: request('e', 'dashboard', 'GET', undefined, {}, 'company:a'), env: { DB: db } })).status, 403, 'revoked membership grants nothing');
assert.equal((await onRequestGet({ request: request('roletext', 'dashboard', 'GET', undefined, {}, 'company:a'), env: { DB: db } })).status, 403, 'specialists.role text grants nothing');
assert.equal((await onRequestGet({ request: request('g', 'dashboard', 'GET', undefined, {}, 'company:a'), env: { DB: db } })).status, 403, 'membership scoped to another workspace cannot authorize Dealer CRM');
assert.equal((await onRequestGet({ request: request('c', 'dashboard', 'GET', undefined, {}, 'repair_shop:shop-a'), env: { DB: db } })).status, 400, 'wrong business namespace fails closed');

// Read-only cannot mutate; member can write only into its delegated tenant.
assert.equal((await onRequestPost({ request: request('c', 'leads', 'POST', { module: 'leads', subject: 'DENIED' }, {}, 'company:a'), env: { DB: db } })).status, 403);
const delegatedLead = await create({ stage: 'contacted', next_action: 'Owner review', follow_up_at: new Date(Date.now() + 86400000).toISOString() }, 'd', 'company:a');
const delegatedRow = sqlite.prepare('SELECT owner_specialist_id FROM hermes_dealer_leads WHERE id=?').get(delegatedLead);
assert.equal(delegatedRow.owner_specialist_id, 'a', 'delegated writes retain canonical company data owner');
const delegatedActivity = sqlite.prepare("SELECT actor_specialist_id FROM hermes_dealer_activity WHERE entity_id=? AND event_type='leads_created' ORDER BY created_at DESC LIMIT 1").get(delegatedLead);
assert.equal(delegatedActivity.actor_specialist_id, 'd', 'delegated write audit keeps the real actor');
assert.equal((await onRequestPost({ request: request('d', 'team', 'POST', { module: 'team', name: 'Denied Team Write', role: 'Sales' }, {}, 'company:a'), env: { DB: db } })).status, 403, 'ordinary member cannot mutate team');
const adminTeamResponse = await onRequestPost({ request: request('f', 'team', 'POST', { module: 'team', name: 'Synthetic Admin Team Member', role: 'Sales', department: 'sales' }, {}, 'company:a'), env: { DB: db } });
assert.equal(adminTeamResponse.status, 201, 'delegated admin can perform bounded team.write');
const adminTeamBody = await adminTeamResponse.json();
const adminTeamRow = sqlite.prepare('SELECT owner_specialist_id FROM hermes_dealer_team_members WHERE id=?').get(adminTeamBody.id);
assert.equal(adminTeamRow.owner_specialist_id, 'a', 'admin team write retains canonical data owner');
const delegatedDeleteUrl = new URL('https://example.invalid/api/hermes-connect/dealer/crm');
delegatedDeleteUrl.searchParams.set('module', 'leads');
delegatedDeleteUrl.searchParams.set('id', delegatedLead);
delegatedDeleteUrl.searchParams.set('business_ref', 'company:a');
const delegatedDelete = await onRequestDelete({ request: new Request(delegatedDeleteUrl, { method: 'DELETE', headers: { Cookie: 'hermes_session=synthetic-f', Origin: 'https://example.invalid', 'Sec-Fetch-Site': 'same-origin' } }), env: { DB: db } });
assert.equal(delegatedDelete.status, 403, 'delegated admin cannot use owner-only record.delete');
assert.equal((await delegatedDelete.json()).error, 'owner_relation_required_for_delete');

assert.equal(hasWarning(ownerPayload), false);
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
