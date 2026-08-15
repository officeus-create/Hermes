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

const publicApks = findApks(publicDir);
assert.deepEqual(publicApks, [], "No APK may ship from public/ while Android release status is BLOCKED.");
assert.ok(existsSync(join(root, "android/app/build.gradle")), "Android wrapper source must remain available for a fresh controlled build.");

assert.doesNotMatch(downloadPage, /\/downloads\/hermes-connect-beta\.apk/,
  "The access page must not link the retired APK.");
assert.doesNotMatch(downloadPage, /download-android-apk|secure, signed Hermes Connect Beta APK|Fully compiled and signed application package/i,
  "The access page must not claim that an unverified Android release is downloadable or release-signed.");
assert.match(downloadPage, /Release verification in progress/,
  "The access page must communicate the current Android release boundary.");
assert.match(downloadPage, /open-android-web-fallback/,
  "Android visitors must retain a supported Web\/PWA fallback.");
assert.match(redirects, /^\/downloads\/hermes-connect-beta\.apk \/download\/ 302$/m,
  "The retired binary URL must temporarily redirect visitors to the truthful release-status page.");

assert.match(releaseTracker, /Android APK.*`BLOCKED`/,
  "The mobile release tracker must keep Android direct distribution blocked.");
assert.match(releaseTracker, /C=US,O=Android,CN=Android Debug/,
  "The release tracker must preserve the retired artifact's signing evidence.");
assert.match(releaseTracker, /32e1c3cf35e77ac789cb8459dfddcfed6088e04e6aa4f113b34a95e8daf26b99/,
  "The release tracker must preserve the retired artifact checksum.");

console.log("Hermes Connect Android release boundary passed: no public APK or false release claim remains, and Web/PWA fallback stays available.");
