import assert from "node:assert/strict";
import fs from "node:fs";
import { beginOAuthState, consumeOAuthState, completeFederatedLogin, getVerifiedOAuthStartOwner } from "../functions/api/_lib/federated-login.mjs";

const startSource = fs.readFileSync(new URL("../functions/api/auth/apple/start.ts", import.meta.url), "utf8");
const callbackSource = fs.readFileSync(new URL("../functions/api/auth/apple/callback.ts", import.meta.url), "utf8");

assert.match(startSource, /getAuthenticatedSpecialist\(request, env.DB\)/);
assert.match(startSource, /sessions WHERE token=\? AND specialist_id=\?/);
assert.match(startSource, /Date\.parse\(String\(activeSession\.expires_at\)\) > Date\.now\(\)/);
assert.match(startSource, /beginOAuthState\(env.DB, "apple", nonce, verifiedStartSession\)/);
assert.match(callbackSource, /getVerifiedOAuthStartOwner\(env.DB, context\)/);
assert.match(callbackSource, /completeFederatedLogin\(/);
assert.match(callbackSource, /verifiedAppleLinkOwnerId,/);

const stateRows = [];
const startSessions = [{
  specialist_id: "owner-1", created_at: "2026-10-14T13:00:00.000Z",
  expires_at: new Date(Date.now()+300000).toISOString(), revoked: false,
}];
const identityRows = [];
const sessions = [];
const specialists = [{ id: "owner-1", email: "owner@example.com", name: "Existing Owner", role: "Business Owner" }];
const db = {
  prepare(query) {
    const sql = query.replace(/\s+/g, " ").trim();
    return {
      async run() {
        if (sql.startsWith("CREATE TABLE") || sql.startsWith("CREATE INDEX")) return { success: true };
        throw Error("unexpected no-bind run: " + sql);
      },
      bind(...args) {
        return {
          async run() {
            if (sql.startsWith("INSERT INTO hermes_oauth_states")) {
              const [hash, provider, codeVerifier, nonce, specialistId, sessionCreatedAt, createdAt, expiresAt] = args;
              stateRows.push({hash, provider, code_verifier: codeVerifier, nonce,
                link_specialist_id: specialistId, link_session_created_at: sessionCreatedAt,
                created_at: createdAt, expires_at: expiresAt, used_at: null});
              return { success: true };
            }
            if (sql.startsWith("UPDATE hermes_oauth_states SET used_at=")) {
              const [date, hash, provider, time] = args;
              const row = stateRows.find(x => x.hash === hash && x.provider === provider &&
                x.used_at === null && x.expires_at > time);
              if (!row) return { meta: { changes: 0 } };
              row.used_at = date;
              return { meta: { changes: 1 } };
            }
            if (sql.startsWith("INSERT INTO hermes_auth_identities")) {
              const [provider, sub, owner, email] = args;
              if (!identityRows.some(x => x.provider === provider && x.sub === sub)) {
                identityRows.push({provider,sub,owner,email});
              }
              return { success: true };
            }
            if (sql.startsWith("INSERT INTO sessions")) {
              sessions.push({token:args[0],specialist_id:args[1]});
              return { success: true };
            }
            throw Error("unexpected run: " + sql);
          },
          async first() {
            if (sql.startsWith("SELECT specialist_id FROM sessions WHERE specialist_id=? AND created_at=? AND expires_at>?")) {
              const [id, created, cutoff] = args;
              const active = startSessions.find(x => x.specialist_id === id && x.created_at === created &&
                x.expires_at > cutoff && !x.revoked);
              return active ? {specialist_id: active.specialist_id} : null;
            }
            if (sql.startsWith("SELECT code_verifier, nonce, link_specialist_id")) {
              const [hash, provider, cutoff] = args;
              const row = stateRows.find(x => x.hash === hash && x.provider === provider &&
                x.used_at === null && x.expires_at > cutoff);
              return row ? {
                code_verifier: row.code_verifier, nonce: row.nonce,
                link_specialist_id: row.link_specialist_id,
                link_session_created_at: row.link_session_created_at
              } : null;
            }
            if (sql.includes("FROM hermes_auth_identities i JOIN specialists")) {
              const identity = identityRows.find(x => x.provider === args[0] && x.sub === args[1]);
              return identity ? specialists.find(x => x.id === identity.owner) : null;
            }
            if (sql.includes("FROM specialists WHERE lower(email)")) {
              return specialists.find(x => x.email === args[0]) || null;
            }
            if (sql.includes("FROM hermes_auth_identities WHERE provider=?")) {
              const row = identityRows.find(x => x.provider === args[0] && x.sub === args[1]);
              return row ? {specialist_id:row.owner} : null;
            }
            throw Error("unexpected first: " + sql);
          }
        };
      }
    };
  }
};

const start = await beginOAuthState(db, "apple", "unique-nonce-1", {
  specialistId: "owner-1", sessionCreatedAt: "2026-10-14T13:00:00.000Z",
});
assert.equal(stateRows.length, 1);
assert.equal(stateRows[0].link_specialist_id, "owner-1");
assert.equal(stateRows[0].link_session_created_at, "2026-10-14T13:00:00.000Z");
assert.notEqual(stateRows[0].hash, start.state, "only state hash must be persisted");
assert.equal(stateRows[0].expires_at > stateRows[0].created_at, true);
const cookie = `__Host-hermes_apple_oauth=${start.state}`;
const request = new Request("https://hermeslogisticsus.com/api/auth/apple/callback", {
  method: "POST", headers: { Cookie: cookie },
});
const consumed = await consumeOAuthState(db, request, "apple", start.state);
assert.equal(consumed.nonce, "unique-nonce-1");
assert.equal(consumed.link_specialist_id, "owner-1");
assert.equal(consumed.link_session_created_at, "2026-10-14T13:00:00.000Z");
assert.equal(await consumeOAuthState(db, request, "apple", start.state), null,
  "one-time state must reject replay");

assert.equal(await getVerifiedOAuthStartOwner(db, consumed), "owner-1");
startSessions[0].revoked = true;
assert.equal(await getVerifiedOAuthStartOwner(db, consumed), null,
  "revoked original Hermes session must prevent Apple provider link");
startSessions[0].revoked = false;
startSessions[0].expires_at = "2026-01-01T00:00:00Z";
assert.equal(await getVerifiedOAuthStartOwner(db, consumed), null,
  "expired original Hermes session must prevent Apple provider link");
startSessions[0].expires_at = new Date(Date.now()+300000).toISOString();

const other = await beginOAuthState(db, "apple", "nonce-2");
assert.equal(stateRows.at(-1).link_specialist_id, null,
  "unauthenticated Apple start must never invent a linking identity");

const initial = await completeFederatedLogin({
  db, request, provider: "apple", subject: "apple-user-1", email: "owner@example.com",
  name: "Existing Owner",
});
assert.equal(initial.error, "existing_account_signin_required",
  "Apple existing identity may not link by email equality without proof");
assert.equal(identityRows.length, 0);
assert.equal(sessions.length, 0);
const wrong = await completeFederatedLogin({
  db, request, provider: "apple", subject: "apple-user-1", email: "owner@example.com",
  verifiedAppleLinkOwnerId: "someone-else",
});
assert.equal(wrong.error, "existing_account_signin_required");
assert.equal(identityRows.length, 0);

const allowed = await completeFederatedLogin({
  db, request, provider: "apple", subject: "apple-user-1", email: "owner@example.com",
  verifiedAppleLinkOwnerId: await getVerifiedOAuthStartOwner(db, consumed),
});
assert.equal(allowed.success, true,
  "Apple one-time state from a verified still-active Hermes session permits explicit linking");
assert.equal(identityRows[0].owner, "owner-1");
assert.equal(sessions.length, 1);
const repeat = await completeFederatedLogin({
  db, request, provider: "apple", subject: "apple-user-1", email: "owner@example.com",
});
assert.equal(repeat.success, true, "already-linked stable Apple provider subject may sign in");
assert.equal(sessions.length, 2);

console.log("hermes-apple-link-state: verified Apple start binding, one-time replay denial, no email-only linking, explicit existing owner PASS");
