import assert from "node:assert/strict";
import { classifyExternalJobLifecycle } from "./lib/external-job-lifecycle.mjs";

const expectedUrl = "https://www.work.ua/jobs/7362244/";

assert.deepEqual(
  classifyExternalJobLifecycle({ expectedUrl, status: 200, finalUrl: expectedUrl, body: "Car Hauling Dispatcher" }),
  { classification: "verified_open", reason: "external_route_exact_and_active" },
);
assert.deepEqual(
  classifyExternalJobLifecycle({
    expectedUrl,
    status: 200,
    finalUrl: "https://www.work.ua/jobs-remote-dispatcher/?job_removed=1",
    body: "",
  }),
  { classification: "review_required", reason: "external_removed_redirect_marker" },
);
assert.deepEqual(
  classifyExternalJobLifecycle({
    expectedUrl,
    status: 200,
    finalUrl: expectedUrl,
    body: "На жаль, вакансію не знайдено. Вакансія була видалена або прихована роботодавцем.",
  }),
  { classification: "review_required", reason: "external_removed_page_marker" },
);
assert.deepEqual(
  classifyExternalJobLifecycle({ expectedUrl, status: 404, finalUrl: expectedUrl, body: "not found" }),
  { classification: "review_required", reason: "external_http_404" },
);
assert.deepEqual(
  classifyExternalJobLifecycle({ expectedUrl, status: null, finalUrl: null, error: "timeout" }),
  { classification: "review_required", reason: "external_request_failed" },
);

console.log("External job lifecycle fail-closed classification passed for active, redirect, removed-marker, HTTP failure, and request failure fixtures.");
