import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const retiredPhone = "+1 (262) 302-3626";
const canonicalFacts = readFileSync("docs/CANONICAL_COMPANY_FACTS_APPROVAL.md", "utf8");
const legacyDelta = readFileSync("docs/CANONICAL_PUBLIC_FACTS_DELTA_2026-08-07.md", "utf8");
const legacyPlan = readFileSync("docs/HERMES_LOGISTICS_CONTACT_AND_DIVISION_PLAN.md", "utf8");
const claude = readFileSync("CLAUDE.md", "utf8");
const site = readFileSync("src/data/site.ts", "utf8");

assert.match(
  canonicalFacts,
  /Primary public phone \| No canonical public phone approved \| `DO_NOT_PUBLISH`/,
  "Canonical company facts must remain the publication authority for the no-public-phone decision",
);
assert.match(
  canonicalFacts,
  /\+1 \(262\) 302-3626.*retired from public Logistics routing/s,
  "Canonical company facts must preserve the retired-phone boundary",
);

assert.match(
  legacyDelta,
  /HISTORICAL_DELTA \/ CONTACT_FIELDS_SUPERSEDED/,
  "The dated public-facts delta must be visibly historical for contact fields",
);
assert.match(
  legacyDelta,
  /RETIRED \/ DO_NOT_PUBLISH/,
  "The dated public-facts delta must not present the retired phone as currently approved",
);
assert.match(
  legacyPlan,
  /HISTORICAL PLAN \/ CURRENT CONTACTS SUPERSEDED/,
  "The old Logistics contact plan must be visibly superseded",
);
assert.match(
  legacyPlan,
  /officeus@hermeslogisticsus\.com.*approved general public coordination email/s,
  "The old plan must point agents to the current approved public email",
);

assert.doesNotMatch(
  claude,
  /Logistics may show phone\+email/,
  "Agent instructions must not authorize the retired Logistics phone",
);
assert.match(
  claude,
  /no canonical public phone is approved/,
  "Agent instructions must reflect the current canonical phone boundary",
);
assert.ok(
  !site.includes(retiredPhone) && !site.includes("tel:+12623023626"),
  "Current public site data must not restore the retired Logistics phone",
);

console.log("Canonical contact governance contract passed.");
