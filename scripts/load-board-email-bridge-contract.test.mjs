import assert from "node:assert/strict";
import bridgeEntry from "../workers/lead-email/src/entry.mjs";
import {
  containsCarHauling,
  extractMimeText,
  handleLoadBoardInboundEmail,
  parseFreightEmail,
  parseSourceConfig,
  sourceAuthenticationPassed,
} from "../workers/lead-email/src/load-board-inbound.mjs";

const stream = (value) => new Blob([value]).stream();
const now = "2026-09-04T14:00:00.000Z";
const bridgeDate = new Date().toUTCString();

assert.equal(typeof bridgeEntry.fetch, "function");
assert.equal(typeof bridgeEntry.email, "function");

const sourceConfig = parseSourceConfig(JSON.stringify({
  "broker@example.com": {
    id: "src_broker_example",
    name: "Broker Example",
    redistribution_permission: "internal_only",
    requested_visibility: "internal_only",
    contact_reveal_permission: "hidden",
    ttl_hours: 12,
    require_authentication: false,
  },
}));
assert.equal(sourceConfig.length, 1);
assert.equal(sourceConfig[0].matchFrom, "broker@example.com");
assert.equal(sourceConfig[0].ttlHours, 12);

const parsed = await parseFreightEmail({
  subject: "Dry Van load Chicago to Atlanta",
  body: [
    "LOAD OFFER",
    "Origin: Chicago, IL 60609",
    "Destination: Atlanta, GA 30303",
    "Pickup: Today 16:00 CT",
    "Equipment: 53ft Dry Van",
    "Rate: $2,100",
  ].join("\n"),
  receivedAt: now,
  observedAt: now,
  source: sourceConfig[0],
  sourceMessageId: "load-001@example.com",
  rawEvidenceRef: "email:src_broker_example:load-001@example.com",
});
assert.equal(parsed.record.origin, "Chicago, IL");
assert.equal(parsed.record.destination, "Atlanta, GA");
assert.equal(parsed.record.equipment, "dry_van");
assert.equal(parsed.record.rate_amount, 2100);
assert.equal(parsed.record.visibility, "internal_only");
assert.equal(parsed.record.expires_at, "2026-09-05T02:00:00.000Z");
assert.match(parsed.record.fingerprint, /^sha256:[a-f0-9]{64}$/);

const carHauling = await parseFreightEmail({
  subject: "Vehicle transport order",
  body: "Origin: Chicago, IL\nDestination: Miami, FL\nEquipment: 3-car wedge\nRate: $3,200",
  receivedAt: now,
  observedAt: now,
  source: sourceConfig[0],
  sourceMessageId: "car-001@example.com",
  rawEvidenceRef: "email:src_broker_example:car-001@example.com",
});
assert.equal(carHauling.record.origin, "Chicago, IL");
assert.equal(carHauling.record.destination, "Miami, FL");
assert.equal(carHauling.record.equipment, "car_hauler");
assert.equal(carHauling.record.rate_amount, 3200);
assert.equal(carHauling.quarantine, undefined);
assert.equal(containsCarHauling("auto transport available"), true);

const incomplete = await parseFreightEmail({
  subject: "Load available",
  body: "Origin: Chicago, IL\nRate: $1,500",
  receivedAt: now,
  observedAt: now,
  source: sourceConfig[0],
  sourceMessageId: "incomplete-001@example.com",
  rawEvidenceRef: "email:src_broker_example:incomplete-001@example.com",
});
assert.match(incomplete.quarantine.reason, /^missing_/);
assert.match(incomplete.quarantine.reason, /equipment/);
assert.match(incomplete.quarantine.reason, /destination/);

const multipartRaw = [
  "From: Broker Example <broker@example.com>",
  "To: loads@hermeslogisticsus.com",
  "Subject: Reefer load",
  "Content-Type: multipart/alternative; boundary=hermes-test",
  "",
  "--hermes-test",
  "Content-Type: text/plain; charset=utf-8",
  "Content-Transfer-Encoding: quoted-printable",
  "",
  "Origin: Milwaukee, WI=0ADestination: Dallas, TX=0AEquipment: Reefer=0ARate: $2,850",
  "--hermes-test",
  "Content-Type: text/html; charset=utf-8",
  "",
  "<p>fallback</p>",
  "--hermes-test--",
].join("\r\n");
const multipartText = extractMimeText(multipartRaw);
assert.match(multipartText.plain, /Origin: Milwaukee, WI/);
assert.match(multipartText.plain, /Equipment: Reefer/);

const authenticatedHeaders = new Headers({
  "Authentication-Results": "mx.cloudflare.net; dkim=pass header.d=example.com; spf=pass smtp.mailfrom=example.com",
});
assert.equal(sourceAuthenticationPassed(authenticatedHeaders), true);
assert.equal(sourceAuthenticationPassed(new Headers()), false);

const rawEmail = [
  "From: Broker Example <broker@example.com>",
  "To: loads@hermeslogisticsus.com",
  "Subject: Dry Van load Chicago to Atlanta",
  "Message-ID: <load-bridge-001@example.com>",
  `Date: ${bridgeDate}`,
  "Content-Type: text/plain; charset=utf-8",
  "",
  "LOAD OFFER",
  "Origin: Chicago, IL",
  "Destination: Atlanta, GA",
  "Pickup: Today 16:00 CT",
  "Equipment: Dry Van",
  "Rate: $2,100",
].join("\r\n");

let capturedRequest = null;
const fakeFetch = async (url, options) => {
  capturedRequest = { url, options };
  return new Response(JSON.stringify({ success: true, accepted: 1, quarantined: 0 }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
};

await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "broker@example.com",
  headers: new Headers({
    From: "Broker Example <broker@example.com>",
    Subject: "Dry Van load Chicago to Atlanta",
    "Message-ID": "<load-bridge-001@example.com>",
    Date: bridgeDate,
  }),
  raw: stream(rawEmail),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "broker@example.com": {
      id: "src_broker_example",
      name: "Broker Example",
      redistribution_permission: "internal_only",
      requested_visibility: "internal_only",
      require_authentication: false,
    },
  }),
}, null, { fetch: fakeFetch });

assert.ok(capturedRequest);
assert.equal(capturedRequest.url, "https://hermeslogisticsus.com/api/load-board/intake");
assert.equal(capturedRequest.options.method, "POST");
assert.equal(capturedRequest.options.headers.Authorization, "Bearer test-runtime-token");
const payload = JSON.parse(capturedRequest.options.body);
assert.equal(payload.source.id, "src_broker_example");
assert.equal(payload.source.provider, "cloudflare_email_routing");
assert.equal(payload.records.length, 1);
assert.equal(payload.quarantine.length, 0);
assert.equal(payload.records[0].origin, "Chicago, IL");
assert.equal(payload.records[0].destination, "Atlanta, GA");
assert.equal(payload.records[0].equipment, "dry_van");
assert.equal(payload.records[0].raw_evidence_ref, "email:src_broker_example:load-bridge-001@example.com");
assert.doesNotMatch(capturedRequest.options.body, /LOAD OFFER/);
assert.doesNotMatch(capturedRequest.options.body, /test-runtime-token/);

let publicPayload = null;
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "publicbroker@example.com",
  headers: new Headers({
    From: "Public Broker <publicbroker@example.com>",
    Subject: "Flatbed load",
    "Message-ID": "<public-001@example.com>",
    Date: bridgeDate,
  }),
  raw: stream(rawEmail.replace(/broker@example\.com/g, "publicbroker@example.com")),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "publicbroker@example.com": {
      id: "src_public_broker",
      name: "Public Broker",
      redistribution_permission: "public",
      requested_visibility: "public",
    },
  }),
}, null, { fetch: async (url, options) => {
  publicPayload = JSON.parse(options.body);
  return new Response("{}", { status: 202 });
} });
assert.equal(publicPayload.records.length, 0);
assert.equal(publicPayload.quarantine.length, 1);
assert.equal(publicPayload.quarantine[0].reason, "source_authentication_unverified");

let unknownSourceCalls = 0;
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "unknown@example.com",
  headers: new Headers({ From: "Unknown <unknown@example.com>" }),
  raw: stream(rawEmail),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "broker@example.com": { id: "src_broker_example", name: "Broker Example" },
  }),
}, null, { fetch: async () => {
  unknownSourceCalls += 1;
  return new Response("{}", { status: 202 });
} });
assert.equal(unknownSourceCalls, 0);

console.log("load-board-email-bridge-contract: approved source, MIME parse, Car Hauling ingestion, quarantine, auth gate, TTL and no-raw-body handoff verified");