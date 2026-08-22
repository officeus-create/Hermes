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

const currentSource = legacySource
  .replaceAll(retiredEmail, activeEmail)
  .replaceAll("Hermes IT Development", "Hermes Technology")
  .replaceAll("Hermes Business Academy", "Hermes Academy")
  .replaceAll("Reach ProgressoPro directly.", "Reach Hermes Marketing.")
  .replaceAll('"https://www.instagram.com/progressopro/"', '"Hermes Marketing"')
  .replaceAll('"https://www.threads.com/@progressopro"', '"Hermes Marketing"')
  .replaceAll('"https://t.me/SMMProgressoPro"', '"Hermes Marketing"')
  .replaceAll("Hermes Connect · Prototype work started", "Hermes Connect · Repair Shops is the most mature current vertical")
  .replaceAll("Prototype brief", "Public product family")
  .replaceAll("Specialist booking flow", "Repair Shops")
  .replaceAll("First prototype target · Mobile-first PWA", "Current public path · Web-first")
  .replaceAll("Personal booking link", "Owner access")
  .replaceAll("Defined prototype scope · Simulated data and test booking only", "Availability, integrations, and live external actions are verified separately.")
  .replaceAll(
    "No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet",
    "Repair Shops being the most mature current vertical does not imply every module, integration, booking, payment, calendar, or AI action is universally live",
  );
await writeFile(temporaryValidatorUrl, currentSource, "utf8");

try {
  await import(`${temporaryValidatorUrl.href}?current=${Date.now()}`);
} finally {
  await unlink(temporaryValidatorUrl).catch(() => {});
}
