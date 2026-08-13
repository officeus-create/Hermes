var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-anXSgK/functionsWorker-0.841806535599372.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res, err) => /* @__PURE__ */ __name(function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var auth_exports = {};
__export(auth_exports, {
  createSessionToken: /* @__PURE__ */ __name(() => createSessionToken, "createSessionToken"),
  hashPassword: /* @__PURE__ */ __name(() => hashPassword, "hashPassword"),
  isSessionExpired: /* @__PURE__ */ __name(() => isSessionExpired, "isSessionExpired"),
  isValidEmail: /* @__PURE__ */ __name(() => isValidEmail, "isValidEmail"),
  isValidPassword: /* @__PURE__ */ __name(() => isValidPassword, "isValidPassword"),
  parseCookies: /* @__PURE__ */ __name(() => parseCookies, "parseCookies"),
  sessionCookieHeader: /* @__PURE__ */ __name(() => sessionCookieHeader, "sessionCookieHeader"),
  sessionExpiry: /* @__PURE__ */ __name(() => sessionExpiry, "sessionExpiry"),
  toHex: /* @__PURE__ */ __name(() => toHex, "toHex"),
  verifyPassword: /* @__PURE__ */ __name(() => verifyPassword, "verifyPassword"),
  verifyTelegramAuth: /* @__PURE__ */ __name(() => verifyTelegramAuth, "verifyTelegramAuth")
});
function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(toHex, "toHex");
function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
__name(fromHex, "fromHex");
async function deriveKey(password, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits"
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_BYTES * 8
  );
  return toHex(bits);
}
__name(deriveKey, "deriveKey");
function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
__name(isValidEmail, "isValidEmail");
function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 200;
}
__name(isValidPassword, "isValidPassword");
async function hashPassword(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const salt = toHex(saltBytes);
  const hash = await deriveKey(password, saltBytes);
  return { hash, salt };
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, salt, expectedHash) {
  const candidate = await deriveKey(password, fromHex(salt));
  if (candidate.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    mismatch |= candidate.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
__name(verifyPassword, "verifyPassword");
function createSessionToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
}
__name(createSessionToken, "createSessionToken");
function sessionExpiry(now = /* @__PURE__ */ new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS).toISOString();
}
__name(sessionExpiry, "sessionExpiry");
function isSessionExpired(expiresAtIso, now = /* @__PURE__ */ new Date()) {
  return new Date(expiresAtIso).getTime() <= now.getTime();
}
__name(isSessionExpired, "isSessionExpired");
async function hmacSha256Hex(keyBytes, message) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(signature);
}
__name(hmacSha256Hex, "hmacSha256Hex");
async function verifyTelegramAuth(data, botToken) {
  if (!data || typeof data.hash !== "string" || !botToken) return false;
  const { hash, ...fields } = data;
  const checkString = Object.keys(fields).filter((key) => fields[key] !== void 0 && fields[key] !== null && fields[key] !== "").sort().map((key) => `${key}=${fields[key]}`).join("\n");
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const computedHash = await hmacSha256Hex(new Uint8Array(secretKey), checkString);
  if (computedHash.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedHash.length; i += 1) mismatch |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
  if (mismatch !== 0) return false;
  const authDate = Number(fields.auth_date);
  if (!Number.isFinite(authDate)) return false;
  const ageSeconds = Date.now() / 1e3 - authDate;
  return ageSeconds >= -60 && ageSeconds <= TELEGRAM_AUTH_MAX_AGE_SECONDS;
}
__name(verifyTelegramAuth, "verifyTelegramAuth");
function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}
__name(parseCookies, "parseCookies");
function sessionCookieHeader(token, { maxAgeSeconds = 7 * 24 * 60 * 60, clear = false } = {}) {
  const parts = [
    `hermes_session=${clear ? "" : token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${maxAgeSeconds}`
  ];
  return parts.join("; ");
}
__name(sessionCookieHeader, "sessionCookieHeader");
var PBKDF2_ITERATIONS;
var SALT_BYTES;
var HASH_BYTES;
var SESSION_BYTES;
var SESSION_TTL_MS;
var TELEGRAM_AUTH_MAX_AGE_SECONDS;
var init_auth = __esm({
  "../src/auth.mjs"() {
    init_functionsRoutes_0_38791969161777384();
    PBKDF2_ITERATIONS = 1e5;
    SALT_BYTES = 16;
    HASH_BYTES = 32;
    SESSION_BYTES = 32;
    SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
    __name2(toHex, "toHex");
    __name2(fromHex, "fromHex");
    __name2(deriveKey, "deriveKey");
    __name2(isValidEmail, "isValidEmail");
    __name2(isValidPassword, "isValidPassword");
    __name2(hashPassword, "hashPassword");
    __name2(verifyPassword, "verifyPassword");
    __name2(createSessionToken, "createSessionToken");
    __name2(sessionExpiry, "sessionExpiry");
    __name2(isSessionExpired, "isSessionExpired");
    TELEGRAM_AUTH_MAX_AGE_SECONDS = 24 * 60 * 60;
    __name2(hmacSha256Hex, "hmacSha256Hex");
    __name2(verifyTelegramAuth, "verifyTelegramAuth");
    __name2(parseCookies, "parseCookies");
    __name2(sessionCookieHeader, "sessionCookieHeader");
  }
});
async function getAuthenticatedSpecialist(request, db) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies.hermes_session;
  if (!token) return null;
  const session = await db.prepare("SELECT specialist_id, expires_at FROM sessions WHERE token = ?").bind(token).first();
  if (!session) return null;
  if (isSessionExpired(session.expires_at)) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }
  const specialist = await db.prepare("SELECT id, email, name, role, location, bio FROM specialists WHERE id = ?").bind(session.specialist_id).first();
  return specialist || null;
}
__name(getAuthenticatedSpecialist, "getAuthenticatedSpecialist");
function jsonResponse(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders }
  });
}
__name(jsonResponse, "jsonResponse");
var init_session = __esm({
  "api/_lib/session.mjs"() {
    init_functionsRoutes_0_38791969161777384();
    init_auth();
    __name2(getAuthenticatedSpecialist, "getAuthenticatedSpecialist");
    __name2(jsonResponse, "jsonResponse");
  }
});
async function findBooking(token, db) {
  return db.prepare(
    `SELECT b.id, b.status, b.slot, b.client_name, b.created_at,
              b.contact_method, b.contact_handle, b.booking_type, b.meeting_topic, b.meeting_link,
              sp.name as specialist_name, sv.name as service_name, sv.duration_minutes
       FROM bookings b
       JOIN specialists sp ON sp.id = b.specialist_id
       JOIN services sv ON sv.id = b.service_id
       WHERE b.access_token = ?`
  ).bind(token).first();
}
__name(findBooking, "findBooking");
function toPublicShape(row) {
  return {
    id: row.id,
    status: row.status,
    specialist: row.specialist_name,
    service: row.service_name,
    durationMinutes: row.duration_minutes,
    time: row.slot,
    clientName: row.client_name,
    createdAt: row.created_at,
    contactMethod: row.contact_method,
    contactHandle: row.contact_handle,
    bookingType: row.booking_type,
    meetingTopic: row.meeting_topic,
    meetingLink: row.meeting_link
  };
}
__name(toPublicShape, "toPublicShape");
async function onRequestGet({ params, env }) {
  const token = String(params.token || "").slice(0, 80);
  const row = await findBooking(token, env.DB);
  if (!row) return jsonResponse(404, { success: false, error: "booking_not_found" });
  return jsonResponse(200, { success: true, booking: toPublicShape(row) });
}
__name(onRequestGet, "onRequestGet");
async function onRequestPatch({ request, params, env }) {
  const token = String(params.token || "").slice(0, 80);
  let body = {};
  try {
    body = await request.json();
  } catch {
  }
  if (body.action !== "cancel") return jsonResponse(400, { success: false, error: "unsupported_action" });
  const row = await findBooking(token, env.DB);
  if (!row) return jsonResponse(404, { success: false, error: "booking_not_found" });
  if (row.status === "cancelled") return jsonResponse(200, { success: true, booking: toPublicShape(row) });
  await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE access_token = ?").bind(token).run();
  const updated = await findBooking(token, env.DB);
  return jsonResponse(200, { success: true, booking: toPublicShape(updated) });
}
__name(onRequestPatch, "onRequestPatch");
var init_token = __esm({
  "api/public/booking/[token].ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(findBooking, "findBooking");
    __name2(toPublicShape, "toPublicShape");
    __name2(onRequestGet, "onRequestGet");
    __name2(onRequestPatch, "onRequestPatch");
  }
});
async function onRequestGet2({ params, env }) {
  const specialistId = String(params.id || "").slice(0, 120);
  const specialist = await env.DB.prepare("SELECT id, name, role, location, bio FROM specialists WHERE id = ?").bind(specialistId).first();
  if (!specialist) return jsonResponse(404, { success: false, error: "specialist_not_found" });
  const services = await env.DB.prepare(
    "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN specialist_services ss ON ss.service_id = s.id WHERE ss.specialist_id = ?"
  ).bind(specialistId).all();
  const availability = await env.DB.prepare(
    "SELECT sa.slot FROM specialist_availability sa WHERE sa.specialist_id = ? AND sa.slot NOT IN (SELECT slot FROM bookings WHERE specialist_id = ? AND status != 'cancelled')"
  ).bind(specialistId, specialistId).all();
  const staffRows = await env.DB.prepare("SELECT id, name, role FROM staff_members WHERE specialist_id = ? ORDER BY created_at ASC").bind(specialistId).all();
  const staff = await Promise.all(
    (staffRows.results ?? []).map(async (row) => {
      const staffServices = await env.DB.prepare(
        "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN staff_services ss ON ss.service_id = s.id WHERE ss.staff_id = ?"
      ).bind(row.id).all();
      const staffAvailability = await env.DB.prepare(
        "SELECT slot FROM staff_availability WHERE staff_id = ? AND slot NOT IN (SELECT slot FROM bookings WHERE staff_id = ? AND status != 'cancelled')"
      ).bind(row.id, row.id).all();
      return {
        id: row.id,
        name: row.name,
        role: row.role,
        services: staffServices.results ?? [],
        availability: (staffAvailability.results ?? []).map((r) => r.slot)
      };
    })
  );
  return jsonResponse(200, {
    success: true,
    specialist: {
      id: specialist.id,
      name: specialist.name,
      role: specialist.role,
      location: specialist.location,
      bio: specialist.bio,
      services: services.results ?? [],
      availability: (availability.results ?? []).map((row) => row.slot),
      staff
    }
  });
}
__name(onRequestGet2, "onRequestGet2");
var init_id = __esm({
  "api/public/specialist/[id].ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(onRequestGet2, "onRequestGet");
  }
});
async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidEmail(email) || !password) return jsonResponse(400, { success: false, error: "invalid_credentials" });
  const record = await env.DB.prepare("SELECT id, password_hash, password_salt FROM specialists WHERE email = ?").bind(email).first();
  if (!record || !await verifyPassword(password, record.password_salt, record.password_hash)) {
    return jsonResponse(401, { success: false, error: "invalid_credentials" });
  }
  const token = createSessionToken();
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(token, record.id, createdAt, expiresAt).run();
  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader(token) });
}
__name(onRequestPost, "onRequestPost");
var init_login = __esm({
  "api/auth/login.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_auth();
    init_session();
    __name2(onRequestPost, "onRequestPost");
  }
});
async function onRequestPost2({ request, env }) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies.hermes_session;
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }
  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader("", { clear: true }) });
}
__name(onRequestPost2, "onRequestPost2");
var init_logout = __esm({
  "api/auth/logout.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_auth();
    init_session();
    __name2(onRequestPost2, "onRequestPost");
  }
});
async function onRequestGet3({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  return jsonResponse(200, { success: true, specialist });
}
__name(onRequestGet3, "onRequestGet3");
var init_me = __esm({
  "api/auth/me.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(onRequestGet3, "onRequestGet");
  }
});
async function onRequestPost3({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const email = cleanText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const name = cleanText(body.name, 100);
  const role = cleanText(body.role, 120);
  const location = cleanText(body.location, 120);
  const bio = cleanText(body.bio, 500);
  const errors = [];
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
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO specialists (id, email, password_hash, password_salt, name, role, location, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, email, hash, salt, name, role, location, bio, createdAt).run();
  const token = createSessionToken();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(token, id, createdAt, expiresAt).run();
  return jsonResponse(
    201,
    { success: true, specialist: { id, email, name, role, location, bio } },
    { "Set-Cookie": sessionCookieHeader(token) }
  );
}
__name(onRequestPost3, "onRequestPost3");
var CONTROL_CHARS;
var cleanText;
var init_register = __esm({
  "api/auth/register.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_auth();
    init_session();
    CONTROL_CHARS = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max), "cleanText");
    __name2(onRequestPost3, "onRequestPost");
  }
});
async function onRequestPost4({ request, env }) {
  if (!env.TELEGRAM_BOT_TOKEN) return jsonResponse(500, { success: false, error: "telegram_login_not_configured" });
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const telegramId = String(payload.id ?? "").trim();
  if (!telegramId) return jsonResponse(400, { success: false, error: "missing_telegram_id" });
  const ok = await verifyTelegramAuth(payload, env.TELEGRAM_BOT_TOKEN);
  if (!ok) return jsonResponse(401, { success: false, error: "invalid_telegram_signature" });
  let specialist = await env.DB.prepare("SELECT id FROM specialists WHERE telegram_id = ?").bind(telegramId).first();
  if (!specialist) {
    const name = [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim() || (payload.username ? `@${payload.username}` : "Specialist");
    const id = `specialist-${crypto.randomUUID()}`;
    const email = `telegram-${telegramId}@users.hermesconnect.app`;
    const { hash, salt } = await hashRandomPassword();
    const createdAt2 = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      "INSERT INTO specialists (id, email, password_hash, password_salt, name, role, location, bio, created_at, telegram_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, email, hash, salt, name, "Specialist", "", "Signed up with Telegram \u2014 edit your profile to add details.", createdAt2, telegramId).run();
    specialist = { id };
  }
  const token = createSessionToken();
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(token, specialist.id, createdAt, expiresAt).run();
  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader(token) });
}
__name(onRequestPost4, "onRequestPost4");
async function hashRandomPassword() {
  const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
  const random = crypto.randomUUID() + crypto.randomUUID();
  return hashPassword2(random);
}
__name(hashRandomPassword, "hashRandomPassword");
var init_telegram = __esm({
  "api/auth/telegram.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_auth();
    init_session();
    __name2(onRequestPost4, "onRequestPost");
    __name2(hashRandomPassword, "hashRandomPassword");
  }
});
function isValidContactMethod(value) {
  return CONTACT_METHOD_IDS.has(value);
}
__name(isValidContactMethod, "isValidContactMethod");
var CONTACT_METHODS;
var CONTACT_METHOD_IDS;
var init_contact_method = __esm({
  "../src/contact-method.mjs"() {
    init_functionsRoutes_0_38791969161777384();
    CONTACT_METHODS = [
      { id: "whatsapp", label: "WhatsApp" },
      { id: "telegram", label: "Telegram" },
      { id: "instagram", label: "Instagram" }
    ];
    CONTACT_METHOD_IDS = new Set(CONTACT_METHODS.map((method) => method.id));
    __name2(isValidContactMethod, "isValidContactMethod");
  }
});
async function onRequestPost5({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const specialistId = cleanText2(body.specialistId, 120);
  const staffId = cleanText2(body.staffId, 80);
  const serviceId = cleanText2(body.serviceId, 60);
  const slot = cleanText2(body.slot, 60);
  const clientName = cleanText2(body.clientName, 100);
  const clientEmail = cleanText2(body.clientEmail, 160).toLowerCase();
  const contactMethod = cleanText2(body.contactMethod, 20);
  const contactHandle = cleanText2(body.contactHandle, 100);
  const errors = [];
  if (!specialistId) errors.push("specialist_required");
  if (!serviceId || !slot) errors.push("service_and_slot_required");
  if (clientName.length < 2) errors.push("name_required");
  if (!isValidEmail2(clientEmail)) errors.push("email_invalid");
  if (!isValidContactMethod(contactMethod)) errors.push("contact_method_invalid");
  if (contactHandle.length < 2) errors.push("contact_handle_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });
  const specialist = await env.DB.prepare("SELECT id, name FROM specialists WHERE id = ?").bind(specialistId).first();
  if (!specialist) return jsonResponse(404, { success: false, error: "specialist_not_found" });
  let staffName = null;
  if (staffId) {
    const staff = await env.DB.prepare("SELECT id, name FROM staff_members WHERE id = ? AND specialist_id = ?").bind(staffId, specialistId).first();
    if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });
    staffName = staff.name;
  }
  const ownsService = await env.DB.prepare(
    staffId ? "SELECT 1 FROM staff_services WHERE staff_id = ? AND service_id = ?" : "SELECT 1 FROM specialist_services WHERE specialist_id = ? AND service_id = ?"
  ).bind(staffId || specialistId, serviceId).first();
  if (!ownsService) return jsonResponse(400, { success: false, error: "service_not_offered" });
  const ownsSlot = await env.DB.prepare(
    staffId ? "SELECT 1 FROM staff_availability WHERE staff_id = ? AND slot = ?" : "SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?"
  ).bind(staffId || specialistId, slot).first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });
  const alreadyBooked = await env.DB.prepare(
    staffId ? "SELECT 1 FROM bookings WHERE staff_id = ? AND slot = ? AND status != 'cancelled'" : "SELECT 1 FROM bookings WHERE specialist_id = ? AND slot = ? AND status != 'cancelled'"
  ).bind(staffId || specialistId, slot).first();
  if (alreadyBooked) return jsonResponse(409, { success: false, error: "slot_already_booked" });
  const service = await env.DB.prepare("SELECT name, duration_minutes as durationMinutes FROM services WHERE id = ?").bind(serviceId).first();
  const id = `BOOK-${crypto.randomUUID().slice(0, 8)}`;
  const accessToken = crypto.randomUUID().replace(/-/g, "");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO bookings (id, specialist_id, staff_id, service_id, slot, status, client_name, client_email, contact_method, contact_handle, booking_type, access_token, created_at) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'appointment', ?, ?)"
  ).bind(id, specialistId, staffId || null, serviceId, slot, clientName, clientEmail, contactMethod, contactHandle, accessToken, createdAt).run();
  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      status: "confirmed",
      specialist: staffName ?? specialist.name,
      service: service?.name ?? serviceId,
      durationMinutes: service?.durationMinutes ?? null,
      time: slot,
      clientName,
      contactMethod,
      contactHandle,
      accessToken,
      mode: "simulation",
      calendarEventCreated: false,
      paymentCreated: false,
      messageSent: false
    }
  });
}
__name(onRequestPost5, "onRequestPost5");
var CONTROL_CHARS2;
var cleanText2;
var isValidEmail2;
var init_booking = __esm({
  "api/public/booking/index.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    init_contact_method();
    CONTROL_CHARS2 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText2 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS2, "").trim().slice(0, max), "cleanText");
    isValidEmail2 = /* @__PURE__ */ __name2((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "isValidEmail");
    __name2(onRequestPost5, "onRequestPost");
  }
});
async function onRequestPost6({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const specialistId = cleanText3(body.specialistId, 120);
  const staffId = cleanText3(body.staffId, 80);
  const slot = cleanText3(body.slot, 60);
  const meetingTopic = cleanText3(body.meetingTopic, 300);
  const clientName = cleanText3(body.clientName, 100);
  const clientEmail = cleanText3(body.clientEmail, 160).toLowerCase();
  const contactMethod = cleanText3(body.contactMethod, 20);
  const contactHandle = cleanText3(body.contactHandle, 100);
  const errors = [];
  if (!specialistId) errors.push("specialist_required");
  if (!slot) errors.push("slot_required");
  if (meetingTopic.length < 3) errors.push("topic_required");
  if (clientName.length < 2) errors.push("name_required");
  if (!isValidEmail3(clientEmail)) errors.push("email_invalid");
  if (!isValidContactMethod(contactMethod)) errors.push("contact_method_invalid");
  if (contactHandle.length < 2) errors.push("contact_handle_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });
  const specialist = await env.DB.prepare("SELECT id, name FROM specialists WHERE id = ?").bind(specialistId).first();
  if (!specialist) return jsonResponse(404, { success: false, error: "specialist_not_found" });
  let staffName = null;
  if (staffId) {
    const staff = await env.DB.prepare("SELECT id, name FROM staff_members WHERE id = ? AND specialist_id = ?").bind(staffId, specialistId).first();
    if (!staff) return jsonResponse(404, { success: false, error: "staff_not_found" });
    staffName = staff.name;
  }
  const ownsSlot = await env.DB.prepare(
    staffId ? "SELECT 1 FROM staff_availability WHERE staff_id = ? AND slot = ?" : "SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?"
  ).bind(staffId || specialistId, slot).first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });
  const alreadyBooked = await env.DB.prepare(
    staffId ? "SELECT 1 FROM bookings WHERE staff_id = ? AND slot = ? AND status != 'cancelled'" : "SELECT 1 FROM bookings WHERE specialist_id = ? AND slot = ? AND status != 'cancelled'"
  ).bind(staffId || specialistId, slot).first();
  if (alreadyBooked) return jsonResponse(409, { success: false, error: "slot_already_booked" });
  const isReturningClient = await env.DB.prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND client_email = ? AND status = 'confirmed' LIMIT 1").bind(specialistId, clientEmail).first();
  const status = isReturningClient ? "confirmed" : "pending_approval";
  const id = `MEET-${crypto.randomUUID().slice(0, 8)}`;
  const accessToken = crypto.randomUUID().replace(/-/g, "");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO bookings
       (id, specialist_id, staff_id, service_id, slot, status, client_name, client_email, contact_method, contact_handle, booking_type, meeting_topic, access_token, created_at)
     VALUES (?, ?, ?, 'personal-meeting', ?, ?, ?, ?, ?, ?, 'meeting', ?, ?, ?)`
  ).bind(id, specialistId, staffId || null, slot, status, clientName, clientEmail, contactMethod, contactHandle, meetingTopic, accessToken, createdAt).run();
  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      status,
      specialist: staffName ?? specialist.name,
      time: slot,
      clientName,
      meetingTopic,
      contactMethod,
      contactHandle,
      accessToken,
      mode: "simulation",
      calendarEventCreated: false,
      paymentCreated: false,
      messageSent: false
    }
  });
}
__name(onRequestPost6, "onRequestPost6");
var CONTROL_CHARS3;
var cleanText3;
var isValidEmail3;
var init_meeting = __esm({
  "api/public/meeting/index.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    init_contact_method();
    CONTROL_CHARS3 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText3 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS3, "").trim().slice(0, max), "cleanText");
    isValidEmail3 = /* @__PURE__ */ __name2((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "isValidEmail");
    __name2(onRequestPost6, "onRequestPost");
  }
});
async function onRequestPatch2({ request, params, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const id = String(params.id || "").slice(0, 80);
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const action = body.action;
  if (action !== "confirm" && action !== "decline") {
    return jsonResponse(400, { success: false, error: "unsupported_action" });
  }
  const booking = await env.DB.prepare("SELECT id, specialist_id, booking_type, status FROM bookings WHERE id = ?").bind(id).first();
  if (!booking || booking.specialist_id !== specialist.id) return jsonResponse(404, { success: false, error: "booking_not_found" });
  if (booking.booking_type !== "meeting") return jsonResponse(400, { success: false, error: "not_a_meeting" });
  if (action === "decline") {
    if (booking.status !== "pending_approval") return jsonResponse(400, { success: false, error: "not_pending" });
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id).run();
  } else {
    if (booking.status === "cancelled") return jsonResponse(400, { success: false, error: "already_cancelled" });
    const meetingLink = cleanText4(body.meetingLink, 300);
    await env.DB.prepare("UPDATE bookings SET status = 'confirmed', meeting_link = COALESCE(NULLIF(?, ''), meeting_link) WHERE id = ?").bind(meetingLink, id).run();
  }
  const updated = await env.DB.prepare(
    `SELECT id, slot, status, created_at as createdAt, client_name as clientName, client_email as clientEmail,
              contact_method as contactMethod, contact_handle as contactHandle,
              booking_type as bookingType, meeting_topic as meetingTopic, meeting_link as meetingLink
       FROM bookings WHERE id = ?`
  ).bind(id).first();
  return jsonResponse(200, { success: true, booking: updated });
}
__name(onRequestPatch2, "onRequestPatch2");
var CONTROL_CHARS4;
var cleanText4;
var init_id2 = __esm({
  "api/booking/[id].ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    CONTROL_CHARS4 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText4 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS4, "").trim().slice(0, max), "cleanText");
    __name2(onRequestPatch2, "onRequestPatch");
  }
});
async function onRequestPut({ request, params, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const email = decodeURIComponent(String(params.email || "")).toLowerCase().slice(0, 160);
  if (!email) return jsonResponse(400, { success: false, error: "email_required" });
  const ownsClient = await env.DB.prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND client_email = ? LIMIT 1").bind(specialist.id, email).first();
  if (!ownsClient) return jsonResponse(404, { success: false, error: "client_not_found" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const note = cleanText5(body.note, 1e3);
  const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO client_notes (specialist_id, client_email, note, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(specialist_id, client_email) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at`
  ).bind(specialist.id, email, note, updatedAt).run();
  return jsonResponse(200, { success: true, note, updatedAt });
}
__name(onRequestPut, "onRequestPut");
var CONTROL_CHARS5;
var cleanText5;
var init_email = __esm({
  "api/clients/[email].ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    CONTROL_CHARS5 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText5 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS5, "").trim().slice(0, max), "cleanText");
    __name2(onRequestPut, "onRequestPut");
  }
});
async function assertOwnership(staffId, specialistId, db) {
  const row = await db.prepare("SELECT id FROM staff_members WHERE id = ? AND specialist_id = ?").bind(staffId, specialistId).first();
  return !!row;
}
__name(assertOwnership, "assertOwnership");
async function onRequestPut2({ request, params, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const staffId = String(params.id || "").slice(0, 80);
  if (!await assertOwnership(staffId, specialist.id, env.DB)) return jsonResponse(404, { success: false, error: "staff_not_found" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const name = cleanText6(body.name, 100);
  const role = cleanText6(body.role, 120);
  const serviceIds = unique(Array.isArray(body.serviceIds) ? body.serviceIds : []).map((id) => cleanText6(id, 60)).slice(0, MAX_SERVICES);
  const availability = unique(Array.isArray(body.availability) ? body.availability : []).map((slot) => cleanText6(slot, 60)).slice(0, MAX_AVAILABILITY_SLOTS);
  const errors = [];
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });
  await env.DB.batch([
    env.DB.prepare("UPDATE staff_members SET name = ?, role = ? WHERE id = ?").bind(name, role, staffId),
    env.DB.prepare("DELETE FROM staff_services WHERE staff_id = ?").bind(staffId),
    env.DB.prepare("DELETE FROM staff_availability WHERE staff_id = ?").bind(staffId),
    ...serviceIds.map((sid) => env.DB.prepare("INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)").bind(staffId, sid)),
    ...availability.map((slot) => env.DB.prepare("INSERT INTO staff_availability (staff_id, slot) VALUES (?, ?)").bind(staffId, slot))
  ]);
  return jsonResponse(200, { success: true, staffMember: { id: staffId, name, role, services: serviceIds, availability } });
}
__name(onRequestPut2, "onRequestPut2");
async function onRequestDelete({ request, params, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const staffId = String(params.id || "").slice(0, 80);
  if (!await assertOwnership(staffId, specialist.id, env.DB)) return jsonResponse(404, { success: false, error: "staff_not_found" });
  await env.DB.prepare("DELETE FROM staff_members WHERE id = ?").bind(staffId).run();
  return jsonResponse(200, { success: true });
}
__name(onRequestDelete, "onRequestDelete");
var MAX_SERVICES;
var MAX_AVAILABILITY_SLOTS;
var CONTROL_CHARS6;
var cleanText6;
var unique;
var init_id3 = __esm({
  "api/staff/[id].ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    MAX_SERVICES = 6;
    MAX_AVAILABILITY_SLOTS = 12;
    CONTROL_CHARS6 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText6 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS6, "").trim().slice(0, max), "cleanText");
    unique = /* @__PURE__ */ __name2((values) => [...new Set(values)], "unique");
    __name2(assertOwnership, "assertOwnership");
    __name2(onRequestPut2, "onRequestPut");
    __name2(onRequestDelete, "onRequestDelete");
  }
});
async function onRequestGet4({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const [byStatus, byMeetingStatus, topServices, byClient] = await Promise.all([
    env.DB.prepare("SELECT status, COUNT(*) as count FROM bookings WHERE specialist_id = ? GROUP BY status").bind(specialist.id).all(),
    env.DB.prepare("SELECT status, COUNT(*) as count FROM bookings WHERE specialist_id = ? AND booking_type = 'meeting' GROUP BY status").bind(specialist.id).all(),
    env.DB.prepare(
      `SELECT s.name as name, COUNT(*) as count
       FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.specialist_id = ? AND b.status != 'cancelled'
       GROUP BY b.service_id ORDER BY count DESC LIMIT 5`
    ).bind(specialist.id).all(),
    env.DB.prepare(
      `SELECT client_email as clientEmail, COUNT(*) as count
       FROM bookings
       WHERE specialist_id = ? AND status = 'confirmed' AND client_email IS NOT NULL AND client_email != ''
       GROUP BY client_email`
    ).bind(specialist.id).all()
  ]);
  const statusCounts = Object.fromEntries((byStatus.results ?? []).map((r) => [r.status, r.count]));
  const meetingStatusCounts = Object.fromEntries((byMeetingStatus.results ?? []).map((r) => [r.status, r.count]));
  const totalBookings = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
  const clients = byClient.results ?? [];
  const repeatClients = clients.filter((c) => c.count > 1).length;
  const repeatRate = clients.length ? Math.round(repeatClients / clients.length * 100) : 0;
  const meetingsRequested = Object.values(meetingStatusCounts).reduce((sum, n) => sum + n, 0);
  const meetingsConfirmed = meetingStatusCounts.confirmed ?? 0;
  const meetingConfirmRate = meetingsRequested ? Math.round(meetingsConfirmed / meetingsRequested * 100) : null;
  return jsonResponse(200, {
    success: true,
    analytics: {
      totalBookings,
      confirmed: statusCounts.confirmed ?? 0,
      cancelled: statusCounts.cancelled ?? 0,
      pendingApproval: statusCounts.pending_approval ?? 0,
      topServices: topServices.results ?? [],
      distinctClients: clients.length,
      repeatClients,
      repeatRate,
      meetingsRequested,
      meetingsConfirmed,
      meetingConfirmRate
    }
  });
}
__name(onRequestGet4, "onRequestGet4");
var init_analytics = __esm({
  "api/analytics.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(onRequestGet4, "onRequestGet");
  }
});
async function onRequestPost7({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const serviceId = String(body.serviceId ?? "").trim().slice(0, 60);
  const slot = String(body.slot ?? "").trim().slice(0, 60);
  if (!serviceId || !slot) return jsonResponse(400, { success: false, error: "service_and_slot_required" });
  const ownsService = await env.DB.prepare("SELECT 1 FROM specialist_services WHERE specialist_id = ? AND service_id = ?").bind(specialist.id, serviceId).first();
  if (!ownsService) return jsonResponse(400, { success: false, error: "service_not_offered" });
  const ownsSlot = await env.DB.prepare("SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?").bind(specialist.id, slot).first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });
  const service = await env.DB.prepare("SELECT name, duration_minutes as durationMinutes FROM services WHERE id = ?").bind(serviceId).first();
  const id = `TEST-${specialist.id}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO bookings (id, specialist_id, service_id, slot, status, created_at) VALUES (?, ?, ?, ?, 'test_booking_created', ?)"
  ).bind(id, specialist.id, serviceId, slot, createdAt).run();
  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      mode: "simulation",
      status: "test_booking_created",
      specialist: specialist.name,
      service: service?.name ?? serviceId,
      time: slot,
      externalWritePerformed: false,
      calendarEventCreated: false,
      paymentCreated: false,
      messageSent: false
    }
  });
}
__name(onRequestPost7, "onRequestPost7");
async function onRequestGet5({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const bookings = await env.DB.prepare(
    `SELECT b.id, b.slot, b.status, b.created_at as createdAt, s.name as serviceName,
              b.client_name as clientName, b.client_email as clientEmail,
              b.contact_method as contactMethod, b.contact_handle as contactHandle,
              b.booking_type as bookingType, b.meeting_topic as meetingTopic, b.meeting_link as meetingLink,
              sm.name as staffName
       FROM bookings b JOIN services s ON s.id = b.service_id
       LEFT JOIN staff_members sm ON sm.id = b.staff_id
       WHERE b.specialist_id = ? ORDER BY b.created_at DESC`
  ).bind(specialist.id).all();
  return jsonResponse(200, { success: true, bookings: bookings.results ?? [] });
}
__name(onRequestGet5, "onRequestGet5");
var init_booking2 = __esm({
  "api/booking.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(onRequestPost7, "onRequestPost");
    __name2(onRequestGet5, "onRequestGet");
  }
});
async function onRequestGet6({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const [latest, counts] = await Promise.all([
    // Name/contact must come from a single (the most recent) booking row per
    // client — aggregating each column independently with MAX() would mix
    // fields from different bookings when a client's method/handle changed.
    env.DB.prepare(
      `SELECT b.client_email as email, b.client_name as name, b.contact_method as contactMethod,
              b.contact_handle as contactHandle, b.created_at as lastBookingAt
       FROM bookings b
       WHERE b.specialist_id = ? AND b.client_email IS NOT NULL AND b.client_email != ''
         AND b.created_at = (
           SELECT MAX(b2.created_at) FROM bookings b2
           WHERE b2.specialist_id = b.specialist_id AND b2.client_email = b.client_email
         )
       GROUP BY b.client_email`
    ).bind(specialist.id).all(),
    env.DB.prepare(
      `SELECT b.client_email as email, COUNT(*) as totalBookings,
              SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
              n.note as note
       FROM bookings b
       LEFT JOIN client_notes n ON n.specialist_id = b.specialist_id AND n.client_email = b.client_email
       WHERE b.specialist_id = ? AND b.client_email IS NOT NULL AND b.client_email != ''
       GROUP BY b.client_email`
    ).bind(specialist.id).all()
  ]);
  const countsByEmail = new Map((counts.results ?? []).map((row) => [row.email, row]));
  const clients = (latest.results ?? []).map((row) => ({ ...row, ...countsByEmail.get(row.email) ?? {} })).sort((a, b) => a.lastBookingAt < b.lastBookingAt ? 1 : -1);
  return jsonResponse(200, { success: true, clients });
}
__name(onRequestGet6, "onRequestGet6");
var init_clients = __esm({
  "api/clients.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    __name2(onRequestGet6, "onRequestGet");
  }
});
async function loadServicesAndAvailability(specialistId, db) {
  const services = await db.prepare(
    "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN specialist_services ss ON ss.service_id = s.id WHERE ss.specialist_id = ?"
  ).bind(specialistId).all();
  const availability = await db.prepare("SELECT slot FROM specialist_availability WHERE specialist_id = ?").bind(specialistId).all();
  return {
    services: services.results ?? [],
    availability: (availability.results ?? []).map((row) => row.slot)
  };
}
__name(loadServicesAndAvailability, "loadServicesAndAvailability");
async function onRequestGet7({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const { services, availability } = await loadServicesAndAvailability(specialist.id, env.DB);
  return jsonResponse(200, { success: true, profile: { ...specialist, services, availability } });
}
__name(onRequestGet7, "onRequestGet7");
async function onRequestPut3({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const name = cleanText7(body.name, 100);
  const role = cleanText7(body.role, 120);
  const location = cleanText7(body.location, 120);
  const bio = cleanText7(body.bio, 500);
  const serviceIds = unique2(Array.isArray(body.serviceIds) ? body.serviceIds : []).map((id) => cleanText7(id, 60)).slice(0, MAX_SERVICES2);
  const availability = unique2(Array.isArray(body.availability) ? body.availability : []).map((slot) => cleanText7(slot, 60)).slice(0, MAX_AVAILABILITY_SLOTS2);
  const errors = [];
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (location.length < 2) errors.push("location_required");
  if (bio.length < 20) errors.push("bio_too_short");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");
  if (serviceIds.length) {
    const placeholders = serviceIds.map(() => "?").join(",");
    const known = await env.DB.prepare(`SELECT id FROM services WHERE id IN (${placeholders})`).bind(...serviceIds).all();
    if ((known.results ?? []).length !== serviceIds.length) errors.push("unknown_service");
  }
  if (availability.length) {
    const placeholders = availability.map(() => "?").join(",");
    const known = await env.DB.prepare(`SELECT slot FROM availability_slots WHERE slot IN (${placeholders})`).bind(...availability).all();
    if ((known.results ?? []).length !== availability.length) errors.push("unknown_availability");
  }
  if (errors.length) return jsonResponse(400, { success: false, errors });
  await env.DB.prepare("UPDATE specialists SET name = ?, role = ?, location = ?, bio = ? WHERE id = ?").bind(name, role, location, bio, specialist.id).run();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM specialist_services WHERE specialist_id = ?").bind(specialist.id),
    env.DB.prepare("DELETE FROM specialist_availability WHERE specialist_id = ?").bind(specialist.id),
    ...serviceIds.map(
      (id) => env.DB.prepare("INSERT INTO specialist_services (specialist_id, service_id) VALUES (?, ?)").bind(specialist.id, id)
    ),
    ...availability.map(
      (slot) => env.DB.prepare("INSERT INTO specialist_availability (specialist_id, slot) VALUES (?, ?)").bind(specialist.id, slot)
    )
  ]);
  const { services, availability: savedAvailability } = await loadServicesAndAvailability(specialist.id, env.DB);
  return jsonResponse(200, {
    success: true,
    profile: { id: specialist.id, email: specialist.email, name, role, location, bio, services, availability: savedAvailability }
  });
}
__name(onRequestPut3, "onRequestPut3");
var MAX_SERVICES2;
var MAX_AVAILABILITY_SLOTS2;
var CONTROL_CHARS7;
var cleanText7;
var unique2;
var init_profile = __esm({
  "api/profile.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    MAX_SERVICES2 = 6;
    MAX_AVAILABILITY_SLOTS2 = 12;
    CONTROL_CHARS7 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText7 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS7, "").trim().slice(0, max), "cleanText");
    unique2 = /* @__PURE__ */ __name2((values) => [...new Set(values)], "unique");
    __name2(loadServicesAndAvailability, "loadServicesAndAvailability");
    __name2(onRequestGet7, "onRequestGet");
    __name2(onRequestPut3, "onRequestPut");
  }
});
async function loadStaffServicesAndAvailability(staffId, db) {
  const services = await db.prepare(
    "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN staff_services ss ON ss.service_id = s.id WHERE ss.staff_id = ?"
  ).bind(staffId).all();
  const availability = await db.prepare("SELECT slot FROM staff_availability WHERE staff_id = ?").bind(staffId).all();
  return {
    services: services.results ?? [],
    availability: (availability.results ?? []).map((row) => row.slot)
  };
}
__name(loadStaffServicesAndAvailability, "loadStaffServicesAndAvailability");
async function onRequestGet8({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const rows = await env.DB.prepare("SELECT id, name, role, created_at as createdAt FROM staff_members WHERE specialist_id = ? ORDER BY created_at ASC").bind(specialist.id).all();
  const staff = await Promise.all(
    (rows.results ?? []).map(async (row) => ({ ...row, ...await loadStaffServicesAndAvailability(row.id, env.DB) }))
  );
  return jsonResponse(200, { success: true, staff });
}
__name(onRequestGet8, "onRequestGet8");
async function onRequestPost8({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const existingCount = await env.DB.prepare("SELECT COUNT(*) as n FROM staff_members WHERE specialist_id = ?").bind(specialist.id).first();
  if ((existingCount?.n ?? 0) >= MAX_STAFF) return jsonResponse(400, { success: false, error: "too_many_staff" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const name = cleanText8(body.name, 100);
  const role = cleanText8(body.role, 120);
  const serviceIds = unique3(Array.isArray(body.serviceIds) ? body.serviceIds : []).map((id2) => cleanText8(id2, 60)).slice(0, MAX_SERVICES3);
  const availability = unique3(Array.isArray(body.availability) ? body.availability : []).map((slot) => cleanText8(slot, 60)).slice(0, MAX_AVAILABILITY_SLOTS3);
  const errors = [];
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });
  const id = `staff-${crypto.randomUUID()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO staff_members (id, specialist_id, name, role, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, specialist.id, name, role, createdAt),
    ...serviceIds.map(
      (sid) => env.DB.prepare("INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)").bind(id, sid)
    ),
    ...availability.map(
      (slot) => env.DB.prepare("INSERT INTO staff_availability (staff_id, slot) VALUES (?, ?)").bind(id, slot)
    )
  ]);
  const { services, availability: savedAvailability } = await loadStaffServicesAndAvailability(id, env.DB);
  return jsonResponse(201, { success: true, staffMember: { id, name, role, createdAt, services, availability: savedAvailability } });
}
__name(onRequestPost8, "onRequestPost8");
var MAX_STAFF;
var MAX_SERVICES3;
var MAX_AVAILABILITY_SLOTS3;
var CONTROL_CHARS8;
var cleanText8;
var unique3;
var init_staff = __esm({
  "api/staff.ts"() {
    init_functionsRoutes_0_38791969161777384();
    init_session();
    MAX_STAFF = 20;
    MAX_SERVICES3 = 6;
    MAX_AVAILABILITY_SLOTS3 = 12;
    CONTROL_CHARS8 = new RegExp(
      "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
      "g"
    );
    cleanText8 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS8, "").trim().slice(0, max), "cleanText");
    unique3 = /* @__PURE__ */ __name2((values) => [...new Set(values)], "unique");
    __name2(loadStaffServicesAndAvailability, "loadStaffServicesAndAvailability");
    __name2(onRequestGet8, "onRequestGet");
    __name2(onRequestPost8, "onRequestPost");
  }
});
var routes;
var init_functionsRoutes_0_38791969161777384 = __esm({
  "../.wrangler/tmp/pages-anXSgK/functionsRoutes-0.38791969161777384.mjs"() {
    init_token();
    init_token();
    init_id();
    init_login();
    init_logout();
    init_me();
    init_register();
    init_telegram();
    init_booking();
    init_meeting();
    init_id2();
    init_email();
    init_id3();
    init_id3();
    init_analytics();
    init_booking2();
    init_booking2();
    init_clients();
    init_profile();
    init_profile();
    init_staff();
    init_staff();
    routes = [
      {
        routePath: "/api/public/booking/:token",
        mountPath: "/api/public/booking",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/public/booking/:token",
        mountPath: "/api/public/booking",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch]
      },
      {
        routePath: "/api/public/specialist/:id",
        mountPath: "/api/public/specialist",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/auth/login",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/auth/logout",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/auth/me",
        mountPath: "/api/auth",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/auth/telegram",
        mountPath: "/api/auth",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/public/booking",
        mountPath: "/api/public/booking",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/public/meeting",
        mountPath: "/api/public/meeting",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/booking/:id",
        mountPath: "/api/booking",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch2]
      },
      {
        routePath: "/api/clients/:email",
        mountPath: "/api/clients",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut]
      },
      {
        routePath: "/api/staff/:id",
        mountPath: "/api/staff",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/staff/:id",
        mountPath: "/api/staff",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut2]
      },
      {
        routePath: "/api/analytics",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/booking",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/booking",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/clients",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut3]
      },
      {
        routePath: "/api/staff",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/staff",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost8]
      }
    ];
  }
});
init_functionsRoutes_0_38791969161777384();
init_functionsRoutes_0_38791969161777384();
init_functionsRoutes_0_38791969161777384();
init_functionsRoutes_0_38791969161777384();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_38791969161777384();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_38791969161777384();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_38791969161777384();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-OJrAHM/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-OJrAHM/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.841806535599372.js.map
