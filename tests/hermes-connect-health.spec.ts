import { expect, test } from "@playwright/test";
import {
  applyHermesHealthFreshness,
  connectorToHermesHealth,
  internalAiRuntimeToHermesHealth,
  normalizeHermesHealthItem,
  sanitizeHermesHealthErrorClass,
  summarizeHermesHealth,
} from "../src/lib/hermes-connect-health";

test("health error classes are bounded instead of leaking raw provider errors", () => {
  expect(sanitizeHermesHealthErrorClass("rate_limited")).toBe("rate_limited");
  expect(sanitizeHermesHealthErrorClass("Bearer abc123 failed for user@example.com")).toBe("unknown_error");
});

test("unknown stays unknown instead of being converted to healthy or zero", () => {
  const item = normalizeHermesHealthItem({
    key: "connector-x",
    componentClass: "connector",
    state: "unknown",
    observedAt: "2026-10-02T16:00:00Z",
    source: "test",
  });
  expect(item.state).toBe("unknown");
  expect(item.pendingCount).toBeUndefined();
  expect(item.failedCount).toBeUndefined();
});

test("freshness expiration changes eligible items to stale", () => {
  const item = normalizeHermesHealthItem({
    key: "source-a",
    componentClass: "connector",
    state: "healthy",
    observedAt: "2026-10-02T15:00:00Z",
    freshnessExpiresAt: "2026-10-02T16:00:00Z",
    source: "test",
  });
  expect(applyHermesHealthFreshness(item, new Date("2026-10-02T17:00:00Z")).state).toBe("stale");
});

test("authorization-blocked and disabled states are not mislabeled stale", () => {
  for (const state of ["blocked_authorization", "disabled"] as const) {
    const item = normalizeHermesHealthItem({
      key: state,
      componentClass: "connector",
      state,
      observedAt: "2026-10-02T15:00:00Z",
      freshnessExpiresAt: "2026-10-02T16:00:00Z",
      source: "test",
    });
    expect(applyHermesHealthFreshness(item, new Date("2026-10-02T17:00:00Z")).state).toBe(state);
  }
});

test("Internal AI runtime adapter preserves online/offline truth", () => {
  expect(internalAiRuntimeToHermesHealth({ online: true, lastSeenAt: "2026-10-02T16:01:00Z" }, "2026-10-02T16:02:00Z"))
    .toMatchObject({ key: "internal_ai_runtime", state: "healthy", componentClass: "runtime" });
  expect(internalAiRuntimeToHermesHealth({ online: false }, "2026-10-02T16:02:00Z"))
    .toMatchObject({ state: "unavailable", errorClass: "runtime_offline" });
  expect(internalAiRuntimeToHermesHealth({}, "2026-10-02T16:02:00Z").state).toBe("unknown");
});

test("connector adapter distinguishes connected, authorization blocked and disabled", () => {
  expect(connectorToHermesHealth({
    key: "meta",
    companyId: "company-1",
    state: "connected",
    observedAt: "2026-10-02T16:00:00Z",
  }).state).toBe("healthy");
  expect(connectorToHermesHealth({
    key: "meta",
    companyId: "company-1",
    state: "permission_required",
    observedAt: "2026-10-02T16:00:00Z",
  }).state).toBe("blocked_authorization");
  expect(connectorToHermesHealth({
    key: "meta",
    companyId: "company-1",
    state: "disabled",
    observedAt: "2026-10-02T16:00:00Z",
  }).state).toBe("disabled");
});

test("health summary reports worst current system state, not a business KPI", () => {
  const items = [
    normalizeHermesHealthItem({ key: "api", componentClass: "api", state: "healthy", observedAt: "2026-10-02T16:00:00Z", source: "test" }),
    normalizeHermesHealthItem({ key: "queue", componentClass: "queue", state: "degraded", observedAt: "2026-10-02T16:00:00Z", source: "test", pendingCount: 4 }),
  ];
  expect(summarizeHermesHealth(items)).toMatchObject({
    overall: "degraded",
    counts: { healthy: 1, degraded: 1 },
  });
});
