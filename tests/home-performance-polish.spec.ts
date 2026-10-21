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

  expect(scene).toContain('src="/media/home/technology-claude-v3-poster.jpg"');
  expect(scene).toContain("srcset=");
  expect(scene).toContain('decoding="async"');
  expect(scene).not.toContain("<canvas");
  const videoTags = scene.match(/<video\b/g) ?? [];
  expect(videoTags.length).toBe(4);
  if (videoTags.length >= 1) {
    expect(scene).toContain('data-home-cinematic-video="logistics"');
    expect(scene).not.toContain('                    autoplay');
    expect(scene).toContain('muted');
    expect(scene).toContain('loop');
    expect(scene).toContain('playsinline');
    expect(scene).toContain('preload="none"');
    expect(scene).toContain('poster="/images/logistics-living/car-hauler-512.webp"');
    expect(scene).toContain('data-cinematic-src="/media/home/logistics-golden-v1.mp4"');
    expect(scene).toContain('.home-logistics-cinematic{display:none!important}');
    expect(scene).not.toMatch(/<video[\s\S]*?src=["']https?:\/\//);
    const cinematic = path.join(root, "public/media/home/logistics-golden-v1.mp4");
    expect(fs.existsSync(cinematic)).toBe(true);
    const bytes = fs.statSync(cinematic).size;
    expect(bytes).toBeGreaterThan(200_000);
    expect(bytes).toBeLessThan(8_000_000);
  }
  expect(scene).toContain('data-home-marketing-cinematic');
  expect(scene).toContain('data-home-marketing-video');
  expect(scene).toContain('data-desktop-src="/media/home/marketing-team-v1.mp4"');
  expect(scene).toContain('data-mobile-src="/media/home/marketing-team-v1.mp4"');
  expect(scene).toContain('src="/media/home/marketing-team-poster.jpg"');
  const marketingRuntime = read("public/scripts/home-marketing-video.js");
  expect(marketingRuntime).toContain("IntersectionObserver");
  expect(marketingRuntime).toContain("prefers-reduced-motion: reduce");
  expect(marketingRuntime).toContain("saveData");
  const media = ["marketing-team-v1.mp4", "marketing-team-poster.jpg"];
  for (const file of media) expect(fs.existsSync(path.join(root, "public/media/home", file))).toBe(true);
  expect(fs.statSync(path.join(root, "public/media/home/marketing-team-v1.mp4")).size).toBeLessThan(8_000_000);
  for (const id of ["technology", "academy"]) {
    expect(scene).toContain(`data-home-${id}-cinematic`);
    expect(scene).toContain(`data-desktop-src="/media/home/${id}-claude-v3.mp4"`);
    expect(scene).toContain(`src="/media/home/${id}-claude-v3-poster.jpg"`);
    for (const file of [`${id}-claude-v3.mp4`, `${id}-claude-v3-poster.jpg`]) {
      expect(fs.existsSync(path.join(root, "public/media/home", file))).toBe(true);
      expect(fs.statSync(path.join(root, "public/media/home", file)).size).toBeLessThan(1_500_000);
    }
  }

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
  expect(headers).toContain("/media/*");
  expect(headers).toContain("max-age=31536000, immutable");
  expect(headers).toContain("max-age=2592000, stale-while-revalidate=86400");
});
