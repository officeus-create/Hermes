import assert from "node:assert/strict";
import { verifyAppleIdentityToken } from "../functions/api/_lib/apple-oidc.mjs";

// Synthetic, locally signed RS256 Apple-like tokens. No real Apple credentials,
// provider network calls, email, database writes, or real user identity.
const keys = await crypto.subtle.generateKey({
  name: "RSASSA-PKCS1-v1_5",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
}, true, ["sign", "verify"]);
const publicJwk = {
  ...(await crypto.subtle.exportKey("jwk", keys.publicKey)),
  kid: "synthetic-apple-key-1", alg: "RS256", use: "sig",
};
const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const makeJwt = async claims => {
  const header = encode({ alg: "RS256", kid: publicJwk.kid, typ: "JWT" });
  const payload = encode(claims);
  const signingInput = header + "." + payload;
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" }, keys.privateKey, new TextEncoder().encode(signingInput),
  );
  return signingInput + "." + Buffer.from(signature).toString("base64url");
};
const now = Math.floor(Date.now() / 1000);
const id = "com.hermes.synthetic.apple.service";
const nonce = "synthetic-nonce";
const valid = {
  iss: "https://appleid.apple.com",
  aud: id,
  sub: "synthetic-apple-user-1",
  email: "synthetic@example.com",
  email_verified: "true",
  nonce,
  iat: now - 20,
  exp: now + 300,
};
const realFetch = globalThis.fetch;
let keyFetches = 0;
globalThis.fetch = async (input) => {
  assert.equal(String(input), "https://appleid.apple.com/auth/keys");
  keyFetches++;
  return new Response(JSON.stringify({ keys: [publicJwk] }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
};

try {
  const approved = await verifyAppleIdentityToken(await makeJwt(valid), id, nonce);
  assert.deepEqual(approved, { sub: valid.sub, email: valid.email });
  const negatives = [
    ["missing exp", { exp: undefined }],
    ["missing iat", { iat: undefined }],
    ["text exp", { exp: String(now + 300) }],
    ["text iat", { iat: String(now - 20) }],
    ["fraction exp", { exp: now + 0.1 }],
    ["negative exp", { exp: -1 }],
    ["expired token", { exp: now - 10 }],
    ["future issuance", { iat: now + 180 }],
    ["issued after expiry", { iat: now - 5, exp: now - 10 }],
    ["incorrect audience", { aud: "com.attacker.fake" }],
    ["incorrect nonce", { nonce: "replay-other-session" }],
    ["unverified email", { email_verified: false }],
  ];
  for (const [caseName, override] of negatives) {
    const candidate = { ...valid, ...override };
    const result = await verifyAppleIdentityToken(await makeJwt(candidate), id, nonce);
    assert.equal(result, null, "reject " + caseName);
  }
  const original = await makeJwt(valid);
  const parts = original.split(".");
  parts[1] = encode({ ...valid, sub: "malicious-subject" });
  assert.equal(await verifyAppleIdentityToken(parts.join("."), id, nonce), null,
    "reject signed JWT whose payload was altered");
  assert.ok(keyFetches >= negatives.length, "JWKS provider check executed under mock");
  console.log("hermes-apple-id-token-claims: signed positive, missing numeric dates, expiry, audience, nonce, signature and verified-email negatives PASS");
} finally {
  globalThis.fetch = realFetch;
}
