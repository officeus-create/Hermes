import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import {
  onRequestGet as getAcademyCrm,
  onRequestPost as mutateAcademyCrm,
} from "../functions/api/hermes-connect/academy/crm.ts";

function makeD1() {
  const sqlite = new DatabaseSync(":memory:");
  const db = {
    prepare(sql) {
      let args = [];
      const q = {
        bind(...values) { args = values; return q; },
        async all() { return { results: sqlite.prepare(sql).all(...args).map((row) => ({ ...row })) }; },
        async first() {
          const row = sqlite.prepare(sql).get(...args);
          return row ? { ...row } : null;
        },
        async run() {
          const result = sqlite.prepare(sql).run(...args);
          return { success: true, meta: { changes: Number(result.changes) } };
        },
      };
      return q;
    },
  };
  return { sqlite, db };
}

function ensureIdentityTables(sqlite) {
  sqlite.exec(`
    CREATE TABLE specialists (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      role TEXT,
      location TEXT,
      bio TEXT
    );
    CREATE TABLE sessions (
      token TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);
}

function seedIdentity(sqlite, id, token, email) {
  sqlite.prepare("INSERT INTO specialists (id,email,name,role,location,bio) VALUES (?,?,?,?,?,?)")
    .run(id, email, "Academy Owner", "Academy Business Owner", "Kyiv, Ukraine", "Synthetic isolated CRM fixture.");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)")
    .run(token, id, "2099-01-01T00:00:00.000Z");
}

const academyPayload = {
  businessName: "Synthetic KNB CRM Fixture",
  academyType: "business_club",
  city: "Біла Церква",
  region: "Київська область",
  countryCode: "UA",
  website: "https://synthetic-academy.example/",
  phone: "+380671234567",
  timezone: "Europe/Kyiv",
  catalogOptIn: false,
};

function request(url, token, method = "GET", body = null, extraHeaders = {}) {
  return new Request(`https://hermes.example${url}`, {
    method,
    headers: {
      Cookie: `hermes_session=${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...extraHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function setupAcademy(db, token, payload = academyPayload) {
  const response = await saveAcademyBusiness({
    request: request("/api/hermes-connect/academy/business", token, "POST", payload),
    env: { DB: db },
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  return body;
}

test("Academy CRM core persists one owner-scoped lead with attribution and honest revenue evidence", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite, "owner-one", "token-one", "owner-one@example.com");
  await setupAcademy(db, "token-one");

  const created = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "create_lead",
      contactName: "Synthetic Prospect",
      contactEmail: "prospect@example.com",
      sourceChannel: "instagram",
      contentId: "reel-001",
      contentFormat: "reel",
      campaignId: "organic-october",
      ctaKeyword: "diagnostic",
      entryOffer: "business diagnostic",
      organicState: "organic_winner",
      paidLearningState: "not_started",
      audienceGeo: "UA / Kyiv region",
      primaryPain: "Sales systemization",
      diagnosticPrimaryGap: "No measurable follow-up loop",
      recommendedModule: "W6 · Sales System",
      businessStage: "consultation_booked",
      consultationStatus: "booked",
      nextAction: "Hold consultation",
      nextContactAt: "2026-10-08T09:00:00+03:00",
      programFit: "7-week managed growth program",
    }),
    env: { DB: db },
  });
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.lead.sourceChannel, "instagram");
  assert.equal(createdBody.lead.saleRevenueCents, null);
  assert.equal(createdBody.lead.businessStage, "consultation_booked");

  const dashboard = await getAcademyCrm({
    request: request("/api/hermes-connect/academy/crm?module=dashboard", "token-one"),
    env: { DB: db },
  });
  assert.equal(dashboard.status, 200);
  const dashboardBody = await dashboard.json();
  assert.equal(dashboardBody.metrics.totalLeads, 1);
  assert.equal(dashboardBody.metrics.consultationsBooked, 1);
  assert.equal(dashboardBody.metrics.revenueKnownCount, 0);
  assert.equal(dashboardBody.metrics.revenueCents, 0);

  const rejectedRevenue = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "update_lead",
      id: createdBody.lead.id,
      businessStage: "enrolled",
      consultationStatus: "qualified",
      saleRevenueCents: 75000,
      revenueSourceRef: "",
    }),
    env: { DB: db },
  });
  assert.equal(rejectedRevenue.status, 400);
  const rejectedBody = await rejectedRevenue.json();
  assert.ok(rejectedBody.errors.includes("revenue_source_ref_required"));

  const updated = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "update_lead",
      id: createdBody.lead.id,
      businessStage: "enrolled",
      consultationStatus: "qualified",
      saleRevenueCents: 75000,
      revenueSourceRef: "synthetic-test-receipt:academy-001",
      cohort: "Synthetic cohort",
      completionStatus: "not_started",
      renewalStatus: "not_due",
    }),
    env: { DB: db },
  });
  assert.equal(updated.status, 200);
  const updatedBody = await updated.json();
  assert.equal(updatedBody.lead.saleRevenueCents, 75000);
  assert.equal(updatedBody.lead.revenueSourceRef, "synthetic-test-receipt:academy-001");

  const reread = await getAcademyCrm({
    request: request("/api/hermes-connect/academy/crm?module=dashboard", "token-one"),
    env: { DB: db },
  });
  const rereadBody = await reread.json();
  assert.equal(rereadBody.metrics.enrolled, 1);
  assert.equal(rereadBody.metrics.consultationsQualified, 1);
  assert.equal(rereadBody.metrics.revenueKnownCount, 1);
  assert.equal(rereadBody.metrics.revenueCents, 75000);

  sqlite.close();
});

test("Academy CRM core is owner/company scoped, same-origin guarded, and archives instead of hard deleting", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite, "owner-one", "token-one", "owner-one@example.com");
  await setupAcademy(db, "token-one");

  const created = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "create_lead",
      contactName: "Owner One Lead",
      sourceChannel: "threads",
      businessStage: "new",
    }),
    env: { DB: db },
  });
  const createdBody = await created.json();

  const crossSite = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "update_lead",
      id: createdBody.lead.id,
      nextAction: "Should fail",
    }, { "Sec-Fetch-Site": "cross-site" }),
    env: { DB: db },
  });
  assert.equal(crossSite.status, 403);
  assert.equal((await crossSite.json()).error, "same_origin_required");

  seedIdentity(sqlite, "owner-two", "token-two", "owner-two@example.com");
  await setupAcademy(db, "token-two", {
    ...academyPayload,
    businessName: "Second Synthetic Academy",
    website: "https://second-academy.example/",
  });

  const foreignUpdate = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-two", "POST", {
      action: "update_lead",
      id: createdBody.lead.id,
      nextAction: "Should not cross tenant",
    }),
    env: { DB: db },
  });
  assert.equal(foreignUpdate.status, 404);

  const archived = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "archive_lead",
      id: createdBody.lead.id,
    }),
    env: { DB: db },
  });
  assert.equal(archived.status, 200);
  assert.ok((await archived.json()).lead.archivedAt);

  const activeList = await getAcademyCrm({
    request: request("/api/hermes-connect/academy/crm?module=leads", "token-one"),
    env: { DB: db },
  });
  assert.equal((await activeList.json()).leads.length, 0);

  const archivedList = await getAcademyCrm({
    request: request("/api/hermes-connect/academy/crm?module=leads&include_archived=1", "token-one"),
    env: { DB: db },
  });
  assert.equal((await archivedList.json()).leads.length, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_leads").get().count, 1);

  sqlite.close();
});

const workspace = readFileSync(new URL("../src/pages/services/hermes-connect/academy/business/workspace/index.astro", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../functions/api/hermes-connect/academy/crm.ts", import.meta.url), "utf8");
const helperSource = readFileSync(new URL("../functions/api/_lib/academy-business-crm.mjs", import.meta.url), "utf8");

for (const marker of [
  "data-academy-crm-core",
  "data-crm-lead-form",
  'data-crm-metric="totalLeads"',
  "/api/hermes-connect/academy/crm?module=dashboard",
  'action:"create_lead"',
  "LIVE DATA · PRIVATE",
]) {
  assert.match(workspace, new RegExp(marker.replace(/[.*+?^$()|[\]\\]/g, "\\$&")), `workspace missing CRM core marker: ${marker}`);
}
for (const field of [
  "source_channel",
  "content_id",
  "campaign_id",
  "organic_state",
  "paid_learning_state",
  "primary_pain",
  "diagnostic_primary_gap",
  "recommended_module",
  "consultation_status",
  "next_action",
  "next_contact_at",
  "sale_revenue_cents",
  "revenue_source_ref",
  "completion_status",
  "renewal_status",
]) {
  assert.match(helperSource, new RegExp(field), `CRM schema missing ${field}`);
}
assert.match(apiSource, /same_origin_required/);
assert.match(apiSource, /owner_specialist_id=\? AND company_id=\?/);
assert.match(apiSource, /archive_lead/);
console.log("hermes-connect-academy-crm-core: contract ok");
