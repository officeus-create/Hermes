# Hermes Website Factory — Production Intake UX V1

Status: DESIGN COMPLETE / IMPLEMENTATION READY
Product family: Hermes Connect · Technology / IT
Primary goal: turn scattered public business information + owner intent into a reviewable website build brief without forcing the owner to fill a long generic questionnaire.

## Product promise
The owner should feel:
> “I showed Hermes where my business already exists, explained what I want, showed three useful references, reviewed the facts, and the system now has enough structured information to build.”

The flow is not a website-template picker. It is an evidence-to-brief workflow.

## Design principles
1. **Import before asking.** Do not ask the owner to retype facts Hermes can safely structure from provided public sources.
2. **Review before build.** AI extraction is proposed data, never silent truth.
3. **One question per decision.** Avoid giant multi-section forms.
4. **Competitor references have roles.** “I like this site” is too vague; capture *why* each reference matters.
5. **Voice is first-class.** A business owner can explain intent faster by voice than by filling twenty fields.
6. **Save continuously.** Closing the browser must not destroy a useful brief.
7. **Never request social passwords.** Public URLs are sufficient unless a future explicit OAuth connector is used.
8. **Mobile must be fully usable.** The intake should be possible from a phone after opening Google Maps/Instagram in adjacent apps.

---

# Flow

## Step 0 — Identity and resume
### Screen
**Build your website with Hermes**

If not authenticated:
- Continue with email / Hermes account.

If authenticated:
- show current Hermes identity;
- show existing unfinished Website Factory drafts;
- `Resume brief` or `Start a new website`.

### State created
`website_factory_draft_id`

### Required
Authenticated Hermes identity.

---

## Step 1 — Tell us where your business already exists
### Prompt
**Add anything that already represents your business.**

Accept one or more:
- current website;
- Google Maps / Business Profile;
- Instagram;
- Facebook;
- LinkedIn;
- X / Twitter;
- Threads;
- TikTok;
- YouTube;
- Yelp or other public directory;
- other public URL.

### Interaction
One universal URL field with automatic source detection.
After submission each URL becomes a `SourceCard`:
- source icon/type;
- domain / handle;
- `Ready to analyze`, `Reading`, `Needs attention`, `Imported`;
- remove/retry.

### Rule
Do not request login/password credentials for these sources.

### Continue condition
At least one source **or** explicit `I’m starting from zero`.

---

## Step 2 — Hermes prepares the business snapshot
### Purpose
Convert source material into a structured draft before asking the owner to type it again.

### Proposed fact groups
- business name;
- business category;
- short description;
- address / service area;
- phone;
- public email;
- hours;
- services / products;
- public social profiles;
- logo / brand references if publicly available;
- repeated customer language/topics from public material when reliable;
- existing website pages if a website source was supplied.

### UI
`FactReviewGroup` cards with three states:
- **Confirmed** — owner accepted;
- **Needs review** — conflict/low confidence;
- **Missing** — useful fact not found.

Each fact shows its source where possible.

### Conflict pattern
If Google Maps and Instagram disagree:
> “We found two phone numbers. Which one should the new website use?”

Never silently choose.

### Owner action
`Looks right` / edit individual facts.

---

## Step 3 — What should the new website accomplish?
### Primary question
**What should this website do for the business?**

Selectable goals, examples:
- get calls;
- collect leads;
- bookings / appointments;
- sell services;
- show portfolio/work;
- explain a complex offer;
- recruit people;
- support local SEO;
- establish credibility;
- another goal.

Then ask only relevant follow-up questions based on chosen goals.

### Inputs
- primary goal;
- secondary goals;
- target customer;
- geography / market;
- languages;
- primary action the visitor should take.

---

## Step 4 — Explain it naturally
### Prompt
**Tell Hermes what you want changed, added, removed or emphasized.**

Two equal options:
- `Record voice brief`;
- `Type brief`.

### Voice UX
- clear recording timer;
- pause/resume;
- playback;
- replace recording;
- transcript preview when available;
- owner may edit transcript/summary instead of re-recording.

### AI output
Do not replace the owner’s original recording/text. Generate a separate structured interpretation:
- must-have;
- nice-to-have;
- dislikes;
- brand tone;
- conversion goal;
- special constraints;
- unresolved questions.

Owner confirms/edits that interpretation.

---

## Step 5 — Three reference sites, three different jobs
### Instruction
**Give Hermes references for what “good” means to you. They do not need to be direct competitors.**

### Reference A — Visual direction
Question:
> “Which site has the visual feeling you want?”

Capture:
- URL;
- what specifically is liked: typography / colors / spacing / imagery / premium feel / simplicity / other.

### Reference B — Functionality
Question:
> “Which site works the way you want yours to work?”

Capture:
- URL;
- functionality liked: booking / quote flow / configurator / search / account / ecommerce / gallery / other.

### Reference C — Structure / content
Question:
> “Which site explains or organizes the business well?”

Capture:
- URL;
- what is liked: navigation / page structure / service explanations / proof / FAQs / case studies / other.

### Important rule
Do not ask the AI to copy a competitor. The output is a list of **principles to learn from**, not cloned text/layout/assets.

---

## Step 6 — Pages and capabilities
### Default
Hermes proposes an information architecture from the confirmed business facts, goals and references.

Example proposal:
- Home;
- Services;
- individual service pages where justified;
- About / Trust;
- Work / Portfolio;
- FAQ;
- Contact;
- location pages only when legitimate;
- privacy/legal as needed.

### Capability cards
Examples:
- booking;
- lead form;
- click-to-call;
- maps/directions;
- reviews/proof;
- gallery;
- multilingual;
- CRM handoff;
- analytics;
- chat/AI assistant;
- customer portal;
- integrations.

Each capability has:
- `Include` / `Not now`;
- short explanation of why Hermes recommended it.

Do not expose engineering jargon unless expanded on demand.

---

## Step 7 — Brand input
### If reliable brand assets were found
Show them and ask:
> “Use these as the current brand?”

### Otherwise
Ask only what is needed:
- existing logo upload;
- existing brand colors if known;
- photos/media upload;
- `No brand yet — create a direction from the brief`.

Never make the owner choose arbitrary design tokens from a huge color picker as the first brand decision.

---

## Step 8 — Review what Hermes understands
### This is the trust screen.
Show one structured brief:
1. Business truth.
2. Target customer / market.
3. Primary conversion goal.
4. Brand/tone direction.
5. Reference lessons.
6. Proposed pages.
7. Proposed capabilities.
8. Assets supplied.
9. Missing/uncertain items.

Every section has `Edit`.

### Readiness indicator
Use factual categories, not a fake AI score:
- **Ready to build**;
- **Ready with minor open items**;
- **Needs these answers first**.

---

## Step 9 — Build handoff
Primary action:
**Create website brief** / later **Start build** when the build engine is factual and available.

After submission show:
- brief ID;
- created time;
- current state;
- what happens next;
- link back to Hermes Connect;
- `Continue editing` while allowed.

Never claim a site is being built automatically unless the production build worker is actually connected and observable.

---

# Reusable component contract

## `WebsiteFactoryProgress`
- step name, not only `4/9`;
- completed steps clickable;
- mobile uses compact current-step header + progress bar;
- exposes saved state (`Saved just now`).

## `SourceUrlInput`
- paste-first;
- detects source type;
- validates HTTPS/public URL shape;
- never asks for password.

## `SourceCard`
States: queued / reading / imported / unsupported / retryable error / removed.

## `FactReviewGroup`
- source-aware proposed facts;
- inline edit;
- confirm group;
- conflict resolution.

## `GoalSelector`
- multi-select cards;
- one primary goal required before handoff.

## `VoiceBrief`
States: idle / recording / paused / processing / transcript-ready / error.
Original audio and derived interpretation are visually distinguished.

## `CompetitorRoleCard`
Props:
- role = visual | functionality | structure;
- URL;
- liked principles;
- optional note.

## `CapabilityCard`
- benefit-first label;
- reason recommended;
- include/not-now state.

## `AssetDropzone`
- logo / photos / other;
- mobile camera/gallery friendly;
- upload progress;
- retry/remove.

## `BriefReviewSection`
- summary;
- evidence/source count where relevant;
- edit deep-link;
- unresolved marker.

## `DraftResumeCard`
- business name/draft title;
- last saved;
- progress step;
- resume/delete action.

---

# Save / resume contract

## Autosave
Save after meaningful field changes with debouncing; do not block every keystroke on a request.

Visible state:
- `Saving…`
- `Saved`
- `Couldn’t save — retrying`
- persistent error with manual retry if retries fail.

## Resume
A returning authenticated user sees existing incomplete drafts before starting a new one.

## Navigation safety
If an unsaved upload/recording is active and the user attempts to leave, show a specific warning. Normal autosaved fields should not create unnecessary leave-confirmation dialogs.

---

# Validation contract

Validate at the decision boundary, not only on final submit.

Examples:
- invalid URL -> explain what is wrong beside that source;
- duplicate source -> merge/focus existing SourceCard;
- competitor field uses same URL for two roles -> allowed, but ask whether both roles are intentional;
- no primary conversion goal -> block final handoff, not early exploration;
- no sources + starting from zero -> allow flow, ask more fact questions;
- missing logo -> never block website brief;
- failed AI extraction -> allow manual fact entry.

Error copy must say what the owner can do next.

---

# Mobile contract — 390px
- one primary column;
- sticky progress may be compact but must not consume excessive vertical space;
- all source/reference inputs paste-friendly;
- 44px+ touch targets;
- long URLs truncate visually without losing copy/open access;
- competitor roles stack;
- voice controls remain reachable while keyboard is open;
- review sections expand/collapse but primary unresolved items stay visible;
- no horizontal scrolling.

---

# Accessibility contract
- explicit visible labels;
- error/status announcements through appropriate live regions;
- recording state is not communicated by color alone;
- keyboard-operable source cards, selectors and review actions;
- focus returns predictably after dialogs;
- reduced motion respected;
- upload/progress status has textual equivalents.

---

# Data / privacy UX boundary
- only process information the owner supplies or public sources they identify, subject to production data-policy rules;
- do not collect social-media passwords in the intake;
- mark imported facts as proposed until confirmed;
- distinguish public facts, owner-entered facts and AI interpretations;
- give the owner a way to remove a supplied source/draft asset subject to retention policy;
- do not publish or build from an unresolved conflicting critical contact/address fact without review.

---

# Build-ready route recommendation
When implementation begins, prefer one canonical Hermes Connect product route, e.g.:
`/services/hermes-connect/website-factory/`

Do not create parallel demo runtimes once the production implementation starts.

# Acceptance criteria for the UX design
- A user can complete the brief with one existing public source + voice description + three references.
- A user starting from zero can complete it manually.
- No social password is requested.
- Extracted facts are reviewable and source-aware.
- The three references have explicit distinct roles.
- Every meaningful step autosaves.
- Resume works conceptually from the Hermes account.
- Final handoff clearly separates confirmed facts, preferences and AI interpretation.
- 390px interaction model is defined.
- The design never promises an automatic production build before that capability exists.
