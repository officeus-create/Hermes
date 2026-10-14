import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// 2026-10-14 source-backed minimum versions for SDK packages used in the
// Hermes website. This is a preventive lockfile gate, NOT a remote host scan.
// Official advisories: GHSA-6qxp-vccf-f47h (OAuth issuer mix-up),
// GHSA-rvq5-wwqv-78pq (server wrong audience),
// GHSA-22jm-h49p-29qw (cross-session tasks).
const floors = new Map([
  ["@modelcontextprotocol/sdk", "1.32.0"],
  ["@modelcontextprotocol/client", "2.3.1"],
  ["@modelcontextprotocol/core", "2.3.1"],
  ["@modelcontextprotocol/server", "2.3.1"],
  ["@modelcontextprotocol/server-legacy", "2.3.1"],
  ["mcp-handler", "1.1.0"],
]);

const canonicalVersion = value => {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+$/.test(value)) return null;
  return value.split(".").map(Number);
};
function older(current, min) {
  const a = canonicalVersion(current);
  const b = canonicalVersion(min);
  if (!a || !b) return true; // pre-release, alias or unknown: manual review.
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}
function scanLock(lock) {
  const issues = [];
  for (const [path, record] of Object.entries(lock.packages || {})) {
    if (!path.startsWith("node_modules/")) continue;
    const fullName = path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
    const floor = floors.get(fullName);
    if (floor && older(record?.version, floor)) {
      issues.push({ name: fullName, installed: record?.version || "UNRESOLVED", floor });
    }
  }
  return issues;
}

// Prove the guard catches both direct and nested vulnerable transitive packages.
for (const [name, vulnerable, safe] of [
  ["@modelcontextprotocol/sdk", "1.31.0", "1.32.0"],
  ["@modelcontextprotocol/client", "2.1.0", "2.3.1"],
  ["@modelcontextprotocol/server", "2.2.0", "2.3.1"],
  ["@modelcontextprotocol/core", "2.1.0", "2.3.1"],
  ["mcp-handler", "1.0.0", "1.1.0"],
]) {
  const path = "node_modules/" + name;
  assert.equal(scanLock({ packages: { [path]: { version: vulnerable } } }).length, 1);
  assert.equal(scanLock({ packages: { [path]: { version: safe } } }).length, 0);
  assert.equal(scanLock({ packages: { ["node_modules/some-package/" + path]: { version: vulnerable } } }).length, 1);
  assert.equal(scanLock({ packages: { [path]: { version: safe + "-rc1" } } }).length, 1);
}
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("package.json", root), "utf8"));
const lock = JSON.parse(fs.readFileSync(new URL("package-lock.json", root), "utf8"));
assert.ok(lock.packages && typeof lock.packages === "object", "npm lockfile packages required");
const installed = scanLock(lock);
const declared = { ...(manifest.dependencies || {}), ...(manifest.devDependencies || {}), ...(manifest.optionalDependencies || {}) };
for (const [name, floor] of floors) {
  const declaration = declared[name];
  if (declaration && !/^[~^]?\d+\.\d+\.\d+$/.test(declaration)) {
    installed.push({ name, installed: declaration, floor, reason: "unreviewed_dependency_range" });
  }
  if (declaration && !lock.packages["node_modules/" + name]) {
    installed.push({ name, installed: declaration, floor, reason: "dependency_missing_in_lock" });
  }
}
assert.deepEqual(installed, [], "Vulnerable or non-auditable MCP SDK dependency: " + JSON.stringify(installed));
console.log("HERMES_MCP_SDK_SECURITY_GATE_PASS=YES: lockfile has no vulnerable MCP SDK client/server, core, legacy or mcp-handler dependency");
