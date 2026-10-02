import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet, onRequestPost } from "../functions/api/hermes-connect/academy/business.ts";
import { ensureHermesCompanyProfilesSchema } from "../functions/api/_lib/hermes-company-profiles.mjs";

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

function seedIdentity(sqlite, id = "specialist-academy-owner", token = "academy-owner-session") {
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
  sqlite.prepare("INSERT INTO specialists (id,email,name,role,location,bio) VALUES (?,?,?,?,?,?)")
    .run(id, "academy-owner@example.com", "Academy Owner", "Academy Business Owner", "Kyiv, Ukraine", "Synthetic Academy owner for isolated test.");
  sqlite.prepare("INSERT INTO sessions (token,specialist_id,expires_at) VALUES (?,?,?)")
    .run(token, id, "2099-01-01T00:00:00.000Z");
  return { id, token };
}

function postRequest(token, body) {
  return new Request("https://hermes.example/api/hermes-connect/academy/business", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `hermes_session=${token}`,
    },
    body: JSON.stringify(body),
  });
}

function getRequest(token) {
  return new Request("https://hermes.example/api/hermes-connect/academy/business", {
    headers: { Cookie: `hermes_session=${token}` },
  });
}

const academyPayload = {
  businessName: "Demo Business Academy",
  academyType: "business_academy",
  city: "Kyiv",
  region: "Kyiv",
  countryCode: "UA",
  website: "https://academy.example/",
  phone: "+380501234567",
  timezone: "Europe/Kyiv",
};

test("Academy setup creates one canonical company, one extension, and explicit Catalog opt-in", async () => {
  const { sqlite, db } = makeD1();
  const { token } = seedIdentity(sqlite);

  const first = await onRequestPost({ request: postRequest(token, academyPayload), env: { DB: db } });
  assert.equal(first.status, 200);
  const firstBody = await first.json();
  assert.equal(firstBody.success, true);
  assert.equal(firstBody.catalog.listed, false);
  assert.ok(firstBody.canonicalCompany.id);

  const companyRows = sqlite.prepare("SELECT id,catalog_opt_in,load_board_access FROM hermes_company_profiles").all();
  const academyRows = sqlite.prepare("SELECT id,company_id,catalog_opt_in FROM hermes_academy_business_profiles").all();
  assert.equal(companyRows.length, 1);
  assert.equal(academyRows.length, 1);
  assert.equal(academyRows[0].company_id, companyRows[0].id);
  assert.equal(Number(companyRows[0].catalog_opt_in), 0);
  assert.equal(Number(academyRows[0].catalog_opt_in), 0);
  assert.equal(Number(companyRows[0].load_board_access), 0);

  const second = await onRequestPost({
    request: postRequest(token, { ...academyPayload, catalogOptIn: true }),
    env: { DB: db },
  });
  assert.equal(second.status, 200);
  const secondBody = await second.json();
  assert.equal(secondBody.catalog.listed, true);
  assert.equal(secondBody.canonicalCompany.id, firstBody.canonicalCompany.id);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_company_profiles").get().count, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_profiles").get().count, 1);
  assert.equal(Number(sqlite.prepare("SELECT catalog_opt_in FROM hermes_company_profiles").get().catalog_opt_in), 1);

  const readback = await onRequestGet({ request: getRequest(token), env: { DB: db } });
  const readbackBody = await readback.json();
  assert.equal(readbackBody.academyBusiness.companyId, firstBody.canonicalCompany.id);
  assert.equal(readbackBody.academyBusiness.catalogOptIn, true);

  sqlite.close();
});

test("Academy setup fails closed when the same account already owns a different canonical company", async () => {
  const { sqlite, db } = makeD1();
  const { id, token } = seedIdentity(sqlite);
  await ensureHermesCompanyProfilesSchema(db);
  const now = new Date().toISOString();
  sqlite.prepare(`
    INSERT INTO hermes_company_profiles
      (id,owner_specialist_id,company_name,slug,company_type,city,state,website,catalog_opt_in,catalog_status,load_board_access,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,0,'self_submitted',0,?,?)
  `).run("company-existing", id, "Existing Logistics Company", "existing-logistics", "carrier", "Chicago", "IL", "https://existing.example/", now, now);

  const response = await onRequestPost({ request: postRequest(token, academyPayload), env: { DB: db } });
  assert.equal(response.status, 409);
  const body = await response.json();
  assert.equal(body.error, "existing_company_requires_manual_link");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_profiles").get().count, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_company_profiles").get().count, 1);

  sqlite.close();
});


test("Academy setup does not overwrite an unrelated company that wins a concurrent create race", async () => {
  const { sqlite, db } = makeD1();
  const { id, token } = seedIdentity(sqlite);
  const originalPrepare = db.prepare.bind(db);
  let injected = false;

  db.prepare = (sql) => {
    const query = originalPrepare(sql);
    if (!injected && String(sql).includes("INSERT OR IGNORE INTO hermes_company_profiles")) {
      const originalBind = query.bind.bind(query);
      query.bind = (...values) => {
        const bound = originalBind(...values);
        const originalRun = bound.run.bind(bound);
        bound.run = async () => {
          if (!injected) {
            injected = true;
            const now = new Date().toISOString();
            sqlite.prepare(`
              INSERT INTO hermes_company_profiles
                (id,owner_specialist_id,company_name,slug,company_type,city,state,website,catalog_opt_in,catalog_status,load_board_access,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,0,'self_submitted',0,?,?)
            `).run(
              "company-concurrent",
              id,
              "Concurrent Other Company",
              "concurrent-other-company",
              "carrier",
              "Chicago",
              "IL",
              "https://concurrent.example/",
              now,
              now,
            );
          }
          return originalRun();
        };
        return bound;
      };
    }
    return query;
  };

  const response = await onRequestPost({ request: postRequest(token, academyPayload), env: { DB: db } });
  assert.equal(injected, true);
  assert.equal(response.status, 409);
  const body = await response.json();
  assert.equal(body.error, "canonical_company_concurrent_conflict");
  const company = sqlite.prepare("SELECT company_name,website FROM hermes_company_profiles WHERE owner_specialist_id=?").get(id);
  assert.equal(company.company_name, "Concurrent Other Company");
  assert.equal(company.website, "https://concurrent.example/");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM hermes_academy_business_profiles").get().count, 0);

  sqlite.close();
});
