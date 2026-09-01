import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const page = read("src/pages/services/hermes-connect/website-factory/index.astro");
const helper = read("functions/api/_lib/website-factory.mjs");
const drafts = read("functions/api/website-factory/drafts.ts");
const item = read("functions/api/website-factory/drafts/[id].ts");

assert.match(page, /robots="noindex,nofollow"/, "Website Factory must remain private/noindex in B1");
assert.match(page, /\/api\/auth\/me/, "Website Factory must reuse the shared Hermes session");
assert.match(page, /\/api\/auth\/login/, "Website Factory must reuse shared Hermes login");
assert.match(page, /\/api\/auth\/register/, "Website Factory must reuse shared Hermes registration");
assert.match(page, /No separate Website Factory password store is created/, "identity boundary must be explicit");
assert.match(page, /automated source reading is not yet connected/i, "B1 must not pretend source extraction exists");
assert.match(page, /Secure audio storage\/transcription is not connected in B1/, "B1 voice boundary must be truthful");
assert.match(page, /B1 does not invent an upload backend/, "B1 upload boundary must be truthful");
assert.match(page, /three different jobs/i, "reference roles must be explicit");
for (const role of ["visual", "functionality", "structure"]) assert.match(page, new RegExp(`data-ref-url="${role}"`), `${role} reference input is required`);
for (let step = 1; step <= 9; step += 1) assert.match(page, new RegExp(`data-step="${step}"`), `step ${step} must exist`);
assert.match(page, /build_started/, "client must consume explicit build-start boundary");
assert.doesNotMatch(page, /MediaRecorder|navigator\.mediaDevices|getUserMedia/, "B1 must not create disposable voice capture without storage");

assert.match(helper, /website_factory_drafts/, "Website Factory must persist drafts in one owner-scoped D1 model");
assert.match(helper, /specialist_id TEXT NOT NULL/, "draft ownership must bind to the shared specialist identity");
assert.match(helper, /state IN \('draft','brief_ready','submitted'\)/, "draft lifecycle must be constrained");
assert.match(helper, /url\.protocol !== "https:"/, "public sources must be HTTPS only");
assert.match(helper, /password\|secret\|token\|cookie\|credential/, "credential-shaped fields must be blocked from draft payloads");
assert.match(helper, /WEBSITE_FACTORY_MAX_PAYLOAD_BYTES/, "autosave payload must be bounded");
assert.match(helper, /critical_conflicts_unresolved/, "critical fact conflicts must block handoff");

assert.match(drafts, /getAuthenticatedSpecialist/, "draft collection must require the shared Hermes session");
assert.match(drafts, /sameOriginMutation/, "draft creation must be same-origin protected");
assert.match(drafts, /WHERE specialist_id = \?/, "draft list must be owner scoped");
assert.doesNotMatch(drafts, /email\s*=|role\s*=/, "Website Factory draft storage must not infer ownership from email or role");

assert.match(item, /sameOriginMutation/, "draft mutations must be same-origin protected");
assert.match(item, /WHERE id = \? AND specialist_id = \?/, "draft reads and writes must be owner scoped");
assert.match(item, /draft_not_found/, "cross-owner draft IDs must fail closed as not found");
assert.match(item, /submitted_draft_is_immutable/, "submitted handoff snapshots must be immutable");
assert.match(item, /brief_not_ready/, "incomplete drafts must not submit");
assert.match(item, /build_started:\s*false/, "brief creation must never claim an automated website build started");
assert.match(item, /No automated production build has been started/, "handoff copy must state the production boundary");

console.log("Hermes Connect Website Factory B1 contract: PASS");
