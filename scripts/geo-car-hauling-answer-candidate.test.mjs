import assert from "node:assert/strict";
import {
  buildGeoAnswerSchema,
  validateGeoAnswerSurface,
} from "../src/data/geo-answer-contract.ts";
import { geoCarHaulingAnswerCandidate } from "../src/data/geo-car-hauling-answer-candidate.ts";
import { findGeoOwnerForPrompt } from "../src/data/geo-prompt-owner-registry.ts";

assert.doesNotThrow(() => validateGeoAnswerSurface(geoCarHaulingAnswerCandidate));
assert.equal(geoCarHaulingAnswerCandidate.slug, "/logistics/car-hauling-dispatch/");
assert.equal(findGeoOwnerForPrompt("LOG-01").canonicalOwner, geoCarHaulingAnswerCandidate.slug);
assert.equal(geoCarHaulingAnswerCandidate.layers.nextAction.href, "/logistics/start-car-hauling-dispatch/");
assert.ok(geoCarHaulingAnswerCandidate.claims.every((claim) => claim.truthLabel === "verified_fact"));
assert.ok(geoCarHaulingAnswerCandidate.evidence.every((item) => item.origin === "public_source"));
assert.ok(geoCarHaulingAnswerCandidate.evidence.every((item) => item.url?.startsWith("https://hermeslogisticsus.com/")));
assert.ok(geoCarHaulingAnswerCandidate.guidedPath.questions.length <= 7);
assert.ok(geoCarHaulingAnswerCandidate.guidedPath.questions.every((question) => question.options.length >= 2 && question.options.length <= 5));
assert.ok(geoCarHaulingAnswerCandidate.guidedPath.outcomes.every((outcome) => outcome.nextAction.href.startsWith("/")));

const schema = buildGeoAnswerSchema(geoCarHaulingAnswerCandidate);
assert.deepEqual(schema.isBasedOn, ["https://hermeslogisticsus.com/logistics/car-hauling-dispatch/"]);
assert.deepEqual(schema.mainEntity.acceptedAnswer.citation, ["https://hermeslogisticsus.com/logistics/car-hauling-dispatch/"]);
const aboutIds = schema.about.map((entity) => entity["@id"]);
assert.ok(aboutIds.includes("https://hermeslogisticsus.com/#organization"));
assert.ok(aboutIds.includes("https://hermeslogisticsus.com/logistics/car-hauling-dispatch/#service"));

const serialized = JSON.stringify(geoCarHaulingAnswerCandidate).toLowerCase();
for (const prohibitedField of ["email", "phone", "mcnumber", "usdotnumber", "vin", "token", "cookie", "accountid", "streamid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `Production GEO answer candidate must not contain ${prohibitedField} fields`);
}

assert.ok(serialized.includes("does not guarantee") || serialized.includes("no-guarantee"));
assert.ok(!serialized.includes("guaranteed loads"));
assert.ok(!serialized.includes("guaranteed revenue"));

console.log("GEO car-hauling production candidate passed");