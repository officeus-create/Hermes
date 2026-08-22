import { expect, test } from "@playwright/test";
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

test("operating/program names remain second-level labels", () => {
  const marketing = publicPathById("marketing");
  const academy = publicPathById("academy");
  const technology = publicPathById("technology");

  expect(marketing?.brandLabel).toBe("Hermes Marketing");
  expect(marketing?.programLabel).toContain("ProgressoPro");
  expect(academy?.brandLabel).toBe("Hermes Academy");
  expect(technology?.brandLabel).toBe("Hermes Technology");
  expect(technology?.programLabel).toContain("IT Development");
});
