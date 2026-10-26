# HAE Plugin Creator release readback — 2026-10-27

Status: **PROVIDER_READBACK / VERSION_DRIFT_RECONCILED_IN_SOURCE / RUNTIME_COMPATIBILITY_HOLD**

Source: authenticated Plugin Creator read-only inventory plus each current release `plugin.json`.
Scope: the nine existing roles in `plugin-runtime-registry.mjs`.
No plugin update, no permission change, no dispatch, no One Brain write, no Queue/D1 write.

| HAE role | Plugin Creator ID | Current release | Provider version | Manifest identity/version |
|---|---|---|---:|---|
| hermes-automatic-engineer | plugins_6ace1c27c458819186989a5aa3ef87b5 | pluginrel_6addf2a3436081919104b03a7d2672ad | 0.1.26 | MATCH |
| hermes-agent-coordinator | plugins_6acf865dbc3c8191a21ca0da11dfb094 | pluginrel_6adf45916efc8191823b43bca3d6b374 | 0.1.71 | MATCH |
| hermes-technology-developer | plugins_6acf3453cfa48191884198be23defd3c | pluginrel_6adf1eb6cd848191a097c4f98167e55f | 0.1.56 | MATCH |
| hermes-qa-evidence-auditor | plugins_6adbe0ff25c881919716f063e76cdf2e | pluginrel_6adf45aa788c8191a32d4756f0de4bae | 0.1.8 | MATCH |
| hermes-knowledge-curator | plugins_6adb884d92648191bbe819e3142018fe | pluginrel_6adf45bfee188191b5b9dbb740945109 | 0.1.81 | MATCH |
| hermes-marketing-growth | plugins_6adb94b7d6988191bb3f4608ced11293 | pluginrel_6adfb8bee8d08191ab68257393e1846a | 0.1.8 | MATCH |
| hermes-search-growth | plugins_6adb897a707081918cc54dda5fcec4d2 | pluginrel_6adf457ac2d88191bef1b3604887a3d3 | 0.1.8 | MATCH |
| hermes-academy | plugins_6acf344acf8481919ecb846796ea59ee | pluginrel_6adbb08361288191b8e0a1dfabe2f666 | 0.1.12 | MATCH |
| hermes-dispatch-os | plugins_6acccd5a49d48191932fc106919bf824 | pluginrel_6adedaefade08191aa9bcf4c0da2916b | 0.1.21 | MATCH |

## Delta against the 2026-10-25 registry

Eight of nine roles advanced; `hermes-academy` stayed at 0.1.12:

- automatic-engineer 0.1.25 -> 0.1.26
- agent-coordinator 0.1.68 -> 0.1.71
- technology-developer 0.1.55 -> 0.1.56
- qa-evidence-auditor 0.1.5 -> 0.1.8
- knowledge-curator 0.1.77 -> 0.1.81
- marketing-growth 0.1.6 -> 0.1.8
- search-growth 0.1.6 -> 0.1.8
- dispatch-os 0.1.20 -> 0.1.21

The source registry is updated to this observed provider state. The synthetic drift test no longer hard-codes today's provider versions as "future" versions; it generates a deterministic patch bump so the regression remains valid after legitimate registry refreshes.

## Remaining gate

This readback proves current provider release identity and version alignment only. It does **not** prove that every updated plugin release has been consumed successfully by HAE runtime dispatch. Keep automatic plugin upgrades, automatic registry promotion, and runtime dispatch disabled until the existing role-contract/runtime acceptance path supplies independent evidence.
