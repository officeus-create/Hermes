#!/usr/bin/env bash

# Retry only the retired deadline gate that can be observed briefly while the
# exact Cloudflare Pages deployment is converging across the custom domain.
# Every other response, a missing exact-SHA receipt, and the final attempt fail
# closed in the caller.
hermes_should_retry_repair_shop_rollout() {
  local exact_sha_confirmed="${1:-false}"
  local http_status="${2:-}"
  local error_code="${3:-}"
  local attempt="${4:-0}"
  local max_attempts="${5:-0}"

  [[ "$exact_sha_confirmed" == "true" ]] || return 1
  [[ "$http_status" == "403" ]] || return 1
  [[ "$error_code" == "repair_shop_free_registration_ended" ]] || return 1
  [[ "$attempt" =~ ^[0-9]+$ && "$max_attempts" =~ ^[0-9]+$ ]] || return 1
  (( attempt < max_attempts ))
}
