#!/usr/bin/env bash
set -euo pipefail

HOST="app.hermeslogisticsus.com"
ZONE_NAME="hermeslogisticsus.com"
EXPECTED_HSTS="max-age=31536000"
RULE_DESCRIPTION="Hermes app HSTS"
RULE_EXPRESSION='(http.host eq "app.hermeslogisticsus.com")'
CF_API="https://api.cloudflare.com/client/v4"

emit_classification() {
  local value="$1"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf 'classification=%s\n' "$value" >> "$GITHUB_OUTPUT"
  fi
  printf 'classification=%s\n' "$value"
}

live_has_expected_hsts() {
  local headers
  headers="$(curl -fsSI --max-time 20 "https://${HOST}/" | tr -d '\r')" || return 1
  printf '%s\n' "$headers" | grep -Eiq "^strict-transport-security:[[:space:]]*${EXPECTED_HSTS}[[:space:]]*$"
}

if live_has_expected_hsts; then
  emit_classification "already_live"
  exit 0
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  emit_classification "blocked_cloudflare_token"
  exit 1
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

zone_file="${tmpdir}/zone.json"
zone_http="$(curl -sS -G -o "$zone_file" -w '%{http_code}'   "${CF_API}/zones"   "${auth[@]}"   --data-urlencode "name=${ZONE_NAME}"   --data-urlencode "status=active")"

if [[ "$zone_http" != "200" ]] || ! jq -e '.success == true and (.result | length) == 1' "$zone_file" >/dev/null; then
  emit_classification "blocked_zone_lookup"
  exit 1
fi

zone_id="$(jq -r '.result[0].id' "$zone_file")"
if [[ -z "$zone_id" || "$zone_id" == "null" ]]; then
  emit_classification "blocked_zone_lookup"
  exit 1
fi
echo "::add-mask::${zone_id}"

entry_file="${tmpdir}/entry.json"
entry_http="$(curl -sS -o "$entry_file" -w '%{http_code}'   "${CF_API}/zones/${zone_id}/rulesets/phases/http_response_headers_transform/entrypoint"   "${auth[@]}")"

rule_payload="$(jq -cn   --arg description "$RULE_DESCRIPTION"   --arg expression "$RULE_EXPRESSION"   --arg value "$EXPECTED_HSTS"   '{
    action:"rewrite",
    action_parameters:{headers:{"Strict-Transport-Security":{operation:"set",value:$value}}},
    expression:$expression,
    description:$description,
    ref:"hermes_app_hsts",
    enabled:true
  }')"

mutation_file="${tmpdir}/mutation.json"

if [[ "$entry_http" == "200" ]] && jq -e '.success == true and .result.id' "$entry_file" >/dev/null; then
  ruleset_id="$(jq -r '.result.id' "$entry_file")"
  echo "::add-mask::${ruleset_id}"

  existing_rule_id="$(jq -r --arg description "$RULE_DESCRIPTION" --arg expression "$RULE_EXPRESSION" '
    [.result.rules[]? | select(
      .description == $description
      or .ref == "hermes_app_hsts"
      or (
        .expression == $expression
        and .action == "rewrite"
        and .action_parameters.headers["Strict-Transport-Security"].operation == "set"
      )
    )][0].id // empty
  ' "$entry_file")"

  if [[ -n "$existing_rule_id" ]]; then
    echo "::add-mask::${existing_rule_id}"
    mutation_http="$(curl -sS -o "$mutation_file" -w '%{http_code}'       -X PATCH       "${CF_API}/zones/${zone_id}/rulesets/${ruleset_id}/rules/${existing_rule_id}"       "${auth[@]}"       --data "$rule_payload")"
  else
    mutation_http="$(curl -sS -o "$mutation_file" -w '%{http_code}'       -X POST       "${CF_API}/zones/${zone_id}/rulesets/${ruleset_id}/rules"       "${auth[@]}"       --data "$rule_payload")"
  fi
elif [[ "$entry_http" == "404" ]]; then
  ruleset_payload="$(jq -cn     --arg description "$RULE_DESCRIPTION"     --arg expression "$RULE_EXPRESSION"     --arg value "$EXPECTED_HSTS"     '{
      name:"Hermes response header transforms",
      kind:"zone",
      phase:"http_response_headers_transform",
      rules:[{
        action:"rewrite",
        action_parameters:{headers:{"Strict-Transport-Security":{operation:"set",value:$value}}},
        expression:$expression,
        description:$description,
        ref:"hermes_app_hsts",
        enabled:true
      }]
    }')"
  mutation_http="$(curl -sS -o "$mutation_file" -w '%{http_code}'     -X POST     "${CF_API}/zones/${zone_id}/rulesets"     "${auth[@]}"     --data "$ruleset_payload")"
else
  emit_classification "blocked_ruleset_read"
  exit 1
fi

if [[ "$mutation_http" != "200" ]] && [[ "$mutation_http" != "201" ]]; then
  emit_classification "blocked_ruleset_write"
  exit 1
fi
if ! jq -e '.success == true' "$mutation_file" >/dev/null; then
  emit_classification "blocked_ruleset_write"
  exit 1
fi

for _ in $(seq 1 12); do
  if live_has_expected_hsts; then
    emit_classification "pass"
    exit 0
  fi
  sleep 5
done

emit_classification "mutation_applied_live_not_observed"
exit 1
