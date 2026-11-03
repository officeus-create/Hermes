// Compatibility entrypoint for the existing protected GitHub workflow.
// The review-only production gate keeps execution disabled; this workflow proves
// that stale "live" configuration still fails closed to review/onboarding.
await import("./carrier-contract-review-containment.test.mjs");

await import("./carrier-14day-execution-schema.test.mjs");
