import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SANITIZED_CSV_ADAPTER_MODE,
  SANITIZED_CSV_MAX_BYTES,
  SANITIZED_CSV_MAX_ROWS,
  runSanitizedCsvPreview,
} from "../src/lib/sanitized-csv-adapter.ts";

const offersCsv = await readFile(new URL("../fixtures/load-operations/offers.synthetic.csv", import.meta.url), "utf8");
const historyCsv = await readFile(new URL("../fixtures/load-operations/shipment-history.synthetic.csv", import.meta.url), "utf8");
const now = new Date("2026-07-29T13:00:00Z");

assert.equal(SANITIZED_CSV_ADAPTER_MODE, "preview_only");
assert.equal(SANITIZED_CSV_MAX_BYTES, 2_000_000);
assert.equal(SANITIZED_CSV_MAX_ROWS, 5_000);

const baseApproval = {
  ownerApproved: true,
  sourceApproved: true,
  privacyReviewPassed: true,
  dataRightsReviewPassed: true,
};

const deniedOwner = runSanitizedCsvPreview({
  ...baseApproval,
  ownerApproved: false,
  importKind: "offers",
  csv: offersCsv,
  now,
});
assert.equal(deniedOwner.status, "denied");
assert.match(deniedOwner.reason, /owner approval/i);
assert.equal(deniedOwner.externalActionPerformed, false);
assert.equal(deniedOwner.writePerformed, false);
assert.equal(deniedOwner.publicExportPerformed, false);
assert.equal("csv" in deniedOwner, false);

const deniedPrivacy = runSanitizedCsvPreview({
  ...baseApproval,
  privacyReviewPassed: false,
  importKind: "shipment_history",
  csv: historyCsv,
});
assert.equal(deniedPrivacy.status, "denied");
assert.match(deniedPrivacy.reason, /privacy review/i);

const deniedEmpty = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "offers",
  csv: "   ",
});
assert.equal(deniedEmpty.status, "denied");
assert.match(deniedEmpty.reason, /empty/i);

const offerResult = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "offers",
  csv: offersCsv,
  now,
});
assert.equal(offerResult.status, "preview_complete");
if (offerResult.status !== "preview_complete") throw new Error("Expected offer preview");
assert.equal(offerResult.preview.mode, "preview_only");
assert.equal(offerResult.preview.summary.acceptedRows, 3);
assert.equal(offerResult.preview.summary.quarantinedRows, 0);
assert.equal(offerResult.externalActionPerformed, false);
assert.equal(offerResult.writePerformed, false);
assert.equal(offerResult.publicExportPerformed, false);
assert.equal(Object.isFrozen(offerResult), true);

const historyResult = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "shipment_history",
  csv: historyCsv,
});
assert.equal(historyResult.status, "preview_complete");
if (historyResult.status !== "preview_complete") throw new Error("Expected history preview");
assert.equal(historyResult.preview.summary.acceptedRows, 2);
assert.equal(historyResult.preview.summary.quarantinedRows, 0);

const privateColumnResult = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "offers",
  csv: "offer_id,email\nSYN-PRIVATE,test@example.com",
  now,
});
assert.equal(privateColumnResult.status, "preview_complete");
if (privateColumnResult.status !== "preview_complete") throw new Error("Expected quarantine preview");
assert.equal(privateColumnResult.preview.summary.acceptedRows, 0);
assert.equal(privateColumnResult.preview.summary.quarantinedRows, 1);
assert.equal(privateColumnResult.preview.quarantined[0].reason, "private_columns");
assert.equal(privateColumnResult.preview.quarantined[0].message.includes("test@example.com"), false);

const tooLarge = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "offers",
  csv: `header\n${"x".repeat(SANITIZED_CSV_MAX_BYTES + 10)}`,
});
assert.equal(tooLarge.status, "denied");
assert.match(tooLarge.reason, /byte preview limit/i);

const tooManyRowsCsv = `header\n${Array.from({ length: SANITIZED_CSV_MAX_ROWS + 1 }, () => "x").join("\n")}`;
const tooManyRows = runSanitizedCsvPreview({
  ...baseApproval,
  importKind: "shipment_history",
  csv: tooManyRowsCsv,
});
assert.equal(tooManyRows.status, "denied");
assert.match(tooManyRows.reason, /row preview limit/i);

console.log("Sanitized CSV adapter approval, size, quarantine, and no-side-effect checks passed.");
