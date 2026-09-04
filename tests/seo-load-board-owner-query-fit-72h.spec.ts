import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const source = readFileSync(path.join(root, "src/pages/load-board.astro"), "utf8");

test("canonical load board owner matches verified load-board queries without changing protected owner markers", () => {
  expect(source).toContain("Car Hauling Loads & Load Board Preview | Hermes Logistics");
  expect(source).toContain("Review Car Hauling Loads Before You Commit");
  expect(source).toContain("Car hauler load board preview:");
  expect(source).toContain("Where can I find car hauling loads?");
  expect(source).toContain("This Hermes car hauler load board preview");
});

test("load board query-fit copy preserves the fictional-freight boundary", () => {
  expect(source).toContain("No load shown on this page is live or bookable.");
  expect(source).toContain("it does not publish live or bookable freight");
  expect(source).not.toContain("guaranteed loads");
  expect(source).not.toContain("live loads available now");
});
