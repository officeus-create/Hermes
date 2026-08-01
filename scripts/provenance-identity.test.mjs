import assert from "node:assert/strict";
import {
  createProvenanceIdentityKey,
  normalizeProvenanceIdentity,
} from "../src/lib/provenance-identity.ts";

assert.equal(normalizeProvenanceIdentity(" SYN-CASE "), "syn-case");
assert.equal(normalizeProvenanceIdentity("syn-case"), "syn-case");
assert.equal(
  createProvenanceIdentityKey("source", " SYN-CASE "),
  createProvenanceIdentityKey("source", "syn-case"),
);
assert.notEqual(
  createProvenanceIdentityKey("shipment", "SYN-CASE"),
  createProvenanceIdentityKey("source", "SYN-CASE"),
);
assert.throws(() => createProvenanceIdentityKey("source", "   "), /required/i);

console.log("Provenance identity normalization checks passed.");
