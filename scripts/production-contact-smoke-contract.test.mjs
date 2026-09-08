import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(
  new URL("../.github/workflows/production-contact-smoke.yml", import.meta.url),
  "utf8",
);
const homepageContact = await readFile(
  new URL("../src/components/HomeRecoveryFinish.astro", import.meta.url),
  "utf8",
);
const footer = await readFile(
  new URL("../src/components/SiteFooter.astro", import.meta.url),
  "utf8",
);

const workflowLiteral = (name) => {
  const match = workflow.match(new RegExp(`^\\s*${name}='([^']+)'`, "m"));
  assert.ok(match, `Production contact smoke must define ${name}`);
  return match[1];
};

const expectedContact = workflowLiteral("expected_contact");
const expectedFooter = workflowLiteral("expected_footer");

assert.ok(
  homepageContact.includes(expectedContact),
  "Production smoke contact marker must remain present in the canonical homepage contact component",
);
assert.ok(
  footer.includes(expectedFooter),
  "Production smoke footer marker must remain present in the canonical footer component",
);

for (const sourcePath of [
  "src/components/HomeRecoveryFinish.astro",
  "src/components/SiteFooter.astro",
]) {
  assert.ok(
    workflow.includes(`- ${sourcePath}`),
    `Production smoke must run when ${sourcePath} changes`,
  );
}

console.log("Production contact smoke contract passed.");
