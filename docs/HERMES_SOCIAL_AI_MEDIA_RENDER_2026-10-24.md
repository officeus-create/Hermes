# Hermes Social Studio — AI media render slice — 2026-10-24

Status: review-only implementation on top of the merged Social Studio. This slice does not create a second scheduler, social connector, AI runtime, or brand brain.

## Problem closed

The merged Social Studio already supports:

- Facebook / Instagram / Threads connection state on one screen;
- live cross-channel readback;
- one unified composer with Smart Mirror;
- Instagram Feed + Instagram Story + Threads Feed + Facebook Page distribution;
- Google Drive owner OAuth and source ingestion;
- Workers AI source analysis;
- source-bounded captions, Threads/Facebook variants, Story direction, destination choice and carousel storyboard.

The remaining product gap was between **storyboard** and **publishable image URL**. Meta image publishing needs public media URLs, while the Drive source is private and must not be silently made public.

## Bounded implementation

After an owner reviews the AI package, **Render publish-ready JPEGs**:

1. turns the reviewed carousel plan into original Hermes Connect editorial cards in the browser;
2. renders feed/carousel cards at 4:5 (900×1125);
3. renders a separate Instagram Story derivative at 9:16 (900×1600) from the reviewed Story direction instead of stretching the feed card;
4. adaptively lowers JPEG quality if required;
5. uploads each approved render through the authenticated same-origin Social Studio endpoint;
6. stores only a short-lived JPEG payload and asset metadata in the existing D1 binding;
7. returns an opaque same-domain public HTTPS URL;
8. inserts feed URLs into the existing unified composer and routes the dedicated Story URL only to Instagram Story for final review/publish.

The asset endpoint does not publish to Meta. External social publication still requires the existing explicit owner confirmation.

## Privacy / security boundary

- Only an authenticated owner of the current business can create an asset.
- Creation requires same-origin mutation protection.
- The creative intake must belong to the same owner/business.
- Only JPEG is accepted.
- Maximum JPEG size: 1,250,000 bytes.
- Maximum active assets per intake: 11 (up to 10 feed/carousel images plus one dedicated 9:16 Story image).
- Asset IDs are cryptographically random opaque identifiers.
- Public GET exposes one image only; there is no public listing endpoint.
- Public responses are `noindex, nofollow, noarchive`.
- Assets expire after 72 hours and are lazily deleted.
- Tokens, OAuth credentials, private Drive URLs and raw Drive files are not exposed by the media endpoint.

The 72-hour public URL exists because Meta must be able to fetch image media during publication. It is not a permanent media library.

## Why existing D1 is used for this slice

No canonical R2 or Cloudflare Images storage binding exists in current Pages runtime truth. Adding one solely for this feature would create a new runtime dependency and an owner Cloudflare configuration gate.

This first bounded implementation therefore uses the already-governed production D1 only as a small temporary publication cache. D1 currently limits a string/BLOB/row to 2 MB, so the product enforces a lower 1.25 MB JPEG ceiling.

If media volume grows, promote the same interface to Hermes-controlled object storage instead of increasing D1 media retention.

## Rendering boundary

The first renderer is deterministic and source-bounded. Feed/carousel and Story use separate aspect-ratio derivatives; Threads is never represented as having an Instagram-style Story surface. It does **not** invent source photography, customer results, people, locations or product UI. It renders:

- business identity;
- AI-reviewed carousel headline/body;
- Hermes Connect editorial visual grammar;
- slide index;
- a restrained provenance footer.

This is intentionally safer than asking an image model to fabricate client visuals.

Future optional visual-media generation can sit behind the same review/upload interface after provenance, cost and provider storage are approved.

## Acceptance

- Social Studio must keep one-screen channel overview and Smart Mirror.
- Social icon remains distinct from Product Hub grid.
- CRM compact sizing stays unchanged.
- Existing Drive/AI draft flow stays source-bounded.
- No new scheduler.
- No new provider OAuth path.
- No blind social retry.
- Media route never returns credentials.
- Rendered public media expires automatically.
- Final publish still requires owner confirmation.
