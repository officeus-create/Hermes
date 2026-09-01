import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cleanWebsiteFactoryUrl,
  normalizeWebsiteFactoryPayload,
  websiteFactoryReadiness,
} from "../functions/api/_lib/website-factory.mjs";

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
assert.match(page, /not a fake promise that a production build has already started/i, "client copy must preserve the build-start boundary");
for (const role of ["visual", "functionality", "structure"]) assert.match(page, new RegExp(`data-ref-url="${role}"`), `${role} reference input is required`);
for (let step = 1; step <= 9; step += 1) assert.match(page, new RegExp(`data-step="${step}"`), `step ${step} must exist`);
assert.doesNotMatch(page, /MediaRecorder|navigator\.mediaDevices|getUserMedia/, "B1 must not create disposable voice capture without storage");

assert.match(helper, /website_factory_drafts/, "Website Factory must persist drafts in one owner-scoped D1 model");
assert.match(helper, /website_factory_handoffs/, "Website Factory must persist delivery state separately from the immutable brief");
assert.match(helper, /notification_status IN \('pending','sent','failed'\)/, "handoff delivery state must be constrained");
assert.match(helper, /specialist_id TEXT NOT NULL/, "draft ownership must bind to the shared specialist identity");
assert.match(helper, /state IN \('draft','brief_ready','submitted'\)/, "draft lifecycle must be constrained");
assert.match(helper, /url\.protocol !== "https:"/, "public sources must be HTTPS only");
assert.match(helper, /password\|secret\|token\|cookie\|credential/, "credential-shaped fields must be blocked from draft payloads");
assert.match(helper, /WEBSITE_FACTORY_MAX_PAYLOAD_BYTES/, "autosave payload must be bounded");
assert.match(helper, /critical_conflicts_unresolved/, "critical fact conflicts must block handoff");

assert.equal(cleanWebsiteFactoryUrl("http://example.com"), null, "HTTP sources must be rejected");
assert.equal(cleanWebsiteFactoryUrl("https://example.com/path#fragment"), "https://example.com/path", "safe HTTPS URLs should be normalized and lose fragments");
const readyPayload = normalizeWebsiteFactoryPayload({
  starting_from_zero: true,
  goals: { primary: "Get calls" },
  brief: { text: "Build a clear service website for qualified local leads." },
  references: [
    { role: "visual", url: "https://example.com/visual" },
    { role: "functionality", url: "https://example.com/functionality" },
    { role: "structure", url: "https://example.com/structure" },
  ],
});
assert.deepEqual(websiteFactoryReadiness(readyPayload), { ready: true, reasons: [] }, "minimum valid owner brief should reach the handoff gate");
const blockedPayload = normalizeWebsiteFactoryPayload({ starting_from_zero: false });
assert.equal(websiteFactoryReadiness(blockedPayload).ready, false, "missing source/goal/brief/references must stay blocked");

assert.match(drafts, /getAuthenticatedSpecialist/, "draft collection must require the shared Hermes session");
assert.match(drafts, /sameOriginMutation/, "draft creation must be same-origin protected");
assert.match(drafts, /WHERE specialist_id = \?/, "draft list must be owner scoped");
assert.doesNotMatch(drafts, /email\s*=|role\s*=/, "Website Factory draft storage must not infer ownership from email or role");

assert.match(item, /sameOriginMutation/, "draft mutations must be same-origin protected");
assert.match(item, /WHERE id = \? AND specialist_id = \?/, "draft reads and writes must be owner scoped");
assert.match(item, /draft_not_found/, "cross-owner draft IDs must fail closed as not found");
assert.match(item, /submitted_draft_is_immutable/, "submitted handoff snapshots must be immutable");
assert.match(item, /brief_not_ready/, "incomplete drafts must not submit");
assert.match(item, /LEAD_EMAIL_SERVICE/, "submitted briefs must use the existing Hermes internal delivery service instead of a parallel inbox");
assert.match(item, /website_factory_\$\{draft\.id\}/, "handoff delivery must use a stable brief-scoped request id");
assert.match(item, /notification_status:\s*"pending"/, "delivery not configured must not erase or roll back the submitted brief");
assert.match(item, /notification_status:\s*"failed"/, "delivery failures must be observable without losing the brief");
assert.match(item, /retry:\s*true/, "reposting an already submitted brief must be able to retry a non-sent notification");
assert.match(item, /build_started:\s*false/, "brief creation must never claim an automated website build started");
assert.match(item, /No automated production build has been started/, "handoff copy must state the production boundary");

console.log("Hermes Connect Website Factory B1 contract: PASS");
