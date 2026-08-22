import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const privacy = await read("dist/privacy/index.html");
assert.match(privacy, /Privacy Policy &amp; Notice at Collection/);
assert.match(privacy, /Notice at Collection: categories and purposes/);
assert.match(privacy, /Retention and data minimization/);
assert.match(privacy, /Privacy rights and choices/);
assert.match(privacy, /California notice/);
assert.match(privacy, /International visitors/);
assert.match(privacy, /WhatsApp or Telegram contact/);
assert.match(privacy, /UTM source/);
assert.match(privacy, /GCLID/);
assert.match(privacy, /GBRAID/);
assert.match(privacy, /WBRAID/);
assert.match(privacy, /attached to the lead only when the visitor submits the form/);
assert.match(privacy, /duplicate prevention, rate limiting/);

const choices = await read("dist/privacy-choices/index.html");
assert.match(choices, /Privacy Choices &amp; Requests/);
assert.match(choices, /Start a privacy request/);
assert.match(choices, /access, correction, or deletion/i);
assert.match(choices, /Opt-out requests/);

const company = await read("dist/company-information/index.html");
assert.match(company, /Company Information/);
assert.match(company, /Hermes Logistics LLC/);
assert.match(company, /One Hermes website, multiple directions/);
assert.match(company, /Hermes Logistics, Hermes Marketing, Hermes Academy, and Hermes Technology/);
assert.match(company, /Before payment or signing/);

const payments = await read("dist/payments-cancellations/index.html");
assert.match(payments, /Payments, Refunds &amp; Cancellation/);
assert.match(payments, /Current website payment status/);
assert.match(payments, /Recurring billing/);
assert.match(payments, /Request payment terms/);

const security = await read("dist/data-security/index.html");
assert.match(security, /Data Security/);
assert.match(security, /Data minimization/);
assert.match(security, /Analytics boundary/);
assert.match(security, /Request data-security information/);

const licensing = await read("dist/asset-licensing/index.html");
assert.match(licensing, /Asset Licensing &amp; Intellectual Property/);
assert.match(licensing, /Manrope/);
assert.match(licensing, /Source Sans 3/);
assert.match(licensing, /IBM Plex Mono/);
assert.match(licensing, /Request licensing information/);

const legal = await read("dist/legal-compliance/index.html");
assert.match(legal, /Legal &amp; Compliance/);
assert.match(legal, /Published now/);
assert.match(legal, /Available on request/);
assert.match(legal, /href="\/payments-cancellations\/"/);
assert.match(legal, /href="\/data-security\/"/);
assert.match(legal, /href="\/asset-licensing\/"/);
assert.match(legal, /Request payment terms/);
assert.match(legal, /Request data information/);
assert.match(legal, /Request licensing information/);
assert.match(legal, /Request terms before payment/);
assert.match(legal, /Open privacy settings/);

const homepage = await read("dist/index.html");
assert.match(homepage, /href="\/legal-compliance\/"/);
assert.match(homepage, /href="\/privacy-choices\/"/);
assert.match(homepage, /href="\/company-information\/"/);
assert.match(homepage, /href="\/privacy\/"/);
assert.match(homepage, /href="\/terms\/"/);

console.log("Compliance layer checks passed: legal hub, privacy, business-lead attribution disclosure, payment, security, licensing, request routes, and footer discovery are present.");
