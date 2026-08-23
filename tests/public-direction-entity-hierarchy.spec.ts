import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { publicPaths } from "../src/data/public-paths";

test("public Four Directions use canonical Hermes direction entities", () => {
  expect(publicPaths.map(({ brandLabel }) => brandLabel)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Academy",
    "Hermes Technology",
  ]);
  expect(publicPaths.map(({ category }) => category)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Academy",
    "Hermes Technology",
  ]);
});

test("direction breadcrumb is derived from the public entity rather than legacy navigation", async () => {
  const source = await readFile(resolve(process.cwd(), "src/pages/paths/[slug].astro"), "utf8");
  expect(source).toContain("name: path.brandLabel");
  expect(source).not.toContain("site.navigation.find");
});
