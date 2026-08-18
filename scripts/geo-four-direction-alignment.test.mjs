import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { aiVisibilityPrompts } from "../src/data/ai-visibility-scorecard.ts";
import { geoDirectionAlignment } from "../src/data/geo-direction-alignment.ts";

const root = new URL("../", import.meta.url).pathname;
const registryPath = join(root, "data", "marketing", "seo-four-direction-market-registry.json");
const seoRegistry = JSON.parse(await readFile(registryPath, "utf8"));

assert.equal(
  seoRegistry.scope,
  "Google/Bing SEO market research and publication control",
  "SEO market registry must stay scoped to Google/Bing; GEO/AI visibility is a separate measurement workstream",
);

const expected = {
  logistics: "logistics",
  marketing: "marketing",
  academy: "academy",
  technology: "it_hermes_connect",
};

assert.deepEqual(
  Object.fromEntries(Object.entries(geoDirectionAlignment).map(([key, value]) => [key, value.seoMarketDirection])),
  expected,
);

for (const [geoDirection, seoDirection] of Object.entries(expected)) {
  const alignment = geoDirectionAlignment[geoDirection];
  assert.ok(alignment, `missing GEO direction alignment: ${geoDirection}`);
  assert.ok(seoRegistry.directions?.[seoDirection], `missing corresponding SEO market direction: ${seoDirection}`);
  assert.equal(alignment.relationship, "shared_business_direction_separate_measurement_workstreams");
  assert.ok(alignment.canonicalDirectionOwner.startsWith("/paths/"));

  const prompts = aiVisibilityPrompts.filter((prompt) => prompt.direction === geoDirection);
  assert.equal(prompts.length, 12, `${geoDirection} must keep exactly 12 governed AI visibility prompts`);
}

const seoCandidateIds = new Set(
  Object.values(seoRegistry.directions ?? {}).flatMap((direction) =>
    (direction.candidates ?? []).map((candidate) => candidate.id),
  ),
);
const geoPromptIds = new Set(aiVisibilityPrompts.map((prompt) => prompt.id));
for (const candidateId of seoCandidateIds) {
  assert.ok(
    !geoPromptIds.has(candidateId),
    `SEO research candidate ${candidateId} must not silently become a GEO prompt`,
  );
}

const nonBuildSeoCandidates = Object.values(seoRegistry.directions ?? {})
  .flatMap((direction) => direction.candidates ?? [])
  .filter((candidate) => !["approved_for_build", "published", "measurement_active"].includes(candidate.status));
assert.ok(nonBuildSeoCandidates.length > 0, "fixture must include research/hold candidates for publication-boundary coverage");
for (const candidate of nonBuildSeoCandidates) {
  assert.equal(
    candidate.canonical_owner,
    undefined,
    `${candidate.id} must not be assigned a publishable canonical owner before SEO approval`,
  );
}

const academyExcluded = new Set(seoRegistry.directions?.academy?.excluded_markets ?? []);
assert.ok(academyExcluded.has("Russia"), "GEO alignment must preserve the Academy acquisition exclusion in the SEO market registry");

console.log("GEO four-direction alignment contract passed: shared directions, separate SEO/GEO publication authority.");
