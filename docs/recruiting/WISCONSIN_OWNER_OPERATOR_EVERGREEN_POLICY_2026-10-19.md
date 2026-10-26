# Wisconsin Owner-Operator Recruiting — Evergreen Owner Directive

Owner decision: 2026-10-19. Hermes Logistics LLC recruits Wisconsin owner-operators **continuously and without a fixed end date**. Previous short-lived source-review deadlines (notably 2026-10-15) were mistaken for a recruiting closure; they are superseded for this owner-confirmed position. This document does not certify a carrier's USDOT/MC status, insurance or a freight guarantee.

## Canonical surface and identity
- Active canonical: `https://hermeslogisticsus.com/careers/wisconsin-owner-operators/`.
- Original real posting date: `2026-10-03`. Do not modify `datePosted` to simulate freshness.
- Owner confirmation/review evidence: `owner:2026-10-19:permanent-open-recruiting`.
- `alwaysOpen: true` and no `expiresAt`. Google Search Central states `validThrough` **must be omitted** for positions that never expire.
- Role: independent owner-operators with **their own commercial truck and trailer**. `CONTRACTOR` (not a company-driver job, not necessarily employment by the Hermes agency), and no forced dispatch subject to the applicable carrier program.
- Wisconsin is a recruiting-market scope. Listed cities do **not** represent Hermes offices, guaranteed loads, exact lanes, or countrywide eligibility.
- Any rates, revenue, insurance, operating authority, contract, carrier program, dedicated lanes, or income require individual verification; no guarantees.

## Real application channel — no dependency on ATS subscription
1. **Candidate calls and interviews:** Yuri, an owner-operator trusted by the owner and assigned to screen Wisconsin Owner-Operator candidates, takes recruiting calls at **+1 (414) 269-7377**. Confirmed contact hours (U.S. Central Time): **Monday–Friday after 2:15 PM CT; Saturday–Sunday 10:00 AM–9:00 PM CT**. This is Yuri's personal number *used with the owner's authorization for this recruiting function*, not a general Hermes switchboard or a registration verification number.
2. **Email fallback/application:** send to `officeus@hermeslogisticsus.com`, subject `Wisconsin Owner-Operator Application`, briefly providing home base, truck/trailer, experience and preferred lanes. Do not request identity documents in the first email. Email receiving was independently tested. Owner clarification from October 19 supersedes the incorrect temporary phone removal: Yuri is the designated recruiter/interviewer, and his published call hours and number must remain visible on the vacancy page and existing ATS listing.
3. **Google Voice is INTERNAL verification-only**, per owner instruction: use the existing company Google Voice number for registration/SMS verification only if the platform accepts VoIP numbers and the currently authorized account can access messages. It does not become a candidate contact and its OTP codes must not be saved in GitHub, Drive, analytics or public discussions. Direct Google Voice app/browser control is not connected in this chat, but Google Voice forwarding to the linked corporate Gmail inbox is VERIFIED: an October 19, 2026 incoming SMS notification was read via the authorized Gmail connector with message content kept private. For future registration, look up only the requested message in this mailbox when appropriate; never display or store the OTP in issue comments, repository files or analytics. Forwarding is not guaranteed for all shortcodes or future messages. (Indeed previously rejected a virtual-number verification attempt.)
4. The older `https://100hires.com/j/G4ek3eN` is **Unlisted** and historical. Never use it as the primary or sole application CTA. No subscription purchase is approved.
5. Do not claim a Hermes web form delivers, stores, or creates candidate records until backend persistence, dedupe, privacy and a production receipt are proven. `directApply:false` until verified.

## Lifecycle guard
- A periodic *operational audit* is recommended for mailbox receipt, Yuri's candidate interview call delivery/schedule, employer/company facts, eligibility and visible copy; it does **not** close an owner-confirmed always-open position. The owner has designated Yuri for this recruiting campaign; actual call receipt is still to be tested independently.
- Only an explicit authorized owner pause/closure or loss of truthful intake changes the public opening status. The edge runtime guards remove JobPosting and application CTAs on pause, including against previously cached HTML.
- A deliberate new finite vacancy must still have a genuine `expiresAt`; do not generalize this exception to unrelated Academy, dispatcher, or third-party jobs.
- Never create new duplicate pages per Wisconsin city solely for rankings; use the one canonical vacancy with substantive unique market details.

## Verification
- PR: https://github.com/officeus-create/Hermes/pull/1965
- Keep exact-head CI + Playwright desktop/mobile, one active role on the Careers hub, `JobPosting` on detailed page only, no `validThrough`, canonical/sitemap dates, Yuri's interview number and correct Central Time hours, and the functional company email application fallback. Internal Google Voice number and SMS/OTP must never appear as public recruiting CTAs.
- Production readback and Search Console URL Inspection/Job rich-result eligibility are distinct from merging. Neither ranking nor real contact delivery follows automatically from structured data.
- Canonical HR ownership #513, website Opportunities #1682. Do not spin up a second HR pipeline.

References:
- Google Search Central: https://developers.google.com/search/docs/appearance/structured-data/job-posting
- Google editorial freshness policy: https://developers.google.com/search/blog/2021/07/job-posting-updates
