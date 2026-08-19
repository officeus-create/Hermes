export type GeoDiscoveryNodeKind = "hub" | "commercial_owner" | "supporting_resource" | "case" | "intake" | "demo";

export interface GeoDiscoveryNode {
  path: string;
  kind: GeoDiscoveryNodeKind;
  indexable: boolean;
  links: string[];
  /** A page such as /paths/marketing/ can be a direction hub and also own the real intake section. */
  hasIntake?: boolean;
}

export interface GeoIntentOwnerRecord {
  intentKey: string;
  canonicalOwner: string;
  priority: "high" | "medium" | "low";
}

const clean = (value: string) => {
  if (!value.startsWith("/") || value.startsWith("//")) throw new Error(`Discovery path must be site-relative: ${value}`);
  const path = value.split("?")[0].split("#")[0];
  return path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
};

const normalizeGraph = (nodes: GeoDiscoveryNode[]) => {
  const normalized = nodes.map((node) => ({
    ...node,
    path: clean(node.path),
    links: [...new Set(node.links.map(clean))].sort(),
    hasIntake: Boolean(node.hasIntake || node.kind === "intake"),
  }));
  if (new Set(normalized.map((node) => node.path)).size !== normalized.length) throw new Error("Discovery graph paths must be unique");
  return normalized;
};

const shortestPath = (nodes: GeoDiscoveryNode[], start: string, predicate: (node: GeoDiscoveryNode) => boolean) => {
  const byPath = new Map(nodes.map((node) => [node.path, node]));
  const queue: Array<{ path: string; depth: number; route: string[] }> = [{ path: clean(start), depth: 0, route: [clean(start)] }];
  const visited = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!;
    if (visited.has(current.path)) continue;
    visited.add(current.path);
    const node = byPath.get(current.path);
    if (!node) continue;
    if (current.depth > 0 && predicate(node)) return current;
    for (const link of node.links) if (!visited.has(link)) queue.push({ path: link, depth: current.depth + 1, route: [...current.route, link] });
  }
  return null;
};

const isIntakeNode = (node: GeoDiscoveryNode) => node.kind === "intake" || node.hasIntake === true;

export const auditHighPriorityIntentOwnership = (nodes: GeoDiscoveryNode[], owners: GeoIntentOwnerRecord[]) => {
  const graph = normalizeGraph(nodes);
  const byPath = new Map(graph.map((node) => [node.path, node]));
  const high = owners.filter((item) => item.priority === "high");
  const byIntent = new Map<string, GeoIntentOwnerRecord[]>();
  for (const row of high) byIntent.set(row.intentKey, [...(byIntent.get(row.intentKey) ?? []), { ...row, canonicalOwner: clean(row.canonicalOwner) }]);
  const issues: string[] = [];
  for (const [intentKey, rows] of byIntent) {
    const uniqueOwners = [...new Set(rows.map((row) => row.canonicalOwner))];
    if (uniqueOwners.length !== 1) issues.push(`${intentKey}:expected_one_owner:${uniqueOwners.length}`);
    for (const owner of uniqueOwners) {
      const page = byPath.get(owner);
      if (!page) issues.push(`${intentKey}:owner_missing:${owner}`);
      else if (!page.indexable || page.kind !== "commercial_owner") issues.push(`${intentKey}:owner_not_searchable_commercial:${owner}`);
    }
  }
  return { ready: issues.length === 0, issues: issues.sort() };
};

export const auditDiscoveryJourneys = (nodes: GeoDiscoveryNode[], priorityOwners: string[], maxCommercialDepth = 3) => {
  const graph = normalizeGraph(nodes);
  const byPath = new Map(graph.map((node) => [node.path, node]));
  const hubs = graph.filter((node) => node.kind === "hub" && node.indexable);
  const commercialOwners = priorityOwners.map(clean);
  const deadEnds: string[] = [];
  const excessiveDepth: Array<{ hub: string; owner: string; depth: number | null }> = [];
  const transactionalDemoLeaks: Array<{ from: string; to: string }> = [];
  const authorityEdgeGaps: string[] = [];

  for (const ownerPath of commercialOwners) {
    const owner = byPath.get(ownerPath);
    if (!owner || owner.kind !== "commercial_owner") continue;
    const intake = shortestPath(graph, ownerPath, isIntakeNode);
    if (!intake) deadEnds.push(ownerPath);
    for (const hub of hubs) {
      if (hub.path === ownerPath) continue;
      const route = shortestPath(graph, hub.path, (node) => node.path === ownerPath);
      if (!route || route.depth > maxCommercialDepth) excessiveDepth.push({ hub: hub.path, owner: ownerPath, depth: route?.depth ?? null });
    }
  }

  for (const node of graph.filter((item) => item.kind === "commercial_owner" || isIntakeNode(item))) {
    for (const link of node.links) {
      const target = byPath.get(link);
      if (target && (target.kind === "demo" || !target.indexable) && node.kind === "commercial_owner") {
        transactionalDemoLeaks.push({ from: node.path, to: target.path });
      }
    }
  }

  for (const resource of graph.filter((node) => node.kind === "supporting_resource" || node.kind === "case")) {
    if (!resource.links.some((link) => byPath.get(link)?.kind === "commercial_owner")) authorityEdgeGaps.push(resource.path);
  }

  return {
    deadEnds: deadEnds.sort(),
    excessiveDepth: excessiveDepth.sort((a, b) => a.owner.localeCompare(b.owner) || a.hub.localeCompare(b.hub)),
    transactionalDemoLeaks: transactionalDemoLeaks.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    authorityEdgeGaps: authorityEdgeGaps.sort(),
    ready: deadEnds.length === 0 && excessiveDepth.length === 0 && transactionalDemoLeaks.length === 0 && authorityEdgeGaps.length === 0,
  };
};

export const auditDiscoveryHierarchy = (nodes: GeoDiscoveryNode[]) => {
  const graph = normalizeGraph(nodes);
  const byPath = new Map(graph.map((node) => [node.path, node]));
  const issues: string[] = [];
  for (const owner of graph.filter((node) => node.kind === "commercial_owner")) {
    const hasHubInbound = graph.some((node) => node.kind === "hub" && node.links.includes(owner.path));
    const hasSupportInbound = graph.some((node) => (node.kind === "supporting_resource" || node.kind === "case") && node.links.includes(owner.path));
    const hasIntakePath = Boolean(shortestPath(graph, owner.path, isIntakeNode));
    if (!hasHubInbound) issues.push(`${owner.path}:missing_hub_inbound`);
    if (!hasSupportInbound) issues.push(`${owner.path}:missing_supporting_authority_inbound`);
    if (!hasIntakePath) issues.push(`${owner.path}:missing_intake_path`);
  }
  for (const node of graph) for (const link of node.links) if (!byPath.has(link) && !link.startsWith("/external/")) issues.push(`${node.path}:unresolved_internal_link:${link}`);
  return { ready: issues.length === 0, issues: issues.sort() };
};

export interface GeoLinkOpportunityInput {
  from: string;
  to: string;
  evidenceClass: "platform_verified" | "owner_provided_handoff" | "repository_verified";
  searchImpressions: number | null;
  commercialPriority: "high" | "medium" | "low";
  evidenceGapSeverity: "none" | "low" | "medium" | "high";
  reason: string;
}

const commercialWeight = { high: 40, medium: 20, low: 5 } as const;
const evidenceWeight = { none: 0, low: 5, medium: 12, high: 25 } as const;
const provenanceWeight = { platform_verified: 20, owner_provided_handoff: 10, repository_verified: 5 } as const;

export const rankGeoLinkOpportunities = (inputs: GeoLinkOpportunityInput[]) => inputs.map((item) => {
  const impressions = item.searchImpressions ?? 0;
  const volume = Math.min(25, Math.log10(impressions + 1) * 10);
  return {
    ...item,
    from: clean(item.from),
    to: clean(item.to),
    priorityScore: Number((commercialWeight[item.commercialPriority] + evidenceWeight[item.evidenceGapSeverity] + provenanceWeight[item.evidenceClass] + volume).toFixed(2)),
    rankingLiftClaimAllowed: false as const,
  };
}).sort((a, b) => b.priorityScore - a.priorityScore || a.to.localeCompare(b.to));

export const compareGeoDiscoveryGraphs = (before: GeoDiscoveryNode[], after: GeoDiscoveryNode[], priorityOwners: string[]) => {
  const beforeAudit = auditDiscoveryJourneys(before, priorityOwners);
  const afterAudit = auditDiscoveryJourneys(after, priorityOwners);
  return {
    before: beforeAudit,
    after: afterAudit,
    changes: {
      deadEnds: afterAudit.deadEnds.length - beforeAudit.deadEnds.length,
      excessiveDepth: afterAudit.excessiveDepth.length - beforeAudit.excessiveDepth.length,
      transactionalDemoLeaks: afterAudit.transactionalDemoLeaks.length - beforeAudit.transactionalDemoLeaks.length,
      authorityEdgeGaps: afterAudit.authorityEdgeGaps.length - beforeAudit.authorityEdgeGaps.length,
    },
    rankingImpact: "not_inferred" as const,
    note: "Graph improvements prove internal discovery/architecture changes only; ranking lift requires separate comparable search evidence.",
  };
};
