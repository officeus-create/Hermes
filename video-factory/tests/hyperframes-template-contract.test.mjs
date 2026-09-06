import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildHyperFramesRenderPayload,
  buildHyperFramesTemplateVariables,
} from "../src/providers.mjs";

const job = {
  jobId: "hermes_video_001",
  brandId: "hermes",
  purpose: "social_reel",
  templateId: "hermes-vertical-reel-v1",
  templateVersion: "1.0.0",
  format: { width: 1080, height: 1920, fps: 30, durationSec: 15 },
  script: {
    hook: "One brief. Many approved outputs.",
    body: ["Structured input becomes reusable video.", "No manual timeline rebuild."],
    cta: "Build the pipeline",
  },
  templateVariables: {
    brand_label: "HERMES",
    eyebrow: "CONTENT FACTORY",
    metric_value: "8 LANES",
    metric_label: "One neutral contract across the operating system",
    footer: "hermeslogisticsus.com",
    accent: "#7C5CFF",
  },
};

const variables = buildHyperFramesTemplateVariables({ job });
assert.equal(variables.body, "Structured input becomes reusable video. No manual timeline rebuild.");
assert.equal(variables.metric_value, "8 LANES");
assert.equal(
  Object.values(variables).every((value) => ["string", "number", "boolean"].includes(typeof value)),
  true,
  "HyperFrames runtime variables must stay scalar.",
);

const payload = buildHyperFramesRenderPayload({ job, templateAssetId: "asset_demo" });
assert.equal(payload.aspect_ratio, "9:16");
assert.equal(payload.resolution, "1080p");
assert.equal(payload.fps, 30);
assert.equal(Array.isArray(payload.variables.body), false);
assert.equal("scenes" in payload.variables, false, "SceneSpec arrays stay in VideoJob and must not leak into scalar runtime variables.");

assert.throws(
  () => buildHyperFramesTemplateVariables({ job: { ...job, templateVariables: { scenes: [] } } }),
  /must be a scalar/,
);
assert.throws(
  () => buildHyperFramesTemplateVariables({ job: { ...job, templateVariables: { hook: "override" } } }),
  /cannot override a reserved/,
);

const html = await readFile(
  new URL("../templates/hyperframes/hermes-reel-v1/index.html", import.meta.url),
  "utf8",
);
const declarationMatch = html.match(/data-composition-variables='([\s\S]*?)'>/);
assert.ok(declarationMatch, "Template must declare HyperFrames variables on <html>.");
const declarations = JSON.parse(declarationMatch[1]);
const declaredIds = new Set(declarations.map((item) => item.id));
for (const key of Object.keys(payload.variables)) {
  assert.equal(declaredIds.has(key), true, `Template must declare provider variable ${key}.`);
}

assert.match(html, /data-composition-id="hermes-vertical-reel-v1"/);
assert.match(html, /data-width="1080"/);
assert.match(html, /data-height="1920"/);
assert.match(html, /data-fps="30"/);
assert.match(html, /data-duration="15"/);
assert.match(html, /src="\.\/vendor\/gsap\.min\.js"/);
assert.match(html, /url\("\.\/vendor\/fonts\/manrope-latin\.woff2"\)/);
assert.match(html, /url\("\.\/vendor\/fonts\/source-sans-3-latin\.woff2"\)/);
assert.match(html, /url\("\.\/vendor\/fonts\/ibm-plex-mono-500-latin\.woff2"\)/);
assert.equal((html.match(/@font-face/g) ?? []).length, 3, "All Hermes video font families must be declared locally.");
assert.match(html, /id="scene-1"[\s\S]*?data-start="0" data-duration="5\.42" data-track-index="0"/);
assert.match(html, /id="scene-2"[\s\S]*?data-start="4\.6" data-duration="5\.67" data-track-index="1"/);
assert.match(html, /id="scene-3"[\s\S]*?data-start="9\.45" data-duration="5\.55" data-track-index="2"/);
assert.equal((html.match(/data-layout-allow-occlusion/g) ?? []).length, 2, "Only outgoing scenes should allow transition occlusion.");
assert.match(html, /window\.__timelines\[root\.dataset\.compositionId\] = tl;/);
assert.equal((html.match(/\.from\(/g) ?? []).length >= 15, true, "Every visible scene element needs an authored entrance.");
assert.equal((html.match(/clipPath:/g) ?? []).length >= 2, true, "Multi-scene template needs authored transitions.");
assert.equal(/<script[^>]+src="https?:\/\//.test(html), false, "Render template must not depend on a remote script.");
assert.equal(/\btransition\s*:/.test(html), false, "Seek-unsafe CSS transitions are forbidden.");
assert.equal(/Math\.random\(|Date\.now\(|repeat\s*:\s*-1/.test(html), false, "Template must be deterministic.");
assert.equal(/<br\s*\/?\s*>/i.test(html), false, "Forced line breaks are forbidden in dynamic copy.");

console.log("HyperFrames Hermes template contract: PASS");
