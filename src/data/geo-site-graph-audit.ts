import {
  aiVisibilityPrompts,
  type AiVisibilityDirection,
} from "./ai-visibility-scorecard.ts";
import type { GeoPromptIntentOwnerConflict } from "./geo-answer-owner-audit.ts";
import { geoPromptOwnerRegistry } from "./geo-prompt-owner-registry.ts";
import { publicEntityRegistry } from "./public-entity-registry.ts";

export interface GeoFaqPair {
  question: string;
  answer: string;
}

export interface GeoHreflangReference {
  language: string;
  path: string;
}

export interface GeoSitePageSnapshot {
  path: string;
  canonicalPath: string;
  indexable: boolean;
  links: string[];
  webPagePaths: string[];
  schemaEntityIds: string[];
  serviceProviderIds: string[];
  faqVisible: GeoFaqPair[];
  faqSchema: GeoFaqPair[];
  breadcrumbPaths: string[];
  hreflang: GeoHreflangReference[];
}

export interface GeoSiteGraphAudit {
  missingDirectionHubLinks: Array<{
    direction: AiVisibilityDirection;
    hubPath: string;
    canonicalOwner: string;
  }>;
  supportingResourcesWithoutCommercialBacklink: Array<{
    resourcePath: string;
    direction: AiVisibilityDirection;
    eligibleCommercialOwners: string[];
  }>;
  orphanedCanonicalOwners: string[];
  competingOwnersLinkedTogether: Array<{
    pagePath: string;
    intentGroupKey: string;
    canonicalOwners: string[];
  }>;
  canonicalMismatches: Array<{ pagePath: string; canonicalPath: string }>;
  schemaOwnerMismatches: Array<{ pagePath: string; webPagePath: string }>;
  heldEntityPublicationLeaks: Array<{ pagePath: string; schemaEntityId: string }>;
  serviceProviderMismatches: Array<{ pagePath: string; providerId: string }>;
  faqParityMismatches: Array<{
    pagePath: string;
    schemaOnly: GeoFaqPair[];
    visibleOnly: GeoFaqPair[];
  }>;
  breadcrumbMismatches: Array<{ pagePath: string; breadcrumbLastPath: string | null }>;
  hreflangCanonicalMismatches: Array<{
    pagePath: string;
    language: string;
    targetPath: string;
    targetCanonicalPath: string | null;
  }>;
}

const directionHub: Record<AiVisibilityDirection, string> = {
  logistics: "/paths/logistics/",
  marketing: "/paths/marketing/",
  academy: "/paths/academy/",
  technology: "/paths/technology/",
};

const cleanPath = (value: string) => {
  if (!value.startsWith("/")) throw new Error(`GEO site graph path must be site-relative: ${value}`);
  const path = value.split("?")[0].split("#")[0];
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error(`Invalid site-relative path: ${value}`);
  return path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");
const faqKey = (pair: GeoFaqPair) => `${normalizeText(pair.question)}\u0000${normalizeText(pair.answer)}`;

const normalizeSnapshot = (snapshot: GeoSitePageSnapshot): GeoSitePageSnapshot => ({
  ...snapshot,
  path: cleanPath(snapshot.path),
  canonicalPath: cleanPath(snapshot.canonicalPath),
  links: [...new Set(snapshot.links.map(cleanPath))].sort(),
  webPagePaths: [...new Set(snapshot.webPagePaths.map(cleanPath))].sort(),
  schemaEntityIds: [...new Set(snapshot.schemaEntityIds)].sort(),
  serviceProviderIds: [...new Set(snapshot.serviceProviderIds)].sort(),
  faqVisible: [...snapshot.faqVisible]
    .map((item) => ({ question: normalizeText(item.question), answer: normalizeText(item.answer) }))
    .sort((left, right) => faqKey(left).localeCompare(faqKey(right))),
  faqSchema: [...snapshot.faqSchema]
    .map((item) => ({ question: normalizeText(item.question), answer: normalizeText(item.answer) }))
    .sort((left, right) => faqKey(left).localeCompare(faqKey(right))),
  breadcrumbPaths: snapshot.breadcrumbPaths.map(cleanPath),
  hreflang: snapshot.hreflang
    .map((item) => ({ language: item.language.trim(), path: cleanPath(item.path) }))
    .sort((left, right) => left.language.localeCompare(right.language) || left.path.localeCompare(right.path)),
});

const promptDirectionsByOwner = () => {
  const result = new Map<string, Set<AiVisibilityDirection>>();
  for (const prompt of aiVisibilityPrompts) {
    const current = result.get(prompt.canonicalOwner) ?? new Set<AiVisibilityDirection>();
    current.add(prompt.direction);
    result.set(prompt.canonicalOwner, current);
  }
  return result;
};

const commercialOwnersByDirection = () => {
  const result = new Map<AiVisibilityDirection, Set<string>>();
  for (const prompt of aiVisibilityPrompts.filter((item) => item.intent === "commercial")) {
    const current = result.get(prompt.direction) ?? new Set<string>();
    current.add(prompt.canonicalOwner);
    result.set(prompt.direction, current);
  }
  return result;
};

const isSupportingResource = (path: string) =>
  path.includes("/resources/") || path.startsWith("/resources/");

export const auditGeoSiteGraph = (
  snapshots: GeoSitePageSnapshot[],
  intentConflicts: GeoPromptIntentOwnerConflict[] = [],
): GeoSiteGraphAudit => {
  const pages = snapshots.map(normalizeSnapshot);
  const byPath = new Map(pages.map((page) => [page.path, page]));
  if (byPath.size !== pages.length) throw new Error("GEO site graph snapshots must use unique page paths");

  const owners = geoPromptOwnerRegistry.map((owner) => cleanPath(owner.canonicalOwner));
  const directionByOwner = promptDirectionsByOwner();
  const commercialByDirection = commercialOwnersByDirection();

  const missingDirectionHubLinks: GeoSiteGraphAudit["missingDirectionHubLinks"] = [];
  for (const prompt of aiVisibilityPrompts) {
    const owner = cleanPath(prompt.canonicalOwner);
    if (owner.startsWith("/demos/")) continue;
    const hubPath = directionHub[prompt.direction];
    const hub = byPath.get(hubPath);
    if (!hub || !hub.links.includes(owner)) {
      const exists = missingDirectionHubLinks.some(
        (item) => item.direction === prompt.direction && item.canonicalOwner === owner,
      );
      if (!exists) missingDirectionHubLinks.push({ direction: prompt.direction, hubPath, canonicalOwner: owner });
    }
  }

  const supportingResourcesWithoutCommercialBacklink: GeoSiteGraphAudit["supportingResourcesWithoutCommercialBacklink"] = [];
  for (const owner of owners.filter(isSupportingResource)) {
    const page = byPath.get(owner);
    if (!page) continue;
    const directions = directionByOwner.get(owner) ?? new Set<AiVisibilityDirection>();
    for (const direction of directions) {
      const eligibleCommercialOwners = [...(commercialByDirection.get(direction) ?? new Set<string>())]
        .map(cleanPath)
        .filter((candidate) => candidate !== owner)
        .sort();
      if (eligibleCommercialOwners.length === 0) continue;
      if (!eligibleCommercialOwners.some((candidate) => page.links.includes(candidate))) {
        supportingResourcesWithoutCommercialBacklink.push({
          resourcePath: owner,
          direction,
          eligibleCommercialOwners,
        });
      }
    }
  }

  const inbound = new Map<string, number>();
  for (const owner of owners) inbound.set(owner, 0);
  for (const page of pages.filter((item) => item.indexable)) {
    for (const link of page.links) {
      if (link !== page.path && inbound.has(link)) inbound.set(link, (inbound.get(link) ?? 0) + 1);
    }
  }
  const orphanedCanonicalOwners = [...inbound.entries()]
    .filter(([owner, count]) => !owner.startsWith("/demos/") && count === 0)
    .map(([owner]) => owner)
    .sort();

  const competingOwnersLinkedTogether: GeoSiteGraphAudit["competingOwnersLinkedTogether"] = [];
  for (const page of pages) {
    for (const conflict of intentConflicts) {
      const conflictOwners = conflict.canonicalOwners.map(cleanPath);
      const linkedOwners = conflictOwners.filter((owner) => page.links.includes(owner));
      if (linkedOwners.length > 1) {
        competingOwnersLinkedTogether.push({
          pagePath: page.path,
          intentGroupKey: conflict.intentGroupKey,
          canonicalOwners: linkedOwners.sort(),
        });
      }
    }
  }

  const canonicalMismatches = pages
    .filter((page) => page.indexable && page.path !== page.canonicalPath)
    .map((page) => ({ pagePath: page.path, canonicalPath: page.canonicalPath }));

  const schemaOwnerMismatches = pages.flatMap((page) =>
    page.webPagePaths
      .filter((webPagePath) => webPagePath !== page.canonicalPath)
      .map((webPagePath) => ({ pagePath: page.path, webPagePath })),
  );

  const heldEntityIds = new Set(
    Object.values(publicEntityRegistry)
      .filter((entity) => entity.schemaPublication === "hold")
      .map((entity) => entity.schemaId),
  );
  const approvedProviderIds = new Set(
    Object.values(publicEntityRegistry)
      .filter((entity) => entity.schemaPublication === "approved")
      .map((entity) => entity.schemaId),
  );

  const heldEntityPublicationLeaks = pages.flatMap((page) =>
    page.schemaEntityIds
      .filter((id) => heldEntityIds.has(id))
      .map((schemaEntityId) => ({ pagePath: page.path, schemaEntityId })),
  );
  const serviceProviderMismatches = pages.flatMap((page) =>
    page.serviceProviderIds
      .filter((providerId) => !approvedProviderIds.has(providerId))
      .map((providerId) => ({ pagePath: page.path, providerId })),
  );

  const faqParityMismatches: GeoSiteGraphAudit["faqParityMismatches"] = [];
  for (const page of pages) {
    const visible = new Map(page.faqVisible.map((item) => [faqKey(item), item]));
    const schema = new Map(page.faqSchema.map((item) => [faqKey(item), item]));
    const schemaOnly = [...schema.entries()].filter(([key]) => !visible.has(key)).map(([, item]) => item);
    const visibleOnly = [...visible.entries()].filter(([key]) => !schema.has(key)).map(([, item]) => item);
    if (schemaOnly.length || visibleOnly.length) {
      faqParityMismatches.push({ pagePath: page.path, schemaOnly, visibleOnly });
    }
  }

  const breadcrumbMismatches = pages
    .filter((page) => page.breadcrumbPaths.length > 0)
    .filter((page) => page.breadcrumbPaths.at(-1) !== page.canonicalPath)
    .map((page) => ({
      pagePath: page.path,
      breadcrumbLastPath: page.breadcrumbPaths.at(-1) ?? null,
    }));

  const hreflangCanonicalMismatches: GeoSiteGraphAudit["hreflangCanonicalMismatches"] = [];
  for (const page of pages) {
    for (const alternate of page.hreflang) {
      const target = byPath.get(alternate.path);
      if (!target || target.canonicalPath !== alternate.path) {
        hreflangCanonicalMismatches.push({
          pagePath: page.path,
          language: alternate.language,
          targetPath: alternate.path,
          targetCanonicalPath: target?.canonicalPath ?? null,
        });
      }
    }
  }

  return {
    missingDirectionHubLinks: missingDirectionHubLinks.sort(
      (left, right) => left.direction.localeCompare(right.direction) || left.canonicalOwner.localeCompare(right.canonicalOwner),
    ),
    supportingResourcesWithoutCommercialBacklink: supportingResourcesWithoutCommercialBacklink.sort(
      (left, right) => left.resourcePath.localeCompare(right.resourcePath) || left.direction.localeCompare(right.direction),
    ),
    orphanedCanonicalOwners,
    competingOwnersLinkedTogether: competingOwnersLinkedTogether.sort(
      (left, right) => left.pagePath.localeCompare(right.pagePath) || left.intentGroupKey.localeCompare(right.intentGroupKey),
    ),
    canonicalMismatches,
    schemaOwnerMismatches,
    heldEntityPublicationLeaks,
    serviceProviderMismatches,
    faqParityMismatches,
    breadcrumbMismatches,
    hreflangCanonicalMismatches,
  };
};
