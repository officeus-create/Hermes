import assert from "node:assert/strict";
import { parseInternalRecipients } from "../workers/lead-email/src/index.mjs";

const mainInbox = "officeus@hermeslogisticsus.com";
const retired = "freight_301@hermeslogisticsus.com";

assert.deepEqual(
  parseInternalRecipients({}),
  [mainInbox],
  "The main Hermes inbox must receive every carrier contract even when no recipient environment variable is configured.",
);

assert.deepEqual(
  parseInternalRecipients({
    CARRIER_CONTRACT_INTERNAL_RECIPIENTS: `dispatch-test@hermeslogisticsus.com,${retired}`,
    SALES_DESTINATION: "sales-alt@hermeslogisticsus.com",
  }),
  [mainInbox, "dispatch-test@hermeslogisticsus.com", "sales-alt@hermeslogisticsus.com"],
  "Configured recipients may be added, but the main inbox must never be removed and retired inboxes must remain filtered.",
);

console.log("Carrier contract delivery always includes officeus@hermeslogisticsus.com and filters retired recipients.");

await import("./carrier-contract-delivery-reliability.test.mjs");
