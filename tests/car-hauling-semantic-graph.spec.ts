import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("car-hauling owner links to the two approved supporting resources", async () => {
  const source = await readFile(
    new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url),
    "utf8",
  );

  expect(source).toContain('href: "/logistics/resources/broker-setup-packet-checklist/"');
  expect(source).toContain('href: "/logistics/resources/new-authority-car-hauler-readiness-checklist/"');
});
