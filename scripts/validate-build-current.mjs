import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";

const legacyValidatorUrl = new URL("./validate-build.mjs", import.meta.url);
const temporaryValidatorUrl = new URL("./.validate-build-current.generated.mjs", import.meta.url);
const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";
const legacyHomepageHero = "Four directions. One way forward.";
const currentHomepageHero = "Move vehicles with less uncertainty.";

const legacySource = await readFile(legacyValidatorUrl, "utf8");
const retiredExpectationCount = legacySource.split(retiredEmail).length - 1;
const legacyHomepageHeroExpectationCount = legacySource.split(legacyHomepageHero).length - 1;

assert.equal(
  retiredExpectationCount,
  2,
  `Expected exactly two historical retired-email assertions in validate-build.mjs, found ${retiredExpectationCount}. Update the compatibility runner intentionally if the legacy validator changes.`,
);

assert.equal(
  legacyHomepageHeroExpectationCount,
  1,
  `Expected exactly one historical homepage-hero assertion in validate-build.mjs, found ${legacyHomepageHeroExpectationCount}. Update the compatibility runner intentionally if the legacy validator changes.`,
);

const currentSource = legacySource
  .replaceAll(retiredEmail, activeEmail)
  .replace(legacyHomepageHero, currentHomepageHero);
await writeFile(temporaryValidatorUrl, currentSource, "utf8");

try {
  await import(`${temporaryValidatorUrl.href}?current=${Date.now()}`);
} finally {
  await unlink(temporaryValidatorUrl).catch(() => {});
}
