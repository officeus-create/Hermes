import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const source = () => readFile(new URL("../src/pages/logistics/car-hauling-dispatch/index.astro", import.meta.url), "utf8");

test("car-hauling owner links to the two distinct readiness resources", async () => {
  const page = await source();

  expect(page).toContain('href: "/logistics/resources/broker-setup-packet-checklist/"');
  expect(page).toContain('href: "/logistics/resources/new-authority-car-hauler-readiness-checklist/"');
  expect(page).toContain('label: "Broker Setup Packet Checklist"');
  expect(page).toContain('label: "New Authority Readiness Checklist"');
});

test("bounded authority change does not replace the commercial intake or owner", async () => {
  const page = await source();

  expect(page).toContain('href: "/logistics/start-car-hauling-dispatch/"');
  expect(page).toContain('title: "Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics"');
  expect(page).toContain('h1: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets"');
});
