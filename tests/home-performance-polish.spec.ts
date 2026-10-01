import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("homepage keeps V4 interaction polish lightweight without hidden media runtime", () => {
  const page = read("src/pages/index.astro");
  const scene = read("src/components/HomeMasterScene.astro");
  const layer = read("src/components/HomePerformanceLayer.astro");
  const headers = read("public/_headers");

  expect(page).toContain('import HomePerformanceLayer from "../components/HomePerformanceLayer.astro"');
  expect(page).toContain("<HomePerformanceLayer />");
  expect(page).not.toContain('const homepageLcpImage = "/images/path-logistics-system.jpg"');
  expect(page).not.toContain("preloadImage={homepageLcpImage}");

  expect(scene).toContain('type="image/avif"');
  expect(scene).toContain("srcset=");
  expect(scene).toContain('decoding="async"');
  expect(scene).not.toContain("<video");
  expect(scene).not.toContain("<canvas");
  expect(layer).not.toContain("new Image()");
  expect(layer).not.toContain("IntersectionObserver");
  expect(layer).not.toContain("data-image-ready");
  expect(layer).toContain("content-visibility: auto");
  expect(layer).toContain("contain-intrinsic-size: 1100px");

  expect(layer).toContain("@media (hover: hover) and (pointer: fine)");
  expect(layer).toContain(".home-master-route:hover .home-master-route-copy strong");
  expect(layer).not.toContain("text-shadow");
  expect(layer).not.toContain("linear-gradient");
  expect(layer).toContain("@media (prefers-reduced-motion: reduce)");

  expect(headers).toContain("/_astro/*");
  expect(headers).toContain("/fonts/*");
  expect(headers).toContain("/images/*");
  expect(headers).toContain("max-age=31536000, immutable");
  expect(headers).toContain("max-age=2592000, stale-while-revalidate=86400");
});
