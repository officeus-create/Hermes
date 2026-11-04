import assert from "node:assert/strict";
import {
  buildCarrierThreadsPost,
  chicagoSlotKey,
  isEligibleChicagoSlot,
} from "../workers/automation-engine/src/index.mjs";

const allSlots = [];
const allowed = [];
for (let ctHour = 0; ctHour < 24; ctHour += 1) {
  // 2026-10-28 is CDT, UTC-5. Never infer time-zone offset for other dates.
  const date = new Date(Date.UTC(2026, 9, 28, ctHour + 5, 17));
  const slot = chicagoSlotKey(date);
  assert.equal(slot, `2026-10-28T${String(ctHour).padStart(2, "0")}`);
  const isAllowed = isEligibleChicagoSlot(date);
  allSlots.push({ slot, isAllowed });
  if (isAllowed) allowed.push(slot);
}
assert.equal(allSlots.length, 24);
assert.equal(allowed.length, 20);
for (const hour of ["02", "03", "04", "05"]) {
  assert.equal(allSlots.find((s) => s.slot.endsWith(`T${hour}`)).isAllowed, false);
}
const seen = new Set();
for (const slot of allowed) {
  const post = buildCarrierThreadsPost(slot);
  assert.deepEqual(post, buildCarrierThreadsPost(slot), "same slot must render same draft");
  assert.equal(post.account_key, "hermes_logistics");
  assert.equal(post.platform, "threads");
  assert.ok(!seen.has(post.idempotency_key), "one idempotency key per CT hour");
  seen.add(post.idempotency_key);
  assert.ok(post.bytes <= 500);
  assert.equal(post.bytes, new TextEncoder().encode(post.body).byteLength);
  assert.equal((post.body.match(/https:\/\//g) || []).length, 1);
  const url = new URL(post.destination_url);
  assert.equal(url.hostname, "hermeslogisticsus.com");
  assert.equal(url.searchParams.get("utm_source"), "threads");
  assert.equal(url.searchParams.get("utm_medium"), "organic_social");
  assert.equal(url.searchParams.get("utm_campaign"), "car_hauler_carrier_growth");
  assert.ok(url.searchParams.get("utm_content")?.startsWith("hae-"));
}
assert.equal(seen.size, 20);
console.log("HAE Threads recurrence/draft contract PASS: 20 CT slots, 4 quiet, no provider call");
