import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { deleteExpiredRepairShopFeedback, ensureRepairShopFeedbackSchema } from "../_lib/repair-shop-feedback-schema.mjs";

type Env = { DB?: any };
type FeedbackInput = { category?: unknown; rating?: unknown; message?: unknown };
const CATEGORIES = new Set(["setup", "booking", "customers", "mobile", "other"]);
const RETENTION_DAYS = 180;

async function prepareFeedbackStore(db: any) {
  await ensureRepairShopFeedbackSchema(db);
  await deleteExpiredRepairShopFeedback(db);
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  await prepareFeedbackStore(env.DB);
  const result = await env.DB.prepare("SELECT id,category,rating,message,created_at,retention_until FROM repair_shop_feedback WHERE owner_specialist_id = ? ORDER BY created_at DESC LIMIT 20").bind(specialist.id).all();
  return jsonResponse(200, { success: true, feedback: result.results ?? [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  let body: FeedbackInput;
  try { body = (await request.json()) as FeedbackInput; } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  const category = String(body.category ?? "").trim().toLowerCase();
  const rating = Number(body.rating);
  const message = String(body.message ?? "").trim();
  if (!CATEGORIES.has(category)) return jsonResponse(400, { success: false, error: "invalid_feedback_category" });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonResponse(400, { success: false, error: "invalid_feedback_rating" });
  if (message.length < 10 || message.length > 2000) return jsonResponse(400, { success: false, error: "invalid_feedback_message" });
  await prepareFeedbackStore(env.DB);
  const createdAt = new Date();
  const retentionUntil = new Date(createdAt.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const feedback = { id: `feedback-${crypto.randomUUID()}`, category, rating, message, created_at: createdAt.toISOString(), retention_until: retentionUntil.toISOString() };
  await env.DB.prepare("INSERT INTO repair_shop_feedback (id,owner_specialist_id,category,rating,message,created_at,retention_until) VALUES (?,?,?,?,?,?,?)").bind(feedback.id, specialist.id, category, rating, message, feedback.created_at, feedback.retention_until).run();
  return jsonResponse(201, { success: true, feedback });
}
