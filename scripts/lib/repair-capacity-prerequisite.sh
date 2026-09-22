#!/usr/bin/env bash

hermes_select_repair_booking_prerequisite() {
  local expected_sha="$1"
  local selected

  if ! selected="$(jq -r --arg expected_sha "$expected_sha" '
    [
      .workflow_runs[]?
      | select(.name == "Repair Shop real booking production smoke")
      | select(.head_sha == $expected_sha)
      | select(.event == "push" or .event == "issue_comment" or .event == "workflow_dispatch")
    ]
    | sort_by(.created_at)
    | last
    | if . == null then
        ["missing", "pending", "missing", "missing", ""]
      else
        [
          (.status // "missing"),
          (.conclusion // "pending"),
          (.event // "missing"),
          ((.id // "missing") | tostring),
          (.head_sha // "")
        ]
      end
    | @tsv
  ')"; then
    selected=""
  fi

  if [[ -z "$selected" ]]; then
    printf 'missing\tpending\tmissing\tmissing\t\n'
    return 0
  fi

  printf '%s\n' "$selected"
}
