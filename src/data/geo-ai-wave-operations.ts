import { aiVisibilityPrompts, type AiVisibilityProvider } from "./ai-visibility-scorecard.ts";
import type { buildGeoAiReviewWaveReport } from "./geo-ai-review-wave-quality.ts";

export const standardGeoAiReviewProviders: AiVisibilityProvider[] = [
  "chatgpt",
  "gemini",
  "copilot",
  "perplexity",
  "google_ai_mode",
];

export interface GeoAiManualReviewPair {
  promptId: string;
  canonicalOwner: string;
  cadence: "weekly" | "monthly";
  provider: AiVisibilityProvider;
}

export const buildNextGeoAiManualReviewPlan = (
  providers: AiVisibilityProvider[] = standardGeoAiReviewProviders,
): GeoAiManualReviewPair[] => {
  if (!providers.length) throw new Error("AI review plan requires at least one provider");
  if (new Set(providers).size !== providers.length) throw new Error("AI review plan providers must be unique");
  return aiVisibilityPrompts.flatMap((prompt) => providers.map((provider) => ({
    promptId: prompt.id,
    canonicalOwner: prompt.canonicalOwner,
    cadence: prompt.cadence,
    provider,
  })));
};

type GeoAiWaveReport = ReturnType<typeof buildGeoAiReviewWaveReport>;

export const buildGeoAiWaveOperatingSummary = (
  report: GeoAiWaveReport,
  plan: GeoAiManualReviewPair[] = buildNextGeoAiManualReviewPlan(report.providers.length ? report.providers : standardGeoAiReviewProviders),
) => {
  const expectedKeys = new Set(plan.map((item) => `${item.promptId}|${item.provider}`));
  const observedKeys = new Set(report.coverageKeys.filter((key) => expectedKeys.has(key)));
  const coverageRate = expectedKeys.size === 0 ? 0 : Number(((observedKeys.size / expectedKeys.size) * 100).toFixed(1));

  const providerRows = report.providerRows.map((row) => ({
    provider: row.provider,
    observations: row.observations,
    citationMatchRate: row.citationMatchRate,
    wrongHermesOwnerCitationRate: row.wrongHermesOwnerCitationRate,
    unmappedHermesPathCitationRate: row.unmappedHermesPathCitationRate,
    noCitationMentionRate: row.noCitationMentionRate,
    factualErrors: row.factualErrors,
    factualSeverityScore: row.factualSeverityScore,
    evidenceSupportedRate: row.evidenceSupportedRate,
    prohibitedClaimOccurrences: row.prohibitedClaimOccurrences,
  }));

  const remediation: Array<{
    priority: 1 | 2 | 3 | 4;
    category: "truth_error" | "citation_owner" | "evidence_support" | "coverage" | "freshness" | "cosmetic";
    canonicalOwner: string | null;
    provider: AiVisibilityProvider | null;
    detail: string;
  }> = [];

  for (const row of providerRows) {
    if (row.prohibitedClaimOccurrences > 0 || row.factualSeverityScore > 0) remediation.push({
      priority: 1,
      category: "truth_error",
      canonicalOwner: null,
      provider: row.provider,
      detail: `${row.provider}: factual severity=${row.factualSeverityScore}, prohibited claim occurrences=${row.prohibitedClaimOccurrences}`,
    });
    if (row.wrongHermesOwnerCitationRate > 0 || row.unmappedHermesPathCitationRate > 0 || row.noCitationMentionRate > 0) remediation.push({
      priority: 2,
      category: "citation_owner",
      canonicalOwner: null,
      provider: row.provider,
      detail: `${row.provider}: citation match=${row.citationMatchRate}%, wrong-owner=${row.wrongHermesOwnerCitationRate}%, unmapped=${row.unmappedHermesPathCitationRate}%, mention-without-citation=${row.noCitationMentionRate}%`,
    });
    if (row.evidenceSupportedRate < 100 && row.observations > 0) remediation.push({
      priority: 2,
      category: "evidence_support",
      canonicalOwner: null,
      provider: row.provider,
      detail: `${row.provider}: evidence-supported observations=${row.evidenceSupportedRate}%`,
    });
  }

  for (const debt of report.providerCoverageDebt) remediation.push({
    priority: 3,
    category: "coverage",
    canonicalOwner: debt.canonicalOwner,
    provider: null,
    detail: `Missing reviewed prompt/provider pairs: ${debt.debtCount}/${debt.expectedPairs}`,
  });

  for (const stale of report.staleEvidencePriority) remediation.push({
    priority: stale.riskScore >= 15 ? 1 : stale.riskScore >= 8 ? 2 : 3,
    category: "freshness",
    canonicalOwner: stale.canonicalOwner,
    provider: stale.provider,
    detail: `${stale.promptId}/${stale.provider}: age=${stale.ageDays}d, cadence=${stale.cadenceDays}d, risk=${stale.riskScore}`,
  });

  const evidenceWorkOpen = remediation.some((item) => item.priority <= 3);
  remediation.push({
    priority: 4,
    category: "cosmetic",
    canonicalOwner: null,
    provider: null,
    detail: evidenceWorkOpen
      ? "Cosmetic answer/presentation changes remain behind truth, citation, evidence, coverage and freshness work."
      : "Cosmetic review may proceed only after evidence queues remain clear.",
  });

  return {
    schemaVersion: "geo_ai_wave_operations_v1" as const,
    waveId: report.waveId,
    promptCount: aiVisibilityPrompts.length,
    providerCount: new Set(plan.map((item) => item.provider)).size,
    expectedPromptProviderPairs: expectedKeys.size,
    observedPromptProviderPairs: observedKeys.size,
    coverageRate,
    providerRows,
    remediation: remediation.sort((a, b) => a.priority - b.priority || (a.provider ?? "").localeCompare(b.provider ?? "") || (a.canonicalOwner ?? "").localeCompare(b.canonicalOwner ?? "")),
    evidenceWorkOpen,
    cosmeticWorkBlockedByEvidence: evidenceWorkOpen,
  };
};

export const validateGeoAiWaveComparisonDiscipline = (comparison: {
  state: "comparable" | "not_comparable";
  reasons: string[];
}) => ({
  deltasAllowed: comparison.state === "comparable" && comparison.reasons.length === 0,
  reasons: comparison.reasons,
});
