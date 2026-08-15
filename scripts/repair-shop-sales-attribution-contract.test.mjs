import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { onRequestGet as captureReferral } from "../functions/api/repair-shop/referral.ts";
import { onRequestPost as register } from "../functions/api/auth/register.ts";

class AttributionMockDb {
  constructor() {
    this.specialists = [];
    this.sessions = [];
    this.attribution = [];
  }

  prepare(sql) {
    const db = this;
    const cleanSql = sql.replace(/\s+/g, " ").trim();
    const directRun = async () => ({ success: true });

    return {
      run: directRun,
      bind(...args) {
        return {
          async first() {
            if (cleanSql.includes("SELECT id FROM specialists WHERE email = ?")) {
              const specialist = db.specialists.find((item) => item.email === args[0]);
              return specialist ? { id: specialist.id } : null;
            }
            return null;
          },
          async run() {
            if (cleanSql.includes("INSERT INTO specialists")) {
              const [id, email, password_hash, password_salt, name, role, location, bio, created_at] = args;
              db.specialists.push({ id, email, password_hash, password_salt, name, role, location, bio, created_at });
            } else if (cleanSql.includes("INSERT OR IGNORE INTO repair_shop_sales_attribution")) {
              const [owner_specialist_id, salesperson_code, referral_token_hash, source, captured_at, registered_at] = args;
              if (!db.attribution.some((item) => item.owner_specialist_id === owner_specialist_id)) {
                db.attribution.push({ owner_specialist_id, salesperson_code, referral_token_hash, source, captured_at, registered_at });
              }
            } else if (cleanSql.includes("INSERT INTO sessions")) {
              const [token, specialist_id, created_at, expires_at] = args;
              db.sessions.push({ token, specialist_id, created_at, expires_at });
            }
            return { success: true };
          },
        };
      },
    };
  }
}

const opaqueToken = "PilotReferral_7xYp3A9mK2vN8qRs";
const privateSalespersonCode = "REP_17";
const envConfig = JSON.stringify({
  [opaqueToken]: { salesperson_code: privateSalespersonCode, source: "repair-shop-outbound" },
});

const captureResponse = await captureReferral({
  request: new Request(`https://hermeslogisticsus.com/api/repair-shop/referral?ref=${opaqueToken}`),
  env: { REPAIR_SHOP_REFERRAL_MAP_JSON: envConfig },
});

assert.equal(captureResponse.status, 302);
const captureLocation = captureResponse.headers.get("Location") || "";
assert.match(captureLocation, /\/services\/hermes-connect\/repair-shops\/auth\/\?mode=register&referral=captured$/);
assert.doesNotMatch(captureLocation, new RegExp(opaqueToken));
assert.doesNotMatch(captureLocation, new RegExp(privateSalespersonCode));

const referralCookie = captureResponse.headers.get("Set-Cookie") || "";
assert.match(referralCookie, /hermes_repair_ref=/);
assert.match(referralCookie, /HttpOnly/);
assert.match(referralCookie, /Secure/);
assert.match(referralCookie, /SameSite=Lax/);
assert.doesNotMatch(referralCookie, new RegExp(privateSalespersonCode));

const db = new AttributionMockDb();
const registrationRequest = new Request("https://hermeslogisticsus.com/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: referralCookie.split(";")[0],
  },
  body: JSON.stringify({
    email: "pilot.shop@example.com",
    password: "StrongPilotPassword123!",
    name: "Pilot Shop Owner",
    role: "Shop Owner",
    location: "Milwaukee, WI",
    bio: "Independent repair shop registered for Hermes Connect outbound beta.",
  }),
});

const registrationResponse = await register({
  request: registrationRequest,
  env: { DB: db, REPAIR_SHOP_REFERRAL_MAP_JSON: envConfig },
});

assert.equal(registrationResponse.status, 201);
const registrationData = await registrationResponse.json();
assert.equal(registrationData.success, true);
assert.equal(registrationData.attribution_captured, true);
assert.equal(db.attribution.length, 1);
assert.equal(db.attribution[0].owner_specialist_id, registrationData.specialist.id);
assert.equal(db.attribution[0].salesperson_code, privateSalespersonCode);
assert.equal(db.attribution[0].source, "repair-shop-outbound");
assert.notEqual(db.attribution[0].referral_token_hash, opaqueToken);
assert.equal(db.attribution[0].referral_token_hash, createHash("sha256").update(opaqueToken).digest("hex"));

const responseText = JSON.stringify(registrationData);
assert.doesNotMatch(responseText, new RegExp(privateSalespersonCode));
assert.doesNotMatch(responseText, new RegExp(opaqueToken));

const registrationCookies = registrationResponse.headers.get("Set-Cookie") || "";
assert.match(registrationCookies, /hermes_session=/);
assert.match(registrationCookies, /hermes_repair_ref=;/);
assert.match(registrationCookies, /Max-Age=0/);

const invalidCapture = await captureReferral({
  request: new Request("https://hermeslogisticsus.com/api/repair-shop/referral?ref=UnknownOpaqueToken_0000"),
  env: { REPAIR_SHOP_REFERRAL_MAP_JSON: envConfig },
});
assert.equal(invalidCapture.status, 302);
assert.match(invalidCapture.headers.get("Location") || "", /referral=invalid/);
assert.equal(invalidCapture.headers.get("Set-Cookie"), null);

console.log("Repair Shop private referral capture and owner attribution contract passed.");
