import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { auditSources } from "./verify-home-multishot.mjs";
const manifest = JSON.parse(readFileSync(new URL("../../src/data/home-cinematic-sources.json", import.meta.url), "utf8"));
test("four owner-approved lanes have only verified production first movies", () => {
  assert.deepEqual(manifest.panels.map(x => x.id),["logistics","technology","academy","marketing"]);
  assert.equal(manifest.minimumDistinctMovingSourceClipsPerPanel,2);
  const result = auditSources(manifest);
  assert.equal(result.panels.length,4);
  assert.equal(result.releaseReady,false);
  for(const id of ["logistics","technology","academy","marketing"]) {
    assert.ok(result.problems.includes(`${id}: fewer than two distinct verified moving sources`));
  }
});
test("unlisted or fake-license candidates cannot pass multi-shot release gate", () => {
  const copy = structuredClone(manifest);
  copy.reviewedAdditionalSources = [{
    direction:"academy",provider:"pexels",id:"unapproved-example",previewAssetPath:"public/media/home/example.mp4",
    licenseReviewed:true,noImpliedEndorsementReviewed:true,normalSpeedTemporalReview:"passed",sha256:"a".repeat(64)
  }];
  const result=auditSources(copy,{ exists:()=>true,size:()=>200_000,sha256:()=>"a".repeat(64) });
  assert.equal(result.releaseReady,false);
  assert.ok(result.problems.some(x=>x.includes("unlisted or duplicate source")));
});
