import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const manifestPath = path.resolve(
  process.env.SCREENSHOT_MANIFEST || "artifacts/route-screenshots/manifest.json",
);
const expectedWidths = [390, 430, 768, 1024, 1440];
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const observations = Array.isArray(manifest.observations) ? manifest.observations : [];

if (!observations.length) throw new Error("Visual evidence manifest contains no route observations");

const widths = [...new Set(observations.map((item) => Number(item.width)))].sort((a, b) => a - b);
for (const width of expectedWidths) {
  if (!widths.includes(width)) throw new Error(`Visual evidence is missing required ${width}px viewport coverage`);
}

const failures = [];
for (const item of observations) {
  const viewportWidth = Number(item.width || item.documentClientWidth || 0);
  const documentWidth = Number(item.documentScrollWidth || 0);
  const bodyWidth = Number(item.bodyScrollWidth || 0);
  const clientWidth = Number(item.documentClientWidth || 0);
  const widest = Math.max(documentWidth, bodyWidth);

  if (!viewportWidth || !clientWidth) {
    failures.push(`${item.routeId}/${item.viewport}: missing measurable viewport width`);
    continue;
  }
  if (widest > clientWidth + 1 || widest > viewportWidth + 1) {
    failures.push(`${item.routeId}/${item.viewport}: horizontal overflow document=${documentWidth}, body=${bodyWidth}, client=${clientWidth}, viewport=${viewportWidth}`);
  }
  if (Number(item.status || 0) >= 400 || Number(item.status || 0) === 0) {
    failures.push(`${item.routeId}/${item.viewport}: invalid HTTP status ${item.status}`);
  }
}

if (failures.length) {
  throw new Error(`Visual layout evidence failed with ${failures.length} issue(s):\n${failures.map((item) => `- ${item}`).join("\n")}`);
}

const routeCount = new Set(observations.map((item) => item.routeId)).size;
console.log(`Visual layout evidence PASS: ${observations.length} observations across ${routeCount} routes and widths ${widths.join(", ")}px, with no horizontal overflow.`);
