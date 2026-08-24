import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";

const legacyValidatorUrl = new URL("./validate-build.mjs", import.meta.url);
const temporaryValidatorUrl = new URL("./.validate-build-current.generated.mjs", import.meta.url);
const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";
const legacyHomepageTechnologyLabel = "Hermes IT Development";
const canonicalHomepageTechnologyLabel = "Hermes Technology";

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

const currentSource = legacySource
  .replaceAll(retiredEmail, activeEmail)
  .replace(
    `  "${legacyHomepageTechnologyLabel}",\n];`,
    `  "${canonicalHomepageTechnologyLabel}",\n];`,
  );
await writeFile(temporaryValidatorUrl, currentSource, "utf8");

try {
  await import(`${temporaryValidatorUrl.href}?current=${Date.now()}`);
} finally {
  await unlink(temporaryValidatorUrl).catch(() => {});
}
