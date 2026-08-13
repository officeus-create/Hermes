import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  isValidPassword,
  createSessionToken,
  sessionExpiry,
  isSessionExpired,
  parseCookies,
  sessionCookieHeader,
  verifyTelegramAuth,
} from "../src/auth.mjs";

async function signedTelegramPayload(token, overrides = {}) {
  const fields = { id: 12345, first_name: "Ada", auth_date: Math.floor(Date.now() / 1000), ...overrides };
  const checkString = Object.keys(fields).sort().map((key) => `${key}=${fields[key]}`).join("\n");
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const key = await crypto.subtle.importKey("raw", new Uint8Array(secretKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(checkString));
  const hash = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { ...fields, hash };
}

test("hashes and verifies a correct password", async () => {
  const { hash, salt } = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", salt, hash), true);
});

test("rejects an incorrect password", async () => {
  const { hash, salt } = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("wrong password", salt, hash), false);
});

test("two hashes of the same password use different salts and differ", async () => {
  const a = await hashPassword("same-password-123");
  const b = await hashPassword("same-password-123");
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
});

test("validates email format", () => {
  assert.equal(isValidEmail("maya@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail(""), false);
});

test("validates password length boundaries", () => {
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("exactly8"), true);
  assert.equal(isValidPassword("a".repeat(201)), false);
});

test("session tokens are random and hex-encoded", () => {
  const a = createSessionToken();
  const b = createSessionToken();
  assert.notEqual(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test("session expiry is in the future and expiry check agrees", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const expiry = sessionExpiry(now);
  assert.equal(isSessionExpired(expiry, now), false);
  assert.equal(isSessionExpired(expiry, new Date("2026-02-01T00:00:00Z")), true);
});

test("parses cookies from a header string", () => {
  const cookies = parseCookies("hermes_session=abc123; other=value");
  assert.equal(cookies.hermes_session, "abc123");
  assert.equal(cookies.other, "value");
});

test("parseCookies handles missing header", () => {
  assert.deepEqual(parseCookies(undefined), {});
});

test("session cookie header sets expected attributes", () => {
  const header = sessionCookieHeader("token123");
  assert.match(header, /^hermes_session=token123/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Lax/);
});

test("clearing session cookie empties the value and expires immediately", () => {
  const header = sessionCookieHeader("token123", { clear: true });
  assert.match(header, /^hermes_session=;/);
  assert.match(header, /Max-Age=0/);
});

test("accepts a correctly signed Telegram auth payload", async () => {
  const payload = await signedTelegramPayload("test-bot-token");
  assert.equal(await verifyTelegramAuth(payload, "test-bot-token"), true);
});

test("rejects a Telegram payload signed with the wrong bot token", async () => {
  const payload = await signedTelegramPayload("test-bot-token");
  assert.equal(await verifyTelegramAuth(payload, "a-different-token"), false);
});

test("rejects a tampered Telegram payload (field changed after signing)", async () => {
  const payload = await signedTelegramPayload("test-bot-token");
  payload.first_name = "Eve";
  assert.equal(await verifyTelegramAuth(payload, "test-bot-token"), false);
});

test("rejects a stale Telegram auth_date", async () => {
  const staleSeconds = Math.floor(Date.now() / 1000) - 25 * 60 * 60;
  const payload = await signedTelegramPayload("test-bot-token", { auth_date: staleSeconds });
  assert.equal(await verifyTelegramAuth(payload, "test-bot-token"), false);
});

test("rejects a Telegram payload missing a hash", async () => {
  assert.equal(await verifyTelegramAuth({ id: 1, auth_date: Math.floor(Date.now() / 1000) }, "test-bot-token"), false);
});
