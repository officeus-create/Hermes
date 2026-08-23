import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("homepage keeps interaction polish lightweight and defers mobile image work", () => {
  const page = read("src/pages/index.astro");
  const layer = read("src/components/HomePerformanceLayer.astro");
  const headers = read("public/_headers");

  expect(page).toContain('import HomePerformanceLayer from "../components/HomePerformanceLayer.astro"');
  expect(page).toContain("<HomePerformanceLayer />");

  expect(layer).toContain('window.matchMedia("(max-width: 900px)")');
  expect(layer).toContain("IntersectionObserver");
  expect(layer).toContain('rootMargin: "360px 0px"');
  expect(layer).toContain('room.dataset.imageReady = "true"');
  expect(layer).toContain("background-image: none !important");
  expect(layer).toContain("content-visibility: auto");
  expect(layer).toContain("contain-intrinsic-size: 1100px");

  expect(layer).toContain("@media (hover: hover) and (pointer: fine)");
  expect(layer).toContain(".home-room:hover .home-room-copy strong");
  expect(layer).toContain(".site-header a:not(.brand):hover");
  expect(layer).toContain("@media (prefers-reduced-motion: reduce)");

  expect(headers).toContain("/_astro/*");
  expect(headers).toContain("/fonts/*");
  expect(headers).toContain("/images/*");
  expect(headers).toContain("max-age=31536000, immutable");
  expect(headers).toContain("max-age=2592000, stale-while-revalidate=86400");
});
