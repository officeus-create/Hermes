import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "docs/compliance/font-provenance.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src/styles/global.css"), "utf8");

assert.equal(registry.schema_version, 1, "Font provenance registry schema_version must remain explicit.");
assert.ok(Array.isArray(registry.fonts), "Font provenance registry must include a fonts array.");
assert.ok(registry.fonts.length > 0, "Font provenance registry must not be empty while self-hosted fonts are deployed.");

const fontDirectory = path.join(root, "public/fonts");
const deployedFontPaths = fs.existsSync(fontDirectory)
  ? fs.readdirSync(fontDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(?:woff2?|ttf|otf)$/i.test(entry.name))
      .map((entry) => `public/fonts/${entry.name}`)
      .sort()
  : [];

const registryPaths = registry.fonts.map((font) => font.path).sort();
assert.deepEqual(
  registryPaths,
  deployedFontPaths,
  "Every deployed self-hosted font must have exactly one registry record, and stale registry records must be removed.",
);

const gitBlobSha = (buffer) => {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
};

const seenPaths = new Set();
let pendingExactProvenance = 0;
for (const font of registry.fonts) {
  assert.equal(typeof font.path, "string", "Each font record requires a path.");
  assert.ok(!seenPaths.has(font.path), `Duplicate font registry path: ${font.path}`);
  seenPaths.add(font.path);
  assert.ok(font.path.startsWith("public/fonts/"), `Font registry path must remain under public/fonts/: ${font.path}`);
  assert.equal(typeof font.family, "string", `Font family missing for ${font.path}`);
  assert.equal(font.license, "SIL Open Font License 1.1", `Unexpected or unreviewed font license for ${font.path}`);
  assert.equal(font.license_status, "family_license_verified", `Family license must be explicitly verified for ${font.path}`);
  assert.match(font.license_source, /^https:\/\//, `Authoritative license URL required for ${font.path}`);
  assert.match(font.upstream_family_reference, /^https:\/\//, `Upstream family reference required for ${font.path}`);
  assert.equal(typeof font.notice_requirement, "string", `Notice requirement must be documented for ${font.path}`);
  assert.ok(font.notice_requirement.trim().length > 0, `Notice requirement cannot be empty for ${font.path}`);
  assert.equal(typeof font.verified_at, "string", `Verification date required for ${font.path}`);

  const absolute = path.join(root, font.path);
  assert.ok(fs.existsSync(absolute), `Registered font file missing: ${font.path}`);
  const actualBlobSha = gitBlobSha(fs.readFileSync(absolute));
  assert.equal(actualBlobSha, font.repository_blob_sha, `Font binary changed without provenance-registry review: ${font.path}`);

  if (font.binary_origin_status === "verified_exact_provenance") {
    assert.match(font.exact_binary_source, /^https:\/\//, `Exact verified binary source required for ${font.path}`);
  } else {
    assert.equal(font.binary_origin_status, "pending_exact_provenance", `Unknown binary provenance state for ${font.path}`);
    assert.equal(font.exact_binary_source, null, `Do not claim an exact source while provenance is pending for ${font.path}`);
    pendingExactProvenance += 1;
  }
}

const cssFontReferences = [...css.matchAll(/url\(["']?\/fonts\/([^"')]+)["']?\)/g)]
  .map((match) => `public/fonts/${match[1]}`);
for (const referencedPath of cssFontReferences) {
  assert.ok(seenPaths.has(referencedPath), `CSS references an unregistered self-hosted font: ${referencedPath}`);
}
for (const registeredPath of seenPaths) {
  assert.ok(cssFontReferences.includes(registeredPath), `Registered font is no longer referenced by global CSS: ${registeredPath}`);
}

console.log(
  `Font provenance gate passed: ${registry.fonts.length} deployed font binaries locked to registry identities; ${pendingExactProvenance} exact binary provenance record(s) remain explicitly pending.`,
);
