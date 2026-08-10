# Compliance Source Notes

Reviewed: 2026-08-10

These notes record the primary-source principles used for Compliance Sprint 1 so later changes can distinguish engineering assumptions from legal requirements.

## FTC baseline

FTC business guidance emphasizes knowing what personal information a business holds, collecting and keeping only what is needed for a legitimate business purpose, restricting access, protecting retained data, securely disposing of data that is no longer needed, and planning for security incidents.

Implementation impact: the Hermes internal data-governance gate requires a data inventory, purpose, system of record, access roles, retention/deletion rule, security controls, and explicit analytics exclusions before a new live data flow is launched.

## California notice baseline

California Attorney General guidance describes a CCPA Notice at Collection as a notice that, when the law applies, lists categories of personal information collected and the purposes for which the categories are used, links to the privacy policy, and includes sale/sharing choice information when applicable. It must be provided at or before collection.

Implementation impact: the Hermes Privacy Policy now contains a dedicated Notice at Collection section and the existing public contact form links to that policy at the collection point. Applicability to a particular Hermes business still requires threshold and processing review.

## Important limitation

Nothing in these notes establishes that a specific statute applies to every Hermes business, visitor, or data flow. State, federal, sectoral, and international requirements must be checked against the actual contracting entity, business thresholds, jurisdiction, audience, data categories, and processing activity before a legal compliance claim is made.
