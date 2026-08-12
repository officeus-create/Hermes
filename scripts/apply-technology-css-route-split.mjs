import { readFileSync, writeFileSync } from "node:fs";

const globalPath = "src/styles/global.css";
const technologyPath = "src/styles/features/technology.css";
let globalCss = readFileSync(globalPath, "utf8");
let technologyCss = readFileSync(technologyPath, "utf8");

const startMarker = ".detail-page-technology .detail-hero";
const endMarker = "/* Homepage IT preview */";
const insertMarker = "@media (max-width: 900px) {";

const start = globalCss.indexOf(startMarker);
const end = globalCss.indexOf(endMarker, start);
const insertAt = technologyCss.indexOf(insertMarker);
if (start === -1 || end === -1 || end <= start) throw new Error("Global Technology block markers missing or out of order");
if (insertAt === -1) throw new Error("Technology responsive insertion marker missing");

const block = globalCss.slice(start, end).trimEnd();
if (!block.includes(".candidate-pipeline-feature") || !block.includes(".solution-mockup-grid")) {
  throw new Error("Expected Technology-only selectors are missing from bounded block");
}
if (block.includes(".home-technology-preview")) throw new Error("Homepage preview styles unexpectedly entered bounded Technology block");
if (technologyCss.includes(startMarker)) throw new Error("Technology detail block already exists in technology.css");

globalCss = `${globalCss.slice(0, start).trimEnd()}\n\n${globalCss.slice(end)}`;
const ownershipComment = "/* Technology detail and interface styles — moved from global.css so the homepage can defer them with the existing Technology bundle. */\n";
technologyCss = `${technologyCss.slice(0, insertAt).trimEnd()}\n\n${ownershipComment}${block}\n\n${technologyCss.slice(insertAt)}`;

writeFileSync(globalPath, globalCss);
writeFileSync(technologyPath, technologyCss);
console.log(`Moved ${Buffer.byteLength(block)} source bytes from global.css into technology.css.`);
