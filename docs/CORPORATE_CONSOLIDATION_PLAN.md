# Corporate Consolidation Plan

| System | Recommendation | Why / prerequisite | Migration order |
|---|---|---|---|
| `~/Hermes` | KEEP_CANONICAL | current shared repo | 0 |
| `~/Projects/hermes-connect-next` | RETAIN_RECOVERY / MERGE_CANDIDATE | substantial uncommitted GEO work, not canonical | inventory/diff/owner decision before any port |
| `~/Projects/hermes-connect-mobile` | RETAIN_PROTECTED | possible native-only source | manifest unique native capabilities, then selectively port |
| `~/Projects/hermes-connect-prototype` + recovery package | RETAIN_PENDING | legacy runtime dependency/#567 | read-only traffic/API/data dependency evidence; never delete early |
| `~/Documents/hermeslogisticus.com` | ARCHIVE_CANDIDATE | stale Aug-11 checkout with uncommitted work | diff against canonical, preserve unique artifacts, owner approves archive |
| AI_WORKSPACE / CEO/marketing/sales folders | CONNECT_NOT_MERGE | potentially valuable private knowledge | metadata inventory + provenance; no blind copying |
| Git refs | ARCHIVE_CANDIDATE | 561 unmerged locally known refs | classify merged/superseded/useful; owner approves deletion |
| Legacy command bridge | RETIRE_CANDIDATE | #566 P0 | contain and prove no dependency before retirement |

## Sequence
1. P0 containment and read-only access restoration. 2. Machine-readable source/task/evidence registry. 3. Source classification + diff/retention decisions. 4. Private CRM and analytics reconciliation. 5. One Brain event/task router. 6. Small AI-employee pilots with reversible permissions.
