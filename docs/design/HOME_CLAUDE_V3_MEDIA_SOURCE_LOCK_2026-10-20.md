# Hermes Home v3 — owner-source multi-shot film transfer (review-only)

Status: DRAFT PR #1997. Do **not** describe this as owner-released, merged or live.
Canonical visual source: the owner-approved Claude Design project `274c09e1-8ea3-4bed-8932-b4a8b34cb1e1` plus its Home v3 standalone export archived on 2026-10-20 in the Hermes Design Hub on Google Drive. The project is a bundler; root-only grep does not expose nested source reliably.
See: https://claude.ai/design/p/274c09e1-8ea3-4bed-8932-b4a8b34cb1e1 and https://drive.google.com/file/d/1is9eoeOKY3j72w_8nX3-yiyv91exuKDg/view

| Home scene | Original Pexels clips | Owner/provenance role | Local self-hosted asset | Output |
| --- | --- | --- | --- | --- |
| Logistics | [9339061](https://www.pexels.com/video/9339061/), [18749847](https://www.pexels.com/video/18749847/), [9339073](https://www.pexels.com/video/9339073/) | Three distinct road/freight shots listed in the approved Claude design | `/media/home/logistics-golden-v1-540.mp4` | 540×960; 9 s; 24 fps |
| Technology | [6804117](https://www.pexels.com/video/6804117/), [6804109](https://www.pexels.com/video/6804109/) | Two distinct development/collaboration shots listed in the approved Claude design | `/media/home/technology-claude-v3.mp4` | 540×960; 8 s; 24 fps |
| Academy | [7413799](https://www.pexels.com/video/7413799/), [9034497](https://www.pexels.com/video/9034497/) | Two distinct teaching/practice shots listed in the approved Claude design | `/media/home/academy-claude-v3.mp4` | 540×960; 8 s; 24 fps |
| Marketing | [7963107](https://www.pexels.com/video/7963107/), [7947516](https://www.pexels.com/video/7947516/), [3253113](https://www.pexels.com/video/3253113/) | Three distinct content/measurement/work shots listed in the approved Claude design | `/media/home/marketing-team-v1.mp4` | 540×960; 9 s; 24 fps |

**Provenance/licensing:** The Pexels license allows commercial use and modifications without attribution: https://www.pexels.com/license/. However, stock footage may not imply that identifiable people or brands endorse Hermes, work for Hermes, or are its customers. These are illustrative people scenes, **not** demonstrations of Hermes Connect or verified Academy events. Recheck third-party likeness/logo restrictions before public release. No stock footage forms part of the corporate logo or a trademark.

**Conversion:** Source H.264 masters were center-cropped to the approved 9:16 windows and assembled using local FFmpeg/libx264 at 24 fps, `-an`, `-movflags +faststart`. Runtime 540×960 files use CRF 21; 720×1280 variants use CRF 23. Posters are regenerated from the matching local films. Source audio is discarded. No runtime Pexels fetch, subscription or paid-generation dependency remains. Every runtime file stays below the existing 1.5 MB Home media budget. Keep Pexels masters outside the production repository.

**Runtime policy:** The four native direction links remain real HTML. Every window now uses a local multi-shot film, attached only when allowed by the existing autonomous playback runtime; `Save-Data`, reduced-motion and no-JS keep the poster, and video pauses off-screen/in background. No fabricated stats, fake UI cards, duplicated tiny cars/books or business claims.

**Sitewide protections:** Keep `SiteHeader`, four direction routes, localized pages, Hermes Connect Option 02, organization Schema, canonical/hreflang, legal text, privacy consent, real site activity counter, forms and analytics contracts. No change to product dashboard branding. Compare 390/430/768/1024/1440, iOS Safari, first-middle-last and loop seam before merge. **No merge or deploy without visual owner approval.**
