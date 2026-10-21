# Hermes Home v3 — owner-source film transfer (review-only)

Status (corrected 2026-10-21): **PR #1970 MERGED into main on 2026-10-20** (merge commit `a18f7d603ee6a564fe92c7cad94ac89c38ef9506`). The public English Home visibly contains the four source-matched scenes; this is not a fresh Cloudflare deployed-SHA proof or owner acceptance of every video-loop/frame detail. Current touch-width fix #1982 and 720p media experiment #1984 remain separate unmerged draft PRs, and neither should be described as live.
Canonical visual source: Claude Home v3 standalone export archived on 2026-10-20 in the Hermes Design Hub on Google Drive. It is a bundler; root-only grep does not expose nested source reliably.
See: https://drive.google.com/file/d/1is9eoeOKY3j72w_8nX3-yiyv91exuKDg/view

| Home scene | Original Pexels clip | Owner/provenance role | Local self-hosted asset | Output |
| --- | --- | --- | --- | --- |
| Marketing | https://www.pexels.com/video/business-planning-in-a-meeting-6774593/ (Kindel Media) | Claude v3 DEFAULT, replaces earlier PR-only Thirdman candidate 7652721 | `/media/home/marketing-team-v1.mp4` | 540×960; ~11.1 s; 24 fps |
| Technology | https://www.pexels.com/video/people-coding-on-computer-6804109/ (cottonbro studio) | Claude v3 Technology source, center vertical crop | `/media/home/technology-claude-v3.mp4` | 540×960; 10 s; 24 fps |
| Academy | https://www.pexels.com/video/7413799/ (RDNE stock video) | Claude v3 Academy source, full portrait | `/media/home/academy-claude-v3.mp4` | 540×960; ~8.3 s; 24 fps |

**Provenance/licensing:** The Pexels license allows commercial use and modifications without attribution: https://www.pexels.com/license/. However, stock footage may not imply that identifiable people or brands endorse Hermes, work for Hermes, or are its customers. These are illustrative people scenes, **not** demonstrations of Hermes Connect or verified Academy events. Recheck third-party likeness/logo restrictions before public release. No stock footage forms part of the corporate logo or a trademark.

**Conversion:** Source H.264 videos were cropped (Technology only) and scaled using local FFmpeg 7.1 / libx264, CRF 29, 24 fps, `-an`, `-movflags +faststart`; posters are JPEG frames at ~1.8 s. Source audio discarded. No runtime Pexels fetches, subscription or paid-generation dependency. Local assets are approximately 0.46 MB Marketing, 0.32 MB Technology, 0.35 MB Academy; verify exact bytes in CI. Keep Pexels originals outside production repo.

**Runtime policy:** The four native direction links remain real HTML. Logistics remains a separate single Golden Scene with its fallback. Marketing/Technology/Academy use one local MP4 each, attached only when in viewport; `Save-Data`, reduced-motion and no-JS keep the poster; pause off-screen and in background. No fabricated stats, fake UI cards, duplicated tiny cars/books or business claims.

**Sitewide protections:** Keep `SiteHeader`, four direction routes, localized pages, Hermes Connect Option 02, organization Schema, canonical/hreflang, legal text, privacy consent, real site activity counter, forms and analytics contracts. No change to product dashboard branding. Compare 390/430/768/1024/1440, iOS Safari, first-middle-last and loop seam before merge. **No merge or deploy without visual owner approval.**
