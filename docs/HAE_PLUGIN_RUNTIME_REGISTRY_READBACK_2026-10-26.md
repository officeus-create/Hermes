# HAE Plugin Runtime Registry — authenticated readback — 2026-10-26

Status: SOURCE EVIDENCE / no provider write / no plugin mutation in this artifact.

Base main before reconciliation: `5aeb64ae8644231ce4bad213e9a41aee250a0239`.
Source class: authenticated Plugin Creator readback.
Purpose: reconcile the compiled HAE runtime-role registry and capability-policy pins after T4 verification. This file does not create a second registry; runtime truth remains `workers/automation-engine/src/plugin-runtime-registry.mjs`.

| Runtime role | Plugin version | Plugin Creator release |
|---|---:|---|
| hermes-automatic-engineer | 0.1.26 | pluginrel_6addf2a3436081919104b03a7d2672ad |
| hermes-agent-coordinator | 0.1.71 | pluginrel_6adf45916efc8191823b43bca3d6b374 |
| hermes-technology-developer | 0.1.56 | pluginrel_6adf1eb6cd848191a097c4f98167e55f |
| hermes-qa-evidence-auditor | 0.1.8 | pluginrel_6adf45aa788c8191a32d4756f0de4bae |
| hermes-knowledge-curator | 0.1.81 | pluginrel_6adf45bfee188191b5b9dbb740945109 |
| hermes-marketing-growth | 0.1.7 | pluginrel_6adf74685fc081919239db3ab5d95736 |
| hermes-search-growth | 0.1.8 | pluginrel_6adf457ac2d88191bef1b3604887a3d3 |
| hermes-academy | 0.1.12 | pluginrel_6adbb08361288191b8e0a1dfabe2f666 |
| hermes-dispatch-os | 0.1.21 | pluginrel_6adedaefade08191aa9bcf4c0da2916b |

## Boundaries

- Plugin release != HAE deployment or live capability.
- Do not add Design Hub or Sales merely because they have private releases; they do not own current HAE runtime contracts.
- Capability policy must match role-contract versions derived from the compiled runtime registry.
- Jobs freeze `role_id + plugin_version + contract_version + SHA-256` at enqueue time.
- External Plugin Creator drift still requires a fresh authenticated readback; CI cannot truthfully infer remote plugin versions from its own compiled snapshot.
- T4 is already VERIFIED. This reconciliation must not rerun/redrive the T4 canary or enable provider writes.
