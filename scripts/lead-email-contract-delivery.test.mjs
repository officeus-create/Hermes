import assert from "node:assert/strict";
import worker from "../workers/lead-email/src/index.mjs";

const sent = [];
const env = {
  LEAD_SERVICE_TOKEN: "test-service-token-123456789",
  SALES_DESTINATION: "officeus@hermeslogisticsus.com",
  SALES_SENDER: "website@hermeslogisticsus.com",
  CARRIER_CONTRACT_INTERNAL_RECIPIENTS: "officeus@hermeslogisticsus.com",
  EMAIL_RETRY_DELAY_MS: "0",
  EMAIL: {
    async send(message) {
      if (message.to !== "officeus@hermeslogisticsus.com") {
        const error = new Error("recipient not allowed by binding");
        error.code = "E_RECIPIENT_NOT_ALLOWED";
        throw error;
      }
      sent.push(message);
      return { messageId: `test-${sent.length}` };
    },
  },
};

const attachment = Buffer.alloc(240, 7).toString("base64");
const body = {
  request_id: "contract_email_delivery_test_20260814",
  subject: "[HERMES CONTRACT] [CARRIER ONBOARDING]",
  text: "Hermes carrier agreement execution package. This is a synthetic automated delivery test with enough text to pass the private worker validation boundary.",
  reply_to: "carrier@example.com",
  carrier_email: "carrier@example.com",
  attachments: [
    { filename: "Signed_Appendix_A.pdf", content_type: "application/pdf", content_base64: attachment },
    { filename: "Master_Agreement.pdf", content_type: "application/pdf", content_base64: attachment },
  ],
};
const request = new Request("https://lead-email.internal/v1/send-contract", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const response = await worker.fetch(request, env);
assert.equal(response.status, 202);
const result = await response.json();
assert.equal(result.ok, true);
assert.equal(result.required_internal_delivered, 1);
assert.equal(result.carrier_copy, "download_only");
assert.equal(result.delivery_ledger.required_internal.status, "delivered");
assert.equal(result.delivery_ledger.required_internal.attempts, 1);
assert.equal(result.delivery_ledger.carrier.status, "download_only");
assert.equal(result.delivery_ledger.carrier.attempts, 1);
assert.equal(result.delivery_ledger.carrier.error, "provider_configuration");
assert.equal(sent.length, 1);
assert.equal(sent[0].to, "officeus@hermeslogisticsus.com");
assert.equal(sent[0].subject, body.subject);
assert.equal(sent[0].attachments.length, 2);
assert.deepEqual(Object.keys(sent[0].attachments[0]).sort(), ["content", "disposition", "filename", "type"]);
assert.equal(sent[0].attachments[0].type, "application/pdf");
assert.equal(sent[0].attachments[0].disposition, "attachment");

let transientAttempts = 0;
const transientEnv = {
  ...env,
  EMAIL: {
    async send(message) {
      if (message.to === "officeus@hermeslogisticsus.com" && transientAttempts < 2) {
        transientAttempts += 1;
        const error = new Error("temporary provider unavailable");
        error.status = 503;
        throw error;
      }
      transientAttempts += 1;
      return { messageId: `retry-${transientAttempts}` };
    },
  },
};
const transientRequest = new Request("https://lead-email.internal/v1/send-contract", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${transientEnv.LEAD_SERVICE_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ...body, request_id: "contract_email_retry_test_20260814", carrier_email: "officeus@hermeslogisticsus.com" }),
});
const transientResponse = await worker.fetch(transientRequest, transientEnv);
assert.equal(transientResponse.status, 202);
const transientResult = await transientResponse.json();
assert.equal(transientResult.delivery_ledger.required_internal.status, "delivered");
assert.equal(transientResult.delivery_ledger.required_internal.attempts, 3);
assert.equal(transientResult.carrier_copy, "delivered");
assert.equal(transientAttempts, 3);
console.log("Lead email contract delivery passed: required Hermes mailbox succeeds even when an external carrier copy is not allowed by the current email binding.");
