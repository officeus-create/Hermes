# Public Information Policy

Updated: 2026-07-13

## Publish

- Public services and customer outcomes.
- Approved pricing ranges and delivery timelines.
- Public contact details and verified social links.
- General capabilities, public case studies, and safe process explanations.
- Claims supported by public evidence or explicit business approval.

## Keep Internal

- Internal project and prototype names.
- Employee-only SOP, routing logic, queues, decision records, and operational rules.
- AI tool assignments, internal handoffs, prompts, system architecture, and review discussions.
- CRM structure, lead data, manager allocation, private metrics, and unfinished experiments.
- Credentials, tokens, account details, private files, and internal contacts.
- Personal owner information unless explicitly approved for a specific public use.

## Release Gate

Before deployment, public pages must be checked for internal names and details. `scripts/validate-build.mjs` blocks known internal project and AI-team terms from generated HTML. New internal names must be added to the block list when they are created.

Public copy should explain what a customer receives, not expose how the internal company operating system is organized.

