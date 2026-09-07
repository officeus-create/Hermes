const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const currentRunId = Number(process.env.GITHUB_RUN_ID || 0);

if (!repository || !token) {
  throw new Error("GitHub Actions metadata is required to guard shared Repair Shop synthetic state");
}

const conflictingPaths = new Set([
  ".github/workflows/repair-booking-production-smoke.yml",
  ".github/workflows/repair-capacity-production-smoke.yml",
  ".github/workflows/repair-operations-production-smoke.yml",
  ".github/workflows/repair-booking-concurrency-production-smoke.yml",
]);
const activeStatuses = new Set(["queued", "in_progress", "waiting", "pending", "requested"]);
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "hermes-repair-p0-synthetic-state-guard",
};

async function activeConflicts() {
  const response = await fetch(`https://api.github.com/repos/${repository}/actions/runs?per_page=100`, { headers });
  if (!response.ok) throw new Error(`Unable to inspect Repair Shop workflow state (${response.status})`);
  const data = await response.json();
  return (data.workflow_runs || []).filter((run) =>
    run.id !== currentRunId &&
    conflictingPaths.has(run.path) &&
    activeStatuses.has(run.status),
  );
}

for (let attempt = 1; attempt <= 60; attempt += 1) {
  const conflicts = await activeConflicts();
  if (conflicts.length === 0) {
    console.log(`REPAIR_BOOKING_SYNTHETIC_STATE_IDLE=YES attempt=${attempt}`);
    process.exit(0);
  }
  const summary = conflicts.map((run) => `${run.path}#${run.id}:${run.status}`).join(", ");
  console.log(`REPAIR_BOOKING_SYNTHETIC_STATE_WAIT=${attempt} active=${summary}`);
  await new Promise((resolve) => setTimeout(resolve, 5_000));
}

throw new Error("Shared Repair Shop synthetic booking state did not become idle within 5 minutes");
