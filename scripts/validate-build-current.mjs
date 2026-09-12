import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";

const legacyValidatorUrl = new URL("./validate-build.mjs", import.meta.url);
const temporaryValidatorUrl = new URL("./.validate-build-current.generated.mjs", import.meta.url);
const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";
const legacyHomepageTechnologyLabel = "Hermes IT Development";
const canonicalHomepageTechnologyLabel = "Hermes Technology";
const technologyExpectationReplacements = new Map([
  ["Hermes Connect · Prototype work started", "Hermes Connect · Repair Shops live pilot"],
  ["Prototype brief", "Repair Shops owner workflow"],
  ["Specialist booking flow", "Repair Shops live pilot"],
  ["First prototype target · Mobile-first PWA", "Current live flow · Mobile-first PWA"],
  ["Personal booking link", "public booking"],
  ["Defined prototype scope · Simulated data and test booking only", "Current live scope · Repair Shops Web V1 · authenticated owner workspace and persisted operating data"],
  ["No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet", "Repair Shops is the current live pilot. Other verticals and modules are not presented as live until separately verified."],
]);
const loadBoardExpectationReplacements = new Map([
  ["Car Hauling Loads &amp; Load Board Preview", "Car Hauler Load Board | Review Auto Transport Loads"],
  ["Dry-run only", "Source-gated live + demo"],
]);

const legacySource = await readFile(legacyValidatorUrl, "utf8");
const retiredExpectationCount = legacySource.split(retiredEmail).length - 1;

assert.equal(
  retiredExpectationCount,
  2,
  `Expected exactly two historical retired-email assertions in validate-build.mjs, found ${retiredExpectationCount}. Update the compatibility runner intentionally if the legacy validator changes.`,
);

const homepageExpectationCount = legacySource.split(`  "${legacyHomepageTechnologyLabel}",\n];`).length - 1;
assert.equal(
  homepageExpectationCount,
  1,
  `Expected exactly one legacy homepage Technology direction assertion, found ${homepageExpectationCount}.`,
);

let currentSource = legacySource
  .replaceAll(retiredEmail, activeEmail)
  .replace(
    `  "${legacyHomepageTechnologyLabel}",\n];`,
    `  "${canonicalHomepageTechnologyLabel}",\n];`,
  );

for (const [legacyExpectation, currentExpectation] of technologyExpectationReplacements) {
  const count = currentSource.split(legacyExpectation).length - 1;
  assert.equal(
    count,
    1,
    `Expected exactly one historical Technology expectation for ${legacyExpectation}, found ${count}. Update the compatibility runner intentionally if the legacy validator changes.`,
  );
  currentSource = currentSource.replace(legacyExpectation, currentExpectation);
}

for (const [legacyExpectation, currentExpectation] of loadBoardExpectationReplacements) {
  const count = currentSource.split(legacyExpectation).length - 1;
  assert.equal(
    count,
    1,
    `Expected exactly one historical Load Board expectation for ${legacyExpectation}, found ${count}. Update the compatibility runner intentionally if the legacy validator changes.`,
  );
  currentSource = currentSource.replace(legacyExpectation, currentExpectation);
}

// The legacy validator scans generated HTML text with an anchor regex. Inline client-side
// template literals can legitimately contain href="${...}" strings that are not static DOM
// links. Ignore only those interpolation placeholders; real rendered/static hrefs keep the
// same broken-link enforcement.
const legacyHrefGuard = 'if (!href || href.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) continue;';
const currentHrefGuard = 'if (!href || href.includes("${") || href.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) continue;';
const hrefGuardCount = currentSource.split(legacyHrefGuard).length - 1;
assert.equal(
  hrefGuardCount,
  1,
  `Expected exactly one legacy static href guard, found ${hrefGuardCount}. Update the compatibility runner intentionally if the legacy link validator changes.`,
);
currentSource = currentSource.replace(legacyHrefGuard, currentHrefGuard);

await writeFile(temporaryValidatorUrl, currentSource, "utf8");

try {
  await import(`${temporaryValidatorUrl.href}?current=${Date.now()}`);
} finally {
  await unlink(temporaryValidatorUrl).catch(() => {});
}
