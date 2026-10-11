import assert from "node:assert/strict";
import { test } from "node:test";
import { MemoryD1 } from "./helpers/catalog-memory-d1.mjs";
import { ensureHomeServiceCrmSchema } from "../functions/api/_lib/home-service-crm.mjs";
import { onRequest as intakeRequest } from "../functions/api/hermes-connect/home-services/mzm-intake.ts";
import { onRequest as availabilityRequest } from "../functions/api/hermes-connect/home-services/mzm-availability.ts";

const ORIGIN = "https://mzm-junk-removal.com";
const COMPANY_ID = "home-service-managed:mzm-junk-removal";
const DATA_OWNER_ID = "hermes-managed:mzm-junk-removal";

class MemoryKv {
  values = new Map();
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, String(value)); }
}

async function fixture() {
  const db = new MemoryD1();
  await ensureHomeServiceCrmSchema(db);
  const now = "2026-10-12T00:00:00.000Z";
  await db.prepare(`
    INSERT INTO hermes_company_profiles (
      id,owner_specialist_id,company_name,slug,company_type,city,state,website,authority_number,
      catalog_opt_in,catalog_status,load_board_access,created_at,updated_at,
      phone,address_line1,postal_code,country_code,timezone,public_source_ref,management_mode,catalog_publication_basis
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    COMPANY_ID,
    DATA_OWNER_ID,
    "MZM Junk Removal",
    "mzm-junk-removal",
    "home_service",
    "Roseville",
    "CA",
    "https://mzm-junk-removal.com/",
    null,
    1,
    "verified_public",
    0,
    now,
    now,
    "+12792391800",
    null,
    null,
    "US",
    "America/Los_Angeles",
    "https://mzm-junk-removal.com/",
    "hermes_managed",
    "hermes_managed_public_facts",
  ).run();
  return { db, kv: new MemoryKv() };
}

const base = () => ({
  request_id: "mzm_request_12345678",
  source_path: "/junk-removal-orangevale",
  source: "Orangevale city page",
  name: "Example Customer",
  phone: "(916) 555-0123",
  zip: "95662",
  service: "Garage Cleanout",
  message: "Please quote a garage cleanout.",
  preferred_time: "Tomorrow — Morning",
  mzm_hp: "",
  ts: Date.now() - 5_000,
  attribution: {
    utm_source: "hermeslogisticsus.com",
    utm_medium: "referral",
    utm_campaign: "mzm_evidence_insight",
  },
});

async function send(env, payload = base(), headers = {}) {
  const request = new Request("https://hermeslogisticsus.com/api/hermes-connect/home-services/mzm-intake", {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.request_id,
      "CF-Connecting-IP": "192.0.2.45",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  const response = await intakeRequest({ request, env: { DB: env.db, LEAD_LIMITS: env.kv } });
  return { status: response.status, body: await response.json() };
}

test("valid MZM website inquiry creates exactly one real CRM lead with outcome fields UNKNOWN", async () => {
  const env = await fixture();
  const result = await send(env);
  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  assert.equal(result.body.crm_saved, true);
  assert.equal(result.body.duplicate, false);
  assert.equal(result.body.request_id, base().request_id);
  assert.equal("lead" in result.body, false, "Public response must not echo CRM PII");

  const row = await env.db.prepare("SELECT * FROM hermes_home_service_leads LIMIT 1").first();
  assert.equal(row.owner_specialist_id, DATA_OWNER_ID);
  assert.equal(row.company_id, COMPANY_ID);
  assert.equal(row.source, "MZM Website");
  assert.equal(row.customer_name, "Example Customer");
  assert.equal(row.customer_phone, "(916) 555-0123");
  assert.equal(row.postal_code, "95662");
  assert.equal(row.job_type, "Garage Cleanout");
  assert.equal(row.status, "new");
  assert.equal(Number(row.lead_cost_known), 0);
  assert.equal(Number(row.quote_known), 0);
  assert.equal(Number(row.final_amount_known), 0);
  assert.equal(Number(row.disposal_cost_known), 0);
  assert.match(String(row.notes || ""), /Orangevale city page/);
  assert.match(String(row.notes || ""), /Tomorrow/);
  assert.equal(Number(env.db.sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_home_service_public_intakes").get().n), 1);
});

test("same id + same payload is idempotent and never creates a second lead", async () => {
  const env = await fixture();
  const payload = base();
  assert.equal((await send(env, payload)).status, 201);
  const duplicate = await send(env, payload);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);
  assert.equal(Number(env.db.sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_home_service_leads").get().n), 1);
});

test("same id + changed payload fails closed", async () => {
  const env = await fixture();
  const payload = base();
  await send(env, payload);
  const changed = { ...payload, phone: "(916) 555-0199" };
  const conflict = await send(env, changed);
  assert.equal(conflict.status, 409);
  assert.equal(conflict.body.error, "request_id_payload_conflict");
  assert.equal(Number(env.db.sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_home_service_leads").get().n), 1);
});

test("public caller cannot forge CRM status, quote, revenue, costs, reviews, driver or payment", async () => {
  const env = await fixture();
  const payload = {
    ...base(),
    request_id: "mzm_injection_12345678",
    status: "completed",
    quoteCents: 999_999,
    finalAmountCents: 999_999,
    leadCostCents: 1,
    disposalCostCents: 1,
    reviewReceivedAt: "2026-10-12T00:00:00Z",
    assignedDriver: "Injected",
    paymentMethod: "cash",
  };
  const result = await send(env, payload);
  assert.equal(result.status, 201);
  const row = await env.db.prepare("SELECT * FROM hermes_home_service_leads LIMIT 1").first();
  assert.equal(row.status, "new");
  assert.equal(Number(row.quote_known), 0);
  assert.equal(Number(row.final_amount_known), 0);
  assert.equal(Number(row.lead_cost_known), 0);
  assert.equal(Number(row.disposal_cost_known), 0);
  assert.equal(row.review_received_at, null);
  assert.equal(row.assigned_driver, null);
  assert.equal(row.payment_method, null);
});

test("origin, honeypot, timing, idempotency and ZIP gates fail before persistence", async () => {
  for (const [name, payload, headers, expected] of [
    ["origin", base(), { Origin: "https://evil.example" }, 403],
    ["honeypot", { ...base(), request_id: "mzm_honeypot_12345678", mzm_hp: "filled" }, {}, 400],
    ["timing", { ...base(), request_id: "mzm_timing_12345678", ts: Date.now() }, {}, 400],
    ["id", { ...base(), request_id: "short" }, { "Idempotency-Key": "short" }, 400],
    ["zip", { ...base(), request_id: "mzm_zip_12345678", zip: "99999" }, {}, 400],
  ]) {
    const env = await fixture();
    const result = await send(env, payload, headers);
    assert.equal(result.status, expected, name);
    assert.equal(Number(env.db.sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_home_service_leads").get().n), 0, name);
  }
});

test("fresh intake rate limit is enforced without affecting same-id duplicate readback", async () => {
  const env = await fixture();
  const first = base();
  assert.equal((await send(env, first)).status, 201);
  const rateKey = [...env.kv.values.keys()].find((key) => key.startsWith("mzm-public-intake:rate:"));
  assert.ok(rateKey);
  env.kv.values.set(rateKey, "8");

  const duplicate = await send(env, first);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);

  const fresh = { ...base(), request_id: "mzm_rate_new_12345678" };
  const blocked = await send(env, fresh);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error, "rate_limit_exceeded");
  assert.equal(Number(env.db.sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_home_service_leads").get().n), 1);
});

test("receiver fails closed when canonical managed MZM company is absent", async () => {
  const env = await fixture();
  await env.db.prepare("DELETE FROM hermes_company_profiles").run();
  const result = await send(env);
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "mzm_managed_client_not_ready");
});

test("availability endpoint exposes requestable preference windows, not a calendar-free-slot claim", async () => {
  const request = new Request(
    "https://hermeslogisticsus.com/api/hermes-connect/home-services/mzm-availability?now=2026-10-11T21:17:40.162Z",
    { headers: { "X-Hermes-Synthetic-Test": "1" } },
  );
  const response = await availabilityRequest({ request });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.timezone, "America/Los_Angeles");
  assert.equal(body.mode, "preference_windows_no_calendar");
  assert.equal(body.confirmationRequired, true);
  assert.deepEqual(body.businessHours, { opens: "03:00", closes: "19:00" });
  assert.equal(body.days.length, 4);
  assert.equal(body.days[0].label, "Today");
  assert.equal(body.days[0].windows.find((item) => item.key === "morning").available, false);
  assert.equal(body.days[0].windows.find((item) => item.key === "day").available, false);
  assert.equal(body.days[0].windows.find((item) => item.key === "evening").available, true);
  assert.equal(JSON.stringify(body).includes("calendar"), true, "Mode must explicitly state no calendar backing");
});