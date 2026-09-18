#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const points = (candidate, key, max) => clamp(candidate?.signals?.[key], 0, max);

export const classifyPublicationScore = (score, candidate = {}) => {
  if (candidate.blocked === true || score < 40) return "hold";
  if (score < 60) return "telegram";
  if (score < 75) return "digest";
  if (score < 90) return "standalone";
  return candidate?.signals?.historicalComparison >= 10 ? "standalone_historical" : "standalone";
};

export const scoreInsightCandidate = (candidate) => {
  const reasons = [];
  let score = 0;

  const positive = [
    ["freshness", 20, "freshness"],
    ["authority", 20, "source authority"],
    ["firstPartyEvidence", 20, "first-party evidence"],
    ["historicalComparison", 15, "historical comparison"],
    ["searchValue", 15, "search value"],
    ["internalLinkFit", 10, "internal-link fit"],
  ];

  for (const [key, max, label] of positive) {
    const value = points(candidate, key, max);
    score += value;
    if (value > 0) reasons.push(`+${value} ${label}`);
  }

  const penalties = [
    ["privacyRisk", 30, "privacy risk"],
    ["unverifiedCurrentClaim", 25, "unverified current claim"],
    ["duplicateRisk", 20, "duplicate risk"],
    ["promotionalOnly", 15, "promotional-only signal"],
  ];

  for (const [key, max, label] of penalties) {
    const value = points(candidate, key, max);
    score -= value;
    if (value > 0) reasons.push(`-${value} ${label}`);
  }

  if (candidate?.blocked === true) reasons.push("blocked by governance review");
  score = clamp(Math.round(score), 0, 100);

  return {
    score,
    recommendation: classifyPublicationScore(score, candidate),
    reasons,
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = arg("--input");
  if (!input) {
    console.error("Usage: node scripts/score-insight-candidate.mjs --input /path/to/candidate.json");
    process.exit(1);
  }

  const candidate = JSON.parse(await readFile(resolve(input), "utf8"));
  console.log(JSON.stringify(scoreInsightCandidate(candidate), null, 2));
}
