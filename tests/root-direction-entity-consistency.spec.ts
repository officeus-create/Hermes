import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFile(path.join(root, relativePath), "utf8");

const rootDirections = [
  {
    route: "marketing",
    eyebrow: "02 · Hermes Marketing",
    titleBrand: "Hermes Marketing",
    subordinate: "ProgressoPro",
  },
  {
    route: "academy",
    eyebrow: "03 · Hermes Academy",
    titleBrand: "Hermes Academy",
    subordinate: "Hermes Business Academy",
  },
  {
    route: "technology",
    eyebrow: "04 · Hermes Technology",
    titleBrand: "Hermes Technology",
    subordinate: "IT Development",
  },
] as const;

test("root direction pages use canonical Hermes entities while preserving subordinate operating labels", async () => {
  const homepage = await read("dist/index.html");
  expect(homepage).toContain('href="/paths/technology/">Technology</a>');

  for (const direction of rootDirections) {
    const html = await read(`dist/paths/${direction.route}/index.html`);
    expect(html, `${direction.route} root label`).toContain(direction.eyebrow);
    expect(html, `${direction.route} title/entity`).toContain(direction.titleBrand);
    expect(html, `${direction.route} subordinate operating label remains explainable`).toContain(direction.subordinate);
  }
});
