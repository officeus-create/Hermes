#!/usr/bin/env node
// Fail-closed audit for four genuinely multi-shot Hermes Home cinema windows.
// Reference Pexels IDs are never treated as verified/downloaded footage.
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const file = resolve(root, "src/data/home-cinematic-sources.json");

export function auditSources(manifest, {
  base = root,
  exists = existsSync,
  size = path => statSync(path).size,
  sha256 = path => createHash("sha256").update(readFileSync(path)).digest("hex")
} = {}) {
  const problems = [];
  const expected = ["logistics", "technology", "academy", "marketing"];
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.panels)) {
    return { releaseReady: false, panels: [], problems: ["Invalid source manifest"] };
  }
  const reviewed = Array.isArray(manifest.reviewedAdditionalSources) ? manifest.reviewedAdditionalSources : [];
  const summary = [];
  for (const id of expected) {
    const matches = manifest.panels.filter(p => p.id === id);
    if (matches.length !== 1) { problems.push(`Expected exactly one ${id} panel`); continue; }
    const panel = matches[0];
    const current = panel.current;
    const currentPath = typeof current?.path === "string" && current.path.startsWith("public/media/home/") ? resolve(base,current.path) : null;
    if (!currentPath || !exists(currentPath) || size(currentPath) < 100_000) problems.push(`${id}: existing film unavailable`);
    const listed = new Set((panel.candidates ?? []).map(s => `${s.provider}:${s.id}`));
    const distinct = new Set([current?.source]);
    const accepted = [];
    for (const clip of reviewed.filter(s => s.direction === id)) {
      const key = `${clip.provider}:${clip.id}`;
      if (!listed.has(key) || distinct.has(key)) { problems.push(`${id}: unlisted or duplicate source ${key}`); continue; }
      distinct.add(key);
      const full = typeof clip.previewAssetPath === "string" && clip.previewAssetPath.startsWith("public/media/home/") ? resolve(base,clip.previewAssetPath) : null;
      const actual = full && exists(full) && size(full) >= 100_000 && size(full) <= 4_000_000;
      const checksum = actual && /^[a-f0-9]{64}$/.test(clip.sha256 ?? "") && sha256(full) === clip.sha256;
      if (!checksum || clip.licenseReviewed !== true || clip.noImpliedEndorsementReviewed !== true || clip.normalSpeedTemporalReview !== "passed") {
        problems.push(`${id}: source ${key} missing verified file/rights/temporal review`);
      } else accepted.push(key);
    }
    if (accepted.length < 1) problems.push(`${id}: fewer than two distinct verified moving sources`);
    summary.push({ id, existing: current.path, listedCandidates: [...listed], verifiedAdditional: accepted });
  }
  if (manifest.panels.some(p => !expected.includes(p.id))) problems.push("Unexpected direction");
  if (manifest.releaseApproval?.ownerVisual !== true || !manifest.releaseApproval?.previewEvidenceUrl) {
    problems.push("Actual owner visual acceptance of exact video preview is missing");
  }
  return { releaseReady: problems.length === 0, panels: summary, problems };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(readFileSync(file,"utf8"));
  const audit = auditSources(manifest);
  process.stdout.write(JSON.stringify(audit,null,2)+"\n");
  if (process.argv.includes("--release") && !audit.releaseReady) process.exitCode = 1;
}
