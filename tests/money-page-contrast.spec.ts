import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const loader = readFileSync(path.join(root, "public/money-page-contrast-loader.js"), "utf8");
const contrast = readFileSync(path.join(root, "public/money-page-contrast.css"), "utf8");
const component = readFileSync(path.join(root, "src/components/Seo4ConversionEnhancer.astro"), "utf8");

test("money-page contrast loader is exact-route scoped", () => {
  expect(loader).toContain('path === "/load-board/"');
  expect(loader).toContain('path === "/services/hermes-connect/repair-shops/"');
  expect(loader).toContain('document.body.classList.add("money-page-contrast", pageClass)');
  expect(loader).toContain('stylesheet.href = "/money-page-contrast.css"');
  expect(loader).not.toContain("startsWith(");
  expect(component).toContain('src="/money-page-contrast-loader.js"');
});

test("contrast CSS requires explicit money-page body classes", () => {
  expect(contrast).toContain("body.money-page-load-board");
  expect(contrast).toContain("body.money-page-repair");
  expect(contrast).not.toMatch(/^\s*\.site-header\s*\{/m);
  expect(contrast).not.toMatch(/^\s*\.repair-pilot-page\s*\{/m);
});