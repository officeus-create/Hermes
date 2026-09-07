import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const source = readFileSync(path.join(root, "src/pages/load-board.astro"), "utf8");
const liveEnhancer = readFileSync(path.join(root, "src/components/LoadBoardCapacityEnhancer.astro"), "utf8");
const directNetwork = readFileSync(path.join(root, "src/pages/logistics/direct-vehicle-transport-network/index.astro"), "utf8");

test("canonical load board owner matches load-board intent with one truthful mixed-mode owner", () => {
  expect(source).toContain("Car Hauling Load Board | Live Feed + Demo Review | Hermes Logistics");
  expect(source).toContain("Review Car Hauling Loads Before You Commit");
  expect(source).toContain("Where can I find car hauling loads?");
  expect(source).toContain("Source-gated live + demo");
  expect(source).toContain("the Live marketplace shows only approved, active, unexpired public records");
  expect(source).toContain("may show zero");
  expect(source).toContain("Available Loads · Demo data");
  expect(source).toContain("No load below is available to book.");
});

test("load board truth boundary keeps live feed, demo freight and booking semantics separate", () => {
  expect(liveEnhancer).toContain('/api/load-board/active?type=${type}');
  expect(liveEnhancer).toContain("Only active, unexpired, permission-safe D1 records appear in the counters above.");
  expect(liveEnhancer).toContain("0 approved live loads in D1 right now.");
  expect(source).toContain("submission itself is not a booking");
  expect(source).not.toContain("No load shown on this page is live or bookable.");
  expect(source).not.toContain("it does not publish live or bookable freight");
  expect(source).not.toContain("guaranteed loads");
  expect(source).not.toContain("live loads available now");
});

test("direct-demand owner does not describe the canonical Load Board as fictional-only", () => {
  expect(directNetwork).toContain("source-gated Live marketplace can display approved active public records");
  expect(directNetwork).toContain("demo cards remain fictional and non-bookable");
  expect(directNetwork).toContain('{ label: "Car Hauling Load Board", href: "/load-board/" }');
  expect(directNetwork).not.toContain("The public Load Board is a fictional product preview");
});
