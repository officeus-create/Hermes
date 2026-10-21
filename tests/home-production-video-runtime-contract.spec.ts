import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();

test("production release verifies all four Home videos beyond asset availability", () => {
  const probe = fs.readFileSync(path.join(root, "scripts/check-production-home-video-runtime.mjs"), "utf8");
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/cloudflare-pages-production-v2.yml"), "utf8");
  const controller = fs.readFileSync(path.join(root, "public/scripts/home-marketing-video.js"), "utf8");

  for (const id of ["logistics", "technology", "academy", "marketing"]) {
    expect(probe).toContain(`"${id}"`);
  }

  expect(probe).toContain("currentTime: node.currentTime");
  expect(probe).toContain("readyState: node.readyState");
  expect(probe).toContain("videoWidth: node.videoWidth");
  expect(probe).toContain("videoHeight: node.videoHeight");
  expect(probe).toContain('stage.getAttribute("data-media-state")');
  expect(probe).toContain('contentType.includes("video/mp4")');
  expect(probe).toContain("[200, 206]");
  expect(probe).toContain('createHash("sha256")');
  expect(probe).toContain("frameBefore === frameAfter");
  expect(probe).toContain("advancedBy < 0.35");
  expect(probe).not.toContain("await route.hover()");
  expect(controller).toContain("const shouldRun = intersects &&");
  expect(controller).not.toContain("finePointer.matches ? active : intersects");
  expect(controller).not.toContain('route.addEventListener("pointerenter"');
  expect(workflow).toContain("Verify Home production video delivery, decode, playback, and visible motion");
  expect(workflow).toContain("node scripts/check-production-home-video-runtime.mjs");
});
