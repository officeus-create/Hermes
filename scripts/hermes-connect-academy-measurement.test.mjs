import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import { onRequestPost as mutateAcademyCrm } from "../functions/api/hermes-connect/academy/crm.ts";
import {
  onRequestGet as getMeasurement,
  onRequestPost as mutateMeasurement,
} from "../functions/api/hermes-connect/academy/measurement.ts";

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
    .run(id, email, "Academy Owner", "Academy Business Owner", "Kyiv, Ukraine", "Synthetic measurement fixture.");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)")
    .run(token, id, "2099-01-01T00:00:00.000Z");
}

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

async function setupAcademy(db, token, name) {
  const response = await saveAcademyBusiness({
    request: request("/api/hermes-connect/academy/business", token, "POST", {
      businessName: name,
      academyType: "business_club",
      city: "Біла Церква",
      region: "Київська область",
      countryCode: "UA",
      website: "https://synthetic-academy.example/",
      phone: "+380671234567",
      timezone: "Europe/Kyiv",
      catalogOptIn: false,
    }),
    env: { DB: db },
  });
  assert.equal(response.status, 200);
}

async function createLead(db, token, contactName, revenueCents = null) {
  const payload = {
    action: "create_lead",
    contactName,
    sourceChannel: "instagram",
    campaignId: "paid-october",
    contentId: "reel-001",
    businessStage: "enrolled",
    consultationStatus: "qualified",
    ...(revenueCents === null ? {} : {
      saleRevenueCents: revenueCents,
      revenueCurrency: "EUR",
      revenueSourceRef: `synthetic-receipt:${contactName}`,
    }),
  };
  const response = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", token, "POST", payload),
    env: { DB: db },
  });
  assert.equal(response.status, 201);
  return (await response.json()).lead;
}

test("Academy measurement keeps CAC source-scoped and ROMI UNKNOWN until attributed revenue is complete", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite, "owner-one", "token-one", "owner-one@example.com");
  await setupAcademy(db, "token-one", "Synthetic Measurement Academy");
  const leadOne = await createLead(db, "token-one", "Lead One", 7500);
  const leadTwo = await createLead(db, "token-one", "Lead Two", null);

  const baseline = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "organic_baseline",
      sourceChannel: "instagram",
      metricKey: "reach",
      metricValue: 12500,
      metricUnit: "accounts",
      sourceRef: "synthetic-insights:baseline-oct",
      observedAt: "2026-10-07T08:00:00Z",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      definition: "Instagram accounts reached during the baseline period.",
      evidenceOwnerLabel: "Academy owner",
    }),
    env: { DB: db },
  });
  assert.equal(baseline.status, 201);

  const spend = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "paid_spend",
      sourceChannel: "instagram",
      campaignId: "paid-october",
      contentId: "reel-001",
      amountCents: 10000,
      currency: "EUR",
      sourceRef: "synthetic-ads:paid-october",
      observedAt: "2026-10-07T08:10:00Z",
      periodStart: "2026-10-01",
      periodEnd: "2026-10-07",
      definition: "Permitted campaign spend exported from the ad account.",
      evidenceOwnerLabel: "Marketing owner",
    }),
    env: { DB: db },
  });
  assert.equal(spend.status, 201);

  const dashboard = await getMeasurement({
    request: request("/api/hermes-connect/academy/measurement?module=dashboard", "token-one"),
    env: { DB: db },
  });
  assert.equal(dashboard.status, 200);
  const body = await dashboard.json();
  assert.equal(body.measurement.organicBaselines.length, 1);
  assert.equal(body.measurement.economics.length, 1);
  assert.equal(body.measurement.economics[0].spendCents, 10000);
  assert.equal(body.measurement.economics[0].attributedSales, 2);
  assert.equal(body.measurement.economics[0].cacCents, 5000);
  assert.equal(body.measurement.economics[0].revenueCents, null);
  assert.equal(body.measurement.economics[0].romiRatio, null);
  assert.equal(body.measurement.economics[0].revenueComplete, false);
  assert.equal(body.measurement.ltvEvidence.length, 0);

  const updatedSecond = await mutateAcademyCrm({
    request: request("/api/hermes-connect/academy/crm", "token-one", "POST", {
      action: "update_lead",
      id: leadTwo.id,
      saleRevenueCents: 15000,
      revenueCurrency: "EUR",
      revenueSourceRef: "synthetic-receipt:Lead Two",
    }),
    env: { DB: db },
  });
  assert.equal(updatedSecond.status, 200);

  const ltv = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "ltv",
      amountCents: 50000,
      currency: "EUR",
      sourceRef: "synthetic-finance:cohort-ltv",
      observedAt: "2026-10-07T08:20:00Z",
      definition: "Observed cohort lifetime revenue per customer using the documented cohort definition.",
      evidenceOwnerLabel: "Finance owner",
    }),
    env: { DB: db },
  });
  assert.equal(ltv.status, 201);

  const completeDashboard = await getMeasurement({
    request: request("/api/hermes-connect/academy/measurement?module=dashboard", "token-one"),
    env: { DB: db },
  });
  const complete = await completeDashboard.json();
  assert.equal(complete.measurement.economics[0].revenueCents, 22500);
  assert.equal(complete.measurement.economics[0].romiRatio, 1.25);
  assert.equal(complete.measurement.ltvEvidence[0].amountCents, 50000);
  assert.equal(complete.measurement.ltvEvidence[0].currency, "EUR");
  assert.equal(leadOne.revenueCurrency, "EUR");
});

test("Result claims require provenance, review date, and human-approved wording before approved state", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite, "owner-one", "token-one", "owner-one@example.com");
  await setupAcademy(db, "token-one", "Synthetic Claim Academy");

  const created = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "result_claim",
      claimText: "Synthetic participants improved a defined KPI.",
      claimState: "needs_review",
      sourceRef: "synthetic-report:claim-001",
      observedAt: "2026-10-07T09:00:00Z",
      definition: "Population, period, KPI formula, and exclusions are defined in the source report.",
      evidenceOwnerLabel: "Program owner",
      reviewAt: "2026-11-07",
    }),
    env: { DB: db },
  });
  assert.equal(created.status, 201);
  const createdBody = await created.json();

  const rejected = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "update_evidence",
      id: createdBody.evidence.id,
      claimState: "approved",
      approvedWording: "",
    }),
    env: { DB: db },
  });
  assert.equal(rejected.status, 400);
  const rejectedBody = await rejected.json();
  assert.ok(rejectedBody.errors.includes("approved_wording_required"));

  const approved = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "update_evidence",
      id: createdBody.evidence.id,
      claimState: "approved",
      approvedWording: "In the defined synthetic cohort and period, the documented KPI improved.",
    }),
    env: { DB: db },
  });
  assert.equal(approved.status, 200);
  const approvedBody = await approved.json();
  assert.equal(approvedBody.evidence.claimState, "approved");
  assert.match(approvedBody.evidence.approvedWording, /defined synthetic cohort/);
});

test("Measurement is owner/company scoped, same-origin guarded, and archive-only", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite, "owner-one", "token-one", "owner-one@example.com");
  seedIdentity(sqlite, "owner-two", "token-two", "owner-two@example.com");
  await setupAcademy(db, "token-one", "Owner One Academy");
  await setupAcademy(db, "token-two", "Owner Two Academy");

  const crossSite = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "other",
      sourceRef: "synthetic:cross-site",
      observedAt: "2026-10-07T09:00:00Z",
      definition: "Blocked cross-site evidence.",
      evidenceOwnerLabel: "Owner",
    }, { Origin: "https://evil.example", "Sec-Fetch-Site": "cross-site" }),
    env: { DB: db },
  });
  assert.equal(crossSite.status, 403);

  const created = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "create_evidence",
      kind: "other",
      sourceRef: "synthetic:owner-one",
      observedAt: "2026-10-07T09:00:00Z",
      definition: "Owner one evidence only.",
      evidenceOwnerLabel: "Owner one",
    }),
    env: { DB: db },
  });
  const createdBody = await created.json();

  const ownerTwoRead = await getMeasurement({
    request: request("/api/hermes-connect/academy/measurement?module=evidence", "token-two"),
    env: { DB: db },
  });
  const ownerTwoBody = await ownerTwoRead.json();
  assert.equal(ownerTwoBody.evidence.length, 0);

  const archived = await mutateMeasurement({
    request: request("/api/hermes-connect/academy/measurement", "token-one", "POST", {
      action: "archive_evidence",
      id: createdBody.evidence.id,
    }),
    env: { DB: db },
  });
  assert.equal(archived.status, 200);
  const archivedBody = await archived.json();
  assert.ok(archivedBody.evidence.archivedAt);

  const apiSource = readFileSync(new URL("../functions/api/hermes-connect/academy/measurement.ts", import.meta.url), "utf8");
  const libSource = readFileSync(new URL("../functions/api/_lib/academy-business-measurement.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(apiSource, /DELETE\s+FROM\s+hermes_academy_business_evidence/i);
  assert.doesNotMatch(libSource, /DELETE\s+FROM\s+hermes_academy_business_evidence/i);
  assert.match(apiSource, /private, no-store/);
  assert.match(apiSource, /noindex, nofollow/);
});


test("Academy owner workspace loads persisted programs and measurement on first boot without hard-coded USD", () => {
  const workspace = readFileSync(new URL("../src/pages/services/hermes-connect/academy/business/workspace/index.astro", import.meta.url), "utf8");
  assert.match(workspace, /Promise\.all\(\[loadCrmCore\(\),loadProgramsCohorts\(\),loadMeasurement\(\)\]\)/);
  assert.match(workspace, /data-measurement-form/);
  assert.match(workspace, /\/api\/hermes-connect\/academy\/measurement\?module=dashboard/);
  assert.match(workspace, /data-live-kpi="cac"/);
  assert.match(workspace, /data-live-kpi="ltv"/);
  assert.match(workspace, /data-live-kpi="romi"/);
  assert.doesNotMatch(workspace, /currency:"USD"/);
  assert.match(workspace, /revenueByCurrency/);
});
