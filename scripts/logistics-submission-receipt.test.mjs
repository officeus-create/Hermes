import assert from "node:assert/strict";
import { requireSubmittedReceipt, submissionRequestId } from "../src/lib/logistics-submission-receipt.ts";

const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
for (const body of [{}, { success: false }, { success: true, request_id: "other" }]) {
  await assert.rejects(requireSubmittedReceipt(response(body), "request-1"));
}
await assert.rejects(requireSubmittedReceipt(response({ success: true, request_id: "request-1" }, 500), "request-1"));
for (const duplicate of [false, true]) {
  assert.deepEqual(await requireSubmittedReceipt(response({ success: true, request_id: "request-1", duplicate, human_receipt: true, delivery_confirmed: true }), "request-1"), {
    submission: "submitted", delivery: "unconfirmed", humanReceipt: "unconfirmed",
  });
}
console.log("Logistics receipt: acceptance never implies delivery or human receipt: PASS");
const lead = {};
assert.equal(submissionRequestId(lead), submissionRequestId(lead));
assert.notEqual(submissionRequestId({}), submissionRequestId(lead));
const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
const nativeCrypto = globalThis.crypto;
let fallbackRandomCalls = 0;
try {
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: {
    getRandomValues(bytes) {
      fallbackRandomCalls += 1;
      return nativeCrypto.getRandomValues(bytes);
    },
  } });
  const fallbackLead = {};
  const fallbackId = submissionRequestId(fallbackLead);
  assert.match(fallbackId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(submissionRequestId(fallbackLead), fallbackId);
  assert.equal(fallbackRandomCalls, 1, "Same-object retry must not generate a new identity");
  assert.notEqual(submissionRequestId({}), fallbackId);
} finally {
  Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
}
console.log("Secure UUID fallback and same-object retry: PASS");
