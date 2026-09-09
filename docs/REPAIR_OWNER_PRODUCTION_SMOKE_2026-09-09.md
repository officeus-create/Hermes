# Repair Shop owner production smoke — 2026-09-09

The exact-main production closure run on `1118b5d33d5e2783468fac07117f2becd1c589c3` passed production customer CRM aggregation but failed the owner desktop/mobile step because the smoke still required the historical heading text `Repair Shop workspace`.

Current production markup uses the owner CRM shell and a different workspace heading. The smoke now validates the stable product contract instead: authenticated owner summary, visible CRM shell, visible non-empty workspace heading, localized dashboard context that is not the literal `Today`, and no horizontal overflow.

This change does not modify product runtime or production data. It repairs the verifier so future failures reflect live product behavior rather than stale copy.
