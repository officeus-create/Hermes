import assert from "node:assert/strict";
import fs from "node:fs";
import bridgeEntry from "../workers/lead-email/src/entry.mjs";
import {
  containsCarHauling,
  extractMimeText,
  handleLoadBoardInboundEmail,
  parseCapacityListEmail,
  parseControlledForwardMetadata,
  parseFreightEmail,
  parseSourceConfig,
  sourceAuthenticationPassed,
} from "../workers/lead-email/src/load-board-inbound.mjs";

const stream = (value) => new Blob([value]).stream();
const now = "2026-09-04T14:00:00.000Z";

assert.equal(typeof bridgeEntry.fetch, "function");
assert.equal(typeof bridgeEntry.email, "function");
const productionWorkerConfig = JSON.parse(fs.readFileSync(new URL("../workers/lead-email/wrangler.production.jsonc", import.meta.url), "utf8"));
assert.equal(productionWorkerConfig.vars.LOADBOARD_EMAIL_RECIPIENT, "loads@loadboard.hermeslogisticsus.com");

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
const forwardConfig = parseSourceConfig(JSON.stringify({
  "forwarder@example.com": {
    id: "src_forwarded_capacity",
    name: "Forwarded Capacity",
    redistribution_permission: "carrier_only",
    requested_visibility: "carrier_only",
    forwarded_source_email: "capacity-source@example.com",
  },
}));
assert.equal(forwardConfig[0].forwardedSourceEmail, "capacity-source@example.com");
const forwardMeta = parseControlledForwardMetadata("HERMES_LOADBOARD_FORWARD\nOriginal-Source: capacity-source@example.com\nOriginal-Received-At: 2026-09-04T14:00:00Z\nOriginal-Message-ID: gmail:abc123");
assert.equal(forwardMeta.source, "capacity-source@example.com");
assert.equal(forwardMeta.receivedAt, "2026-09-04T14:00:00.000Z");
assert.equal(forwardMeta.messageId, "gmail:abc123");

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


const multiCapacity = await parseCapacityListEmail({
  subject: "Truck list",
  body: [
    "Good Morning,",
    "Friday's Empty 53 dry vans list:",
    "dispatcher@example.com",
    "000-000-0000",
    "Fulton, NY -",
    "10:00 AM APPT",
    "Delaware, OH to Houston, TX -",
    "10:00 AM READY",
    "Saturday:",
    "dispatcher2@example.com",
    "000-000-0000",
    "Joplin, MO - 14:00 PM Team Truck",
    "REEFER Centre, AL - 10:00 READY",
    "THANK YOU.",
    "Sales Team",
  ].join("\n"),
  receivedAt: now,
  observedAt: now,
  source: { ...sourceConfig[0], requestedVisibility: "carrier_only", ttlHours: 12 },
  sourceMessageId: "capacity-list-001@example.com",
  rawEvidenceRef: "email:src_broker_example:capacity-list-001@example.com",
});
assert.equal(multiCapacity.quarantine.length, 0);
assert.equal(multiCapacity.records.length, 4);
assert.deepEqual(multiCapacity.records.map((item) => item.origin), ["Fulton, NY", "Delaware, OH", "Joplin, MO", "Centre, AL"]);
assert.deepEqual(multiCapacity.records.map((item) => item.equipment), ["dry_van", "dry_van", "dry_van", "reefer"]);
assert.equal(multiCapacity.records[0].pickup_window, "Friday 10:00 AM APPT");
assert.equal(multiCapacity.records[1].destination, "Houston, TX");
assert.equal(multiCapacity.records[2].pickup_window, "Saturday 14:00 PM Team Truck");
assert.equal(multiCapacity.records[2].team, true);
assert.equal(multiCapacity.records[0].visibility, "carrier_only");
assert.ok(multiCapacity.records.every((item) => item.record_type === "capacity"));
assert.ok(multiCapacity.records.every((item) => /^sha256:[a-f0-9]{64}$/.test(item.fingerprint)));
assert.ok(multiCapacity.records.every((item) => !JSON.stringify(item).includes("dispatcher@example.com")));

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

// Keep the bridge integration fixture fresh relative to the test run. TTL behavior
// itself is already covered above with fixed receivedAt/observedAt timestamps.
const bridgeDate = new Date().toUTCString();
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

let sharedTokenRequest = null;
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "broker@example.com",
  headers: new Headers({
    From: "Broker Example <broker@example.com>",
    Subject: "Dry Van load Chicago to Atlanta",
    "Message-ID": "<load-bridge-shared-token@example.com>",
    Date: bridgeDate,
  }),
  raw: stream(rawEmail.replace("load-bridge-001@example.com", "load-bridge-shared-token@example.com")),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LEAD_SERVICE_TOKEN: "shared-private-service-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "broker@example.com": {
      id: "src_broker_example",
      name: "Broker Example",
      redistribution_permission: "internal_only",
      requested_visibility: "internal_only",
      require_authentication: false,
    },
  }),
}, null, { fetch: async (url, options) => {
  sharedTokenRequest = { url, options };
  return new Response(JSON.stringify({ success: true, accepted: 1, quarantined: 0 }), { status: 202 });
} });
assert.equal(sharedTokenRequest.options.headers.Authorization, "Bearer shared-private-service-token");

let capacityListPayload = null;
const capacityBridgeDate = new Date().toUTCString();
const capacityRawEmail = [
  "From: Capacity Partner <capacity@example.com>",
  "To: loads@hermeslogisticsus.com",
  "Subject: Truck list",
  "Message-ID: <capacity-bridge-001@example.com>",
  `Date: ${capacityBridgeDate}`,
  "Content-Type: text/plain; charset=utf-8",
  "",
  "Friday's Empty 53 dry vans list:",
  "dispatcher@example.com",
  "000-000-0000",
  "Fulton, NY -",
  "10:00 AM APPT",
  "Delaware, OH to Houston, TX - 10:00 AM READY",
  "Saturday:",
  "Joplin, MO - 14:00 PM Team Truck",
  "REEFER Centre, AL - 10:00 READY",
  "THANK YOU.",
].join("\r\n");
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "capacity@example.com",
  headers: new Headers({
    From: "Capacity Partner <capacity@example.com>",
    Subject: "Truck list",
    "Message-ID": "<capacity-bridge-001@example.com>",
    Date: capacityBridgeDate,
    "Authentication-Results": "mx.cloudflare.net; dkim=pass header.d=example.com; spf=pass smtp.mailfrom=example.com",
  }),
  raw: stream(capacityRawEmail),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "capacity@example.com": {
      id: "src_capacity_partner",
      name: "Capacity Partner",
      redistribution_permission: "carrier_only",
      requested_visibility: "carrier_only",
      contact_reveal_permission: "hidden",
      ttl_hours: 12,
    },
  }),
}, null, { fetch: async (_url, options) => {
  capacityListPayload = JSON.parse(options.body);
  return new Response(JSON.stringify({ success: true, accepted: 4, quarantined: 0 }), { status: 202 });
} });
assert.equal(capacityListPayload.records.length, 4);
assert.equal(capacityListPayload.quarantine.length, 0);
assert.equal(capacityListPayload.records[1].destination, "Houston, TX");
assert.ok(capacityListPayload.records.every((item) => item.record_type === "capacity"));
assert.ok(capacityListPayload.records.every((item) => item.visibility === "carrier_only"));
assert.ok(capacityListPayload.records.every((item) => !JSON.stringify(item).includes("dispatcher@example.com")));

let carrierAuthPayload = null;
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "capacity@example.com",
  headers: new Headers({
    From: "Capacity Partner <capacity@example.com>",
    Subject: "Truck list",
    "Message-ID": "<capacity-auth-fail@example.com>",
    Date: capacityBridgeDate,
  }),
  raw: stream(capacityRawEmail.replace("capacity-bridge-001@example.com", "capacity-auth-fail@example.com")),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "capacity@example.com": {
      id: "src_capacity_partner",
      name: "Capacity Partner",
      redistribution_permission: "carrier_only",
      requested_visibility: "carrier_only",
    },
  }),
}, null, { fetch: async (_url, options) => {
  carrierAuthPayload = JSON.parse(options.body);
  return new Response(JSON.stringify({ success: true, accepted: 0, quarantined: 1 }), { status: 202 });
} });
assert.equal(carrierAuthPayload.records.length, 0);
assert.equal(carrierAuthPayload.quarantine[0].reason, "source_authentication_unverified");

let forwardedPayload = null;
const forwardedRaw = [
  "From: Internal Forwarder <forwarder@example.com>",
  "To: loads@hermeslogisticsus.com",
  "Subject: Fwd: Truck list",
  "Message-ID: <outer-forward-001@example.com>",
  `Date: ${capacityBridgeDate}`,
  "Content-Type: text/plain; charset=utf-8",
  "",
  "HERMES_LOADBOARD_FORWARD",
  "Original-Source: capacity-source@example.com",
  `Original-Received-At: ${new Date().toISOString()}`,
  "Original-Message-ID: gmail:capacity-original-001",
  "",
  "---------- Forwarded message ---------",
  "From: Capacity Source <capacity-source@example.com>",
  "Subject: Truck list",
  "",
  "Friday's Empty 53 dry vans list:",
  "dispatcher@example.com",
  "000-000-0000",
  "Fulton, NY - 10:00 AM READY",
  "Delaware, OH to Houston, TX - 12:00 PM READY",
  "THANK YOU.",
].join("\r\n");
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "forwarder@example.com",
  headers: new Headers({
    From: "Internal Forwarder <forwarder@example.com>",
    Subject: "Fwd: Truck list",
    "Message-ID": "<outer-forward-001@example.com>",
    Date: capacityBridgeDate,
    "Authentication-Results": "mx.cloudflare.net; dkim=pass header.d=example.com; spf=pass smtp.mailfrom=example.com",
  }),
  raw: stream(forwardedRaw),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "forwarder@example.com": {
      id: "src_forwarded_capacity",
      name: "Capacity Source",
      redistribution_permission: "carrier_only",
      requested_visibility: "carrier_only",
      contact_reveal_permission: "hidden",
      ttl_hours: 12,
      forwarded_source_email: "capacity-source@example.com",
    },
  }),
}, null, { fetch: async (_url, options) => {
  forwardedPayload = JSON.parse(options.body);
  return new Response(JSON.stringify({ success: true, accepted: 2, quarantined: 0 }), { status: 202 });
} });
assert.equal(forwardedPayload.source.provider, "controlled_email_forwarding");
assert.equal(forwardedPayload.records.length, 2);
assert.ok(forwardedPayload.records.every((item) => item.source_message_id === "gmail:capacity-original-001"));
assert.ok(forwardedPayload.records.every((item) => item.visibility === "carrier_only"));
assert.doesNotMatch(JSON.stringify(forwardedPayload.records), /forwarder@example\.com|dispatcher@example\.com/);

let forgedForwardPayload = null;
await handleLoadBoardInboundEmail({
  to: "loads@hermeslogisticsus.com",
  from: "forwarder@example.com",
  headers: new Headers({
    From: "Internal Forwarder <forwarder@example.com>",
    Subject: "Fwd: Truck list",
    "Message-ID": "<outer-forward-forged@example.com>",
    Date: capacityBridgeDate,
    "Authentication-Results": "mx.cloudflare.net; dkim=pass header.d=example.com; spf=pass smtp.mailfrom=example.com",
  }),
  raw: stream(forwardedRaw.replace("From: Capacity Source <capacity-source@example.com>", "From: Other <other@example.com>")),
}, {
  LOADBOARD_EMAIL_RECIPIENT: "loads@hermeslogisticsus.com",
  LOADBOARD_INGEST_URL: "https://hermeslogisticsus.com/api/load-board/intake",
  LOADBOARD_INGEST_TOKEN: "test-runtime-token",
  LOADBOARD_EMAIL_SOURCE_CONFIG: JSON.stringify({
    "forwarder@example.com": {
      id: "src_forwarded_capacity",
      name: "Capacity Source",
      redistribution_permission: "carrier_only",
      requested_visibility: "carrier_only",
      forwarded_source_email: "capacity-source@example.com",
    },
  }),
}, null, { fetch: async (_url, options) => {
  forgedForwardPayload = JSON.parse(options.body);
  return new Response(JSON.stringify({ success: true, accepted: 0, quarantined: 1 }), { status: 202 });
} });
assert.equal(forgedForwardPayload.records.length, 0);
assert.equal(forgedForwardPayload.quarantine[0].reason, "forwarded_source_unverified");

const staleForwardReceived = "2026-09-01T00:00:00.000Z";
const staleForwardObserved = "2026-09-04T14:00:00.000Z";
const staleForward = await parseCapacityListEmail({
  subject: "Fwd: Truck list",
  body: "Friday's Empty 53 dry vans list:\\nFulton, NY - 10:00 AM READY",
  receivedAt: staleForwardReceived,
  observedAt: staleForwardObserved,
  source: { ...sourceConfig[0], requestedVisibility: "carrier_only", ttlHours: 12 },
  sourceMessageId: "gmail:stale-forward",
  rawEvidenceRef: "email:src_broker_example:gmail:stale-forward",
});
assert.equal(staleForward.records.length, 0);
assert.equal(staleForward.quarantine[0].reason, "stale_email");

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
}, null, { fetch: async (_url, options) => {
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

console.log("load-board-email-bridge-contract: approved source, MIME parse, multi-record capacity, Car Hauling ingestion, authentication gate, TTL and no-raw-body handoff verified");
