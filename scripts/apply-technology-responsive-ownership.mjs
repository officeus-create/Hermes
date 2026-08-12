import { readFileSync, writeFileSync } from "node:fs";

const globalPath = "src/styles/global.css";
const technologyPath = "src/styles/features/technology.css";
let globalCss = readFileSync(globalPath, "utf8");
let technologyCss = readFileSync(technologyPath, "utf8");

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`Missing ${label}`);
  if (source.indexOf(before, first + 1) !== -1) throw new Error(`Ambiguous ${label}`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const global900 = `@media (max-width: 900px) {
  .solution-mockup-grid { grid-template-columns: 1fr; }
  .solution-mockup-carrier { grid-row: auto; }
  .solution-mockup-dashboard { grid-column: auto; }
  .executive-dashboard-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .home-technology-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}`;
const global900Home = `@media (max-width: 900px) {
  .home-technology-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}`;
globalCss = replaceOnce(globalCss, global900, global900Home, "Technology/home 900px split block");

const global560 = `@media (max-width: 560px) {
  .solution-mockup { min-height: 0; }
  .solution-mockup-heading { flex-wrap: wrap; }
  .solution-mockup-heading strong { width: 100%; margin: .2rem 0 0; }
  .route-risk-map { grid-template-columns: 1fr; }
  .route-risk-map i { width: 2px; height: 24px; margin-left: 1rem; }
  .recruiting-pipeline { grid-template-columns: 1fr; gap: .8rem; }
  .recruiting-pipeline li { grid-template-columns: 36px 1fr; }
  .recruiting-pipeline li::after { top: 1rem; bottom: -.8rem; left: .7rem; width: 2px; height: auto; }
  .executive-dashboard-grid, .home-technology-grid { grid-template-columns: 1fr; }
  .home-technology-grid article { min-height: 210px; }
}`;
const global560Home = `@media (max-width: 560px) {
  .home-technology-grid { grid-template-columns: 1fr; }
  .home-technology-grid article { min-height: 210px; }
}`;
globalCss = replaceOnce(globalCss, global560, global560Home, "Technology/home 560px split block");

const candidate620 = `  .candidate-pipeline-feature { gap: 1.5rem; }
  .candidate-pipeline-visual { grid-template-columns: 1fr; }
  .candidate-pipeline-visual > svg { justify-self: center; transform: rotate(90deg); }
  .candidate-pipeline-visual > div { min-height: 120px; }
  .candidate-pipeline-visual > div strong { margin-top: 1.4rem; }
`;
globalCss = replaceOnce(globalCss, candidate620, "", "candidate pipeline 620px overrides");

const tech900Anchor = `.candidate-pipeline-feature, .technology-industries { grid-template-columns: 1fr; }
`;
const tech900Add = `.solution-mockup-grid { grid-template-columns: 1fr; }
.solution-mockup-carrier { grid-row: auto; }
.solution-mockup-dashboard { grid-column: auto; }
.executive-dashboard-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
`;
technologyCss = replaceOnce(technologyCss, tech900Anchor, tech900Anchor + tech900Add, "technology.css 900px anchor");

const tech620Anchor = `@media (max-width: 620px) {
.technology-build-pulse { padding: 3.5rem 0; }
`;
const tech620Add = `.candidate-pipeline-feature { gap: 1.5rem; }
.candidate-pipeline-visual { grid-template-columns: 1fr; }
.candidate-pipeline-visual > svg { justify-self: center; transform: rotate(90deg); }
.candidate-pipeline-visual > div { min-height: 120px; }
.candidate-pipeline-visual > div strong { margin-top: 1.4rem; }
`;
technologyCss = replaceOnce(
  technologyCss,
  tech620Anchor,
  `@media (max-width: 620px) {\n${tech620Add}.technology-build-pulse { padding: 3.5rem 0; }\n`,
  "technology.css 620px anchor",
);

const reducedMotionAnchor = `@media (prefers-reduced-motion: reduce) {`;
const tech560 = `@media (max-width: 560px) {
.solution-mockup { min-height: 0; }
.solution-mockup-heading { flex-wrap: wrap; }
.solution-mockup-heading strong { width: 100%; margin: .2rem 0 0; }
.route-risk-map { grid-template-columns: 1fr; }
.route-risk-map i { width: 2px; height: 24px; margin-left: 1rem; }
.recruiting-pipeline { grid-template-columns: 1fr; gap: .8rem; }
.recruiting-pipeline li { grid-template-columns: 36px 1fr; }
.recruiting-pipeline li::after { top: 1rem; bottom: -.8rem; left: .7rem; width: 2px; height: auto; }
.executive-dashboard-grid { grid-template-columns: 1fr; }
}
`;
const reducedMotionIndex = technologyCss.indexOf(reducedMotionAnchor);
if (reducedMotionIndex === -1) throw new Error("Missing first technology.css reduced-motion anchor");
technologyCss = technologyCss.slice(0, reducedMotionIndex) + tech560 + technologyCss.slice(reducedMotionIndex);

writeFileSync(globalPath, globalCss);
writeFileSync(technologyPath, technologyCss);
console.log("Moved matching 900px, 620px, and 560px Technology responsive overrides to technology.css.");
