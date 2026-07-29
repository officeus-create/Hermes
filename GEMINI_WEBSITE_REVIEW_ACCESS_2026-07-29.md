# Hermes Website — Gemini Review Access

## Purpose

Give Gemini enough verified context to review the Hermes website and prepare
implementation-ready recommendations for Codex without exposing production
credentials, customer records, private databases, or publishing access.

## Approved task

Vladimir confirmed on 2026-07-29 that the following P0 handoff had already been
approved with ChatGPT:

- `00_P0_HERMES_WEBSITE_EXPANSION_CODEX_HANDOFF.md`
- Google Drive file:
  `https://drive.google.com/file/d/1QApJ3RmInXjDItr9i4azBqHIGzGZvKb9/view`

Primary outcome:

`Direction -> Role -> Need -> Situation -> Recommendation -> Action`

The implementation must extend the current site. It must not redesign or
replace the approved homepage, business-direction pages, contact routes, or
visual system.

## Verified current state

Production:

- `https://hermeslogisticsus.com/`
- `https://hermeslogisticsus.com/paths/logistics/`
- `https://hermeslogisticsus.com/paths/marketing/`
- `https://hermeslogisticsus.com/paths/academy/`
- `https://hermeslogisticsus.com/paths/technology/`
- `https://hermeslogisticsus.com/load-board/`

Repository:

- Astro, TypeScript, and shared CSS;
- 21 generated website pages;
- four business directions;
- Logistics audience routes;
- Load Board demo and sales-intake previews;
- Marketing interactive growth flow;
- Academy interactive learning flow;
- IT operating flow and five-step project brief;
- SEO metadata, canonical URLs, sitemap, robots, and structured data;
- local analytics event adapter with no approved external receiver;
- protected Logistics Sales receiver prepared locally but not activated;
- automated build, unit, and browser checks.

Latest local verification before this package:

- 64 files checked;
- 0 errors;
- 0 warnings;
- 0 hints;
- 21 pages built;
- static site, contact handoff, Load Board, and protected receiver checks passed.

## Gemini assignment

Review the approved P0 handoff, the production site, and the attached safe
source snapshot. Return a concise `CODEX AUDIT PACKET`.

Required output:

1. Files and public pages actually inspected.
2. Access limitations.
3. Which P0 requirements are already implemented.
4. Which are partially implemented.
5. Which are missing.
6. The smallest additive integration points for a reusable Path Engine.
7. Proposed configuration schema and route mapping.
8. Logistics P0 decision tree with every terminal result.
9. Accessibility, mobile, SEO, privacy, and failure-state risks.
10. Duplicate functionality that Codex must reuse instead of rebuilding.
11. Claims or commercial terms that need evidence even though the overall P0
    implementation direction is approved.
12. Exact implementation order for Codex.

Use these labels:

- `VERIFIED`
- `INFERENCE`
- `NEEDS REVIEW`
- `NOT FOUND`

Do not describe inaccessible local functionality as missing. State that it was
not accessible and identify the file or evidence needed.

## Security and authority boundary

Gemini receives read-only review material. Gemini does not receive:

- Cloudflare credentials or publishing authority;
- GitHub credentials or repository write access;
- `.env` files, API keys, OAuth tokens, passwords, or secrets;
- CRM, Sheets, carrier, applicant, customer, or employee data;
- production email-sending authority;
- permission to contact customers or employees;
- permission to change business rules independently.

Gemini may recommend changes and prepare specifications. Codex remains the code
executor. Vladimir retains production and business approval.

## Important review rules

- Do not ask Vladimir to paste the full homepage source into chat; use the safe
  source snapshot.
- Do not create a replacement `audit.mjs`; the repository already has build,
  static, unit, and browser validation.
- Do not recommend copying competitor text, imagery, reviews, metrics, or
  commercial terms.
- Do not create thin SEO pages only to increase route count.
- Do not send personal information into analytics, URLs, or browser storage.
- Preserve the existing contact policy: Logistics may use the approved phone
  and email; Marketing, Academy, and IT use email-based contact routes.
- Keep Hermes Connect status truthful and distinguish live, prototype, next,
  and planned functionality.

