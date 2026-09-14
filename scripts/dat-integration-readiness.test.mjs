import assert from "node:assert/strict";
import { evaluateDatProviderReadiness } from "../functions/api/_lib/dat-provider-readiness.mjs";
import {
  DAT_SEARCH_LIMITS,
  evaluateDatSearchBudget,
  expireDatInventory,
  normalizeDatMappedOpportunity,
  normalizeDatSearchIntent,
  shouldFailClosedDatInventory,
} from "../functions/api/_lib/dat-certification-policy.mjs";

function call(env, environment = "sandbox") {
  return evaluateDatProviderReadiness(env, environment);
}

{
  let result = call({});
  assert.equal(result.status, 403);
  assert.equal(result.body.error, "dat_partnership_not_approved");
  assert.equal(result.body.external_request_performed, false);

  result = call({ HERMES_DAT_PARTNERSHIP_APPROVED: "true" });
  assert.equal(result.status, 403);
  assert.equal(result.body.error, "dat_data_rights_not_approved");

  result = call({
    HERMES_DAT_PARTNERSHIP_APPROVED: "true",
    HERMES_DAT_DATA_RIGHTS_APPROVED: "true",
  }, "production");
  assert.equal(result.status, 403);
  assert.equal(result.body.error, "dat_certification_required");

  result = call({
    HERMES_DAT_PARTNERSHIP_APPROVED: "true",
    HERMES_DAT_DATA_RIGHTS_APPROVED: "true",
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "dat_credentials_not_configured");
  assert.deepEqual(result.body.missing_configuration.sort(), [
    "DAT_SERVICE_ACCOUNT_EMAIL",
    "DAT_SERVICE_ACCOUNT_PASSWORD",
    "DAT_USER_EMAIL",
  ]);

  const configured = {
    HERMES_DAT_PARTNERSHIP_APPROVED: "true",
    HERMES_DAT_DATA_RIGHTS_APPROVED: "true",
    DAT_SERVICE_ACCOUNT_EMAIL: "service@example.test",
    DAT_SERVICE_ACCOUNT_PASSWORD: "not-a-real-secret",
    DAT_USER_EMAIL: "user@example.test",
  };
  result = call(configured);
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "dat_api_contract_not_configured");

  result = call({ ...configured, DAT_API_BASE_URL: "https://sandbox.example.test" });
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "dat_endpoint_mapping_pending");
  assert.equal(result.body.environment, "sandbox");
  assert.equal(result.body.intended_visibility, "carrier_only");
  assert.equal(result.body.certification_required_for_production, true);
  assert.equal(result.body.external_request_performed, false);
  assert.equal(result.body.scraping_used, false);
  assert.equal(result.body.write_or_book_performed, false);

  result = call({
    ...configured,
    DAT_API_BASE_URL: "https://production.example.test",
    HERMES_DAT_CERTIFIED: "true",
    HERMES_DAT_PUBLIC_DISPLAY_APPROVED: "true",
  }, "production");
  assert.equal(result.status, 503);
  assert.equal(result.body.error, "dat_endpoint_mapping_pending");
  assert.equal(result.body.certification_approved, true);
  assert.equal(result.body.intended_visibility, "public");

  const intent = normalizeDatSearchIntent({
    resource: "loads",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    equipment: "dry van",
    radius_miles: 150,
    cursor: "opaque-next-page",
    limit: 500,
  });
  assert.equal(intent.resource, "loads");
  assert.equal(intent.origin, "Chicago, IL");
  assert.equal(intent.destination, "Dallas, TX");
  assert.equal(intent.equipment, "dry_van");
  assert.equal(intent.radius_miles, 150);
  assert.equal(intent.cursor, "opaque-next-page");
  assert.equal(intent.requested_limit, 100, "Hermes display batch must stay bounded independently of DAT endpoint pagination");
  assert.equal(intent.purpose, "user_freight_matching");
  assert.equal(intent.analytics_or_bulk_retrieval, false);

  assert.equal(DAT_SEARCH_LIMITS.searches_per_user_hour, 60);
  assert.equal(DAT_SEARCH_LIMITS.searches_per_user_month, 1000);
  let budget = evaluateDatSearchBudget({ hourlySearches: 59, monthlySearches: 999, requestedSearches: 1 });
  assert.equal(budget.allowed, true);
  budget = evaluateDatSearchBudget({ hourlySearches: 60, monthlySearches: 100, requestedSearches: 1 });
  assert.equal(budget.allowed, false);
  budget = evaluateDatSearchBudget({ hourlySearches: 10, monthlySearches: 1000, requestedSearches: 1 });
  assert.equal(budget.allowed, false);

  let mapped = normalizeDatMappedOpportunity({
    provider_record_id: "dat-cert-load-001",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    equipment: "dry_van",
    observed_at: "2026-09-14T17:00:00Z",
    rate_amount: 2450,
    distance_miles: 925,
  });
  assert.equal(mapped.ok, false);
  assert.equal(mapped.reason, "dat_freshness_mapping_required", "No guessed DAT TTL is allowed");

  mapped = normalizeDatMappedOpportunity({
    provider_record_id: "dat-cert-load-001",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    equipment: "dry_van",
    observed_at: "2026-09-14T17:00:00Z",
    rate_amount: 2450,
    distance_miles: 925,
    source_version: "fixture-v1",
  }, { approved_ttl_minutes: 30 });
  assert.equal(mapped.ok, true);
  assert.equal(mapped.record.visibility, "carrier_only");
  assert.equal(mapped.record.record_type, "load");
  assert.match(mapped.record.fingerprint, /^dat:dat-cert-load-001:fixture-v1/);

  const publicMapped = normalizeDatMappedOpportunity({
    provider_record_id: "dat-cert-load-002",
    origin: "Atlanta, GA",
    destination: "Charlotte, NC",
    observed_at: "2026-09-14T17:00:00Z",
    expires_at: "2026-09-14T17:30:00Z",
  }, { public_display_approved: true });
  assert.equal(publicMapped.ok, true);
  assert.equal(publicMapped.record.visibility, "public");

  assert.equal(shouldFailClosedDatInventory("dat_data_rights_not_approved"), true);
  assert.equal(shouldFailClosedDatInventory("dat_credentials_not_configured"), true);
  assert.equal(shouldFailClosedDatInventory("dat_endpoint_mapping_pending"), false);

  const sql = [];
  const fakeDb = {
    prepare(statement) {
      sql.push(String(statement));
      return {
        bind() { return this; },
        async run() { return { success: true }; },
        async all() { return { results: [] }; },
      };
    },
  };
  const revoked = await expireDatInventory(fakeDb, "dat_data_rights_not_approved");
  assert.equal(revoked.sources_disabled, true);
  assert.equal(revoked.records_expired, true);
  assert.equal(sql.some((statement) => statement.includes("WHERE provider = 'dat'")), true);
  assert.equal(sql.some((statement) => statement.includes("SET status = 'expired'")), true);

  console.log("DAT integration readiness gate: partnership, rights, service-account/user auth, official search budgets, user-search intent, freshness mapping, carrier-only default, revocation expiry and endpoint-mapping boundaries verified without provider calls.");
}
