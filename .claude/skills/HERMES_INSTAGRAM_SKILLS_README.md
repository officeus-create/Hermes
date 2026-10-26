# Hermes / ProgressoPro Instagram Agent Skills (Claude Code)

**Status: draft implementation, NOT merged/deployed/published.** Source: `Jakeschincariol/instagram-agent-skill`, pinned SHA `d03c56bb598be770c60b201f94237e5d1a4268a6`, MIT license in `INSTAGRAM_DONOR_LICENSE`. Claude Code discovers the 13 `/ig-*` skills in this project's `.claude/skills/`.

## Quick start (local Claude Code)
1. Check out the reviewed PR branch in an authorized clone of Hermes. Pick exactly one verified brand and Instagram account. Work ONLY in `~/.hermes-social/<brand_id>/<account_id>/` and never commit account data.
2. Copy `docs/marketing/INSTAGRAM_VOICE_TEMPLATE.md` into that private directory as `voice.md` and fill with only owner-approved actual material. Existing skill donor paths have been moved from global `~/.claude/instagram/` to private per-account templates.
3. Run `/ig-viral` on user-provided permitted examples, `/ig-reel` on a proven topic, `/ig-human`, `/ig-caption`, then Design + owner review. Every assistant output is a **draft**, never an authorization to post.
4. CLI sample, no API access: `python3 .claude/skills/ig-reel/hookscore.py --hook "A carrier asked us why this contract clause matters"`. Additional local checkers: `beats.py`, `caption.py`, `humanize.py`, `detect.py`, `swipe.py`.
5. Owner-approved results go through the **existing** canonical Social Publisher only after its separate permission/identity/receipt gates are proven. No new publishing app, cron, scraping tool, HAE job, queue or database.

Marketing & Social Growth owns experiments, Design Hub owns visual QA, Sales leads/commercial truth, Hermes Connect CRM truth, QA validates evidence, Knowledge Curator proposes lessons into One Brain. HAE stays P0-frozen pending natural heartbeat and independent proof.

Note: Original hook scoring research reports poor winner-selection performance (~0.56 AUC) even while filtering obvious weak hooks. Treat it as a draft quality check, not an algorithm for guaranteed virality.

## Verification
`node scripts/instagram-skills-integration.test.mjs`
