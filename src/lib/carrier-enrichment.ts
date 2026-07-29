export type AuthorityKind = "MC" | "USDOT";
export type CarrierDataQuality = "verified" | "partial" | "invalid" | "unavailable";
export type CarrierSourceKind = "official_api" | "official_dataset" | "fallback";

export type NormalizedAuthority = {
  kind: AuthorityKind;
  number: string;
  display: string;
};

export type CarrierEnrichmentRecord = {
  authority: NormalizedAuthority;
  legalName?: string;
  operatingStatus?: string;
  entityType?: string;
  source: string;
  sourceKind: CarrierSourceKind;
  updatedAt: string;
};

export type CarrierEnrichmentResult = {
  quality: CarrierDataQuality;
  authority?: NormalizedAuthority;
  record?: CarrierEnrichmentRecord;
  attempts: { provider: string; sourceKind: CarrierSourceKind; outcome: "found" | "not_found" | "error" }[];
  message: string;
};

export type CarrierEnrichmentProvider = {
  name: string;
  sourceKind: CarrierSourceKind;
  enabled: boolean;
  lookup(authority: NormalizedAuthority): Promise<Omit<CarrierEnrichmentRecord, "authority" | "source" | "sourceKind"> | null>;
};

const providerPriority: Record<CarrierSourceKind, number> = {
  official_api: 0,
  official_dataset: 1,
  fallback: 2,
};

export function normalizeAuthorityIdentifier(value: string): NormalizedAuthority | null {
  const compact = value.toUpperCase().replace(/[\s-]+/g, "");
  const match = compact.match(/^(MC|USDOT|DOT)(\d{5,8})$/);
  if (!match) return null;
  const kind: AuthorityKind = match[1] === "MC" ? "MC" : "USDOT";
  return { kind, number: match[2], display: `${kind} ${match[2]}` };
}

export async function enrichCarrierAuthority(
  rawAuthority: string,
  providers: CarrierEnrichmentProvider[],
): Promise<CarrierEnrichmentResult> {
  const authority = normalizeAuthorityIdentifier(rawAuthority);
  if (!authority) {
    return {
      quality: "invalid",
      attempts: [],
      message: "Use MC or USDOT with its prefix and 5–8 digits.",
    };
  }

  const attempts: CarrierEnrichmentResult["attempts"] = [];
  const ordered = providers
    .filter((provider) => provider.enabled)
    .sort((a, b) => providerPriority[a.sourceKind] - providerPriority[b.sourceKind]);

  for (const provider of ordered) {
    try {
      const found = await provider.lookup(authority);
      attempts.push({ provider: provider.name, sourceKind: provider.sourceKind, outcome: found ? "found" : "not_found" });
      if (!found) continue;
      return {
        quality: provider.sourceKind === "fallback" ? "partial" : "verified",
        authority,
        record: { ...found, authority, source: provider.name, sourceKind: provider.sourceKind },
        attempts,
        message: provider.sourceKind === "fallback"
          ? "Fallback data found; verify against an official FMCSA source before operational use."
          : "Carrier authority data found in an official FMCSA source.",
      };
    } catch {
      attempts.push({ provider: provider.name, sourceKind: provider.sourceKind, outcome: "error" });
    }
  }

  return {
    quality: "unavailable",
    authority,
    attempts,
    message: "No connected provider returned a record. Continue with manual review; do not treat the authority as verified.",
  };
}

