import { aiVisibilityPrompts } from "./ai-visibility-scorecard.ts";

export interface GeoTranslatedClaimSignatureInput {
  claim_key: string;
  source_keys: string[];
}

export interface GeoHreflangEvidenceInput {
  language_tag: string;
  canonical_owner: string;
}

export interface GeoMultilingualSurfaceInput {
  surface_id: string;
  translation_group: string;
  language_tag: string;
  canonical_owner: string;
  prompt_ids: string[];
  hreflang: GeoHreflangEvidenceInput[];
  entity_ids: string[];
  claims: GeoTranslatedClaimSignatureInput[];
}

const topFields = new Set(["surface_id", "translation_group", "language_tag", "canonical_owner", "prompt_ids", "hreflang", "entity_ids", "claims"]);
const hreflangFields = new Set(["language_tag", "canonical_owner"]);
const claimFields = new Set(["claim_key", "source_keys"]);
const languageTag = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const opaque = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => {
  for (const key of Object.keys(row)) if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  for (const key of fields) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
};
const cleanOpaque = (value: unknown, label: string) => {
  if (typeof value !== "string" || !opaque.test(value)) throw new Error(`${label} must be an opaque safe identifier`);
  return value;
};
const cleanLanguage = (value: unknown, label: string) => {
  if (typeof value !== "string" || !languageTag.test(value)) throw new Error(`${label} must be a controlled BCP-47-like language tag`);
  return value;
};
const cleanPath = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`${label} must be a clean site-relative path`);
  return value;
};
const cleanStringArray = (value: unknown, label: string, max = 200) => {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${label} must be an array of at most ${max} values`);
  const rows = value.map((item, index) => cleanOpaque(item, `${label}[${index}]`));
  if (new Set(rows).size !== rows.length) throw new Error(`${label} must be unique`);
  return [...rows].sort();
};

export const importGeoMultilingualSurfaces = (inputs: unknown[]): GeoMultilingualSurfaceInput[] => {
  if (!Array.isArray(inputs) || inputs.length > 1000) throw new Error("Multilingual surfaces must contain at most 1000 rows");
  const rows = inputs.map((input, index) => {
    const row = asRecord(input, `surfaces[${index}]`);
    exactFields(row, topFields, `surfaces[${index}]`);
    if (!Array.isArray(row.hreflang) || row.hreflang.length > 50) throw new Error(`surfaces[${index}].hreflang must be an array`);
    const hreflang = row.hreflang.map((item, hreflangIndex) => {
      const target = asRecord(item, `surfaces[${index}].hreflang[${hreflangIndex}]`);
      exactFields(target, hreflangFields, `surfaces[${index}].hreflang[${hreflangIndex}]`);
      return {
        language_tag: cleanLanguage(target.language_tag, `surfaces[${index}].hreflang[${hreflangIndex}].language_tag`),
        canonical_owner: cleanPath(target.canonical_owner, `surfaces[${index}].hreflang[${hreflangIndex}].canonical_owner`),
      };
    });
    if (new Set(hreflang.map((item) => item.language_tag)).size !== hreflang.length) throw new Error(`surfaces[${index}].hreflang language tags must be unique`);
    if (!Array.isArray(row.claims) || row.claims.length > 500) throw new Error(`surfaces[${index}].claims must be an array`);
    const claims = row.claims.map((item, claimIndex) => {
      const claim = asRecord(item, `surfaces[${index}].claims[${claimIndex}]`);
      exactFields(claim, claimFields, `surfaces[${index}].claims[${claimIndex}]`);
      return {
        claim_key: cleanOpaque(claim.claim_key, `surfaces[${index}].claims[${claimIndex}].claim_key`),
        source_keys: cleanStringArray(claim.source_keys, `surfaces[${index}].claims[${claimIndex}].source_keys`, 50),
      };
    });
    if (new Set(claims.map((item) => item.claim_key)).size !== claims.length) throw new Error(`surfaces[${index}].claim_key values must be unique`);
    const surface = {
      surface_id: cleanOpaque(row.surface_id, `surfaces[${index}].surface_id`),
      translation_group: cleanOpaque(row.translation_group, `surfaces[${index}].translation_group`),
      language_tag: cleanLanguage(row.language_tag, `surfaces[${index}].language_tag`),
      canonical_owner: cleanPath(row.canonical_owner, `surfaces[${index}].canonical_owner`),
      prompt_ids: cleanStringArray(row.prompt_ids, `surfaces[${index}].prompt_ids`, 100),
      hreflang: [...hreflang].sort((a, b) => a.language_tag.localeCompare(b.language_tag)),
      entity_ids: cleanStringArray(row.entity_ids, `surfaces[${index}].entity_ids`, 200),
      claims: [...claims].sort((a, b) => a.claim_key.localeCompare(b.claim_key)),
    };
    return surface;
  });
  if (new Set(rows.map((item) => item.surface_id)).size !== rows.length) throw new Error("surface_id values must be unique");
  return rows.sort((a, b) => a.translation_group.localeCompare(b.translation_group) || a.language_tag.localeCompare(b.language_tag));
};

const sameSet = (left: string[], right: string[]) => left.length === right.length && [...left].sort().join("|") === [...right].sort().join("|");
const claimMap = (surface: GeoMultilingualSurfaceInput) => new Map(surface.claims.map((claim) => [claim.claim_key, claim.source_keys]));

export const buildGeoMultilingualConsistencyAudit = (inputs: unknown[]) => {
  const surfaces = importGeoMultilingualSurfaces(inputs);
  const knownPrompts = new Map(aiVisibilityPrompts.map((prompt) => [prompt.id, prompt]));
  const ownerByLocale = new Map<string, string>();
  const localeOwnerConflicts: string[] = [];
  const surfaceAudits = surfaces.map((surface) => {
    const issues: string[] = [];
    const selfHreflang = surface.hreflang.find((item) => item.language_tag === surface.language_tag);
    if (!selfHreflang) issues.push("missing_self_hreflang");
    else if (selfHreflang.canonical_owner !== surface.canonical_owner) issues.push("self_hreflang_canonical_mismatch");

    for (const promptId of surface.prompt_ids) {
      const prompt = knownPrompts.get(promptId);
      if (!prompt) {
        issues.push(`unknown_prompt:${promptId}`);
        continue;
      }
      if (prompt.language !== surface.language_tag) issues.push(`prompt_language_mismatch:${promptId}`);
      if (prompt.canonicalOwner !== surface.canonical_owner) issues.push(`prompt_owner_mismatch:${promptId}`);
    }

    const localeOwnerKey = `${surface.translation_group}|${surface.language_tag}`;
    const existingOwner = ownerByLocale.get(localeOwnerKey);
    if (existingOwner && existingOwner !== surface.canonical_owner) localeOwnerConflicts.push(localeOwnerKey);
    else ownerByLocale.set(localeOwnerKey, surface.canonical_owner);

    return {
      surfaceId: surface.surface_id,
      translationGroup: surface.translation_group,
      languageTag: surface.language_tag,
      canonicalOwner: surface.canonical_owner,
      issues,
    };
  });

  const groupAudits = [...new Set(surfaces.map((surface) => surface.translation_group))].sort().map((groupId) => {
    const group = surfaces.filter((surface) => surface.translation_group === groupId);
    const issues: string[] = [];
    const languageToOwner = new Map(group.map((surface) => [surface.language_tag, surface.canonical_owner]));
    const expectedHreflang = [...languageToOwner.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const surface of group) {
      for (const [language, owner] of expectedHreflang) {
        const target = surface.hreflang.find((item) => item.language_tag === language);
        if (!target) issues.push(`${surface.surface_id}:missing_hreflang:${language}`);
        else if (target.canonical_owner !== owner) issues.push(`${surface.surface_id}:hreflang_owner_mismatch:${language}`);
      }
    }

    const baseline = group[0];
    const baselineClaims = claimMap(baseline);
    for (const surface of group.slice(1)) {
      if (!sameSet(surface.entity_ids, baseline.entity_ids)) issues.push(`${surface.surface_id}:entity_id_set_mismatch`);
      const currentClaims = claimMap(surface);
      if (!sameSet([...baselineClaims.keys()], [...currentClaims.keys()])) {
        issues.push(`${surface.surface_id}:claim_key_set_mismatch`);
      } else {
        for (const [claimKey, sourceKeys] of baselineClaims) {
          if (!sameSet(sourceKeys, currentClaims.get(claimKey) ?? [])) issues.push(`${surface.surface_id}:claim_source_parity_mismatch:${claimKey}`);
        }
      }
    }
    return {
      translationGroup: groupId,
      languageTags: group.map((surface) => surface.language_tag).sort(),
      issues: [...new Set(issues)].sort(),
      entityIdsConsistent: !issues.some((issue) => issue.includes("entity_id_set_mismatch")),
      claimSourceParity: !issues.some((issue) => issue.includes("claim_key_set_mismatch") || issue.includes("claim_source_parity_mismatch")),
      hreflangConsistent: !issues.some((issue) => issue.includes("hreflang")),
      ready: issues.length === 0,
    };
  });

  return {
    surfaces,
    surfaceAudits,
    groupAudits,
    localeOwnerConflicts: [...new Set(localeOwnerConflicts)].sort(),
    readyGroups: groupAudits.filter((group) => group.ready).map((group) => group.translationGroup),
    blockedGroups: groupAudits.filter((group) => !group.ready).map((group) => group.translationGroup),
  };
};
