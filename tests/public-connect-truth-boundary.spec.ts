import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicReferencePages = [
  "src/pages/services/hermes-connect/ai-command-center.astro",
  "src/pages/services/hermes-connect/business-automation.astro",
  "src/pages/services/hermes-connect/load-analyzer.astro",
  "src/pages/services/hermes-connect/proposal-builder.astro",
  "src/pages/services/hermes-connect/rate-negotiator.astro",
  "src/pages/services/hermes-connect/roi-calculator.astro",
  "src/pages/services/hermes-connect/unified-inbox.astro",
];

test("public reference capabilities do not assert a current live pilot", async () => {
  for (const relativePath of publicReferencePages) {
    const source = await readFile(resolve(process.cwd(), relativePath), "utf8");
    expect(source.toLowerCase(), `${relativePath} must keep availability evidence-safe`).not.toContain("current live pilot");
    expect(source.toLowerCase(), `${relativePath} must remain visibly reference-scoped`).toContain("reference");
  }
});

test("the public truth language identifies maturity without universal availability", async () => {
  const source = await readFile(
    resolve(process.cwd(), "src/pages/services/hermes-connect/ai-command-center.astro"),
    "utf8",
  );

  expect(source).toContain("most mature current vertical");
  expect(source).toContain("availability");
  expect(source).toContain("verified");
});

test("the Hermes Connect hub uses evidence-safe maturity status outside the frozen SEO metadata", async () => {
  const source = await readFile(
    resolve(process.cwd(), "src/pages/services/hermes-connect/index.astro"),
    "utf8",
  );

  expect(source).toContain('status: "MOST MATURE CURRENT VERTICAL"');
  expect(source).not.toContain('status: "LIVE PRODUCT"');
  expect(source).toContain("Repair Shops · most mature current vertical");
  expect(source).toContain("Availability must be verified");
  expect(source).toContain("availability and production state must be verified");
  expect(source).toContain("No inflated availability claims.");
});