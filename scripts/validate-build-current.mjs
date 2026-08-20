import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";

const legacyValidatorUrl = new URL("./validate-build.mjs", import.meta.url);
const temporaryValidatorUrl = new URL("./.validate-build-current.generated.mjs", import.meta.url);
const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";

const legacySource = await readFile(legacyValidatorUrl, "utf8");
const retiredExpectationCount = legacySource.split(retiredEmail).length - 1;

assert.equal(
  retiredExpectationCount,
  2,
  `Expected exactly two historical retired-email assertions in validate-build.mjs, found ${retiredExpectationCount}. Update the compatibility runner intentionally if the legacy validator changes.`,
);

const currentExpectationReplacements = new Map([
  ["Hermes Connect · Prototype work started", "Hermes Connect · Staged rollout"],
  ["Product architecture", "Repair Shops"],
  ["Prototype brief", "Academy"],
  ["Specialist booking flow", "Beauty"],
  ["First prototype target · Mobile-first PWA", "Current public maturity map"],
  ["Personal booking link", "Academy · developing"],
  ["Defined prototype scope · Simulated data and test booking only", "Status labels describe current public maturity, not universal availability."],
  [
    "No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet",
    "Repair Shops is the most mature current vertical. Academy is developing as an authenticated learning vertical.",
  ],
]);

let currentSource = legacySource.replaceAll(retiredEmail, activeEmail);
for (const [historicalExpectation, currentExpectation] of currentExpectationReplacements) {
  currentSource = currentSource.replaceAll(historicalExpectation, currentExpectation);
}
await writeFile(temporaryValidatorUrl, currentSource, "utf8");

try {
  await import(`${temporaryValidatorUrl.href}?current=${Date.now()}`);
} finally {
  await unlink(temporaryValidatorUrl).catch(() => {});
}

const distRoot = new URL("../dist/", import.meta.url);
const currentDirectionExpectations = [
  { file: "paths/logistics/index.html", hero: "01 · Hermes Logistics" },
  { file: "paths/marketing/index.html", hero: "02 · Hermes Marketing" },
  { file: "paths/academy/index.html", hero: "03 · Hermes Academy" },
  { file: "paths/technology/index.html", hero: "04 · Hermes Technology" },
];

for (const expectation of currentDirectionExpectations) {
  const html = await readFile(new URL(expectation.file, distRoot), "utf8");
  assert.ok(
    html.includes(expectation.hero),
    `Current public direction hierarchy missing from ${expectation.file}: ${expectation.hero}`,
  );
}

const homeHtml = await readFile(new URL("index.html", distRoot), "utf8");
for (const direction of ["Hermes Logistics", "Hermes Marketing", "Hermes Academy", "Hermes Technology"]) {
  assert.ok(homeHtml.includes(direction), `Home must present ${direction} as a first-level Hermes direction.`);
}

await import("./public-geo-design-inventory.test.mjs");
