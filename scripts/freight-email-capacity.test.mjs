import assert from "node:assert/strict";
import { parseTruckAvailabilityEmail, toPublicCapacityRecord } from "../src/lib/freight-email-capacity.ts";

const sample = `Good Morning,
If you have any freight from these areas, please contact dispatcher directly.
Thursdays Empty 53\" dry vans list:
Marshalltown, IA - ready 2PM
Norfolk, NE - ready now
Glenwillow, OH to Chicago, IL - ready 12PM
REEFER Brownsville, TX - ready now
Rogers, MN - ready 12PM - TEAM`;

const parsed = parseTruckAvailabilityEmail({
  sourceId: "source-test",
  sourceMessageId: "msg-test",
  sourceName: "Example Carrier",
  subject: "Truck list",
  body: sample,
  receivedAt: "2026-09-03T11:52:36Z",
});

assert.equal(parsed.records.length, 5);
assert.equal(parsed.records[0].origin, "Marshalltown, IA");
assert.equal(parsed.records[1].origin, "Norfolk, NE");
assert.equal(parsed.records[2].origin, "Glenwillow, OH");
assert.equal(parsed.records[2].destination, "Chicago, IL");
assert.equal(parsed.records[3].equipment, "reefer");
assert.equal(parsed.records[4].team, true);

const publicRecord = toPublicCapacityRecord(parsed.records[0]);
assert.equal("sourceMessageId" in publicRecord, false);
assert.equal("sourceId" in publicRecord, false);

console.log(`freight-email-capacity: ${parsed.records.length} records parsed safely`);
