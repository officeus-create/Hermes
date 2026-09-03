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
  expect(homepage).toContain('href="/paths/technology/"');
  expect(homepage).toContain(">Technology</a>");

  for (const direction of rootDirections) {
    const html = await read(`dist/paths/${direction.route}/index.html`);
    expect(html, `${direction.route} root label`).toContain(direction.eyebrow);
    expect(html, `${direction.route} title/entity`).toContain(direction.titleBrand);
    expect(html, `${direction.route} subordinate operating label remains explainable`).toContain(direction.subordinate);
  }
});

test("Academy JSON-LD uses one canonical #academy name", async () => {
  const academyProgram = await read("dist/academy/marketing/index.html");
  const academyApply = await read("dist/academy/apply/index.html");
  const academyApplyUa = await read("dist/ua/academy/apply/index.html");

  for (const [label, html] of [
    ["Academy program", academyProgram],
    ["Academy application", academyApply],
    ["Ukrainian Academy application", academyApplyUa],
  ] as const) {
    expect(html, `${label} contains canonical academy entity`).toContain("Hermes Academy");
    expect(html, `${label} does not publish the subordinate label as the #academy Organization name`)
      .not.toMatch(/#academy[\s\S]{0,300}name[\\"':\s]+Hermes Business Academy/i);
  }
});

test("Technology case does not create a competing IT Development Organization", async () => {
  const html = await read("dist/case/it-development/index.html");
  expect(html).toContain("https://hermeslogisticsus.com/#organization");
  expect(html).toContain("https://hermeslogisticsus.com/#technology");
  expect(html).not.toMatch(/Organization[\s\S]{0,220}Hermes IT Development/i);
  expect(html).toContain("Hermes Technology");
});
