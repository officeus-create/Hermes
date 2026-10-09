import assert from "node:assert/strict";
import { repairSourceContext, repairIntakeContext } from "../src/lib/repair-attribution.ts";
const cases = [
  ["/services/auto-repair-website-design/", "/paths/technology/", "project=website_development", "auto_repair_website"],
  ["/services/seo-for-auto-repair-shops/", "/paths/marketing/", "service=seo", "auto_repair_seo"],
];
for (const [source, destination, mode, group] of cases) {
  const expected = { source_path: source, vertical: "auto_repair", service_group: group };
  const query = `${mode}&vertical=auto_repair&source_path=${encodeURIComponent(source)}`;
  assert.deepEqual(repairSourceContext(source), expected);
  assert.deepEqual(repairIntakeContext(destination, new URLSearchParams(query)), expected);
  assert.deepEqual(repairIntakeContext(destination, new URLSearchParams(query + "&email=private@example.invalid&service_group=forged&arbitrary=secret")), expected);
  const oppositeMode = mode.startsWith("project=") ? "service" : "project";
  const oppositeValue = oppositeMode === "service" ? "seo" : "website_development";
  for (const conflicting of [`${query}&${oppositeMode}=${oppositeValue}`, `${query}&${oppositeMode}=`]) {
    assert.deepEqual(repairIntakeContext(destination, new URLSearchParams(conflicting)), {}, "Opposite mode must be absent, including an empty key");
  }
  for (const rejected of [mode, query.replace("auto_repair", "other"), query.replace(encodeURIComponent(source), "%2Fprivate%2F"), query + "&source_path=%2Fprivate%2F", query + "&vertical=other", query + "&" + mode]) {
    assert.deepEqual(repairIntakeContext(destination, new URLSearchParams(rejected)), {});
  }
  assert.deepEqual(repairIntakeContext("/other/", new URLSearchParams(query)), {});
  assert.deepEqual(repairIntakeContext(destination === "/paths/marketing/" ? "/paths/technology/" : "/paths/marketing/", new URLSearchParams(query)), {});
}
for (const path of ["/services/seo/", "/services/website-development/", "/services/website-redesign/", "/private/", "/services/seo-for-auto-repair-shops/?email=private"]) assert.deepEqual(repairSourceContext(path), {});
console.log("Repair attribution allowlist, opposite-mode absence, mismatched/duplicate rejection, privacy and generic fallback PASS");
