import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildGeoOperationalScorecardReport } from "../src/data/geo-operational-scorecard.ts";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node --experimental-strip-types scripts/geo-operational-scorecard.mjs <sanitized-input.json>");
  process.exit(2);
}

const resolved = path.resolve(process.cwd(), inputPath);
const stat = fs.statSync(resolved);
if (!stat.isFile()) {
  throw new Error("GEO operational input must be a regular file");
}
if (stat.size > 5 * 1024 * 1024) {
  throw new Error("GEO operational input must be 5 MiB or smaller");
}

const raw = fs.readFileSync(resolved, "utf8");
let input;
try {
  input = JSON.parse(raw);
} catch {
  throw new Error("GEO operational input must be valid JSON");
}

const report = buildGeoOperationalScorecardReport(input);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
