import fs from "node:fs";

const relevant = [
  /^functions\/api\/logistics-lead\.ts$/,
  /^functions\/api\/_lib\/.*(?:lead|email|delivery|rate|idempot)/i,
  /^workers\/lead-email\//,
  /^wrangler\.jsonc\.example$/,
  /^workers\/lead-email\/wrangler(?:\.production)?\.jsonc(?:\.example)?$/,
  /^\.github\/workflows\/(?:repair-paid-intent-production-smoke|cloudflare-pages-production-v2|lead-email-worker-production)\.yml$/,
  /^src\/pages\/services\/hermes-connect\/repair-shops\/plan\//,
];

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.stdout.write(JSON.stringify({ full: true, matched: ["fail_safe_invalid_commit_file_list"] }));
  process.exit(0);
}

const files = Array.isArray(payload?.files) ? payload.files.filter((file) => typeof file === "string") : null;
if (!files || files.length >= 300) {
  process.stdout.write(JSON.stringify({ full: true, matched: ["fail_safe_large_or_missing_commit_file_list"] }));
  process.exit(0);
}

const matched = files.filter((file) => relevant.some((pattern) => pattern.test(file)));
process.stdout.write(JSON.stringify({ full: matched.length > 0, matched }));
