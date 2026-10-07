import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost as saveAcademyBusiness } from "../functions/api/hermes-connect/academy/business.ts";
import {
  onRequestGet as getPrograms,
  onRequestPost as mutatePrograms,
} from "../functions/api/hermes-connect/academy/programs.ts";

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
    .run(id, email, "Academy Owner", "Academy Business Owner", "Kyiv, Ukraine", "Synthetic programs fixture.");
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

async function setupAcademy(db, token, name = "Synthetic Academy") {
  const response = await saveAcademyBusiness({
    request: request("/api/hermes-connect/academy/business", token, "POST", {
      businessName: name,
      academyType: "business_academy",
      city: "Біла Церква",
      region: "Київська область",
      countryCode: "UA",
      website: "https://synthetic-academy.example/",
      timezone: "Europe/Kyiv",
      catalogOptIn: false,
    }),
    env: { DB: db },
  });
  assert.equal(response.status, 200);
}

test("Academy Business persists owner-scoped programs/cohorts without fabricating price, dates, or capacity", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","token-one","owner-one@example.com");
  await setupAcademy(db,"token-one");

  const createdProgram = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"create_program",
      name:"Synthetic Managed Growth",
      formatText:"Group",
      durationText:"7 weeks",
      eligibilityText:"Owner-confirmed fit required",
      status:"draft",
    }),
    env:{DB:db},
  });
  assert.equal(createdProgram.status,201);
  const programBody = await createdProgram.json();
  assert.equal(programBody.program.priceCents,null);
  assert.equal(programBody.program.currency,"");

  const rejectedPrice = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"update_program",
      id:programBody.program.id,
      priceCents:28300,
      currency:"EUR",
      priceSourceRef:"",
    }),
    env:{DB:db},
  });
  assert.equal(rejectedPrice.status,400);
  assert.ok((await rejectedPrice.json()).errors.includes("program_price_source_ref_required"));

  const priced = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"update_program",
      id:programBody.program.id,
      priceCents:28300,
      currency:"EUR",
      priceSourceRef:"synthetic-owner-confirmation:program-price",
    }),
    env:{DB:db},
  });
  assert.equal(priced.status,200);
  assert.equal((await priced.json()).program.priceCents,28300);

  const bypassArchive = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"update_program",
      id:programBody.program.id,
      status:"archived",
    }),
    env:{DB:db},
  });
  assert.equal(bypassArchive.status,200);
  const bypassBody = await bypassArchive.json();
  assert.notEqual(bypassBody.program.status,"archived");
  assert.equal(bypassBody.program.archivedAt,null);

  const createdCohort = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"create_cohort",
      programId:programBody.program.id,
      name:"Synthetic Autumn Cohort",
      status:"planned",
      timezone:"Europe/Kyiv",
      scheduleText:"UNKNOWN until owner confirmation",
    }),
    env:{DB:db},
  });
  assert.equal(createdCohort.status,201);
  const cohortBody = await createdCohort.json();
  assert.equal(cohortBody.cohort.startDate,null);
  assert.equal(cohortBody.cohort.endDate,null);
  assert.equal(cohortBody.cohort.capacity,null);
  const originalCode = cohortBody.cohort.code;

  const cohortUpdate = await mutatePrograms({
    request: request("/api/hermes-connect/academy/programs","token-one","POST",{
      action:"update_cohort",
      id:cohortBody.cohort.id,
      code:"CALLER-CANNOT-REKEY",
      scheduleText:"Owner-confirmed schedule later",
    }),
    env:{DB:db},
  });
  assert.equal(cohortUpdate.status,200);
  assert.equal((await cohortUpdate.json()).cohort.code,originalCode);

  const read = await getPrograms({
    request:request("/api/hermes-connect/academy/programs","token-one"),
    env:{DB:db},
  });
  const readBody = await read.json();
  assert.equal(readBody.programs.length,1);
  assert.equal(readBody.cohorts.length,1);
  assert.equal(readBody.enrollmentBridge,"not_activated");

  sqlite.close();
});

test("Programs/cohorts fail closed across tenants, block cross-site mutation, and archive instead of delete", async () => {
  const { sqlite, db } = makeD1();
  ensureIdentityTables(sqlite);
  seedIdentity(sqlite,"owner-one","token-one","owner-one@example.com");
  seedIdentity(sqlite,"owner-two","token-two","owner-two@example.com");
  await setupAcademy(db,"token-one","Owner One Academy");
  await setupAcademy(db,"token-two","Owner Two Academy");

  const created = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"create_program",name:"Owner One Program"}),
    env:{DB:db},
  });
  const program = (await created.json()).program;

  const crossSite = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"update_program",id:program.id,name:"Should fail"},{ "Sec-Fetch-Site":"cross-site" }),
    env:{DB:db},
  });
  assert.equal(crossSite.status,403);

  const foreign = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-two","POST",{action:"update_program",id:program.id,name:"Wrong tenant"}),
    env:{DB:db},
  });
  assert.equal(foreign.status,404);

  const otherRead = await getPrograms({request:request("/api/hermes-connect/academy/programs","token-two"),env:{DB:db}});
  assert.equal((await otherRead.json()).programs.length,0);

  const cohortRes = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"create_cohort",programId:program.id,name:"Open Cohort",status:"planned"}),
    env:{DB:db},
  });
  const cohort = (await cohortRes.json()).cohort;

  const blockedArchive = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"archive_program",id:program.id}),
    env:{DB:db},
  });
  assert.equal(blockedArchive.status,409);
  assert.equal((await blockedArchive.json()).error,"program_has_open_cohorts");

  const archivedCohort = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"archive_cohort",id:cohort.id}),
    env:{DB:db},
  });
  assert.equal(archivedCohort.status,200);
  assert.ok((await archivedCohort.json()).cohort.archivedAt);

  const archivedProgram = await mutatePrograms({
    request:request("/api/hermes-connect/academy/programs","token-one","POST",{action:"archive_program",id:program.id}),
    env:{DB:db},
  });
  assert.equal(archivedProgram.status,200);
  assert.ok((await archivedProgram.json()).program.archivedAt);

  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_programs").get().count,1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_cohorts").get().count,1);
  sqlite.close();
});

const workspace = readFileSync(new URL("../src/pages/services/hermes-connect/academy/business/workspace/index.astro", import.meta.url),"utf8");
const apiSource = readFileSync(new URL("../functions/api/hermes-connect/academy/programs.ts", import.meta.url),"utf8");
const helperSource = readFileSync(new URL("../functions/api/_lib/academy-business-programs.mjs", import.meta.url),"utf8");

for (const marker of [
  "data-academy-programs-cohorts",
  "data-academy-program-form",
  "data-academy-cohort-form",
  "/api/hermes-connect/academy/programs",
  "enrollmentBridge",
  "not_activated",
]) assert.match(workspace + apiSource,new RegExp(marker.replace(/[.*+?^$()|[\]\\]/g,"\\$&")));

for (const field of [
  "owner_specialist_id",
  "company_id",
  "price_source_ref",
  "program_id",
  "start_date",
  "capacity",
  "delivery_owner_label",
]) assert.match(helperSource,new RegExp(field));

assert.match(apiSource,/same_origin_required/);
assert.match(apiSource,/owner_specialist_id=\? AND company_id=\?/);
assert.doesNotMatch(apiSource,/onRequestDelete|DELETE FROM hermes_academy_business_/);
assert.doesNotMatch(apiSource + helperSource,/UPDATE academy_enrollments|INSERT INTO academy_enrollments/);
assert.doesNotMatch(apiSource + helperSource,/academy_reviewer_access|academy_support_access/);
console.log("hermes-connect-academy-programs-cohorts: contract ok");
