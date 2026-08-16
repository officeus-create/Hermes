import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const publicDir = join(root, "public");
const downloadPage = readFileSync(join(root, "src/pages/download.astro"), "utf8");
const releaseTracker = readFileSync(join(root, "docs/ISSUE_511_MOBILE_RELEASE.md"), "utf8");
const redirects = readFileSync(join(root, "public/_redirects"), "utf8");

function findApks(directory) {
  const matches = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) matches.push(...findApks(absolute));
    if (entry.isFile() && extname(entry.name).toLowerCase() === ".apk") matches.push(absolute);
  }
  return matches;
}

assert.deepEqual(findApks(publicDir), [], "No APK may ship from public/ while Android release status is blocked.");
assert.ok(existsSync(join(root, "android/app/build.gradle")), "Android wrapper source must remain available for a future controlled build.");
assert.doesNotMatch(downloadPage, /\/downloads\/hermes-connect-beta\.apk|download-android-apk|signed Hermes Connect Beta APK/i,
  "Access Center must not expose or claim an unverified APK.");
assert.match(downloadPage, /No public mobile-store or direct APK release is currently presented as available/,
  "Access Center must communicate the current native-mobile release boundary.");
assert.match(downloadPage, /href="\/services\/hermes-connect\/repair-shops\/"/,
  "Mobile visitors must retain the supported current Web App path.");
assert.match(downloadPage, /No public APK, Google Play, or App Store release is currently claimed/,
  "Access Center must not imply a released native distribution channel.");
assert.match(redirects, /^\/downloads\/hermes-connect-beta\.apk \/download\/ 302$/m,
  "Retired binary URL must continue to redirect to the truthful Access Center.");
assert.match(releaseTracker, /Android APK.*`BLOCKED`/,
  "Mobile release tracker must keep Android direct distribution blocked.");
assert.match(releaseTracker, /C=US,O=Android,CN=Android Debug/,
  "Release tracker must preserve retired artifact signing evidence.");
assert.match(releaseTracker, /32e1c3cf35e77ac789cb8459dfddcfed6088e04e6aa4f113b34a95e8daf26b99/,
  "Release tracker must preserve the retired artifact checksum.");

console.log("Hermes Connect Android release boundary passed: browser-first current product, no public APK, and no false native release claim.");
