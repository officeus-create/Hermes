#!/usr/bin/env bash
set -euo pipefail

# Keep the canonical production proof unchanged while preventing the GitHub
# workflow-runs response from exceeding Linux's environment/argv limit when the
# proof validates exact-main deployment evidence.
gh() {
  if [[ "${1:-}" == "api" \
    && "${2:-}" == "repos/${GITHUB_REPOSITORY}/actions/workflows/cloudflare-pages-production-v2.yml/runs?branch=main&per_page=50" ]]; then
    command gh "$@" --jq '{workflow_runs: [.workflow_runs[] | {head_sha,status,conclusion}]}'
    return
  fi
  command gh "$@"
}
export -f gh

exec bash scripts/repair-shop-access-state-production-proof.sh
