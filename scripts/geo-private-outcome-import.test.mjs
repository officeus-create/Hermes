import assert from "node:assert/strict";
import {
  geoPrivateOutcomeAggregateVersion,
  importGeoPrivateOutcomeAggregateBundle,
} from "../src/data/geo-private-outcome-import.ts";

const bundle = {
  schema_version: geoPrivateOutcomeAggregateVersion,
  observed_at: "2026-08-18T12:00:00Z",
  rows: [
    {
      window_days: 7,
      page_path: "/logistics/car-hauling-dispatch/",
      reviewed_inquiries: 5,
      qualified_leads: 4,
      opportunities: 3,
      wins: 2,
      losses: 1,
      revenue_reconciled_wins: 1,
      evidence_class: "private_operations_verified",
    },
  ],
};

const imported = importGeoPrivateOutcomeAggregateBundle(bundle);
assert.equal(imported.schemaVersion, geoPrivateOutcomeAggregateVersion);
assert.equal(imported.observedAt, "2026-08-18T12:00:00.000Z");
assert.equal(imported.rows.length, 1);
assert.equal(imported.rows[0].observedAt, imported.observedAt);
assert.equal(imported.rows[0].qualifiedLeads, 4);

assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle({ ...bundle, schema_version: "geo_private_outcome_aggregate_v2" }),
  /schema_version must be geo_private_outcome_aggregate_v1/,
);
assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle({ ...bundle, email: "private@example.com" }),
  /unsupported field: email/,
);
assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle({ ...bundle, observed_at: "not-a-date" }),
  /valid ISO date\/time/,
);

const privateRow = structuredClone(bundle);
privateRow.rows[0].lead_name = "Private Person";
assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle(privateRow),
  /unsupported field: lead_name/,
);

const duplicate = structuredClone(bundle);
duplicate.rows.push(structuredClone(duplicate.rows[0]));
assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle(duplicate),
  /Duplicate private outcome owner\/window aggregate/,
);

const invalidChain = structuredClone(bundle);
invalidChain.rows[0].qualified_leads = 6;
assert.throws(
  () => importGeoPrivateOutcomeAggregateBundle(invalidChain),
  /qualified_leads cannot exceed reviewed_inquiries/,
);

const serialized = JSON.stringify(imported).toLowerCase();
for (const forbidden of ["email", "phone", "lead_name", "lead_id", "raw_lead", "revenue_amount", "token", "cookie"]) {
  assert.ok(!serialized.includes(`\"${forbidden}\"`));
}

console.log("GEO versioned private outcome aggregate import passed");
