import assert from "node:assert/strict";
import { syncLoadBoardGmailInbox } from "../workers/lead-email/src/load-board-gmail-readonly.mjs";

const disabledCalls = [];
const disabled = await syncLoadBoardGmailInbox({
  LOADBOARD_GMAIL_INTAKE_ENABLED: "false",
}, null, {
  fetch: async (...args) => {
    disabledCalls.push(args);
    throw new Error("disabled sync must not call provider");
  },
});
assert.equal(disabled.enabled, false);
assert.equal(disabledCalls.length, 0);

const raw = [
  "From: Capacity Partner <capacity@example.com>",
  "To: tina@example.com",
  "Subject: Truck list",
  "Message-ID: <gmail-readonly-capacity-001@example.com>",
  "Date: Mon, 12 Oct 2026 10:00:00 +0000",
  "Authentication-Results: mx.google.com; dkim=pass header.d=example.com; spf=pass smtp.mailfrom=example.com; dmarc=pass header.from=example.com",
  "Content-Type: text/plain; charset=utf-8",
  "",
  "Monday's Empty 53 dry vans list:",
  "Fulton, NY - 10:00 AM READY",
  "Delaware, OH to Houston, TX - 12:00 PM READY",
  "THANK YOU.",
].join("\r\n");

const rawEncoded = Buffer.from(raw, "utf8").toString("base64url");
const calls = [];
let intakePayload = null;

const fetchMock = async (url, init = {}) => {
  const value = String(url);
  calls.push({ url: value, method: init.method || "GET" });

  if (value === "https://oauth2.googleapis.com/token") {
    assert.equal(init.method, "POST");
    assert.match(String(init.body), /grant_type=refresh_token/);
    return new Response(JSON.stringify({ access_token: "readonly-token" }), { status: 200 });
  }
  if (value === "https://gmail.googleapis.com/gmail/v1/users/me/profile") {
    assert.equal(init.headers.Authorization, "Bearer readonly-token");
    return new Response(JSON.stringify({ emailAddress: "tina@example.com" }), { status: 200 });
  }
  if (value.startsWith("https://gmail.googleapis.com/gmail/v1/users/me/messages?")) {
    assert.match(value, /q=/);
    assert.equal(init.headers.Authorization, "Bearer readonly-token");
    return new Response(JSON.stringify({ messages: [{ id: "gmail-001" }] }), { status: 200 });
  }
  if (value === "https://gmail.googleapis.com/gmail/v1/users/me/messages/gmail-001?format=raw") {
    assert.equal(init.headers.Authorization, "Bearer readonly-token");
    return new Response(JSON.stringify({ id: "gmail-001", raw: rawEncoded,
      internalDate: String(Date.parse("2026-10-12T11:00:00Z")) }), { status: 200 });
  }
  if (value === "https://hermeslogisticsus.com/api/load-board/intake") {
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, "Bearer intake-token");
    intakePayload = JSON.parse(init.body);
    return new Response(JSON.stringify({ success: true, accepted: 2, quarantined: 0 }), { status: 202 });
  }
  throw new Error(`unexpected URL: ${value}`);
};

const enabledConfig = {
  LOADBOARD_GMAIL_INTAKE_ENABLED: "true",
  LOADBOARD_GMAIL_MAILBOX: "tina@example.com",
  LOADBOARD_GMAIL_QUERY: "newer_than:1d from:capacity@example.com",
  LOADBOARD_GMAIL_MAX_MESSAGES: "10",
  GMAIL_INGEST_OAUTH_CLIENT_ID: "client-id",
  GMAIL_INGEST_OAUTH_CLIENT_SECRET: "client-secret",
  GMAIL_INGEST_OAUTH_REFRESH_TOKEN: "refresh-token",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "intake-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "capacity@example.com": {
      id: "src_capacity_partner", name: "Capacity Partner",
      redistribution_permission: "carrier_only", requested_visibility: "carrier_only",
      contact_reveal_permission: "hidden", ttl_hours: 12, require_authentication: true,
    },
  }),
};

const result = await syncLoadBoardGmailInbox({
  LOADBOARD_GMAIL_INTAKE_ENABLED: "true",
  LOADBOARD_GMAIL_MAILBOX: "tina@example.com",
  LOADBOARD_GMAIL_QUERY: "newer_than:1d from:capacity@example.com",
  LOADBOARD_GMAIL_MAX_MESSAGES: "10",
  GMAIL_INGEST_OAUTH_CLIENT_ID: "client-id",
  GMAIL_INGEST_OAUTH_CLIENT_SECRET: "client-secret",
  GMAIL_INGEST_OAUTH_REFRESH_TOKEN: "refresh-token",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "intake-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "capacity@example.com": {
      id: "src_capacity_partner",
      name: "Capacity Partner",
      redistribution_permission: "carrier_only",
      requested_visibility: "carrier_only",
      contact_reveal_permission: "hidden",
      ttl_hours: 12,
      require_authentication: true,
    },
  }),
}, null, {
  fetch: fetchMock,
  now: () => Date.parse("2026-10-12T12:00:00.000Z"),
});

assert.equal(result.enabled, true);
assert.equal(result.scanned, 1);
assert.equal(result.ingested, 2);
assert.equal(result.quarantined, 0);
assert.equal(result.skipped, 0);
assert.equal(intakePayload.source.provider, "gmail_api");
assert.equal(intakePayload.source.mailbox_email, "tina@example.com");
assert.equal(intakePayload.source.credential_ref, "gmail_oauth:tina@example.com");
assert.equal(intakePayload.source.read_enabled, true);
assert.equal(intakePayload.source.ingest_enabled, true);
assert.equal(intakePayload.records.length, 2);
assert.ok(intakePayload.records.every((record) => record.record_type === "capacity"));
assert.ok(intakePayload.records.every((record) => record.visibility === "carrier_only"));
assert.doesNotMatch(JSON.stringify(intakePayload), /client-secret|refresh-token|readonly-token/);
assert.equal(calls.some((call) => /messages\/send|\/v1\/send/.test(call.url)), false);

// A wrong OAuth account must be rejected before messages.list or intake.
let wrongMailboxListCalls=0;
const wrongMailboxFetch = async (url, init={}) => {
  if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/profile")
    return new Response(JSON.stringify({emailAddress:"another-mailbox@example.com"}),{status:200});
  if (String(url).includes("/gmail/v1/users/me/messages") || String(url).includes("/api/load-board/intake"))
    wrongMailboxListCalls++;
  return fetchMock(url,init);
};
await assert.rejects(
  syncLoadBoardGmailInbox(enabledConfig,null,{fetch:wrongMailboxFetch,now:()=>Date.parse("2026-10-12T12:00:00Z")}),
  /gmail_ingest_mailbox_mismatch/
);
assert.equal(wrongMailboxListCalls,0);

// A re-delivered stale source message cannot create live capacity merely
// because Gmail's internal delivery timestamp or poll time is recent.
let stalePayload=null;
const staleRaw = raw.replace("Date: Mon, 12 Oct 2026 10:00:00 +0000","Date: Fri, 25 Sep 2026 10:00:00 +0000");
const staleFetch = async (url,init={}) => {
  if(String(url).endsWith("/messages/gmail-001?format=raw"))
    return new Response(JSON.stringify({id:"gmail-001",
      raw:Buffer.from(staleRaw,"utf8").toString("base64url"),
      internalDate:String(Date.parse("2026-10-12T11:00:00Z"))}),{status:200});
  if(String(url)==="https://hermeslogisticsus.com/api/load-board/intake"){
    stalePayload=JSON.parse(init.body);
    return new Response(JSON.stringify({success:true,accepted:0,quarantined:1}),{status:202});
  }
  return fetchMock(url,init);
};
const staleResult=await syncLoadBoardGmailInbox(enabledConfig,null,{
  fetch:staleFetch,now:()=>Date.parse("2026-10-12T12:00:00Z")});
assert.equal(staleResult.ingested,0);
assert.equal(staleResult.quarantined,1);
assert.equal(stalePayload.records.length,0);
assert.equal(stalePayload.quarantine[0].reason,"stale_email");
assert.equal(calls.some((call)=>call.url.includes("/messages/send") || call.url.includes("/v1/send")),false);

console.log("load-board-gmail-readonly-contract PASS: disabled mode, verified OAuth mailbox, fresh timestamp, source auth, stale quarantine, zero outbound");
