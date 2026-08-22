import assert from "node:assert/strict";
import { auditGeoSiteGraph } from "../src/data/geo-site-graph-audit.ts";

const page = (path, overrides = {}) => ({
  path,
  canonicalPath: path,
  indexable: true,
  links: [],
  webPagePaths: [path],
  schemaEntityIds: ["https://hermeslogisticsus.com/#organization"],
  serviceProviderIds: [],
  faqVisible: [],
  faqSchema: [],
  breadcrumbPaths: path === "/" ? ["/"] : ["/", path],
  hreflang: [],
  ...overrides,
});

const snapshots = [
  page("/", {
    links: ["/paths/logistics/", "/paths/marketing/", "/paths/academy/", "/paths/technology/"],
  }),
  page("/paths/logistics/", {
    links: [
      "/logistics/car-hauling-dispatch/",
      "/logistics/resources/dispatch-service-vs-self-dispatch/",
    ],
  }),
  page("/paths/marketing/", { links: ["/services/seo/"] }),
  page("/paths/academy/", { links: ["/academy/us-logistics-operations/"] }),
  page("/paths/technology/", { links: [] }),
  page("/logistics/car-hauling-dispatch/", {
    links: ["/logistics/start-car-hauling-dispatch/"],
    serviceProviderIds: ["https://hermeslogisticsus.com/#organization"],
  }),
  page("/logistics/resources/dispatch-service-vs-self-dispatch/", {
    links: ["/logistics/car-hauling-dispatch/"],
    faqVisible: [{ question: "Should I self-dispatch?", answer: "Compare control, time, tools, and support scope." }],
    faqSchema: [{ question: "Should I self-dispatch?", answer: "Compare control, time, tools, and support scope." }],
  }),
  page("/services/seo/", {
    hreflang: [{ language: "x-default", path: "/services/seo/" }],
  }),
  page("/academy/us-logistics-operations/"),
  page("/orphan-holder/", {
    schemaEntityIds: ["https://hermeslogisticsus.com/#logistics"],
    serviceProviderIds: ["https://hermeslogisticsus.com/#logistics"],
  }),
];

const audit = auditGeoSiteGraph(snapshots);
assert.ok(
  audit.missingDirectionHubLinks.some(
    (item) => item.direction === "technology" && item.hubPath === "/paths/technology/",
  ),
);
assert.ok(
  !audit.supportingResourcesWithoutCommercialBacklink.some(
    (item) => item.resourcePath === "/logistics/resources/dispatch-service-vs-self-dispatch/",
  ),
  "resource has a commercial-owner backlink",
);
assert.ok(
  audit.orphanedCanonicalOwners.includes("/logistics/resources/new-authority-car-hauler-readiness-checklist/"),
  "a governed owner absent from inbound links must be diagnosed",
);
assert.deepEqual(audit.canonicalMismatches, []);
assert.deepEqual(audit.schemaOwnerMismatches, []);
assert.deepEqual(audit.faqParityMismatches, []);
assert.deepEqual(audit.breadcrumbMismatches, []);
assert.deepEqual(audit.hreflangCanonicalMismatches, []);
assert.deepEqual(audit.heldEntityPublicationLeaks, [
  { pagePath: "/orphan-holder/", schemaEntityId: "https://hermeslogisticsus.com/#logistics" },
]);
assert.deepEqual(audit.serviceProviderMismatches, [
  { pagePath: "/orphan-holder/", providerId: "https://hermeslogisticsus.com/#logistics" },
]);

const conflictAudit = auditGeoSiteGraph(
  [
    ...snapshots,
    page("/comparison-hub/", {
      links: [
        "/logistics/car-hauling-dispatch/",
        "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
      ],
    }),
  ],
  [
    {
      intentGroupKey: "REVIEWED_DISPATCH_INTENT",
      promptIds: ["LOG-01", "LOG-02"],
      canonicalOwners: [
        "/logistics/car-hauling-dispatch/",
        "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
      ],
    },
  ],
);
assert.deepEqual(conflictAudit.competingOwnersLinkedTogether, [
  {
    pagePath: "/comparison-hub/",
    intentGroupKey: "REVIEWED_DISPATCH_INTENT",
    canonicalOwners: [
      "/logistics/car-hauling-dispatch/",
      "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
    ],
  },
]);

const mismatchAudit = auditGeoSiteGraph([
  page("/a/", {
    canonicalPath: "/b/",
    webPagePaths: ["/c/"],
    faqVisible: [{ question: "Visible?", answer: "Visible answer" }],
    faqSchema: [{ question: "Schema?", answer: "Schema answer" }],
    breadcrumbPaths: ["/", "/c/"],
    hreflang: [{ language: "es", path: "/missing-es/" }],
  }),
]);
assert.deepEqual(mismatchAudit.canonicalMismatches, [{ pagePath: "/a/", canonicalPath: "/b/" }]);
assert.deepEqual(mismatchAudit.schemaOwnerMismatches, [{ pagePath: "/a/", webPagePath: "/c/" }]);
assert.equal(mismatchAudit.faqParityMismatches.length, 1);
assert.deepEqual(mismatchAudit.breadcrumbMismatches, [{ pagePath: "/a/", breadcrumbLastPath: "/c/" }]);
assert.deepEqual(mismatchAudit.hreflangCanonicalMismatches, [
  {
    pagePath: "/a/",
    language: "es",
    targetPath: "/missing-es/",
    targetCanonicalPath: null,
  },
]);

assert.throws(
  () => auditGeoSiteGraph([page("https://example.com/not-site-relative")]),
  /must be site-relative/,
);
assert.throws(
  () => auditGeoSiteGraph([page("/duplicate/"), page("/duplicate/")]),
  /unique page paths/,
);

const serialized = JSON.stringify(audit).toLowerCase();
for (const forbidden of ["email", "phone", "raw_query", "raw_response", "token", "cookie", "account_id"]) {
  assert.ok(!serialized.includes(`\"${forbidden}\"`));
}

console.log("GEO site link/schema/semantic graph diagnostics passed");
