# Hermes Home v3 multi-shot · source-first gate, 22 October 2026

Canonical issue [#1986](https://github.com/officeus-create/Hermes/issues/1986). **Review only; not merged, not production media.** Main already has the approved 21 October layout at `3c7dc5b`. This media PR must NEVER recreate the Home/header/footer or re-open #1988. Hermes Design Hub (v0.2.46) is the owner-approved visual source specialist; Hermes Agent Coordinator (v0.1.38) routes one executor and independent QA. Neither plugin independently generates videos or has automatic cross-chat communication.

## Exactly what is lacking

The real published website has **one** self-hosted motion clip in each of the four physical windows, not the user's **at least two genuinely distinct real shots** per window. #1984 only sharpens the same three shots and does not solve this. The numeric video IDs in the 21 Oct Claude release list are source references, **not actual verified clips with rights/quality/actor-context sign-off**. Main's existing four clips are reference first shots and must not be misrepresented as a complete montage.

## One accountable assembly lane

1. For each pane, verify the owner-listed second source **on its actual Pexels page**, asset download URL and permitted commercial usage, speaker/actor/product depiction and stock-brand logos. **Do not infer a Pexels CDN path from an ID** or hotlink downloads in production. The general Pexels commercial license does not let us claim stock actors endorse or work for Hermes.
2. Download the original source masters through an approved runner, not through paid services, then independently review one frame near start/middle/end for subject relevance and privacy.
3. Reproducible offline first-cut preview: `bash scripts/media/render-home-v3-two-shots.sh academy /path/real-master-1.mp4 /path/real-master-2.mp4 /tmp/hermes-review` with exactly TWO different real sources. It creates a silent self-hostable 540×960 H.264 review MP4, 4 still frames and both source SHA-256 records. It writes **only** to the supplied preview directory, never to `public/media/home/`. Its 0.7+0.7 s fade-through-black avoids ghost faces in a forced people crossfade; it is a design *candidate*, not proof that the 1.4 s Claude crossfade and loop seam are visually approved.
4. Record each approved additional source in `src/data/home-cinematic-sources.json` `reviewedAdditionalSources[]` with `direction,provider,id,previewAssetPath,sha256,licenseReviewed,noImpliedEndorsementReviewed,normalSpeedTemporalReview`. The referenced review file must exist, stay <=4 MB and match its checksum. An absent review, metadata only, or one repeated source cannot satisfy two-shot completion. Then ask for owner visual approval with an actual exact-head **1440 and 390 normal-speed video**; record only a verified `releaseApproval`.
5. Run `node --test scripts/media/verify-home-multishot.test.mjs` for structural source regression, `node scripts/media/verify-home-multishot.mjs` for honest outstanding gaps, and `node scripts/media/verify-home-multishot.mjs --release` as a fail-closed final gate. The presence of a green preflight workflow is NOT a green multi-shot release.
6. After approved four montage sources exist, integrate once into one reviewed scoped media PR with existing video lazy loading, poster fallback, Save-Data/reduced-motion safeguards, compare 390/430/701–820 touch/1024/1440, WebKit/iPhone and Android, first/mid/change/loop, transfer bytes, SEO/consent/CTA. Only then user approves preview → strict CI → merge → Cloudflare exact-SHA verification.

## Five do-not-repeat rules

- One feature ≠ endless patches. Freeze exact head before long CI. Never add unrelated SEO/Contact/redesign changes.
- Screenshot/CI can be green while visuals are wrong. Review actual temporal shot changes in each pane.
- Existing canonical routes, Hermes Connect Option #02, all locale/SEO/legal/consent and Insights-retained proofs remain untouched.
- No unverified source, Pexels endorsement, invented customer outcomes, automatic paid generator or empty traffic/social claims.
- Document SHA/source/evidence/owner release separately. Do not call a draft, plugin skill, or mock MP4 an actual production deployment.

**Next action:** obtain and independently verify one additional genuinely different real video master per physical window, starting Academy (7413799 primary + 9034497 owner-listed second) where the two exact source file references are present in the approved 21 Oct Claude export. Then render a 9-second preview and compare normal speed with original Claude design before promotion.
