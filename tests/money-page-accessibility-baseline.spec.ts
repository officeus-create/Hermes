import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pa11y = readFileSync(path.join(root, ".pa11yci.cjs"), "utf8");
const enhancer = readFileSync(path.join(root, "public/seo4-conversion-enhancer.js"), "utf8");

test("money-page Pa11y baseline includes Repair Shops", () => {
  expect(pa11y).toContain("http://127.0.0.1:4321/load-board/");
  expect(pa11y).toContain("http://127.0.0.1:4321/services/hermes-connect/repair-shops/");
});

test("labelled money-page and footer groups receive permitted ARIA roles", () => {
  for (const selector of [
    ".footer-contacts",
    ".hlb-live-stats",
    ".load-search-bar",
    ".demo-city-choices",
    ".available-load-list",
    ".repair-lifecycle",
    ".repair-geo-market-grid",
    ".repair-geo-actions",
  ]) {
    expect(enhancer).toContain(`"${selector}"`);
  }
  expect(enhancer).toContain('node.setAttribute("role", "group")');
});
