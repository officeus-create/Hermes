import { hashPassword, isValidEmail, isValidPassword, createSessionToken, sessionExpiry, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB: any };

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const email = cleanText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const name = cleanText(body.name, 100);
  const role = cleanText(body.role, 120);
  const location = cleanText(body.location, 120);
  const bio = cleanText(body.bio, 500);

  const errors: string[] = [];
  if (!isValidEmail(email)) errors.push("email_invalid");
  if (!isValidPassword(password)) errors.push("password_too_short");
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (location.length < 2) errors.push("location_required");
  if (bio.length < 20) errors.push("bio_too_short");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const existing = await env.DB.prepare("SELECT id FROM specialists WHERE email = ?").bind(email).first();
  if (existing) return jsonResponse(409, { success: false, error: "email_already_registered" });

  const { hash, salt } = await hashPassword(password);
  const id = `specialist-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO specialists (id, email, password_hash, password_salt, name, role, location, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(id, email, hash, salt, name, role, location, bio, createdAt)
    .run();

  const token = createSessionToken();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, id, createdAt, expiresAt)
    .run();

  return jsonResponse(
    201,
    { success: true, specialist: { id, email, name, role, location, bio } },
    { "Set-Cookie": sessionCookieHeader(token) },
  );
}
