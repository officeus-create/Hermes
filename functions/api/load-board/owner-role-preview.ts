import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { roleReviewAccess } from "../_lib/load-board-role-review.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Vary": "Cookie" };

// Read-only owner preview. Never impersonates another user or grants their privileges.
// Live source metadata is provided only to an authenticated HERMES_INTERNAL_OWNER.
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, headers);
  const reviewAccess = await roleReviewAccess(env.DB,specialist);
  if (!reviewAccess.allowed) {
    return jsonResponse(403, { success: false, error: "role_review_access_required" }, headers);
  }
  const sourceRows = reviewAccess.owner ? await env.DB.prepare(`
    SELECT id, provider, source_name, source_type, read_enabled, ingest_enabled,
      redistribution_permission, contact_reveal_permission,
      trust_status, trust_tier, verification_kind, authority_identifier, trust_verified_at,
      status, last_successful_sync
    FROM hermes_load_sources ORDER BY updated_at DESC LIMIT 60
  `).all() : {results:[]};
  const sources = (sourceRows?.results || []).map((item: any) => ({
    id: String(item.id),
    provider: String(item.provider || "unidentified"),
    label: String(item.source_name || "Unnamed source"),
    type: String(item.source_type || "unclassified"),
    configured: true,
    sourceStatus: String(item.status || "unknown"),
    readEnabled: Number(item.read_enabled) === 1,
    ingestEnabled: Number(item.ingest_enabled) === 1,
    redistributionPermission: String(item.redistribution_permission || "internal_only"),
    contactRevealPermission: String(item.contact_reveal_permission || "hidden"),
    trustStatus: String(item.trust_status || "review_required"),
    trustTier: Number(item.trust_tier || 3),
    verificationKind: item.verification_kind || null,
    authorityIdentifierRecorded: Boolean(item.authority_identifier),
    trustVerifiedAt: item.trust_verified_at || null,
    lastSuccessfulSync: item.last_successful_sync || null,
    // A registered source is not proof of OAuth/API entitlement or current freight inventory.
    liveConnectionVerified: false,
  }));
  return jsonResponse(200, {
    success: true,
    mode: reviewAccess.owner ? "OWNER_READ_ONLY_ROLE_PREVIEW" : "REVIEWER_READ_ONLY_ROLE_PREVIEW",
    ownerAccess:reviewAccess.owner,sourceRegistryRestricted:!reviewAccess.owner,
    actor: { name: String(specialist.name || "Hermes reviewer"), email: String(specialist.email || "") },
    roleSwitchGrantsPermissions: false, realCustomerRecordsIncluded: false,
    messagesSent: false, bookingsCreated: false,
    views: [
      { id: "carrier", title: "Carrier", implemented: true, href: "/services/hermes-connect/load-board/carrier/" },
      { id: "dispatcher", title: "Dispatcher", implemented: true, href: "/services/hermes-connect/load-board/dispatcher/" },
      { id: "dealer", title: "Dealer / Shipper", implemented: true, href: "/services/hermes-connect/load-board/partners/" },
      { id: "broker", title: "Broker", implemented: false, href: "/load-board/" },
    ],
    sources,
    caveat: "Role panels are non-operational illustrations. Reviewers cannot read the source registry, operational workspaces or private contact details. A source row is not proof that freight was received.",
  }, headers);
}
