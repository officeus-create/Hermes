import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { publicPathById, publicPaths } from "../src/data/public-paths";

test("Four Directions use Hermes as the public master brand", () => {
  expect(publicPaths.map((path) => path.brandLabel)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Academy",
    "Hermes Technology",
  ]);

  expect(publicPaths.map((path) => path.category)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Academy",
    "Hermes Technology",
  ]);
});

test("operating brands and evidence remain subordinate instead of being erased", () => {
  const marketing = publicPathById("marketing");
  const academy = publicPathById("academy");
  const technology = publicPathById("technology");

  expect(marketing?.brandLabel).toBe("Hermes Marketing");
  expect(marketing?.programLabel).toContain("ProgressoPro");
  expect(marketing?.socialLinks?.some((link) => link.href.includes("instagram.com/progressopro"))).toBe(true);

  expect(academy?.brandLabel).toBe("Hermes Academy");
  expect(academy?.programLabel).toBeTruthy();

  expect(technology?.brandLabel).toBe("Hermes Technology");
  expect(technology?.programLabel).toContain("IT Development");
});

test("direction breadcrumb schema uses the canonical public entity instead of legacy navigation labels", async () => {
  const source = await readFile(resolve(process.cwd(), "src/pages/paths/[slug].astro"), "utf8");
  expect(source).toContain("const breadcrumbName = path.brandLabel;");
  expect(source).not.toContain("site.navigation.find");
});
