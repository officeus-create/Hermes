// Compatibility entrypoint for the existing protected GitHub workflow.
// Issue #280 keeps production execution disabled; the workflow now proves
// that stale "live" configuration still fails closed to review/onboarding.
await import("./carrier-contract-review-containment.test.mjs");
