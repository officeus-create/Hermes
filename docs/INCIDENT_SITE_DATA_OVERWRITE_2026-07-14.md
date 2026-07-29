# Site Data Overwrite Incident - 2026-07-14

## Result

The website is operational again. The production data contract in `src/data/site.ts` was replaced by a five-line contacts object, which removed the `site` and `PathDetail` exports and produced 51 compile errors.

## Repair

- Restored the complete `site.ts` contract from the repository index.
- Added the approved logistics phones, public Telegram groups, and Wisconsin location to that contract.
- Kept phone links out of Marketing, Academy, and IT pages; those directions use email.
- Consolidated `/contacts` into one route and removed two redundant draft files.
- Updated the Academy test to target the active screen instead of matching duplicate explanatory text.
- Changed Playwright from the unstable local dev server to the built-site preview server.

## Verification

- `npm run build`: passed with 0 errors, 0 warnings, and 0 hints.
- `npm test`: passed.
- `npm run test:e2e -- --workers=3`: 47 passed, 1 intentionally skipped, 0 failed.

## AI Command Bridge Decision

No working `mod_agent_tunnel.js` or Mac command agent was found in the local projects. An unauthenticated URL that accepts arbitrary shell commands must not be used. It would give anyone with the URL remote command execution on the Mac and could destroy unrelated work.

A future v0.1 bridge may accept only structured, allowlisted job types such as `SITE_BUILD`, `SITE_TEST`, `CREATE_HANDOFF`, and `READ_STATUS`. It must reject shell strings, destructive Git operations, unknown project paths, duplicate request IDs, and unsigned requests. Writes should use authenticated POST requests and produce an audit record.
