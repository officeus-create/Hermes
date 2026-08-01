export type ProvenanceIdentityKind = "shipment" | "offer" | "source";

export function normalizeProvenanceIdentity(value: string): string {
  return value.trim().toLowerCase();
}

export function createProvenanceIdentityKey(kind: ProvenanceIdentityKind, value: string): string {
  const normalized = normalizeProvenanceIdentity(value);
  if (!normalized) throw new Error("Provenance identity value is required");
  return `${kind}:${normalized}`;
}
