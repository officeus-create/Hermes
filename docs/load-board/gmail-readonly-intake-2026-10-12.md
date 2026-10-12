# Direct Gmail → Load Board read-only intake — 2026-10-12

## Decision

Remove the manual-forward dependency without creating a second parser, D1 model, Load Board, or outbound email path.

The existing `hermes-lead-email` Worker now has a scheduled, fail-closed Gmail **read-only** poller that:
1. does nothing unless `LOADBOARD_GMAIL_INTAKE_ENABLED=true`;
2. uses dedicated `GMAIL_INGEST_OAUTH_*` credentials, separate from `GMAIL_OAUTH_*` used by the optional account-mail sender;
3. requires an explicit bounded Gmail query such as `newer_than:1d from:approved-source@example.com`;
4. fetches messages only with Gmail `messages.list` + `messages.get?format=raw`;
5. reuses the existing Load Board source configuration, authentication gate, parser, TTL, quarantine, normalized fingerprints and D1 intake;
6. never calls Gmail send and exposes no send method;
   Source authentication is **mandatory** for direct Gmail intake: the leading `mx.google.com` Authentication-Results must contain a DMARC pass aligned with the approved From domain. A later/forged pass or a `require_authentication=false` source override cannot enable intake. Authentication failures are quarantined.
7. records provider provenance as `gmail_api` and keeps raw bodies out of the normalized Load Board projection.

## Production safety

Production config keeps `LOADBOARD_GMAIL_INTAKE_ENABLED=false` by default.

Activation requires all of the following:
- owner-approved source/mailbox;
- OAuth consent limited to read-only Gmail access;
- dedicated ingest client/secret/refresh token stored as Worker secrets, never in GitHub;
- explicit mailbox and source query;
- existing Load Board source permissions/TTL;
- current private intake token/service trust;
- current company-wide no-email-send rule remains unchanged.

The scheduled trigger can exist while disabled; a disabled run performs zero provider calls.

## Current implementation boundary

This first direct-mailbox slice uses a bounded **fresh-window poll** plus existing D1 message/fingerprint dedupe. It removes manual forwarding and keeps stale history out of live inventory.

A true Gmail `users.watch/history.list` cursor can replace the bounded polling window later only if the operational volume makes it necessary. Do not add Pub/Sub/history cursor state merely for architecture purity before this simpler direct path is production-proven.

## Evidence gate

Do not call this LIVE until:
- exact-head contract test passes;
- Worker package dry-run passes;
- current Worker is deployed with the existing narrow Cloudflare release credential;
- dedicated read-only OAuth/query/source config is installed;
- one genuinely fresh permissioned source message is observed through direct intake;
- normalized D1 readback proves correct record type, visibility, TTL and dedupe;
- no outbound email is generated.
