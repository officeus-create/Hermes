#!/usr/bin/env node
// Scrub secrets from tool output before it is shown to the model or pasted anywhere.
//
// Why: an independent audit on 2026-11-06 found that a naive masking script printed a nested
// OAuth credential because it only masked top-level keys. Nested JSON objects and arrays must be
// walked recursively, and long opaque values must be treated as secrets even when their key
// name is innocuous.
//
// Usage:
//   node scripts/ai/scrub-secrets.mjs <file-or-'-'>
//   node scripts/ai/scrub-secrets.mjs --json <file-or-'-'>
//
// Exit code is always 0; scrubbed output goes to stdout.

import { readFileSync } from 'node:fs';

const SECRET_KEY = /(key|token|secret|password|passwd|credential|authorization|auth|bearer|session|cookie|refresh|access)/i;
const OPAQUE = /^[A-Za-z0-9_\-.=+/]{24,}$/; // long opaque blobs: JWTs, base64, keys

function scrub(value, keyHint = '') {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, keyHint));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEY.test(k) ? '<masked>' : scrub(v, k);
    }
    return out;
  }
  if (typeof value === 'string') {
    if (SECRET_KEY.test(keyHint)) return '<masked>';
    if (OPAQUE.test(value) && !value.includes('/') && !value.includes(' ')) return '<opaque-masked>';
    return value;
  }
  return value;
}

function scrubText(text) {
  const redacted = text
    .replace(/(ya29\.[A-Za-z0-9_\-.]+)/g, '<masked:google-oauth>')
    .replace(/(sk-ant-[A-Za-z0-9_\-.]+)/g, '<masked:anthropic-key>')
    .replace(/(sk-[A-Za-z0-9]{16,})/g, '<masked:api-key>')
    .replace(/(rt\.[A-Za-z0-9_\-.]+)/g, '<masked:refresh-token>')
    .replace(/("?(?:access_token|refresh_token|id_token|api_key|authorization|password)"?\s*[:=]\s*"?)([^"\s,}]+)/gi,
      '$1<masked>');
  return redacted;
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const target = args.filter((a) => a !== '--json')[0] || '-';
const raw = target === '-' ? readFileSync(0, 'utf8') : readFileSync(target, 'utf8');

if (asJson) {
  try {
    const parsed = JSON.parse(raw);
    process.stdout.write(JSON.stringify(scrub(parsed), null, 2) + '\n');
  } catch {
    process.stdout.write(scrubText(raw));
  }
} else {
  process.stdout.write(scrubText(raw));
}
