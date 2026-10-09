import assert from 'node:assert/strict';
import { buildLoadBoardPayload, buildPostedLoadSalesLead, reviewLoadBoardPayload } from '../src/lib/load-board.ts';
import { parseUnambiguousJson } from '../functions/api/_lib/unambiguous-json.ts';
import { onRequest } from '../functions/api/logistics-lead.ts';

const fixture = (role = 'broker') => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ submitter_type: role, contact_name: 'Fixture Broker', email: 'broker@example.test', phone: '+1 312 555 0100', pickup_location: 'Chicago, IL', delivery_location: 'Madison, WI', ready_date: '2099-10-08', commodity_type: 'passenger_vehicle', year_make_model: '2025 Test Vehicle', quantity: '1', condition: 'operable', consent: 'on', broker_weight_state: 'known', broker_weight_value: '003500.50', broker_weight_unit: 'lb' })) data.set(key, value);
  return data;
};
const payload = buildLoadBoardPayload(fixture());
assert.deepEqual(payload.broker_weight, { state: 'known', value: '003500.50', unit: 'lb' });
const lead = buildPostedLoadSalesLead(payload, reviewLoadBoardPayload(payload));
assert.deepEqual(lead.broker_weight, payload.broker_weight);
assert.match(lead.email_body, /Broker cargo weight \(submitter supplied, unverified\): 003500\.50 lb/);
for (const unit of ['lb', 'kg']) {
  const data = fixture(); data.set('broker_weight_unit', unit);
  assert.equal(buildLoadBoardPayload(data).broker_weight.unit, unit);
}
const unknown = fixture();
unknown.set('broker_weight_state', 'unknown'); unknown.set('broker_weight_value', ''); unknown.set('broker_weight_unit', '');
assert.deepEqual(buildLoadBoardPayload(unknown).broker_weight, { state: 'unknown', value: '', unit: '' });
for (const [key, value] of [['broker_weight_value', '-1'], ['broker_weight_value', '0'], ['broker_weight_value', '1e3'], ['broker_weight_unit', 'tons'], ['broker_weight_state', 'verified']]) {
  const data = fixture(); data.set(key, value); assert.throws(() => buildLoadBoardPayload(data), /broker weight/i);
}
const duplicate = fixture(); duplicate.append('broker_weight_value', '99');
assert.throws(() => buildLoadBoardPayload(duplicate), /broker weight/i);
for (const role of ['shipper', 'dealer', 'private_party']) assert.throws(() => buildLoadBoardPayload(fixture(role)), /broker weight/i);

const messages = [];
const kv = new Map();
const env = { LEAD_DELIVERY_MODE: 'live', LEAD_SERVICE_TOKEN: 'fixture-only', LEAD_LIMITS: { get: async key => kv.get(key) ?? null, put: async (key, value) => { kv.set(key, value); } }, LEAD_EMAIL_SERVICE: { fetch: async (_url, init) => { messages.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); } } };
const send = (body) => onRequest({ env, request: new Request('https://hermeslogisticsus.com/api/logistics-lead', { method: 'POST', headers: { Origin: 'https://hermeslogisticsus.com', 'Content-Type': 'application/json', 'Idempotency-Key': body.request_id }, body: JSON.stringify(body) }) });
const body = { ...lead, request_id: 'tr058_fixture_12345', page_path: '/logistics/request-vehicle-transport/' };
assert.equal((await send(body)).status, 200);
assert.match(messages[0].text, /Broker weight record: \{"state":"known","value":"003500\.50","unit":"lb"\}/);
assert.equal((await send(body)).status, 200);
assert.equal(messages.length, 1, 'same-object retry must not create another email handoff');
const unknownPayload = buildLoadBoardPayload(unknown);
const unknownLead = buildPostedLoadSalesLead(unknownPayload, reviewLoadBoardPayload(unknownPayload));
assert.equal((await send({ ...body, ...unknownLead, request_id: 'tr058_unknown_12345' })).status, 200);
assert.match(messages[1].text, /Broker weight record: \{"state":"unknown","value":"","unit":""\}/);
for (const extra of [{ broker_weight: { state: 'known', value: '-1', unit: 'lb' } }, { sales_tag: 'POSTED LOAD / SHIPPER' }, { lead_type: 'load_board_access', sales_tag: 'LOAD BOARD ACCESS / CARRIER' }]) {
  assert.equal((await send({ ...body, ...extra, request_id: 'tr058_invalid_12345' })).status, 400);
}
assert.equal(messages.length, 2, 'invalid or wrong-segment data must never reach receiver');
console.log('TR-058 broker weight: values/units, unknown, isolation, invalid and duplicate contracts passed (mock only).');

const rawSend = raw => onRequest({ env, request: new Request('https://hermeslogisticsus.com/api/logistics-lead', { method: 'POST', headers: { Origin: 'https://hermeslogisticsus.com', 'Content-Type': 'application/json', 'Idempotency-Key': 'tr058_raw_json_12345' }, body: raw }) });
const beforeRejected = messages.length;
const rawBody = { ...body, email_body: body.email_body.replace('003500.50 lb', '9999 lb'), request_id: 'tr058_raw_json_12345' };
for (const record of [
  '{"state":"known","value":"3500","value":"9999","unit":"lb"}',
  '{"state":"known","value":"3500","\\u0076alue":"9999","unit":"lb"}',
]) {
  const raw = JSON.stringify(rawBody).replace(JSON.stringify(rawBody.broker_weight), record);
  const response = await rawSend(raw);
  assert.equal(response.status, 400, 'raw duplicate keys must fail before JSON collapse');
  assert.equal((await response.json()).error, 'invalid_json', 'reject raw ambiguity before weight validation');
}
for (const change of [
  { broker_weight: { state: 'known', value: '', unit: 'lb' } },
  { broker_weight: { state: 'known', value: '3500' } },
  { broker_weight: { state: 'known', value: 3500, unit: 'lb' } },
  { broker_weight: { state: 'unknown', value: '3500', unit: 'lb' } },
  { broker_weight: { state: 'known', value: '003500.50', unit: 'kg' } },
  { broker_weight: null },
  { broker_weight: { state: 'known', value: '3500', unit: 'lb', verified: true } },
  { broker_weight: { state: 'unknown', value: '', unit: '' } },
  { broker_weight: undefined },
  { email_body: body.email_body.replace('003500.50 lb', '9999 lb') },
  { email_body: body.email_body.replace('003500.50 lb', '003500.50 kg') },
  { email_body: body.email_body + '\nBroker weight record: {"value":"9999"}' },
  { email_body: body.email_body + '\nBroker cargo weight (submitter supplied, unverified): 9999 kg' },
  { email_body: body.email_body.replace(/^Broker cargo weight.*$/m, '') },
]) assert.equal((await send({ ...body, ...change, request_id: 'tr058_rejected_12345' })).status, 400);
assert.equal(messages.length, beforeRejected, 'ambiguous/contradictory/missing weight records never hand off');
const { broker_weight: _weight, ...legacy } = body;
assert.equal((await send({ ...legacy, email_body: legacy.email_body.replace(/^Broker cargo weight.*\n/m, ''), request_id: 'tr058_legacy_12345' })).status, 200, 'legacy missing-object intake remains compatible');
assert.doesNotMatch(messages.at(-1).text, /Broker weight record:/);
assert.equal(messages[0].text.match(/^Broker weight record:/gm).length, 1);
assert.equal(messages[0].text.match(/^Broker cargo weight/gm).length, 1);
console.log('Raw JSON duplicate, canonical email weight and explicit legacy compatibility contracts passed.');

assert.deepEqual(parseUnambiguousJson('{"records":[{"value":"a"},{"value":"b"}],"text":"{\\\"value\\\":true}"}'), { records: [{ value: 'a' }, { value: 'b' }], text: '{"value":true}' });
for (const raw of ['{"a":1,"a":2}', '{"items":[{"unit":"lb","unit":"kg"}]}', '{"a":1,}', '[1,]', '{"a":}', 'null trailing', '"unterminated']) assert.throws(() => parseUnambiguousJson(raw));
for (const raw of ['null', '[]', '"text"', JSON.stringify(rawBody).replace('"broker_weight":', '"broker_weight":{},"broker_weight":')]) assert.equal((await rawSend(raw)).status, 400);
assert.equal(messages.length, beforeRejected + 1, 'only explicit legacy-compatible case creates one additional handoff');
