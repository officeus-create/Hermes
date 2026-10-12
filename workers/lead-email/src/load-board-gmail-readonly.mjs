import {
  extractMimeText,
  mailboxFromHeader,
  parseCapacityListEmail,
  parseFreightEmailRecords,
  parseSourceConfig,
  sourceAuthenticationPassed,
  submitIntake,
} from "./load-board-inbound.mjs";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const DEFAULT_MAX_MESSAGES = 20;
const MAX_MESSAGES = 50;

const clean = (value, max = 500) => String(value ?? "")
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
  .trim()
  .slice(0, max);

const normalizeEmail = (value) => clean(value, 320).toLowerCase();

const decodeBase64Url = (value) => {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const parseRawHeaders = (raw) => {
  const normalized = String(raw || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const block = normalized.split("\n\n", 1)[0] || "";
  const unfolded = block.replace(/\n[ \t]+/g, " ");
  const headers = {};
  for (const line of unfolded.split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[key] = headers[key] ? `${headers[key]}, ${value}` : value;
  }
  return headers;
};

const header = (headers, name) => clean(headers?.[String(name).toLowerCase()] || "", 4_000);

const safeIso = (value, fallback) => {
  const date = value ? new Date(String(value)) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
};

const isCapacityListEmail = (subject, body) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  return /\btruck\s+list\b/i.test(subject)
    || /\bempty\b[^\n]{0,80}\b(?:dry\s*van|reefer|flatbed|truck|trailer)s?\b[^\n]{0,80}\blist\b/i.test(combined);
};

const gmailReadConfig = (env) => ({
  clientId: clean(env.GMAIL_INGEST_OAUTH_CLIENT_ID, 500),
  clientSecret: clean(env.GMAIL_INGEST_OAUTH_CLIENT_SECRET, 2_000),
  refreshToken: clean(env.GMAIL_INGEST_OAUTH_REFRESH_TOKEN, 4_000),
  mailbox: normalizeEmail(env.LOADBOARD_GMAIL_MAILBOX),
  query: clean(env.LOADBOARD_GMAIL_QUERY, 1_000),
  enabled: String(env.LOADBOARD_GMAIL_INTAKE_ENABLED || "").toLowerCase() === "true",
  maxMessages: Math.max(1, Math.min(MAX_MESSAGES, Number(env.LOADBOARD_GMAIL_MAX_MESSAGES) || DEFAULT_MAX_MESSAGES)),
});

const oauthAccessToken = async (config, fetchImpl) => {
  const response = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`gmail_ingest_oauth_http_${response.status}`);
  const payload = await response.json();
  const token = clean(payload?.access_token, 8_000);
  if (!token) throw new Error("gmail_ingest_oauth_token_missing");
  return token;
};

const sourcePayload = (source, mailbox) => ({
  id: source.id,
  provider: "gmail_api",
  source_type: "email",
  name: source.name,
  mailbox_email: mailbox,
  credential_ref: `gmail_oauth:${mailbox}`,
  redistribution_permission: source.redistributionPermission,
  contact_reveal_permission: source.contactRevealPermission,
  read_enabled: true,
  ingest_enabled: true,
});

const processRawGmailMessage = async ({ gmailId, raw, internalDate, mailbox, sources, env, observedAt, fetchImpl }) => {
  const headers = parseRawHeaders(raw);
  const sender = mailboxFromHeader(header(headers, "from"));
  const source = sources.find((candidate) => candidate.matchFrom === sender);
  if (!source) return { outcome: "skipped_unapproved_source", gmailId };

  const subject = clean(header(headers, "subject"), 200);
  const sourceMessageId = clean(header(headers, "message-id").replace(/[<>]/g, ""), 220) || `gmail:${gmailId}`;
  // Sender Date is untrusted, while Gmail internalDate is the mailbox receipt
  // time. Require both before considering a record fresh; use the older value
  // so a re-delivered historical message never becomes fresh inventory.
  const sourceTime = Date.parse(header(headers, "date"));
  const mailboxTime = Number(internalDate);
  const observedTime = Date.parse(observedAt);
  const datesVerified = Number.isFinite(sourceTime) && Number.isFinite(mailboxTime)
    && mailboxTime > Date.parse("2000-01-01T00:00:00Z")
    && sourceTime <= observedTime + 300_000 && mailboxTime <= observedTime + 300_000;
  const earliestTime = datesVerified ? Math.min(sourceTime, mailboxTime) : NaN;
  const receivedAt = Number.isFinite(earliestTime)
    ? new Date(earliestTime).toISOString() : null;
  const extracted = extractMimeText(raw);
  const body = clean(extracted.plain || extracted.html, 120_000);
  const rawEvidenceRef = `gmail:${source.id}:${gmailId}`;

  let records = [];
  let quarantine = [];
  if (!datesVerified || !receivedAt) {
    quarantine = [{
      source_message_id: sourceMessageId, fingerprint: `gmail-time:${gmailId}`,
      reason: "gmail_message_timestamps_unverified", subject,
      received_at: observedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef,
    }];
  } else if (earliestTime + source.ttlHours * 60 * 60 * 1000 <= observedTime) {
    quarantine = [{
      source_message_id: sourceMessageId, fingerprint: `gmail-stale:${gmailId}`,
      reason: "stale_email", subject,
      received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef,
    }];
  } else if (source.requireAuthentication && !sourceAuthenticationPassed(headers)) {
    quarantine = [{
      source_message_id: sourceMessageId,
      fingerprint: `gmail-auth:${gmailId}`,
      reason: "source_authentication_unverified",
      subject,
      received_at: receivedAt,
      observed_at: observedAt,
      raw_evidence_ref: rawEvidenceRef,
    }];
  } else if (!body) {
    quarantine = [{
      source_message_id: sourceMessageId,
      fingerprint: `gmail-body:${gmailId}`,
      reason: "email_body_unreadable",
      subject,
      received_at: receivedAt,
      observed_at: observedAt,
      raw_evidence_ref: rawEvidenceRef,
    }];
  } else if (isCapacityListEmail(subject, body)) {
    ({ records, quarantine } = await parseCapacityListEmail({
      subject,
      body,
      receivedAt,
      observedAt,
      source,
      sourceMessageId,
      rawEvidenceRef,
    }));
  } else {
    ({ records, quarantine } = await parseFreightEmailRecords({
      subject,
      body,
      receivedAt,
      observedAt,
      source,
      sourceMessageId,
      rawEvidenceRef,
    }));
  }

  const response = await submitIntake(env, {
    source: sourcePayload(source, mailbox),
    records,
    quarantine,
  }, fetchImpl);
  // An HTTP 202 acknowledges the intake request, not acceptance of every
  // parsed freight/capacity record. Count only the API's D1 write receipt.
  const receipt = await response.json().catch(() => null);
  const acceptedRecords = receipt?.accepted;
  const quarantinedRecords = receipt?.quarantined;
  const totalSubmitted = records.length + quarantine.length;
  if (receipt?.success !== true || !Number.isInteger(acceptedRecords)
    || !Number.isInteger(quarantinedRecords) || acceptedRecords < 0
    || quarantinedRecords < 0 || acceptedRecords + quarantinedRecords > totalSubmitted) {
    throw new Error("loadboard_intake_receipt_invalid");
  }

  return {
    outcome: acceptedRecords ? "ingested" : quarantinedRecords ? "quarantined" : "skipped_rejected",
    gmailId,
    acceptedRecords,
    quarantinedRecords,
    intakeStatus: response.status,
  };
};

const syncLoadBoardGmailInbox = async (env, _ctx, deps = {}) => {
  const config = gmailReadConfig(env);
  if (!config.enabled) return { enabled: false, scanned: 0, ingested: 0, quarantined: 0, skipped: 0 };

  if (!config.clientId || !config.clientSecret || !config.refreshToken || !config.mailbox || !config.query) {
    throw new Error("gmail_ingest_configuration_missing");
  }
  if (!env.LOADBOARD_INGEST_URL || !(env.LOADBOARD_INGEST_TOKEN || env.LEAD_SERVICE_TOKEN)) {
    throw new Error("loadboard_bridge_not_configured");
  }

  const sources = parseSourceConfig(env.LOADBOARD_EMAIL_SOURCE_CONFIG);
  if (!sources.length) throw new Error("gmail_ingest_source_config_missing");

  const fetchImpl = deps.fetch || fetch;
  const accessToken = await oauthAccessToken(config, fetchImpl);
  const authHeaders = { Authorization: `Bearer ${accessToken}` };
  // Never attribute a different OAuth mailbox's messages to the configured
  // Hermes source mailbox. A mismatched token fails before listing any mail.
  const profileResponse = await fetchImpl(`${GMAIL_BASE}/profile`, { headers: authHeaders });
  if (!profileResponse.ok) throw new Error(`gmail_ingest_profile_http_${profileResponse.status}`);
  const profile = await profileResponse.json();
  const actualMailbox = normalizeEmail(profile?.emailAddress);
  if (!actualMailbox || actualMailbox !== config.mailbox) {
    throw new Error("gmail_ingest_mailbox_mismatch");
  }
  // Enforce a fresh 24-hour Gmail search boundary even if an operator enters
  // a broad query. Each source's stricter TTL is still checked below before
  // calling intake, so old messages cannot become active freight/capacity.
  const observedAt = new Date(deps.now?.() || Date.now()).toISOString();
  const afterEpoch = Math.floor(Date.parse(observedAt) / 1000) - 24 * 60 * 60;
  const boundedQuery = `(${config.query}) after:${afterEpoch}`;
  const listUrl = `${GMAIL_BASE}/messages?maxResults=${config.maxMessages}&q=${encodeURIComponent(boundedQuery)}`;
  const listResponse = await fetchImpl(listUrl, { headers: authHeaders });
  if (!listResponse.ok) throw new Error(`gmail_ingest_list_http_${listResponse.status}`);
  const listPayload = await listResponse.json();
  const messages = Array.isArray(listPayload?.messages) ? listPayload.messages.slice(0, config.maxMessages) : [];

  const summary = { enabled: true, scanned: 0, ingested: 0, quarantined: 0, skipped: 0 };

  for (const item of messages) {
    const gmailId = clean(item?.id, 240);
    if (!gmailId) continue;
    summary.scanned += 1;
    const response = await fetchImpl(`${GMAIL_BASE}/messages/${encodeURIComponent(gmailId)}?format=raw`, { headers: authHeaders });
    if (!response.ok) throw new Error(`gmail_ingest_message_http_${response.status}`);
    const payload = await response.json();
    const raw = decodeBase64Url(payload?.raw);
    const result = await processRawGmailMessage({
      gmailId,
      raw,
      internalDate: payload?.internalDate,
      mailbox: config.mailbox,
      sources,
      env,
      observedAt,
      fetchImpl,
    });
    summary.ingested += result.acceptedRecords || 0;
    summary.quarantined += result.quarantinedRecords || 0;
    if (!result.acceptedRecords && !result.quarantinedRecords) summary.skipped += 1;
  }

  console.log(JSON.stringify({
    event: "loadboard_gmail_readonly_sync",
    mailbox: config.mailbox,
    scanned: summary.scanned,
    ingested: summary.ingested,
    quarantined: summary.quarantined,
    skipped: summary.skipped,
  }));
  return summary;
};

export {
  decodeBase64Url,
  gmailReadConfig,
  parseRawHeaders,
  processRawGmailMessage,
  syncLoadBoardGmailInbox,
};
