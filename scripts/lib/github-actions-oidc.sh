#!/usr/bin/env bash
set -euo pipefail

HERMES_BOOKING_OIDC_AUDIENCE="https://hermeslogisticsus.com/api/public/repair-booking"

hermes_booking_oidc_token() {
  if [[ -z "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" || -z "${ACTIONS_ID_TOKEN_REQUEST_TOKEN:-}" ]]; then
    echo "GitHub Actions OIDC is unavailable; id-token: write is required." >&2
    return 1
  fi

  local encoded_audience response token
  encoded_audience="$(jq -rn --arg value "$HERMES_BOOKING_OIDC_AUDIENCE" '$value|@uri')"
  response="$(curl -fsS --retry 2 --retry-delay 1 \
    -H "Authorization: bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}" \
    "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${encoded_audience}")"
  token="$(printf '%s' "$response" | jq -er '.value | select(type == "string" and length > 100)')"
  printf '%s' "$token"
}
