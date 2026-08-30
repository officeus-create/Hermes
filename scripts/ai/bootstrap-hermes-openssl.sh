#!/usr/bin/env bash
set -euo pipefail

OPENSSL_VERSION="3.5.4"
OPENSSL_SHA256="967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99"
OPENSSL_URL="https://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz"
TARGET="${HERMES_OPENSSL_DIR:-$HOME/.hermes-ai/deps/openssl}"
MODE="${1:-}"

log() {
  printf '[hermes-openssl] %s\n' "$*"
}

fail() {
  printf '[hermes-openssl] ERROR: %s\n' "$*" >&2
  exit 1
}

reject_unsafe_target() {
  case "$TARGET" in
    /usr|/usr/*|/System|/System/*|/opt/homebrew|/opt/homebrew/*|/opt/local|/opt/local/*)
      fail "Refusing system or package-manager OpenSSL target: $TARGET"
      ;;
  esac
}

verify_install() {
  local root="$1"
  [[ -f "$root/include/openssl/ssl.h" ]] || fail "OpenSSL headers are missing at $root/include"
  [[ -f "$root/lib/libssl.a" ]] || fail "Static libssl.a is missing at $root/lib"
  [[ -f "$root/lib/libcrypto.a" ]] || fail "Static libcrypto.a is missing at $root/lib"
  [[ -x "$root/bin/openssl" ]] || fail "OpenSSL executable is missing at $root/bin/openssl"

  local receipt
  receipt="$($root/bin/openssl version)"
  [[ "$receipt" == "OpenSSL ${OPENSSL_VERSION} "* || "$receipt" == "OpenSSL ${OPENSSL_VERSION}" ]] \
    || fail "Expected OpenSSL ${OPENSSL_VERSION}, got: $receipt"
  log "Verified isolated OpenSSL ${OPENSSL_VERSION} at $root"
}

reject_unsafe_target

if [[ "$MODE" == "--verify" ]]; then
  verify_install "$TARGET"
  exit 0
fi

[[ "$MODE" == "" ]] || fail "Unknown argument: $MODE"
[[ "$(uname -s)" == "Darwin" ]] || fail "Pinned Hermes OpenSSL bootstrap is only supported on macOS"
[[ "$(uname -m)" == "x86_64" ]] || fail "Pinned Hermes OpenSSL bootstrap is only required on Intel macOS"

if [[ -e "$TARGET" ]]; then
  [[ -d "$TARGET" ]] || fail "OpenSSL target exists but is not a directory: $TARGET"
  if [[ -n "$(find "$TARGET" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
    verify_install "$TARGET"
    exit 0
  fi
fi

for tool in curl shasum tar perl make cc; do
  command -v "$tool" >/dev/null 2>&1 || fail "Required build tool is missing: $tool"
done

parent="$(dirname "$TARGET")"
mkdir -p "$parent"

tmpdir="$(mktemp -d "${TMPDIR:-/tmp}/hermes-openssl.XXXXXX")"
archive="$tmpdir/openssl-${OPENSSL_VERSION}.tar.gz"
source_dir="$tmpdir/openssl-${OPENSSL_VERSION}"
target_existed=0
[[ -e "$TARGET" ]] && target_existed=1
cleanup() {
  status=$?
  rm -rf "$tmpdir"
  if [[ $status -ne 0 && $target_existed -eq 0 && -e "$TARGET" ]]; then
    rm -rf "$TARGET"
  fi
  exit $status
}
trap cleanup EXIT INT TERM

log "Downloading pinned OpenSSL ${OPENSSL_VERSION} from the official source"
curl --fail --show-error --silent --location --proto '=https' --tlsv1.2 "$OPENSSL_URL" -o "$archive"
printf '%s  %s\n' "$OPENSSL_SHA256" "$archive" | shasum -a 256 -c -

tar -xzf "$archive" -C "$tmpdir"
[[ -d "$source_dir" ]] || fail "Expected source directory was not extracted"

cd "$source_dir"
./Configure darwin64-x86_64-cc no-shared --prefix="$TARGET" --openssldir="$TARGET/ssl"

jobs="${HERMES_OPENSSL_JOBS:-}"
if [[ -z "$jobs" ]]; then
  jobs="$(sysctl -n hw.ncpu 2>/dev/null || printf '2')"
fi
[[ "$jobs" =~ ^[1-9][0-9]*$ ]] || fail "HERMES_OPENSSL_JOBS must be a positive integer"

make -j "$jobs"
make install_sw
verify_install "$TARGET"
log "Installed and verified isolated OpenSSL ${OPENSSL_VERSION}"
