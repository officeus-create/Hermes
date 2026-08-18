import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { geoPromptOwnerRegistry } from "../src/data/geo-prompt-owner-registry.ts";

const root = process.cwd();
const distRoot = join(root, "dist");

const outputCandidates = (route) => {
  const clean = route.split("?")[0].split("#")[0];
  if (clean === "/") return [join(distRoot, "index.html")];
  const relative = clean.replace(/^\/+|\/+$/g, "");
  return [
    join(distRoot, relative, "index.html"),
    join(distRoot, `${relative}.html`),
  ];
};

const findBuiltRoute = (route) => outputCandidates(route).find((candidate) => existsSync(candidate));

const hasNoindex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
  || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);

assert.ok(existsSync(distRoot), "GEO canonical owner audit requires the built dist/ output; run after astro build");

const results = geoPromptOwnerRegistry.map((owner) => {
  const builtRoute = findBuiltRoute(owner.canonicalOwner);
  const previewOnly = owner.canonicalOwner.startsWith("/demos/");
  const html = builtRoute ? readFileSync(builtRoute, "utf8") : "";

  return {
    canonicalOwner: owner.canonicalOwner,
    promptIds: owner.promptIds,
    builtRoute,
    previewOnly,
    noindex: builtRoute ? hasNoindex(html) : false,
    weeklyPromptCount: owner.weeklyPromptCount,
  };
});

const missing = results.filter((item) => !item.builtRoute);
assert.deepEqual(
  missing,
  [],
  `Every AI visibility canonical owner must exist in built output. Missing: ${missing.map((item) => item.canonicalOwner).join(", ")}`,
);

const accidentalNoindex = results.filter((item) => !item.previewOnly && item.noindex);
assert.deepEqual(
  accidentalNoindex,
  [],
  `Production AI visibility owners must not become noindex. Found: ${accidentalNoindex.map((item) => item.canonicalOwner).join(", ")}`,
);

const weeklyPreviewOwners = results.filter((item) => item.previewOnly && item.weeklyPromptCount > 0);
assert.deepEqual(
  weeklyPreviewOwners,
  [],
  `Weekly AI monitoring should not depend on preview-only owners: ${weeklyPreviewOwners.map((item) => item.canonicalOwner).join(", ")}`,
);

assert.equal(
  new Set(results.map((item) => item.canonicalOwner)).size,
  geoPromptOwnerRegistry.length,
  "Canonical owner audit must not duplicate owners",
);

console.log(
  `GEO canonical owner built-route audit passed: ${results.length} owners (${results.filter((item) => item.previewOnly).length} preview-only)`,
);