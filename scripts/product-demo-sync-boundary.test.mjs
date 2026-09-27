import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const syncUrl = new URL("./sync-product-demos.mjs", import.meta.url);
const source = await readFile(syncUrl, "utf8");

assert.equal(source.includes('from "node:os"'), false, "Demo sync must not depend on the executing machine home directory.");
assert.equal(source.includes("homedir("), false, "Demo sync must not resolve sources through the executing user's home directory.");
assert.equal(source.includes("Documents"), false, "Demo sync must not contain workstation-specific Documents paths.");

for (const envName of [
  "HERMES_CRM_VALIDATION_SOURCE_DIR",
  "HERMES_CONNECT_SOURCE_DIR",
  "HERMES_WEBSITE_AUDIT_SOURCE_DIR",
]) {
  assert.ok(source.includes(envName), `Explicit reviewed import boundary missing: ${envName}`);
}

for (const safeDefault of [
  "Preserved repository-managed CRM Validation demo.",
  "Preserved repository-managed Hermes Connect funnel.",
  "Preserved repository-managed Website Audit demo.",
]) {
  assert.ok(source.includes(safeDefault), `Repository-safe default missing: ${safeDefault}`);
}

assert.ok(
  source.includes("if (externalCrmRoot)") &&
    source.includes("if (externalConnectRoot)") &&
    source.includes("if (externalAuditRoot)"),
  "Every external demo source must be gated by an explicit opt-in path.",
);

console.log("Product demo sync source-boundary contract passed.");
