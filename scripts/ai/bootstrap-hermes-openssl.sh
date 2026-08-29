#!/usr/bin/env bash
set -euo pipefail

# This is intentionally an isolated dependency bootstrap. It must never use a
# package manager or write to a macOS-managed OpenSSL location.
OPENSSL_VERSION="3.5.4"
OPENSSL_SHA256="967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99"
OPENSSL_ARCHIVE="openssl-${OPENSSL_VERSION}.tar.gz"
OPENSSL_SOURCE_URL="https://www.openssl.org/source/${OPENSSL_ARCHIVE}"
HERMES_AI_HOME="${HERMES_AI_HOME:-$HOME/.hermes-ai}"
OPENSSL_DIR="${HERMES_OPENSSL_DIR:-$HERMES_AI_HOME/deps/openssl}"
VERIFY_ONLY=false

log() {
  printf '[codex-hermes openssl] %s\n' "$*"
}

fail() {
  printf '[codex-hermes openssl] ERROR: %s\n' "$*" >&2
  exit 1
}

canonical_dir() {
  (cd "$1" && pwd -P)
}

is_system_managed_path() {
  case "$1" in
    /usr|/usr/*|/System|/System/*|/opt/homebrew|/opt/homebrew/*|/opt/local|/opt/local/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_valid_isolated_openssl() {
  [[ -f "$1/include/openssl/ssl.h" ]] && \
    [[ -f "$1/lib/libssl.a" ]] && \
    [[ -f "$1/lib/libcrypto.a" ]] && \
    [[ -x "$1/bin/openssl" ]] && \
    [[ "$("$1/bin/openssl" version 2>/dev/null || true)" == "OpenSSL $OPENSSL_VERSION "* ]]
}

if [[ "${1:-}" == "--verify" ]]; then
  VERIFY_ONLY=true
  shift
fi
[[ "$#" -eq 0 ]] || fail "Usage: $0 [--verify]"

[[ "$(uname -s)" == "Darwin" ]] || fail "This isolated OpenSSL bootstrap is only required on macOS; no dependency was installed."
[[ "$(uname -m)" == "x86_64" ]] || fail "This bootstrap is for Intel macOS only; no dependency was installed."

for command in curl shasum tar make; do
  command -v "$command" >/dev/null 2>&1 || fail "$command is required to build isolated OpenSSL. Install Apple's Command Line Tools; do not use Homebrew."
done

mkdir -p "$(dirname "$OPENSSL_DIR")"
if [[ -e "$OPENSSL_DIR" ]]; then
  [[ -d "$OPENSSL_DIR" ]] || fail "Isolated OpenSSL path exists but is not a directory: $OPENSSL_DIR"
  resolved_openssl_dir="$(canonical_dir "$OPENSSL_DIR")"
  is_system_managed_path "$resolved_openssl_dir" && fail "Refusing to use a system or package-manager OpenSSL path: $resolved_openssl_dir"
  if is_valid_isolated_openssl "$resolved_openssl_dir"; then
    log "Verified isolated OpenSSL $OPENSSL_VERSION at $resolved_openssl_dir"
    exit 0
  fi
  fail "Isolated OpenSSL at $resolved_openssl_dir is incomplete or is not pinned OpenSSL $OPENSSL_VERSION. Expected headers, static libraries, and bin/openssl version receipt; remove only that isolated directory and rerun."
fi

$VERIFY_ONLY && fail "Required isolated OpenSSL $OPENSSL_VERSION is absent at $OPENSSL_DIR. Set OPENSSL_DIR to a reviewed static installation or run the default bootstrap."

tmpdir="$(mktemp -d "${TMPDIR:-/tmp}/hermes-openssl.XXXXXX")"
trap 'rm -rf "$tmpdir"' EXIT

log "Downloading OpenSSL $OPENSSL_VERSION from the official source archive"
curl --fail --location --proto '=https' --tlsv1.2 --silent --show-error \
  --output "$tmpdir/$OPENSSL_ARCHIVE" \
  "$OPENSSL_SOURCE_URL"

actual_sha256="$(shasum -a 256 "$tmpdir/$OPENSSL_ARCHIVE" | awk '{print $1}')"
[[ "$actual_sha256" == "$OPENSSL_SHA256" ]] || fail "OpenSSL SHA-256 mismatch for $OPENSSL_ARCHIVE (expected $OPENSSL_SHA256, got $actual_sha256)"

tar -xzf "$tmpdir/$OPENSSL_ARCHIVE" -C "$tmpdir"
source_dir="$tmpdir/openssl-$OPENSSL_VERSION"
[[ -f "$source_dir/Configure" ]] || fail "Verified OpenSSL archive did not contain its expected source directory"

log "Building pinned OpenSSL $OPENSSL_VERSION in the isolated Hermes dependency directory"
(
  cd "$source_dir"
  ./Configure darwin64-x86_64-cc no-shared no-tests --prefix="$OPENSSL_DIR" --openssldir="$OPENSSL_DIR/ssl"
  make -s -j"$(sysctl -n hw.ncpu)"
  make -s install_sw
)

resolved_openssl_dir="$(canonical_dir "$OPENSSL_DIR")"
is_system_managed_path "$resolved_openssl_dir" && fail "Refusing to verify a system or package-manager OpenSSL path: $resolved_openssl_dir"
is_valid_isolated_openssl "$resolved_openssl_dir" || fail "OpenSSL build completed without the required isolated static headers and libraries"

log "Installed and verified isolated OpenSSL $OPENSSL_VERSION at $resolved_openssl_dir"
