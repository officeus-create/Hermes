import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/auth/google.ts";

const googleClient = "123456-example.apps.googleusercontent.com";
const credential = "test-credential-".padEnd(128, "x");
const now = () => new Date().toISOString();

class FakeD1 {
  constructor() {
    this.specialists = [
      { id: "owner-1", email: "owner@example.com", name: "Existing owner", role: "Business Owner" },
      { id: "owner-2", email: "another@example.com", name: "Other user", role: "Business Owner" },
    ];
    this.sessions = [
      { token: "session-owner", specialist_id: "owner-1", expires_at: new Date(Date.now() + 300000).toISOString() },
      { token: "session-other", specialist_id: "owner-2", expires_at: new Date(Date.now() + 300000).toISOString() },
    ];
    this.identities = [];
    this.raceWith = null;
  }
  prepare(sql) {
    const db = this;
    const q = sql.replace(/\s+/g, " ").trim();
    return {
      bind(...args) {
        return {
          async first() {
            if (q.includes("FROM hermes_auth_identities i")) {
              const identity = db.identities.find(i => i.provider === "google" && i.sub === args[0]);
              return identity ? db.specialists.find(s => s.id === identity.owner) ?? null : null;
            }
            if (q.includes("FROM hermes_auth_identities WHERE provider = 'google'")) {
              const identity = db.identities.find(i => i.provider === "google" && i.sub === args[0]);
              return identity ? { specialist_id: identity.owner } : null;
            }
            if (q.includes("FROM specialists WHERE lower(email) = ?")) {
              return db.specialists.find(s => s.email.toLowerCase() === args[0]) ?? null;
            }
            if (q.includes("FROM sessions WHERE token = ?")) {
              return db.sessions.find(s => s.token === args[0]) ?? null;
            }
            if (q.includes("FROM specialists WHERE id = ?")) {
              return db.specialists.find(s => s.id === args[0]) ?? null;
            }
            throw new Error("unexpected SELECT: " + q);
          },
          async run() {
            if (q.startsWith("CREATE TABLE") || q.startsWith("CREATE INDEX")) return { success: true };
            if (q.startsWith("INSERT INTO hermes_auth_identities")) {
              const [sub, owner] = args;
              if (db.raceWith) {
                db.identities.push({ provider: "google", sub, owner: db.raceWith });
                db.raceWith = null;
                return { success: true };
              }
              if (!db.identities.some(i => i.provider === "google" && i.sub === sub)) {
                if (db.identities.some(i => i.provider === "google" && i.owner === owner)) {
                  throw new Error("unique_provider_owner");
                }
                db.identities.push({ provider: "google", sub, owner });
              }
              return { success: true };
            }
            if (q.startsWith("INSERT INTO sessions")) {
              const [token, specialist_id, created_at, expires_at] = args;
              db.sessions.push({ token, specialist_id, created_at, expires_at });
              return { success: true };
            }
            throw new Error("unexpected RUN: " + q);
          },
        };
      },
      async run() {
        if (q.startsWith("CREATE TABLE") || q.startsWith("CREATE INDEX")) return { success: true };
        throw new Error("unexpected bare RUN: " + q);
      },
    };
  }
}

const db = new FakeD1();
const realFetch = globalThis.fetch;
let subject = "google-identity-one";
globalThis.fetch = async (input) => {
  assert.match(String(input), /^https:\/\/oauth2\.googleapis\.com\/tokeninfo\?id_token=/);
  return new Response(JSON.stringify({
    aud: googleClient, iss: "https://accounts.google.com", sub: subject,
    email: "owner@example.com", email_verified: true,
    exp: Math.floor(Date.now() / 1000) + 300,
  }), { status: 200 });
};

const login = (cookie) => {
  const headers = new Headers({ Origin: "https://hermeslogisticsus.com", "Sec-Fetch-Site": "same-origin" });
  if (cookie) headers.set("Cookie", "hermes_session=" + cookie);
  return onRequestPost({
    request: new Request("https://hermeslogisticsus.com/api/auth/google", {
      method: "POST", headers, body: JSON.stringify({ credential }),
    }),
    env: { DB: db, GOOGLE_OAUTH_CLIENT_ID: googleClient },
  });
};

try {
  const before = db.sessions.length;
  let response = await login();
  assert.equal(response.status, 409, "unverified email equality must not auto-link existing account");
  assert.equal((await response.json()).error, "existing_account_signin_required");
  assert.equal(db.identities.length, 0);
  assert.equal(db.sessions.length, before);

  response = await login("session-other");
  assert.equal(response.status, 409, "other user's active session must not authorize linking");
  assert.equal(db.identities.length, 0);

  response = await login("session-owner");
  assert.equal(response.status, 200, "authenticated matching account owner may link Google");
  assert.equal((await response.json()).state, "linked");
  assert.deepEqual(db.identities, [{ provider: "google", sub: subject, owner: "owner-1" }]);

  response = await login();
  assert.equal(response.status, 200, "known provider subject may sign in without email/password");
  assert.equal((await response.json()).state, "signed_in");

  // Simulate a competing write after the initial identity lookup: rebind must be rejected.
  db.identities.length = 0;
  db.raceWith = "owner-2";
  const sessionsBeforeRace = db.sessions.length;
  response = await login("session-owner");
  assert.equal(response.status, 409, "racing identity claim cannot take over another user");
  assert.equal((await response.json()).error, "provider_identity_conflict");
  assert.equal(db.sessions.length, sessionsBeforeRace);
  assert.equal(db.identities[0].owner, "owner-2");
  console.log("hermes-google-auth-link-security: no implicit linking, owner proof, stable provider subject and race fail-closed PASS");
} finally {
  globalThis.fetch = realFetch;
}
