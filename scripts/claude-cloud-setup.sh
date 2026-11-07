#!/usr/bin/env bash
set -euo pipefail

echo "[Hermes Claude Cloud] Node: $(node --version)"
echo "[Hermes Claude Cloud] npm: $(npm --version)"

required_major=22
actual_major="$(node --version | sed 's/^v//' | cut -d. -f1)"
if [ "$actual_major" -ne "$required_major" ]; then
  echo "Expected Node 22 from .nvmrc, got Node $(node --version)." >&2
  exit 1
fi

npm ci

echo "[Hermes Claude Cloud] Ready."
echo "Preview: npm run dev (Claude launch config uses port 4321)"
echo "Build:   npm run build"
echo "Tests:   npm test"
