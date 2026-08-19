import { geoDirectionAlignment } from "./geo-direction-alignment.ts";

export type GeoPackageVerificationState = "implemented_not_verified" | "ci_verified" | "blocked";
export type GeoCiState = "queued" | "in_progress" | "success" | "failure" | "unknown";

export interface GeoPackageStatus {
  range: string;
  pr: number;
  headSha: string;
  state: GeoPackageVerificationState;
  visualChange: boolean;
}

export interface GeoExactHeadCiEvidence {
  headSha: string;
  state: GeoCiState;
  workflowRunId: number | null;
  build: "success" | "failure" | "pending" | "unknown";
  unit: "success" | "failure" | "pending" | "unknown";
  e2e: "success" | "failure" | "pending" | "unknown";
}

export const geo300ImplementedPackages: GeoPackageStatus[] = [
  { range: "201–210", pr: 738, headSha: "f03c19c13277a921fe44e5fc76dd856ee0b3a006", state: "implemented_not_verified", visualChange: false },
  { range: "211–220", pr: 739, headSha: "1ffcd0b09895c66a8e2c6f7ab5ba22341b938765", state: "implemented_not_verified", visualChange: false },
  { range: "221–230", pr: 741, headSha: "802f1e52ae06c7d14202060866030587b29dacf6", state: "implemented_not_verified", visualChange: false },
  { range: "231–240", pr: 743, headSha: "b2c8d3161a5d4cfa4f981ea54998fae66637f134", state: "implemented_not_verified", visualChange: false },
  { range: "241–250", pr: 746, headSha: "5731af5eb56aef24989ca3311d06912f9558be3c", state: "implemented_not_verified", visualChange: false },
  { range: "251–260", pr: 748, headSha: "31f13af2dd1688d7e0af9bba3a8c43d43964961e", state: "implemented_not_verified", visualChange: false },
  { range: "261–270", pr: 749, headSha: "29484ada57acc150481b53816c561ed8c135d1a0", state: "implemented_not_verified", visualChange: false },
  { range: "271–280", pr: 750, headSha: "20319178c2351372dbb7eb5f4204de22530488fa", state: "implemented_not_verified", visualChange: false },
  { range: "281–290", pr: 751, headSha: "5ad100dccd8b7a79c82e28f72a7e69697f1c901c", state: "implemented_not_verified", visualChange: false },
];

export const applyExactHeadCiEvidence = (packages: GeoPackageStatus[], evidence: GeoExactHeadCiEvidence[]) => {
  const bySha = new Map(evidence.map((item) => [item.headSha, item]));
  return packages.map((pkg) => {
    const ci = bySha.get(pkg.headSha);
    if (!ci) return pkg;
    const exactSuccess =
      ci.state === "success" &&
      ci.build === "success" &&
      ci.unit === "success" &&
      ci.e2e === "success";
    const exactFailure = ci.state === "failure" || ci.build === "failure" || ci.unit === "failure" || ci.e2e === "failure";
    return {
      ...pkg,
      state: exactSuccess ? "ci_verified" as const : exactFailure ? "blocked" as const : "implemented_not_verified" as const,
    };
  });
};

export interface GeoExternalOperatingGap {
  key:
    | "us_owner_level_gsc"
    | "gsc_url_inspection"
    | "bing_exact_url"
    | "ga4_exact_once"
    | "receiver_delivery"
    | "private_qualification"
    | "commercial_outcome"
    | "manual_ai_review_wave";
  canonicalOwner: string | null;
  status: "open" | "complete";
  evidenceReference: string | null;
}

export const geo300KnownExternalGaps: GeoExternalOperatingGap[] = [
  { key: "us_owner_level_gsc", canonicalOwner: "/services/seo-for-logistics-companies/", status: "open", evidenceReference: null },
  { key: "us_owner_level_gsc", canonicalOwner: "/logistics/car-hauling-dispatch/", status: "open", evidenceReference: null },
  { key: "gsc_url_inspection", canonicalOwner: "/careers/car-hauling-dispatcher/", status: "open", evidenceReference: null },
  { key: "bing_exact_url", canonicalOwner: "/careers/car-hauling-dispatcher/", status: "open", evidenceReference: null },
  { key: "ga4_exact_once", canonicalOwner: null, status: "open", evidenceReference: null },
  { key: "receiver_delivery", canonicalOwner: "/services/seo/", status: "open", evidenceReference: null },
  { key: "receiver_delivery", canonicalOwner: "/services/website-development/", status: "open", evidenceReference: null },
  { key: "private_qualification", canonicalOwner: null, status: "open", evidenceReference: null },
  { key: "commercial_outcome", canonicalOwner: null, status: "open", evidenceReference: null },
  { key: "manual_ai_review_wave", canonicalOwner: null, status: "open", evidenceReference: null },
];

export interface GeoPageExpansionCandidate {
  path: string;
  dimension: "location" | "equipment" | "lane" | "service" | "resource" | "answer" | "other";
  distinctIntentEvidence: boolean;
  distinctFirstPartyEvidence: boolean;
  canonicalOwnerConflict: boolean;
  proposedCount: number;
}

export const auditGeoPageExpansionCandidates = (candidates: GeoPageExpansionCandidate[]) => candidates.map((candidate) => {
  if (!candidate.path.startsWith("/") || candidate.path.startsWith("//")) throw new Error(`Candidate path must be site-relative: ${candidate.path}`);
  if (!Number.isInteger(candidate.proposedCount) || candidate.proposedCount < 1) throw new Error("proposedCount must be a positive integer");
  const scalableDimension = ["location", "equipment", "lane"].includes(candidate.dimension);
  const bulk = candidate.proposedCount > 5;
  const gaps: string[] = [];
  if (!candidate.distinctIntentEvidence) gaps.push("distinct_intent_evidence_missing");
  if (!candidate.distinctFirstPartyEvidence) gaps.push("distinct_first_party_evidence_missing");
  if (candidate.canonicalOwnerConflict) gaps.push("canonical_owner_conflict");
  if (scalableDimension && bulk) gaps.push("bulk_location_equipment_lane_factory_blocked");
  return {
    ...candidate,
    publishable: gaps.length === 0,
    gaps,
    rule: "No location/equipment/lane page factory. Every page needs distinct demand, distinct evidence and one canonical intent owner.",
  };
});

export const auditGeoFourDirectionAlignment = () => {
  const rows = Object.values(geoDirectionAlignment);
  const expected = ["logistics", "marketing", "academy", "technology"].sort();
  const actual = rows.map((row) => row.geoDirection).sort();
  return {
    ready: expected.join("|") === actual.join("|") && rows.every((row) => row.canonicalDirectionOwner.startsWith("/")),
    directionCount: rows.length,
    directions: actual,
    owners: rows.map((row) => row.canonicalDirectionOwner).sort(),
  };
};

export const buildGeoNextHighestValueBacklog = (externalGaps: GeoExternalOperatingGap[] = geo300KnownExternalGaps) => {
  const priority: Record<GeoExternalOperatingGap["key"], number> = {
    us_owner_level_gsc: 100,
    ga4_exact_once: 95,
    receiver_delivery: 90,
    private_qualification: 85,
    commercial_outcome: 80,
    manual_ai_review_wave: 75,
    gsc_url_inspection: 70,
    bing_exact_url: 65,
  };
  return externalGaps
    .filter((gap) => gap.status === "open")
    .map((gap) => ({ ...gap, priority: priority[gap.key] }))
    .sort((a, b) => b.priority - a.priority || (a.canonicalOwner ?? "").localeCompare(b.canonicalOwner ?? ""));
};

export const buildGeo300ClosureState = (input: {
  packages: GeoPackageStatus[];
  currentHeadCi: GeoExactHeadCiEvidence | null;
  externalGaps: GeoExternalOperatingGap[];
  materialVisualQueueRefs: string[];
}) => {
  const allHistoricalPackagesVerified = input.packages.every((item) => item.state === "ci_verified");
  const currentHeadVerified = Boolean(
    input.currentHeadCi &&
    input.currentHeadCi.state === "success" &&
    input.currentHeadCi.build === "success" &&
    input.currentHeadCi.unit === "success" &&
    input.currentHeadCi.e2e === "success",
  );
  const openExternal = input.externalGaps.filter((gap) => gap.status === "open");
  if (!allHistoricalPackagesVerified || !currentHeadVerified) {
    return {
      state: "blocked_at_ci" as const,
      closeIssue: false,
      allHistoricalPackagesVerified,
      currentHeadVerified,
      openExternal,
      materialVisualQueueRefs: input.materialVisualQueueRefs,
    };
  }
  if (openExternal.length > 0) {
    return {
      state: "engineering_verified_external_evidence_open" as const,
      closeIssue: false,
      allHistoricalPackagesVerified,
      currentHeadVerified,
      openExternal,
      materialVisualQueueRefs: input.materialVisualQueueRefs,
    };
  }
  return {
    state: input.materialVisualQueueRefs.length ? "engineering_and_external_verified_visual_decisions_open" as const : "ready_to_close" as const,
    closeIssue: input.materialVisualQueueRefs.length === 0,
    allHistoricalPackagesVerified,
    currentHeadVerified,
    openExternal,
    materialVisualQueueRefs: input.materialVisualQueueRefs,
  };
};

export const buildGeo300CurrentState = (input: {
  packageCiEvidence?: GeoExactHeadCiEvidence[];
  currentHeadCi?: GeoExactHeadCiEvidence | null;
  externalGaps?: GeoExternalOperatingGap[];
  materialVisualQueueRefs?: string[];
}) => {
  const packages = applyExactHeadCiEvidence(geo300ImplementedPackages, input.packageCiEvidence ?? []);
  const externalGaps = input.externalGaps ?? geo300KnownExternalGaps;
  const materialVisualQueueRefs = input.materialVisualQueueRefs ?? [];
  const closure = buildGeo300ClosureState({
    packages,
    currentHeadCi: input.currentHeadCi ?? null,
    externalGaps,
    materialVisualQueueRefs,
  });
  return {
    schemaVersion: "geo_300_current_state_v1" as const,
    implementation: {
      implementedRanges: packages.map((item) => item.range),
      verifiedRanges: packages.filter((item) => item.state === "ci_verified").map((item) => item.range),
      blockedRanges: packages.filter((item) => item.state === "blocked").map((item) => item.range),
      packages,
    },
    fourDirections: auditGeoFourDirectionAlignment(),
    externalGaps,
    nextBacklog: buildGeoNextHighestValueBacklog(externalGaps),
    materialVisualQueueRefs,
    closure,
  };
};
