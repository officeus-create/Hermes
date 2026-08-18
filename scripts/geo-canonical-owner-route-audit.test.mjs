import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { geoPromptOwnerRegistry } from "../src/data/geo-prompt-owner-registry.ts";

const root = process.cwd();

const routeCandidates = (route) => {
  const clean = route.split("?")[0].split("#")[0];
  if (clean === "/") return ["src/pages/index.astro"];
  const relative = clean.replace(/^\/+|\/+$/g, "");
  return [
    `src/pages/${relative}.astro`,
    `src/pages/${relative}/index.astro`,
  ];
};

const findRouteFile = (route) =>
  routeCandidates(route).find((candidate) => existsSync(join(root, candidate)));

const results = geoPromptOwnerRegistry.map((owner) => {
  const routeFile = findRouteFile(owner.canonicalOwner);
  const previewOnly = owner.canonicalOwner.startsWith("/demos/");
  const source = routeFile ? readFileSync(join(root, routeFile), "utf8") : "";
  const explicitNoindex = /robots\s*=\s*["'{][^\n>]*noindex/i.test(source) || /noindex\s*,?\s*nofollow/i.test(source);

  return {
    canonicalOwner: owner.canonicalOwner,
    promptIds: owner.promptIds,
    routeFile,
    previewOnly,
    explicitNoindex,
    weeklyPromptCount: owner.weeklyPromptCount,
  };
});

const missing = results.filter((item) => !item.routeFile);
assert.deepEqual(
  missing,
  [],
  `Every AI visibility canonical owner must resolve to a real Astro route. Missing: ${missing.map((item) => item.canonicalOwner).join(", ")}`,
);

const accidentalNoindex = results.filter((item) => !item.previewOnly && item.explicitNoindex);
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
  `GEO canonical owner route audit passed: ${results.length} owners (${results.filter((item) => item.previewOnly).length} preview-only)`,
);