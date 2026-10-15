import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };
const PRIVATE = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
const STATES = new Set(["new", "reviewed", "qualified", "closed"]);
const CLASSIFICATIONS = new Set(["commercial", "qa"]);
const validRequestId = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);

// Private Hermes INTERNAL OWNER read-only triage, using the existing verified
// server-side Hermes Connect session + persisted capability. Not a public CRM
// or a shared Sales-wide privilege; delegation requires a separate owner gate.
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const authorized = await requireInternalOwner(request, env);
  if (authorized.response) return authorized.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_unavailable" }, PRIVATE);

  const url = new URL(request.url);
  const now = new Date().toISOString();
  const id = url.searchParams.get("request_id");
  try {
    if (id !== null) {
      if (!validRequestId(id)) return jsonResponse(400, { success: false, error: "invalid_request_id" }, PRIVATE);
      const row = await env.DB.prepare(`
        SELECT request_id, classification, status, source_path, contact_email,
          email_body, created_at, retention_until, delivery_state
        FROM hermes_carrier_intake
        WHERE request_id = ? AND retention_until > ? LIMIT 1
      `).bind(id, now).first();
      if (!row) return jsonResponse(404, { success: false, error: "request_not_found" }, PRIVATE);
      return jsonResponse(200, {
        success: true,
        request: row,
        is_customer_proven: row.classification === "commercial" ? "not_verified" : "synthetic_qa",
        delivery_state: "not_sent",
        human_receipt_state: "unconfirmed",
        boundary: "Owner-only private intake review. No email, dispatcher or Telegram contact; no authorization to assign a carrier, book a load or claim revenue.",
      }, PRIVATE);
    }

    const requestedClassification = url.searchParams.get("classification") || "commercial";
    if (!CLASSIFICATIONS.has(requestedClassification)) {
      return jsonResponse(400, { success: false, error: "invalid_classification" }, PRIVATE);
    }
    const requestedStatus = url.searchParams.get("status") || "new";
    if (!STATES.has(requestedStatus)) return jsonResponse(400, { success: false, error: "invalid_status" }, PRIVATE);
    const rows = await env.DB.prepare(`
      SELECT request_id, classification, status, source_path, contact_email,
        created_at, retention_until, delivery_state
      FROM hermes_carrier_intake
      WHERE classification = ? AND status = ? AND retention_until > ?
      ORDER BY created_at ASC LIMIT 20
    `).bind(requestedClassification, requestedStatus, now).all();
    // Body/contact phone and MC/USDOT never appear in list/aggregate output.
    return jsonResponse(200, {
      success: true,
      classification: requestedClassification,
      status: requestedStatus,
      requests: Array.isArray(rows?.results) ? rows.results : [],
      max_page_size: 20,
      partial: Array.isArray(rows?.results) && rows.results.length === 20,
      all_are_real_leads: false,
      delivery_state: "not_sent",
      human_receipt_state: "unconfirmed",
      next_action: "Owner verifies authority, insurance, actual Sales eligibility and approved manual follow-up before marking anything qualified.",
    }, PRIVATE);
  } catch {
    return jsonResponse(503, { success: false, error: "intake_read_unavailable" }, PRIVATE);
  }
}
