# Hermes Home v3 — 720p responsive-cinematic candidate, 21 October 2026

Status: **DRAFT / VISUAL AND MOBILE PERFORMANCE REVIEW REQUIRED**. This branch is not production. Source tracking: #1983; implementation PR #1984; independent mobile grid fix PR #1982.

## Measured file bytes (exact checked-in outputs)
| Scene | Current 540×960 video | Candidate 720×1280 video | Source fps |
| --- | ---: | ---: | --- |
| Marketing | 473,362 | 1,822,239 | 30 |
| Technology | 331,256 | 1,091,852 | 25 |
| Academy | 358,936 | 1,236,297 | 24 |
| **Combined** | **1,163,554** | **4,150,388** | native source cadence |

The new versions are about 3.57x larger in bytes combined. **Do not claim improved Core Web Vitals until measured.** No automatic 4K or frame interpolation. Every candidate is generated from the documented original Pexels source via `scripts/media/build-home-v3-720p-candidate.sh` with H.264 CRF25 and local WebP posters at 400/720w; see `HOME_V3_720P_CANDIDATE_METADATA.tsv` for hashes.

## Actual display and bandwidth policy
- Four native anchors and current Light/Premium Green homepage composition remain intact. The Logistics Golden v1 video is unchanged.
- The three people scenes add `srcset` posters with an old JPEG fallback. WebP posters are lazy-loaded; no visual animation requires JavaScript.
- On-device video selection occurs only once at **40% real viewport visibility** (no positive root margin): 720p when DPR >= 1.5 or the actual portal is >= 600 CSS pixels wide; 540p otherwise. This avoids HD network requests for barely visible second cards on mobile.
- Effective connection `slow-2g` or `2g` stays 540p even at Retina DPR. `Save-Data` and `prefers-reduced-motion` block all three video downloads; static scene remains.
- Existing local-only, muted, playsinline, pause-on-background, pause-offscreen, and no-synthetic-live-data protections remain.
- Only **one** media variant per scene should be fetched in a session. No preload of all videos or remote Pexels requests in browser.

## Gates still REQUIRED before any merge/deployment
1. Exact-head security/build/static contracts and all browser-regression shards pass.
2. Visual QA for frame clarity and crop / loop seam (beginning, midpoint, end) at 390, 430, 701, 768, 820, 1024, 1440 CSS pixels, with touch and mouse distinction.
3. Device QA: physical iPhone Safari (100% zoom and pinch state), Android Chrome; screenshots/videos confirm no blank right pane, clipping, text overlays, background flash, jitter or excessive battery/network activity.
4. Performance A/B: compare mobile LCP and CLS, downloaded media bytes, time-to-first-frame, scroll jank and memory against current production baseline. If worse, use 540p or only sharpen poster instead.
5. Owner visually approves selected candidate before reclassifying this draft as a release.

Known limitation: CI screenshots and Chromium device emulation do not prove physical Safari behavior. Data Saver / slow-network features must not be bypassed.
