import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("car-hauling owner links to broker setup and new-authority readiness resources", async () => {
  const source = await readFile(
    new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url),
    "utf8",
  );

  expect(source).toContain('/logistics/resources/broker-setup-packet-checklist/');
  expect(source).toContain('/logistics/resources/new-authority-car-hauler-readiness-checklist/');
  expect(source).toContain('/logistics/start-car-hauling-dispatch/');
});
