# Hermes Production Deployment Record

## Current public production

- Main domain: `https://hermeslogisticsus.com`
- Connect domain: `https://connect.hermeslogisticsus.com`
- App domain: `https://app.hermeslogisticsus.com`
- Cloudflare Pages project: `hermes`
- Production branch: `main`
- Build: `npm run build`
- Build output: `dist`
- Release owner: Cloudflare Git integration
- Private mail/runtime Worker owner: `hermes-lead-email`

The Pages project is released from reviewed GitHub `main`. A merge is not treated as production proof by itself.

## Authoritative Pages release contract

Workflow: `.github/workflows/cloudflare-pages-production-v2.yml`

For each covered `main` change, the workflow:

1. checks out the exact approved `main` revision;
2. builds `dist` and runs the static release contracts;
3. waits for the official `Cloudflare Pages` GitHub App check for that exact commit SHA;
4. reads the current main-domain product truth back from the custom domain;
5. verifies the Connect custom-domain route;
6. publishes sanitized release evidence.

The workflow does not own a second Pages upload path and does not require a generic Cloudflare deployment credential. The native Cloudflare Git integration is the single Pages release owner.

PR #1360 established and live-verified this contract on 2026-09-18. Later releases must satisfy the same exact-SHA verification; do not infer live state from merge status alone.

## Pages runtime configuration — aligned production baseline

Current authenticated Cloudflare evidence after #1360 shows:

- Production bindings still carry the legacy dashboard marker that they are managed through `wrangler.toml`;
- Production compatibility date is `2026-08-04`;
- Preview/default compatibility date is `2026-08-04`;
- Production keeps the intended live delivery, KV, D1 and private `LEAD_EMAIL_SERVICE` binding;
- Preview remains fail-closed and must not gain Production D1 or the private email-service binding.

The public repository intentionally has **no active root Wrangler configuration**. `wrangler.jsonc.example` is a reviewed reference, not a deployment authority.

Canonical authority is now explicit: authenticated Cloudflare Pages project state owns runtime variables/bindings/runtime settings; the Cloudflare Git integration from reviewed `main` owns releases; `config/cloudflare-pages-runtime-baseline.json` is versioned evidence and an anti-regression contract, not a second editable runtime control plane. The dashboard's legacy “managed through wrangler.toml” annotation does not create repository authority while no active root Wrangler config exists.

Rollback remains Cloudflare Pages deployment history followed by exact-SHA/custom-domain readback. Do not deploy a partial downloaded config, copy Cloudflare resource IDs or secret values into the public repository, or introduce a second Pages deploy/config authority.

## Bounded production D1/operator proof — #960

The Repair Shop production access-state proof is a separate capability gate owned by #960, not a Pages release mechanism. #961 is closed because Pages deploy/parity is complete.

It requires only the dedicated authorized proof credentials:

- `CLOUDFLARE_PAGES_READ_TOKEN` for the minimum Pages read needed by the proof;
- `CLOUDFLARE_D1_API_TOKEN` for the bounded D1 proof path;
- the existing account identifier supplied through the authorized production environment.

The proof workflow must not fall back to a broad generic Cloudflare token. If the dedicated credentials are unavailable, the proof remains blocked rather than borrowing a wider credential.

## Other surviving Cloudflare gates

The completed Cloudflare remediation tracker is GitHub issue #1349; do not reopen its closed DNSSEC/runtime-date work. Remaining owner/admin Cloudflare gates are coordinated in One Brain; the bounded Repair Shop D1/operator proof is owned by #960.

Password reset issue #611 has merged opt-in Gmail API transport code but production transport remains OFF pending owner-approved `gmail.send` OAuth/secrets, real reset/session/replay/cleanup proof, and SPF/DKIM/DMARC alignment; it is not a Pages deployment blocker.

## Superseded instructions

Historical guidance that treated missing generic Pages deployment credentials, stale custom-domain deployment, or issues #226/#232 as the current release blocker is retired. Do not revive those paths from older notes or handoff history.

## Rollback

If a reviewed release regresses production, use Cloudflare Pages deployment history to roll back to the previous successful production deployment, then repeat exact-SHA/custom-domain readback. Do not create an alternate deployer as a rollback shortcut.
