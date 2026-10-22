import assert from "node:assert/strict";
import fs from "node:fs";

const providers = fs.readFileSync(new URL("../functions/api/auth/providers.ts", import.meta.url), "utf8");
const google = fs.readFileSync(new URL("../functions/api/auth/google.ts", import.meta.url), "utf8");
const access = fs.readFileSync(new URL("../src/pages/services/hermes-connect/load-board/access/index.astro", import.meta.url), "utf8");
const hub = fs.readFileSync(new URL("../src/pages/services/hermes-connect/access/index.astro", import.meta.url), "utf8");
const headers = fs.readFileSync(new URL("../public/_headers", import.meta.url), "utf8");

assert.match(providers, /GOOGLE_OAUTH_CLIENT_ID/);
assert.match(providers, /googleClientIdLooksValid/);
assert.match(providers, /enabled: googleEnabled/);
assert.match(providers, /client_id: googleEnabled \? clientId : null/);
assert.match(providers, /Cache-Control.*no-store/s);

assert.match(google, /https:\/\/oauth2\.googleapis\.com\/tokeninfo\?id_token=/);
assert.match(google, /String\(info\.aud \|\| ""\) !== clientId/);
assert.match(google, /accounts\.google\.com/);
assert.match(google, /email_verified/);
assert.match(google, /expiresAt <= Math\.floor\(Date\.now\(\) \/ 1000\) - 30/);
assert.match(google, /sameOriginMutation/);
assert.match(google, /CREATE TABLE IF NOT EXISTS hermes_auth_identities/);
assert.match(google, /WHERE lower\(email\) = \?/);
assert.match(google, /ON CONFLICT\(provider,provider_subject\) DO NOTHING/);
assert.match(google, /existing_account_signin_required/);
assert.match(google, /getAuthenticatedSpecialist\(request, env.DB\)/);
assert.match(google, /provider_identity_conflict/);
assert.doesNotMatch(google, /specialist_id=excluded.specialist_id/);
assert.match(google, /sessionCookieHeader\(token\)/);
assert.match(google, /hashPassword\(crypto\.randomUUID\(\) \+ crypto\.randomUUID\(\)\)/);
assert.doesNotMatch(google, /console\.(log|error)\([^\n]*credential/i);

assert.match(access, /\/api\/auth\/providers/);
assert.match(access, /providers\?\.google\?\.enabled/);
assert.match(access, /https:\/\/accounts\.google\.com\/gsi\/client/);
assert.match(access, /\/api\/auth\/google/);
assert.match(access, /data-social-auth hidden/);
assert.match(access, /await setupSocialAuth\(\)/);

assert.match(hub, /data-access-google hidden/);
assert.match(hub, /data-google-auth-button/);
assert.match(hub, /\/api\/auth\/providers/);
assert.match(hub, /providers\?\.google\?\.enabled/);
assert.match(hub, /https:\/\/accounts\.google\.com\/gsi\/client/);
assert.match(hub, /\/api\/auth\/google/);
assert.match(hub, /googleAuthBlock\.hidden = false/);
assert.match(hub, /setupFederatedProviders/);
assert.match(hub, /data-email-magic-link/);

for (const directive of ["script-src", "connect-src", "frame-src"]) {
  assert.match(headers, new RegExp(`${directive}[^\\n]*https://accounts\\.google\\.com`));
}

console.log("hermes-google-auth-contract: provider-gated Google identity, verified-email account linking, one Hermes session and CSP support verified");
