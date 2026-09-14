import assert from "node:assert/strict";
import { evaluateDatProviderReadiness } from "../functions/api/_lib/dat-provider-readiness.mjs";

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

  console.log("DAT integration readiness gate: partnership, rights, service-account/user auth, certification and endpoint-mapping boundaries verified without provider calls.");
}
