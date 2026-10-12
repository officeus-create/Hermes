import { specialistHasInternalOwnerCapability } from "./load-board-market-posts.mjs";

export const REVIEW_ROLES = new Set(["carrier", "dispatcher", "dealer", "broker", "sources"]);
export const REVIEW_KINDS = new Set(["bug", "idea", "question", "ux"]);
export const REVIEW_HEADERS = Object.freeze({
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Vary": "Cookie",
});

export function safeReviewNote(input, limit=1300) {
  return String(input ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, limit);
}

export function sameOriginRoleReview(request) {
  const url=new URL(request.url);
  const origin=request.headers.get("Origin");
  return request.headers.get("Sec-Fetch-Site")!=="cross-site" &&
    (!origin || origin===url.origin);
}

export async function ensureLoadBoardReviewerSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_board_reviewers (
      specialist_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('active', 'revoked')),
      mailbox_ownership_verified INTEGER NOT NULL DEFAULT 0,
      granted_by_specialist_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_board_role_feedback (
      id TEXT PRIMARY KEY,
      reviewer_specialist_id TEXT NOT NULL,
      view_role TEXT NOT NULL CHECK(view_role IN ('carrier','dispatcher','dealer','broker','sources')),
      kind TEXT NOT NULL CHECK(kind IN ('bug','idea','question','ux')),
      author_label TEXT NOT NULL,
      review_note TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_load_board_role_feedback_role
    ON hermes_load_board_role_feedback(view_role, created_at DESC)
  `).run();
}

export async function roleReviewAccess(db, specialist) {
  if(!specialist) return { allowed:false, owner:false };
  const owner=await specialistHasInternalOwnerCapability(db,specialist.id);
  if(owner) return {allowed:true, owner:true};
  await ensureLoadBoardReviewerSchema(db);
  const row=await db.prepare(`
    SELECT status, mailbox_ownership_verified
    FROM hermes_load_board_reviewers WHERE specialist_id=? LIMIT 1
  `).bind(specialist.id).first();
  return {
    allowed:row?.status==="active" && Number(row.mailbox_ownership_verified)===1,
    owner:false,
  };
}
