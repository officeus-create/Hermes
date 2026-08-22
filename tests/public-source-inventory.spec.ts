import { expect, test } from "@playwright/test";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { classifySourcePage } from "../src/data/public-source-scope";

const collectAstroPages = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectAstroPages(absolute)));
    } else if (entry.isFile() && entry.name.endsWith(".astro")) {
      paths.push(relative(process.cwd(), absolute).replaceAll("\\", "/"));
    }
  }

  return paths;
};

test("every Astro page has an explicit GEO/design ownership scope", async () => {
  const pages = await collectAstroPages(join(process.cwd(), "src/pages"));
  expect(pages.length).toBeGreaterThan(0);

  for (const page of pages) {
    const scope = classifySourcePage(page);
    expect(
      [
        "public_audit",
        "public_noindex_audit",
        "public_connect_truth_audit",
        "demo_classification",
        "connect_private_excluded",
        "non_page_excluded",
      ],
      `${page} must have an explicit scope`,
    ).toContain(scope);
  }
});

test("nested Hermes Connect application pages remain excluded", async () => {
  const pages = await collectAstroPages(join(process.cwd(), "src/pages/services/hermes-connect"));
  const nestedProductPages = pages.filter((page) =>
    page.includes("/services/hermes-connect/repair-shops/") ||
    page.includes("/services/hermes-connect/academy/")
  );

  expect(nestedProductPages.length).toBeGreaterThan(0);
  for (const page of nestedProductPages) {
    expect(classifySourcePage(page), page).toBe("connect_private_excluded");
  }
});
