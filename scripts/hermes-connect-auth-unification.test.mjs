import assert from "node:assert/strict";
import "./repair-shop-feedback-contract.test.mjs";
import { createHash, createHmac } from "node:crypto";
import { hashPassword, verifyPassword, createSessionToken } from "../src/legacy-prototype/auth.mjs";
import { getAuthenticatedSpecialist } from "../functions/api/_lib/session.mjs";
import { onRequestPost as handleRegister } from "../functions/api/auth/register.ts";
import { onRequestPost as handleLogin } from "../functions/api/auth/login.ts";
import { onRequestPost as handleLogout } from "../functions/api/auth/logout.ts";
import { onRequestGet as handleMe } from "../functions/api/auth/me.ts";
import { onRequestPost as handleTelegram } from "../functions/api/auth/telegram.ts";

// 1. Mock D1 Database Implementation
class MockD1Database {
  constructor() {
    this.tables = {
      specialists: [],
      sessions: []
    };
  }

  prepare(sql) {
    const db = this;
    const cleanSql = sql.replace(/\s+/g, " ").trim();

    return {
      bind(...args) {
        return {
          async first() {
            if (cleanSql.includes("SELECT id, password_hash, password_salt FROM specialists WHERE email = ?")) {
              const email = args[0];
              const s = db.tables.specialists.find(x => x.email === email);
              if (!s) return null;
              return { id: s.id, password_hash: s.password_hash, password_salt: s.password_salt };
            }
            if (cleanSql.includes("SELECT specialist_id, expires_at FROM sessions WHERE token = ?")) {
              const token = args[0];
              const s = db.tables.sessions.find(x => x.token === token);
              if (!s) return null;
              return { specialist_id: s.specialist_id, expires_at: s.expires_at };
            }
            if (cleanSql.includes("SELECT id, email, name, role, location, bio FROM specialists WHERE id = ?")) {
              const id = args[0];
              const s = db.tables.specialists.find(x => x.id === id);
              if (!s) return null;
              return { id: s.id, email: s.email, name: s.name, role: s.role, location: s.location, bio: s.bio };
            }
            if (cleanSql.includes("SELECT id FROM specialists WHERE telegram_id = ?")) {
              const telegramId = args[0];
              const s = db.tables.specialists.find(x => x.telegram_id === telegramId);
              if (!s) return null;
              return { id: s.id };
            }
            if (cleanSql.includes("SELECT id FROM specialists WHERE email = ?")) {
              const email = args[0];
              const s = db.tables.specialists.find(x => x.email === email);
              if (!s) return null;
              return { id: s.id };
            }
            return null;
          },
          async run() {
            if (cleanSql.includes("INSERT INTO specialists")) {
              const [id, email, password_hash, password_salt, name, role, location, bio, created_at, telegram_id] = args;
              db.tables.specialists.push({ id, email, password_hash, password_salt, name, role, location, bio, created_at, telegram_id: telegram_id || null });
            } else if (cleanSql.includes("INSERT INTO sessions")) {
              const [token, specialist_id, created_at, expires_at] = args;
              db.tables.sessions.push({ token, specialist_id, created_at, expires_at });
            } else if (cleanSql.includes("DELETE FROM sessions")) {
              const token = args[0];
              db.tables.sessions = db.tables.sessions.filter(x => x.token !== token);
            }
            return { success: true };
          }
        };
      }
    };
  }
}

// 2. Mock Request & Response Helper
function mockRequest(method, url, body = null, cookie = null) {
  const headers = new Map();
  headers.set("Content-Type", "application/json");
  if (cookie) {
    headers.set("Cookie", cookie);
  }
  return {
    method,
    url,
    headers,
    async json() {
      if (!body) throw new Error("No body");
      return body;
    }
  };
}

// 3. Test Cases Execution
async function runTests() {
  console.log("=== STARTING AUTH UNIFICATION INTEGRATION TESTS ===");
  const db = new MockD1Database();
  const env = { DB: db, TELEGRAM_BOT_TOKEN: "mock_telegram_bot_token_12345" };

  // --- TEST A: Cryptography Unit Checks ---
  const password = "SuperSecurePassword123!";
  const { hash, salt } = await hashPassword(password);
  assert.ok(hash);
  assert.ok(salt);
  assert.equal(await verifyPassword(password, salt, hash), true, "verifyPassword should pass for correct credentials");
  assert.equal(await verifyPassword("wrong_password", salt, hash), false, "verifyPassword should fail for wrong credentials");
  console.log("✔ Test A: Cryptography helpers verify successfully.");

  // --- TEST B: Account Registration Endpoint (register.ts) ---
  const registerPayload = {
    email: "test.specialist@hermesconnect.app",
    password,
    name: "Alex Pro",
    role: "Logistics Specialist",
    location: "Green Bay, WI",
    bio: "Certified dispatcher and freight operations manager with 10+ years experience."
  };

  const regReq = mockRequest("POST", "http://localhost/api/auth/register", registerPayload);
  const regRes = await handleRegister({ request: regReq, env });
  assert.equal(regRes.status, 201, "Status code should be 201 Created"); // HTTP 201
  const regData = await regRes.json();
  assert.equal(regData.success, true);
  assert.ok(regData.specialist.id.startsWith("specialist-"));
  assert.equal(regData.specialist.email, registerPayload.email);

  const cookieHeader = regRes.headers.get("Set-Cookie");
  assert.ok(cookieHeader && cookieHeader.includes("hermes_session="), "Register must issue hermes_session Set-Cookie header");
  console.log("✔ Test B: Specialist registration endpoint passes contract validation.");

  // --- TEST C: Session Verification Endpoint (me.ts) ---
  const sessionToken = cookieHeader.split(";")[0].split("=")[1];
  const meReq = mockRequest("GET", "http://localhost/api/auth/me", null, `hermes_session=${sessionToken}`);
  const meRes = await handleMe({ request: meReq, env });
  assert.equal(meRes.status, 200, "Status code should be 200 OK");
  const meData = await meRes.json();
  assert.equal(meData.success, true);
  assert.equal(meData.specialist.name, registerPayload.name);
  console.log("✔ Test C: Active session verification (me.ts) retrieves details correctly.");

  // --- TEST D: Duplicate Registration Protection ---
  const dupReq = mockRequest("POST", "http://localhost/api/auth/register", registerPayload);
  const dupRes = await handleRegister({ request: dupReq, env });
  assert.equal(dupRes.status, 409, "Should prevent duplicate registrations with 409 Conflict");
  const dupData = await dupRes.json();
  assert.equal(dupData.error, "email_already_registered");
  console.log("✔ Test D: Duplicate registration protection blocks successfully.");

  // --- TEST E: Account Login Endpoint (login.ts) ---
  const loginPayload = {
    email: registerPayload.email,
    password
  };
  const loginReq = mockRequest("POST", "http://localhost/api/auth/login", loginPayload);
  const loginRes = await handleLogin({ request: loginReq, env });
  assert.equal(loginRes.status, 200, "Login should return 200 OK");
  const loginData = await loginRes.json();
  assert.equal(loginData.success, true);
  const loginCookie = loginRes.headers.get("Set-Cookie");
  assert.ok(loginCookie && loginCookie.includes("hermes_session="), "Login must issue session cookie");
  console.log("✔ Test E: Login endpoint registers session cookie for correct credentials.");

  // --- TEST F: Logout Endpoint (logout.ts) ---
  const newSessionToken = loginCookie.split(";")[0].split("=")[1];
  const logoutReq = mockRequest("POST", "http://localhost/api/auth/logout", null, `hermes_session=${newSessionToken}`);
  const logoutRes = await handleLogout({ request: logoutReq, env });
  assert.equal(logoutRes.status, 200);
  const logoutData = await logoutRes.json();
  assert.equal(logoutData.success, true);
  const logoutCookie = logoutRes.headers.get("Set-Cookie");
  assert.ok(logoutCookie && logoutCookie.includes("Max-Age=0"), "Logout must clear session cookie");

  // Verify session is removed from DB
  const deletedSession = db.tables.sessions.find(x => x.token === newSessionToken);
  assert.equal(deletedSession, undefined, "Session must be deleted from DB on logout");
  console.log("✔ Test F: Logout endpoint cleans up database session ledger correctly.");

  // --- TEST G: Telegram Authentication Integration (telegram.ts) ---
  // Create a synthetic Telegram authentication payload with a mathematically correct signature.
  // Per Telegram Widget Spec: first_name, username, id, auth_date, hash
  const botToken = "mock_telegram_bot_token_12345";
  const secretKey = createHash("sha256").update(botToken).digest();

  const tgFields = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    first_name: "Telegram",
    id: "123456789",
    last_name: "Specialist",
    username: "tg_specialist"
  };

  const checkString = Object.keys(tgFields)
    .sort()
    .map((key) => `${key}=${tgFields[key]}`)
    .join("\n");

  const realHash = createHmac("sha256", secretKey).update(checkString).digest("hex");

  const tgPayload = {
    ...tgFields,
    hash: realHash
  };

  const tgReq = mockRequest("POST", "http://localhost/api/auth/telegram", tgPayload);
  const tgRes = await handleTelegram({ request: tgReq, env });
  assert.equal(tgRes.status, 200, "Telegram auth should succeed and return 200");
  const tgData = await tgRes.json();
  assert.equal(tgData.success, true);
  
  const tgCookie = tgRes.headers.get("Set-Cookie");
  assert.ok(tgCookie && tgCookie.includes("hermes_session="), "Telegram auth must issue session cookie");

  // Verify specialist was created in database
  const createdTgSpecialist = db.tables.specialists.find(x => x.telegram_id === "123456789");
  assert.ok(createdTgSpecialist, "Telegram-authenticated specialist should be created in DB");
  assert.equal(createdTgSpecialist.name, "Telegram Specialist");
  assert.equal(createdTgSpecialist.email, "telegram-123456789@users.hermesconnect.app");

  console.log("✔ Test G: Telegram auth widget integration and automatic account provision passes.");

  console.log("=== ALL AUTH UNIFICATION CONTRACTS SUCCESSFULLY VERIFIED (100% GREEN) ===");
}

runTests().catch((err) => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
