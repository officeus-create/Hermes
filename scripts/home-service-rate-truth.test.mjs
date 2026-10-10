import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { aggregateHomeServiceLeads } from "../functions/api/_lib/home-service-crm.mjs";

const noRows = aggregateHomeServiceLeads([]);
assert.equal(noRows.totalLeads, 0);
assert.equal(noRows.bookedRate, null);
assert.equal(noRows.reviewRate, null);

const oneLost = aggregateHomeServiceLeads([{
  status: "lost",
  review_received_at: null,
}]);
assert.equal(oneLost.bookedRate, 0, "zero booked is valid when at least one lead exists");
assert.equal(oneLost.reviewRate, null, "review rate is unknown when no completed-job denominator exists");

const completedNoReview = aggregateHomeServiceLeads([{
  status: "completed",
  review_received_at: null,
}]);
assert.equal(completedNoReview.bookedRate, 1);
assert.equal(completedNoReview.reviewRate, 0, "zero reviews is valid when completed-job denominator exists");

const workspace = readFileSync(new URL("../src/pages/services/hermes-connect/home-services/workspace/index.astro", import.meta.url), "utf8");
assert.match(workspace, /data-kpi="bookedRate">UNKNOWN<\/strong>/);
assert.match(workspace, /data-kpi="reviewRate">UNKNOWN<\/strong>/);
assert.match(workspace, /value === null \|\| value === undefined \? "UNKNOWN"/);
assert.match(workspace, /percent\(metrics\[key\]\)/);
assert.doesNotMatch(workspace, /percent\(metrics\[key\]\|\|0\)/);

console.log("home-service-rate-truth: ok");
