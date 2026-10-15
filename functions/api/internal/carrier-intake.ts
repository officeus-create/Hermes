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
const PAGE_SIZE = 20;
const validCreatedAt = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));

// The opaque cursor contains a row boundary and its authorized query scope;
// it is not a bearer token. Owner authentication is always rechecked on each page.
function encodeCursor(row: { created_at: string; request_id: string }, classification: string, status: string) {
  return btoa(JSON.stringify({ v: 1, t: row.created_at, id: row.request_id, c: classification, s: status }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function decodeCursor(raw: string | null, classification: string, status: string) {
  if (raw === null) return null;
  if (!/^[A-Za-z0-9_-]{10,512}$/.test(raw)) return false;
  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(normalized));
    if (data.v !== 1 || data.c !== classification || data.s !== status ||
      typeof data.t !== "string" || !validCreatedAt(data.t) ||
      typeof data.id !== "string" || !validRequestId(data.id)) return false;
    return { created_at: data.t, request_id: data.id };
  } catch { return false; }
}

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
    const cursor = decodeCursor(url.searchParams.get("cursor"), requestedClassification, requestedStatus);
    if (cursor === false) return jsonResponse(400, { success: false, error: "invalid_cursor" }, PRIVATE);
    // Keyset paging prevents records beyond the first 20 from becoming invisible.
    // ORDER BY is deterministic on ties, and a 21st row proves a next page exists.
    const cursorClause = cursor
      ? "AND (created_at < ? OR (created_at = ? AND request_id < ?))" : "";
    const query = `
      SELECT request_id, classification, status, source_path, contact_email,
        created_at, retention_until, delivery_state
      FROM hermes_carrier_intake
      WHERE classification = ? AND status = ? AND retention_until > ?
      ${cursorClause}
      ORDER BY created_at DESC, request_id DESC LIMIT 21
    `;
    const args = cursor
      ? [requestedClassification, requestedStatus, now, cursor.created_at, cursor.created_at, cursor.request_id]
      : [requestedClassification, requestedStatus, now];
    const result = await env.DB.prepare(query).bind(...args).all();
    const matches = Array.isArray(result?.results) ? result.results : [];
    const rows = matches.slice(0, PAGE_SIZE);
    const hasMore = matches.length > PAGE_SIZE;
    // Body/contact phone and MC/USDOT never appear in list/aggregate output.
    // If new records arrive after the first page, refreshing starts from newest.
    return jsonResponse(200, {
      success: true,
      classification: requestedClassification,
      status: requestedStatus,
      requests: rows,
      max_page_size: PAGE_SIZE,
      partial: hasMore,
      next_cursor: hasMore && rows.length
        ? encodeCursor(rows[rows.length - 1], requestedClassification, requestedStatus)
        : null,
      all_are_real_leads: false,
      delivery_state: "not_sent",
      human_receipt_state: "unconfirmed",
      next_action: "Owner verifies authority, insurance, actual Sales eligibility and approved manual follow-up before marking anything qualified.",
    }, PRIVATE);
  } catch {
    return jsonResponse(503, { success: false, error: "intake_read_unavailable" }, PRIVATE);
  }
}
