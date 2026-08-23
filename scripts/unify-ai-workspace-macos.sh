#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---check}"
CANONICAL="${HERMES_CANONICAL:-$HOME/Hermes}"
PRIMARY_ALIAS="${HERMES_LEGACY_ALIAS:-$HOME/hermes-connect-next}"
EXPECTED_REMOTE="officeus-create/Hermes"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT="$HOME/.hermes-workspace-backups"

if [[ "$MODE" != "--check" && "$MODE" != "--apply" ]]; then
  echo "Usage: $0 [--check|--apply]"
  exit 2
fi

say() { printf '%s\n' "$*"; }
fail() { say "ERROR: $*" >&2; exit 1; }

repo_remote() {
  git -C "$1" remote get-url origin 2>/dev/null || true
}

repo_head() {
  git -C "$1" rev-parse HEAD 2>/dev/null || true
}

repo_dirty() {
  [[ -n "$(git -C "$1" status --porcelain 2>/dev/null || true)" ]]
}

remote_is_hermes() {
  local remote="$1"
  [[ "$remote" == *"github.com/officeus-create/Hermes.git" || \
     "$remote" == *"github.com:officeus-create/Hermes.git" || \
     "$remote" == *"github.com/officeus-create/Hermes" || \
     "$remote" == *"github.com:officeus-create/Hermes" ]]
}

is_symlink_to_canonical() {
  [[ -L "$1" ]] || return 1
  local resolved
  resolved="$(cd "$(dirname "$1")" && cd -P "$(readlink "$1")" 2>/dev/null && pwd || true)"
  local canonical_resolved
  canonical_resolved="$(cd "$CANONICAL" 2>/dev/null && pwd -P || true)"
  [[ -n "$resolved" && "$resolved" == "$canonical_resolved" ]]
}

say "Hermes AI workspace doctor"
say "Mode:      $MODE"
say "Canonical: $CANONICAL"
say "Alias:     $PRIMARY_ALIAS"
say ""

if [[ ! -e "$CANONICAL" ]]; then
  if [[ -d "$PRIMARY_ALIAS/.git" || -f "$PRIMARY_ALIAS/.git" ]]; then
    remote="$(repo_remote "$PRIMARY_ALIAS")"
    remote_is_hermes "$remote" || fail "$PRIMARY_ALIAS is a git checkout but origin is not $EXPECTED_REMOTE: $remote"

    say "Canonical folder is missing, but the legacy Hermes checkout exists."
    say "Legacy HEAD: $(repo_head "$PRIMARY_ALIAS")"
    if repo_dirty "$PRIMARY_ALIAS"; then
      say "Legacy checkout has uncommitted changes. They will be preserved if the directory is moved."
    fi

    if [[ "$MODE" == "--apply" ]]; then
      mv "$PRIMARY_ALIAS" "$CANONICAL"
      ln -s "$CANONICAL" "$PRIMARY_ALIAS"
      say "APPLIED: moved the checkout to $CANONICAL and created alias $PRIMARY_ALIAS -> $CANONICAL"
    else
      say "SAFE ACTION AVAILABLE: --apply will move the checkout to $CANONICAL and leave a symlink at the old path."
    fi
  else
    fail "Neither canonical Hermes checkout nor a usable $PRIMARY_ALIAS checkout was found. Clone or locate officeus-create/Hermes first."
  fi
else
  [[ -d "$CANONICAL/.git" || -f "$CANONICAL/.git" ]] || fail "$CANONICAL exists but is not a git checkout."
  canonical_remote="$(repo_remote "$CANONICAL")"
  remote_is_hermes "$canonical_remote" || fail "$CANONICAL origin is not $EXPECTED_REMOTE: $canonical_remote"

  say "Canonical checkout detected."
  say "Canonical HEAD: $(repo_head "$CANONICAL")"
  if repo_dirty "$CANONICAL"; then
    say "Canonical checkout has uncommitted changes. No destructive normalization will be attempted."
  else
    say "Canonical checkout is clean."
  fi

  if [[ ! -e "$PRIMARY_ALIAS" && ! -L "$PRIMARY_ALIAS" ]]; then
    if [[ "$MODE" == "--apply" ]]; then
      ln -s "$CANONICAL" "$PRIMARY_ALIAS"
      say "APPLIED: created compatibility alias $PRIMARY_ALIAS -> $CANONICAL"
    else
      say "SAFE ACTION AVAILABLE: --apply will create compatibility alias $PRIMARY_ALIAS -> $CANONICAL"
    fi
  elif is_symlink_to_canonical "$PRIMARY_ALIAS"; then
    say "Alias is already normalized to the canonical checkout."
  elif [[ -d "$PRIMARY_ALIAS/.git" || -f "$PRIMARY_ALIAS/.git" ]]; then
    legacy_remote="$(repo_remote "$PRIMARY_ALIAS")"
    remote_is_hermes "$legacy_remote" || fail "$PRIMARY_ALIAS is a different git repository: $legacy_remote"

    canonical_head="$(repo_head "$CANONICAL")"
    legacy_head="$(repo_head "$PRIMARY_ALIAS")"
    say "Legacy checkout also exists."
    say "Legacy HEAD: $legacy_head"

    if repo_dirty "$CANONICAL" || repo_dirty "$PRIMARY_ALIAS"; then
      fail "Both paths exist and at least one checkout is dirty. Preserve both and reconcile changes before normalization."
    fi

    if [[ "$canonical_head" != "$legacy_head" ]]; then
      fail "Both checkouts are clean but point to different commits. Reconcile branches/commits before normalization."
    fi

    if [[ "$MODE" == "--apply" ]]; then
      mkdir -p "$BACKUP_ROOT"
      backup="$BACKUP_ROOT/hermes-connect-next-$STAMP"
      mv "$PRIMARY_ALIAS" "$backup"
      ln -s "$CANONICAL" "$PRIMARY_ALIAS"
      say "APPLIED: preserved duplicate checkout at $backup"
      say "APPLIED: replaced $PRIMARY_ALIAS with symlink to $CANONICAL"
    else
      say "SAFE ACTION AVAILABLE: the duplicate is clean and on the same HEAD."
      say "--apply will move it to a timestamped backup, then replace it with a symlink to $CANONICAL."
    fi
  else
    fail "$PRIMARY_ALIAS exists but is neither the canonical symlink nor a Hermes git checkout. Inspect it manually; nothing was changed."
  fi
fi

say ""
say "Canonical rule for every AI tool: open exactly $CANONICAL"
say "Do not create another Hermes clone for CORE, WEB, CONNECT, SEO, GEO, or AUDIT."
say "Read first: $CANONICAL/docs/AI_START_HERE.md"
