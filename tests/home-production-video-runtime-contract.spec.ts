import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();

test("production release verifies all four Home videos beyond asset availability", () => {
  const probe = fs.readFileSync(path.join(root, "scripts/check-production-home-video-runtime.mjs"), "utf8");
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/cloudflare-pages-production-v2.yml"), "utf8");

  for (const id of ["logistics", "technology", "academy", "marketing"]) {
    expect(probe).toContain(`"${id}"`);
  }
  expect(probe).toContain("video.readyState");
  expect(probe).toContain("video.currentTime");
  expect(probe).toContain("video.videoWidth");
  expect(probe).toContain("data-media-state");
  expect(probe).toContain("video/mp4");
  expect(probe).toContain("[200, 206]");
  expect(workflow).toContain("Verify Home production video delivery, decode, playback, and visible motion");
  expect(workflow).toContain("node scripts/check-production-home-video-runtime.mjs");
});
