import assert from "node:assert/strict";
import {
  LOAD_BOARD_ADAPTERS,
  OUTBOUND_PROVIDER_REQUESTS_ENABLED,
  PUBLIC_MARKETPLACE_EXPORT_ENABLED,
  REAL_PROVIDER_CREDENTIALS_CONFIGURED,
  SCRAPING_ALLOWED,
  evaluateLoadBoardAdapterAccess,
  getLoadBoardAdapter,
  listEnabledProviderConnections,
} from "../src/lib/load-board-adapters.ts";

assert.equal(SCRAPING_ALLOWED, false);
assert.equal(OUTBOUND_PROVIDER_REQUESTS_ENABLED, false);
assert.equal(PUBLIC_MARKETPLACE_EXPORT_ENABLED, false);
assert.equal(REAL_PROVIDER_CREDENTIALS_CONFIGURED, false);

assert.deepEqual(
  Object.keys(LOAD_BOARD_ADAPTERS).sort(),
  ["central_dispatch", "dat", "sanitized_csv", "ship_cars", "super_dispatch", "truckstop"],
);
assert.equal(Object.isFrozen(LOAD_BOARD_ADAPTERS), true);
assert.equal(listEnabledProviderConnections().length, 0);

for (const adapter of Object.values(LOAD_BOARD_ADAPTERS)) {
  assert.equal(adapter.providerConnectionEnabled, false);
  assert.equal(Object.isFrozen(adapter), true);
  assert.equal(Object.isFrozen(adapter.transports), true);
  assert.ok(adapter.notes.length > 20);
}

assert.equal(getLoadBoardAdapter("central_dispatch").readiness, "owner_approval_required");
assert.equal(getLoadBoardAdapter("super_dispatch").transports.includes("webhook"), true);
assert.equal(getLoadBoardAdapter("truckstop").readiness, "contract_required");
assert.equal(getLoadBoardAdapter("ship_cars").readiness, "research_only");
assert.equal(getLoadBoardAdapter("sanitized_csv").readiness, "preview_ready");

const providerRead = evaluateLoadBoardAdapterAccess({
  providerId: "central_dispatch",
  environment: "sandbox",
  operation: "read_opportunities",
  ownerApproved: true,
  commercialReviewPassed: true,
  dataRightsReviewPassed: true,
});
assert.equal(providerRead.allowed, false);
assert.equal(providerRead.externalActionPerformed, false);
assert.match(providerRead.reason, /disabled.*credentials/i);

const providerProduction = evaluateLoadBoardAdapterAccess({
  providerId: "super_dispatch",
  environment: "production",
  operation: "read_opportunities",
  ownerApproved: true,
  commercialReviewPassed: true,
  dataRightsReviewPassed: true,
});
assert.equal(providerProduction.allowed, false);
assert.equal(providerProduction.externalActionPerformed, false);

const scrapingEquivalentWrite = evaluateLoadBoardAdapterAccess({
  providerId: "truckstop",
  environment: "production",
  operation: "write_or_book",
});
assert.equal(scrapingEquivalentWrite.allowed, false);
assert.match(scrapingEquivalentWrite.reason, /writes and bookings are disabled/i);

const publicExport = evaluateLoadBoardAdapterAccess({
  providerId: "dat",
  environment: "preview",
  operation: "public_export",
});
assert.equal(publicExport.allowed, false);
assert.match(publicExport.reason, /public marketplace export is disabled/i);

const webhook = evaluateLoadBoardAdapterAccess({
  providerId: "super_dispatch",
  environment: "sandbox",
  operation: "receive_webhook",
});
assert.equal(webhook.allowed, false);
assert.match(webhook.reason, /webhooks are not configured/i);

const incompleteCsv = evaluateLoadBoardAdapterAccess({
  providerId: "sanitized_csv",
  environment: "preview",
  operation: "import_preview",
  ownerApproved: true,
  sourceApproved: true,
  privacyReviewPassed: false,
  dataRightsReviewPassed: true,
});
assert.equal(incompleteCsv.allowed, false);
assert.match(incompleteCsv.reason, /privacy review/i);

const approvedCsvPreview = evaluateLoadBoardAdapterAccess({
  providerId: "sanitized_csv",
  environment: "preview",
  operation: "import_preview",
  ownerApproved: true,
  sourceApproved: true,
  privacyReviewPassed: true,
  dataRightsReviewPassed: true,
});
assert.equal(approvedCsvPreview.allowed, true);
assert.equal(approvedCsvPreview.externalActionPerformed, false);
assert.match(approvedCsvPreview.reason, /preview and quarantine/i);

const csvProduction = evaluateLoadBoardAdapterAccess({
  providerId: "sanitized_csv",
  environment: "production",
  operation: "import_preview",
  ownerApproved: true,
  sourceApproved: true,
  privacyReviewPassed: true,
  dataRightsReviewPassed: true,
});
assert.equal(csvProduction.allowed, false);
assert.match(csvProduction.reason, /local preview/i);

const csvRead = evaluateLoadBoardAdapterAccess({
  providerId: "sanitized_csv",
  environment: "preview",
  operation: "read_opportunities",
  ownerApproved: true,
  sourceApproved: true,
  privacyReviewPassed: true,
  dataRightsReviewPassed: true,
});
assert.equal(csvRead.allowed, false);
assert.match(csvRead.reason, /import preview only/i);

console.log("Load-board adapter registry default-deny checks passed.");
