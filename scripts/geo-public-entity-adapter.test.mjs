import assert from "node:assert/strict";
import {
  adaptPublicEntityForGeo,
  geoEntityPublicationState,
} from "../src/data/geo-public-entity-adapter.ts";

const context = {
  description: "Reviewed GEO entity description.",
  relationToHermes: "Reviewed relationship to the Hermes ecosystem.",
  whyItMatters: "The entity changes how the answer is interpreted.",
  evidenceIds: ["repository-entity-evidence"],
};

const root = adaptPublicEntityForGeo("hermes_ecosystem", context);
assert.equal(root.status, "approved");
assert.equal(root.entity.schemaId, "https://hermeslogisticsus.com/#organization");
assert.equal(root.entity.url, "https://hermeslogisticsus.com/");
assert.ok(root.entity.sameAs.length > 0, "Approved root sameAs values may be reused");

const academy = adaptPublicEntityForGeo("hermes_academy", context);
assert.equal(academy.status, "approved");
assert.equal(academy.entity.schemaId, "https://hermeslogisticsus.com/#academy");
assert.equal(academy.entity.url, "https://hermeslogisticsus.com/paths/academy/");

for (const heldId of ["hermes_logistics", "progressopro_marketing", "hermes_it"]) {
  const result = adaptPublicEntityForGeo(heldId, context);
  assert.equal(result.status, "hold", `${heldId} must remain governed by the canonical registry`);
  assert.equal(result.entity, undefined, `${heldId} must not leak a held schema entity into GEO`);
  assert.match(result.reason, /must not publish a competing entity relationship or sameAs claim/);
}

const state = geoEntityPublicationState();
assert.equal(state.length, 5);
assert.equal(state.filter((item) => item.schemaPublication === "approved").length, 2);
assert.equal(state.filter((item) => item.schemaPublication === "hold").length, 3);

console.log("GEO public entity adapter passed");