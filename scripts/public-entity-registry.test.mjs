import assert from "node:assert/strict";
import {
  approvedHermesSameAs,
  heldCrossEntityProfiles,
  publicEntityRegistry,
} from "../src/data/public-entity-registry.ts";
import { contentEntityRegistry } from "../src/lib/content-pipeline.ts";

const progressoproUrl = "https://www.instagram.com/progressopro/";

assert.deepEqual(approvedHermesSameAs, [], "Root sameAs must remain empty while @hermes.logistics ownership is unresolved.");
assert.ok(!approvedHermesSameAs.includes(progressoproUrl));

const root = publicEntityRegistry.hermes_ecosystem;
assert.equal(root.relationshipStatus, "approved_root");
assert.equal(root.schemaPublication, "approved");
assert.ok(root.socialProfiles.every((profile) => profile.status === "website_linked_signal"));
assert.ok(root.notes.includes("Do not publish them in root sameAs"));

const logistics = publicEntityRegistry.hermes_logistics;
assert.equal(logistics.relationshipStatus, "owner_verification_required");
assert.equal(logistics.schemaPublication, "hold");
assert.deepEqual(
  root.socialProfiles.map((profile) => profile.url),
  logistics.socialProfiles.map((profile) => profile.url),
  "The same Logistics-specific handles must not be assigned to root Hermes until the canonical owner is resolved.",
);
assert.ok(logistics.socialProfiles.every((profile) => profile.status === "website_linked_signal"));

const progressopro = publicEntityRegistry.progressopro_marketing;
assert.equal(progressopro.relationshipStatus, "relationship_resolution_required");
assert.equal(progressopro.schemaPublication, "hold");
assert.equal(progressopro.websiteOwner, "/paths/marketing/");
assert.deepEqual(
  progressopro.socialProfiles.map((profile) => [profile.url, profile.status]),
  [[progressoproUrl, "relationship_hold"]],
);

const academy = publicEntityRegistry.hermes_academy;
assert.equal(academy.relationshipStatus, "approved_direction");
assert.equal(academy.schemaPublication, "approved");
assert.equal(academy.socialProfiles.length, 0, "Academy must not invent or infer a social profile URL.");

assert.ok(
  Object.values(publicEntityRegistry)
    .filter((entity) => entity.relationshipStatus === "relationship_resolution_required")
    .every((entity) => entity.schemaPublication === "hold"),
  "Unresolved brand relationships must not publish a public Organization or Brand node.",
);
assert.ok(
  heldCrossEntityProfiles.some(
    (profile) => profile.entityId === "progressopro_marketing" && profile.url === progressoproUrl && profile.status === "relationship_hold",
  ),
);

const pipelineProgressopro = contentEntityRegistry.find((entity) => entity.id === "progressopro_marketing");
assert.ok(pipelineProgressopro);
assert.equal(pipelineProgressopro.relationshipStatus, progressopro.relationshipStatus);
assert.equal(pipelineProgressopro.websiteOwner, progressopro.websiteOwner);
assert.equal(pipelineProgressopro.publishingStatus, "blocked");
assert.ok(
  pipelineProgressopro.socialProfiles.every((profile) => profile.status !== "approved"),
  "The content pipeline must not promote an unresolved ProgressoPro profile to an approved channel.",
);

const pipelineAcademy = contentEntityRegistry.find((entity) => entity.id === "hermes_academy");
assert.ok(pipelineAcademy);
assert.equal(pipelineAcademy.relationshipStatus, "approved_parent");
assert.equal(pipelineAcademy.socialProfiles.length, 0);

console.log("Public entity registry checks passed: ambiguous Hermes social profiles stay out of sameAs, ProgressoPro remains on relationship hold, and downstream content channels stay blocked.");