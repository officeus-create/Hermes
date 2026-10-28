// HAE #2067: pinned identity for the two existing canonical GitHub Actions workflows.
// Names alone are not authoritative: a second workflow can reuse a display name.
// Workflow IDs and paths are verified against GitHub REST workflow-run evidence.
const WORKFLOWS = Object.freeze({
  "Hermes Automation Engine Contract": Object.freeze({
    path: ".github/workflows/automation-engine-contract.yml",
    workflow_id: 382680939,
  }),
  "Website checks": Object.freeze({
    path: ".github/workflows/ci.yml",
    workflow_id: 311612557,
  }),
});

export function githubCIWorkflowIdentityVerified(run) {
  if (!run || typeof run.name !== "string" ||
      !Object.hasOwn(WORKFLOWS, run.name)) return false;
  const expected = WORKFLOWS[run.name];
  return run.path === expected.path && run.workflow_id === expected.workflow_id;
}
