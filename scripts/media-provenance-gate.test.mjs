import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "docs/compliance/media-provenance.json"), "utf8"));
const allowedStatuses = new Set(["NEEDS_OWNER_PROVENANCE", "REPOSITORY_SOURCE_VERIFIED", "SOURCE_AND_RIGHTS_VERIFIED"]);
const allowedDecisions = new Set(["PRESERVE_EXISTING_USE_NO_EXPANDED_REUSE", "CURRENT_USE_ALLOWED"]);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const extensions = new Set(registry.scope.extensions);
const scopedFiles = registry.scope.roots.flatMap((root) => walk(path.join(repoRoot, root)))
  .concat(registry.scope.explicitFiles.map((file) => path.join(repoRoot, file)))
  .filter((file) => extensions.has(path.extname(file).toLowerCase()))
  .map((file) => path.relative(repoRoot, file).split(path.sep).join("/"))
  .sort();
const registeredPaths = registry.assets.map((asset) => asset.path).sort();

assert.deepEqual(registeredPaths, [...new Set(registeredPaths)], "Media registry contains duplicate paths");
assert.deepEqual(registeredPaths, scopedFiles, "Every in-scope public media asset needs exactly one registry record");

for (const asset of registry.assets) {
  assert.match(asset.sha256, /^[a-f0-9]{64}$/, `${asset.path} must record a SHA-256 hash`);
  assert.match(asset.firstTrackedCommit, /^[a-f0-9]{40}$/, `${asset.path} must record its first tracked commit`);
  assert.ok(allowedStatuses.has(asset.provenanceStatus), `${asset.path} has an unsupported provenance status`);
  assert.ok(allowedDecisions.has(asset.publicationDecision), `${asset.path} has an unsupported publication decision`);
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, asset.path))).digest("hex");
  assert.equal(actual, asset.sha256, `${asset.path} bytes changed without provenance review`);
  if (asset.provenanceStatus === "NEEDS_OWNER_PROVENANCE") {
    assert.equal(asset.source, null, `${asset.path} must not invent a source`);
    assert.equal(asset.rightsEvidence, null, `${asset.path} must not invent rights evidence`);
    assert.equal(asset.publicationDecision, "PRESERVE_EXISTING_USE_NO_EXPANDED_REUSE");
  } else {
    assert.ok(asset.source, `${asset.path} must name its source`);
    assert.ok(asset.rightsEvidence, `${asset.path} must name its rights evidence`);
  }
}

console.log(`Media provenance gate passed for ${registry.assets.length} public assets.`);
