import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const enhancer = readFileSync(path.join(root, "public/seo4-conversion-enhancer.js"), "utf8");
const contrast = readFileSync(path.join(root, "public/money-page-contrast.css"), "utf8");

test("money-page contrast layer is scoped to the two canonical owners", () => {
  expect(enhancer).toContain('window.location.pathname === "/load-board/"');
  expect(enhancer).toContain('window.location.pathname === repairShopRoot');
  expect(enhancer).toContain('stylesheet.href = "/money-page-contrast.css"');
  expect(enhancer).toContain('document.body.classList.add("money-page-contrast", pageClass)');
});

test("contrast CSS requires an explicit money-page body class", () => {
  expect(contrast).toContain("body.money-page-load-board");
  expect(contrast).toContain("body.money-page-repair");
  expect(contrast).not.toMatch(/^\s*\.site-header\s*\{/m);
  expect(contrast).not.toMatch(/^\s*\.repair-pilot-page\s*\{/m);
});
