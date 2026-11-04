import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost } from "../functions/api/hermes-connect/company.ts";
import leadEmailWorker from "../workers/lead-email/src/index.mjs";

// Owner decision 2026-10-28: a new Load Board company registration reaches Logistics Sales, and
// carrier-side registrations also reach the dispatch department — in the department's voice.

function makeD1() {
  const sqlite = new DatabaseSync(":memory:");
  const db = {
    prepare(sql) {
      let args = [];
      const q = {
        bind(...values) { args = values; return q; },
        async all() { return { results: sqlite.prepare(sql).all(...args).map((row) => ({ ...row })) }; },
        async first() { const row = sqlite.prepare(sql).get(...args); return row ? { ...row } : null; },
        async run() { const result = sqlite.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes) } }; },
      };
      return q;
    },
  };
  sqlite.exec(`
    CREATE TABLE specialists (id TEXT PRIMARY KEY, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);
    CREATE TABLE sessions (token TEXT PRIMARY KEY, specialist_id TEXT NOT NULL, expires_at TEXT NOT NULL);
  `);
  sqlite.prepare("INSERT INTO specialists VALUES (?,?,?,?,?,?)").run("owner-1", "carrier@example.com", "Test Carrier", "Carrier", "Chicago, IL", "");
  sqlite.prepare("INSERT INTO sessions VALUES (?,?,?)").run("tok-1", "owner-1", "2099-01-01T00:00:00.000Z");
  return { sqlite, db };
}

const request = (body) => new Request("https://hermes.example/api/hermes-connect/company", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: "hermes_session=tok-1" },
  body: JSON.stringify(body),
});
const carrierBody = { companyName: "Test Haulers LLC", companyType: "carrier", city: "Chicago", state: "IL", authorityNumber: "MC123456", callbackPhone: "+1 312 555 0100", catalogOptIn: true };

function emailService(calls, { fail = false } = {}) {
  return { async fetch(url, init) {
    calls.push({ url, auth: init.headers.Authorization, payload: JSON.parse(init.body) });
    if (fail) throw new Error("service down");
    return new Response(JSON.stringify({ ok: true }), { status: 202 });
  } };
}

test("new carrier registration notifies Sales and the dispatch department in the department voice", async () => {
  const { db, sqlite } = makeD1();
  const calls = [];
  const response = await onRequestPost({ request: request(carrierBody), env: { DB: db, LEAD_EMAIL_SERVICE: emailService(calls), LEAD_SERVICE_TOKEN: "t0ken" } });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  const { payload, auth, url } = calls[0];
  assert.equal(url, "https://lead-email.internal/v1/send");
  assert.equal(auth, "Bearer t0ken");
  // The Worker copies exactly this subject to the dispatch department inbox.
  assert.equal(payload.subject, "[HERMES SALES] [LOAD BOARD ACCESS] [CARRIER]");
  assert.match(payload.text, /^Hermes Logistics — Load Board registration\n/);
  assert.match(payload.text, /Company: Test Haulers LLC/);
  assert.match(payload.text, /MC \/ USDOT: MC123456/);
  assert.match(payload.text, /Callback phone: \+1 312 555 0100/);
  assert.match(payload.text, /Email: carrier@example\.com/);
  assert.equal(payload.reply_to, "carrier@example.com");
  assert.match(payload.request_id, /^reg-company-[0-9a-f-]{36}$/);
  assert.doesNotMatch(payload.text, /Page: \/logistics\/start-car-hauling-dispatch\//, "registration must not impersonate the dispatch intake page");
  assert.doesNotMatch(payload.text, /volkogon|vladimir|владимир|claude|codex|chatgpt|hermes ai|viktor/i, "no personal or AI names in the notice");
  // The callback phone is used only in the notice; the profile can become public.
  const stored = sqlite.prepare("SELECT phone FROM hermes_company_profiles").get();
  assert.equal(stored.phone, null);
});

test("dealer, shipper and broker registrations reach Sales only (no dispatch copy subject)", async () => {
  for (const companyType of ["dealer", "shipper", "broker"]) {
    const { db } = makeD1();
    const calls = [];
    const response = await onRequestPost({ request: request({ ...carrierBody, companyType }), env: { DB: db, LEAD_EMAIL_SERVICE: emailService(calls), LEAD_SERVICE_TOKEN: "t0ken" } });
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].payload.subject, "[HERMES INQUIRY] [LOGISTICS]");
  }
});

test("saving the same company again does not send a second notice", async () => {
  const { db } = makeD1();
  const calls = [];
  const env = { DB: db, LEAD_EMAIL_SERVICE: emailService(calls), LEAD_SERVICE_TOKEN: "t0ken" };
  assert.equal((await onRequestPost({ request: request(carrierBody), env })).status, 200);
  assert.equal((await onRequestPost({ request: request({ ...carrierBody, city: "Joliet" }), env })).status, 200);
  assert.equal(calls.length, 1);
});

test("an unavailable email service never blocks the registration", async () => {
  const { db } = makeD1();
  const calls = [];
  const response = await onRequestPost({ request: request(carrierBody), env: { DB: db, LEAD_EMAIL_SERVICE: emailService(calls, { fail: true }), LEAD_SERVICE_TOKEN: "t0ken" } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test("without the email service binding the registration still succeeds", async () => {
  const { db } = makeD1();
  const response = await onRequestPost({ request: request(carrierBody), env: { DB: db } });
  assert.equal(response.status, 200);
});

test("an invalid callback phone is rejected before anything is saved or sent", async () => {
  const { db } = makeD1();
  const calls = [];
  const response = await onRequestPost({ request: request({ ...carrierBody, callbackPhone: "123" }), env: { DB: db, LEAD_EMAIL_SERVICE: emailService(calls), LEAD_SERVICE_TOKEN: "t0ken" } });
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("through the real lead-email Worker: Sales, the dispatch department copy and the owner alert", async () => {
  const { db } = makeD1();
  const sent = [];
  const workerEnv = {
    LEAD_SERVICE_TOKEN: "t0ken",
    SALES_DESTINATION: "officeus@hermeslogisticsus.com",
    SALES_SENDER: "website@hermeslogisticsus.com",
    CARRIER_DISPATCH_RECIPIENTS: "dispatchtruck107@gmail.com",
    OWNER_LEAD_ALERT_RECIPIENT: "owner-alerts@example.com",
    EMAIL: { async send(message) { sent.push(message); return { messageId: `m-${sent.length}` }; } },
  };
  const service = { fetch: (url, init) => leadEmailWorker.fetch(new Request(url, init), workerEnv) };
  const response = await onRequestPost({ request: request(carrierBody), env: { DB: db, LEAD_EMAIL_SERVICE: service, LEAD_SERVICE_TOKEN: "t0ken" } });
  assert.equal(response.status, 200);
  const recipients = sent.map((message) => message.to).sort();
  assert.ok(recipients.includes("officeus@hermeslogisticsus.com"), "Logistics Sales receives the registration");
  assert.ok(recipients.includes("dispatchtruck107@gmail.com"), "the dispatch department receives a copy");
  const dispatchCopy = sent.find((message) => message.to === "dispatchtruck107@gmail.com");
  assert.equal(dispatchCopy.from, "website@hermeslogisticsus.com");
  assert.match(dispatchCopy.text, /^Hermes Logistics — Dispatch Department\n/);
  assert.match(dispatchCopy.text, /Company: Test Haulers LLC/);
});
