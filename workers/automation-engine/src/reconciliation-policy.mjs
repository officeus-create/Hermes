export function reconcileExternalReceipt(input = {}) {
  const receipt = input.receipt || {};
  const provider = input.provider || {};

  if (provider.read_supported !== true) {
    return { status: "UNKNOWN", action: "NONE", reason: "provider_read_not_supported" };
  }
  if (provider.read_ok !== true) {
    return { status: "UNKNOWN", action: "REVIEW", reason: "provider_read_failed" };
  }

  if (provider.found !== true) {
    return { status: "DRIFT", action: "REVIEW", reason: "provider_object_missing" };
  }

  const expectedId = String(receipt.provider_id || "").trim();
  const actualId = String(provider.provider_id || "").trim();
  if (expectedId && !actualId) {
    return { status: "UNKNOWN", action: "REVIEW", reason: "provider_id_missing_from_readback" };
  }
  if (expectedId && actualId !== expectedId) {
    return { status: "DRIFT", action: "REVIEW", reason: "provider_id_mismatch" };
  }

  const expectedPermalink = String(receipt.permalink || "").trim();
  const actualPermalink = String(provider.permalink || "").trim();
  if (expectedPermalink && !actualPermalink) {
    return { status: "UNKNOWN", action: "REVIEW", reason: "permalink_missing_from_readback" };
  }
  if (expectedPermalink && actualPermalink !== expectedPermalink) {
    return { status: "DRIFT", action: "REVIEW", reason: "permalink_mismatch" };
  }

  const expectedHash = String(receipt.content_hash || "").trim();
  const actualHash = String(provider.content_hash || "").trim();
  if (expectedHash && !actualHash) {
    return { status: "UNKNOWN", action: "REVIEW", reason: "content_hash_missing_from_readback" };
  }
  if (expectedHash && actualHash !== expectedHash) {
    return { status: "DRIFT", action: "REVIEW", reason: "content_hash_mismatch" };
  }

  return { status: "CONSISTENT", action: "NONE", reason: "receipt_matches_provider" };
}
