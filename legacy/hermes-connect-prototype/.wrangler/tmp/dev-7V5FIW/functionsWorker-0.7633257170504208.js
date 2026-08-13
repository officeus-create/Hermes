var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-EhptNJ/functionsWorker-0.7633257170504208.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var PBKDF2_ITERATIONS = 1e5;
var SALT_BYTES = 16;
var HASH_BYTES = 32;
var SESSION_BYTES = 32;
var SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(toHex, "toHex");
__name2(toHex, "toHex");
function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
__name(fromHex, "fromHex");
__name2(fromHex, "fromHex");
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
__name2(deriveKey, "deriveKey");
function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
__name(isValidEmail, "isValidEmail");
__name2(isValidEmail, "isValidEmail");
function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 200;
}
__name(isValidPassword, "isValidPassword");
__name2(isValidPassword, "isValidPassword");
async function hashPassword(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const salt = toHex(saltBytes);
  const hash = await deriveKey(password, saltBytes);
  return { hash, salt };
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
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
__name2(verifyPassword, "verifyPassword");
function createSessionToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
}
__name(createSessionToken, "createSessionToken");
__name2(createSessionToken, "createSessionToken");
function sessionExpiry(now = /* @__PURE__ */ new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS).toISOString();
}
__name(sessionExpiry, "sessionExpiry");
__name2(sessionExpiry, "sessionExpiry");
function isSessionExpired(expiresAtIso, now = /* @__PURE__ */ new Date()) {
  return new Date(expiresAtIso).getTime() <= now.getTime();
}
__name(isSessionExpired, "isSessionExpired");
__name2(isSessionExpired, "isSessionExpired");
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
__name2(parseCookies, "parseCookies");
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
__name2(sessionCookieHeader, "sessionCookieHeader");
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
__name2(getAuthenticatedSpecialist, "getAuthenticatedSpecialist");
function jsonResponse(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
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
__name2(findBooking, "findBooking");
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
__name2(toPublicShape, "toPublicShape");
async function onRequestGet({ params, env }) {
  const token = String(params.token || "").slice(0, 80);
  const row = await findBooking(token, env.DB);
  if (!row) return jsonResponse(404, { success: false, error: "booking_not_found" });
  return jsonResponse(200, { success: true, booking: toPublicShape(row) });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
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
__name2(onRequestPatch, "onRequestPatch");
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
  return jsonResponse(200, {
    success: true,
    specialist: {
      id: specialist.id,
      name: specialist.name,
      role: specialist.role,
      location: specialist.location,
      bio: specialist.bio,
      services: services.results ?? [],
      availability: (availability.results ?? []).map((row) => row.slot)
    }
  });
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
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
__name2(onRequestPost, "onRequestPost");
async function onRequestPost2({ request, env }) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies.hermes_session;
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }
  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader("", { clear: true }) });
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestGet3({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  return jsonResponse(200, { success: true, specialist });
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
var CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max), "cleanText");
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
__name2(onRequestPost3, "onRequestPost");
var CONTACT_METHODS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "instagram", label: "Instagram" }
];
var CONTACT_METHOD_IDS = new Set(CONTACT_METHODS.map((method) => method.id));
function isValidContactMethod(value) {
  return CONTACT_METHOD_IDS.has(value);
}
__name(isValidContactMethod, "isValidContactMethod");
__name2(isValidContactMethod, "isValidContactMethod");
var CONTROL_CHARS2 = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText2 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS2, "").trim().slice(0, max), "cleanText");
var isValidEmail2 = /* @__PURE__ */ __name2((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "isValidEmail");
async function onRequestPost4({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const specialistId = cleanText2(body.specialistId, 120);
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
  const ownsService = await env.DB.prepare("SELECT 1 FROM specialist_services WHERE specialist_id = ? AND service_id = ?").bind(specialistId, serviceId).first();
  if (!ownsService) return jsonResponse(400, { success: false, error: "service_not_offered" });
  const ownsSlot = await env.DB.prepare("SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?").bind(specialistId, slot).first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });
  const alreadyBooked = await env.DB.prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND slot = ? AND status != 'cancelled'").bind(specialistId, slot).first();
  if (alreadyBooked) return jsonResponse(409, { success: false, error: "slot_already_booked" });
  const service = await env.DB.prepare("SELECT name, duration_minutes as durationMinutes FROM services WHERE id = ?").bind(serviceId).first();
  const id = `BOOK-${crypto.randomUUID().slice(0, 8)}`;
  const accessToken = crypto.randomUUID().replace(/-/g, "");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO bookings (id, specialist_id, service_id, slot, status, client_name, client_email, contact_method, contact_handle, booking_type, access_token, created_at) VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'appointment', ?, ?)"
  ).bind(id, specialistId, serviceId, slot, clientName, clientEmail, contactMethod, contactHandle, accessToken, createdAt).run();
  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      status: "confirmed",
      specialist: specialist.name,
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
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
var CONTROL_CHARS3 = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText3 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS3, "").trim().slice(0, max), "cleanText");
var isValidEmail3 = /* @__PURE__ */ __name2((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "isValidEmail");
async function onRequestPost5({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const specialistId = cleanText3(body.specialistId, 120);
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
  const ownsSlot = await env.DB.prepare("SELECT 1 FROM specialist_availability WHERE specialist_id = ? AND slot = ?").bind(specialistId, slot).first();
  if (!ownsSlot) return jsonResponse(400, { success: false, error: "slot_not_available" });
  const alreadyBooked = await env.DB.prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND slot = ? AND status != 'cancelled'").bind(specialistId, slot).first();
  if (alreadyBooked) return jsonResponse(409, { success: false, error: "slot_already_booked" });
  const isReturningClient = await env.DB.prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND client_email = ? AND status = 'confirmed' LIMIT 1").bind(specialistId, clientEmail).first();
  const status = isReturningClient ? "confirmed" : "pending_approval";
  const id = `MEET-${crypto.randomUUID().slice(0, 8)}`;
  const accessToken = crypto.randomUUID().replace(/-/g, "");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO bookings
       (id, specialist_id, service_id, slot, status, client_name, client_email, contact_method, contact_handle, booking_type, meeting_topic, access_token, created_at)
     VALUES (?, ?, 'personal-meeting', ?, ?, ?, ?, ?, ?, 'meeting', ?, ?, ?)`
  ).bind(id, specialistId, slot, status, clientName, clientEmail, contactMethod, contactHandle, meetingTopic, accessToken, createdAt).run();
  return jsonResponse(201, {
    success: true,
    booking: {
      id,
      status,
      specialist: specialist.name,
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
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
var CONTROL_CHARS4 = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText4 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS4, "").trim().slice(0, max), "cleanText");
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
__name2(onRequestPatch2, "onRequestPatch");
var CONTROL_CHARS5 = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText5 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS5, "").trim().slice(0, max), "cleanText");
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
__name2(onRequestPut, "onRequestPut");
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
__name2(onRequestGet4, "onRequestGet");
async function onRequestPost6({ request, env }) {
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
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
async function onRequestGet5({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const bookings = await env.DB.prepare(
    `SELECT b.id, b.slot, b.status, b.created_at as createdAt, s.name as serviceName,
              b.client_name as clientName, b.client_email as clientEmail,
              b.contact_method as contactMethod, b.contact_handle as contactHandle,
              b.booking_type as bookingType, b.meeting_topic as meetingTopic, b.meeting_link as meetingLink
       FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.specialist_id = ? ORDER BY b.created_at DESC`
  ).bind(specialist.id).all();
  return jsonResponse(200, { success: true, bookings: bookings.results ?? [] });
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
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
__name2(onRequestGet6, "onRequestGet");
var MAX_SERVICES = 6;
var MAX_AVAILABILITY_SLOTS = 12;
var CONTROL_CHARS6 = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);
var cleanText6 = /* @__PURE__ */ __name2((value, max) => String(value ?? "").replace(CONTROL_CHARS6, "").trim().slice(0, max), "cleanText");
var unique = /* @__PURE__ */ __name2((values) => [...new Set(values)], "unique");
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
__name2(loadServicesAndAvailability, "loadServicesAndAvailability");
async function onRequestGet7({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  const { services, availability } = await loadServicesAndAvailability(specialist.id, env.DB);
  return jsonResponse(200, { success: true, profile: { ...specialist, services, availability } });
}
__name(onRequestGet7, "onRequestGet7");
__name2(onRequestGet7, "onRequestGet");
async function onRequestPut2({ request, env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const name = cleanText6(body.name, 100);
  const role = cleanText6(body.role, 120);
  const location = cleanText6(body.location, 120);
  const bio = cleanText6(body.bio, 500);
  const serviceIds = unique(Array.isArray(body.serviceIds) ? body.serviceIds : []).map((id) => cleanText6(id, 60)).slice(0, MAX_SERVICES);
  const availability = unique(Array.isArray(body.availability) ? body.availability : []).map((slot) => cleanText6(slot, 60)).slice(0, MAX_AVAILABILITY_SLOTS);
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
__name(onRequestPut2, "onRequestPut2");
__name2(onRequestPut2, "onRequestPut");
var routes = [
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
    routePath: "/api/public/booking",
    mountPath: "/api/public/booking",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/public/meeting",
    mountPath: "/api/public/meeting",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
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
    modules: [onRequestPost6]
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
    modules: [onRequestPut2]
  }
];
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

// .wrangler/tmp/bundle-zmYc4d/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-zmYc4d/middleware-loader.entry.ts
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
//# sourceMappingURL=functionsWorker-0.7633257170504208.js.map
