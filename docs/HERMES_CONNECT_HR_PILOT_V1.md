# Hermes Connect HR Pilot V1

Date: 2026-09-02  
Branch: `feature/hermes-connect-hr-pilot-v1`  
Status: IMPLEMENTED FOR REVIEW — not production hiring automation

## Objective

Create the first usable Hermes Connect HR candidate flow inside the canonical `public/demos/hermes-connect/` product tree:

`source → intake → structured interview → adaptive follow-up → practice signals → human review / Academy development path`

The pilot is intentionally narrower than the eventual 110-country system. It proves the product mechanics before broad traffic acquisition.

## Source evidence used

The first question model is grounded in owner-provided Telegram exports and current One Brain specifications, not invented from a generic ATS template.

Observed historical patterns used in V1:

1. Learners were explicitly instructed to read material while asking whether they **understand**, **realize** and can **apply** the information.
2. Training repeatedly moved from study material into a **test call / practical task** rather than stopping at passive completion.
3. Logistics training captured real call outcomes, listening difficulty, mistakes, self-reflection and repeated review/practice cycles.
4. Sales training used discovery frameworks such as SPIN/AIDA and required the learner to translate theory into an actual dialogue.

These patterns justify the V1 sequence:

`Context → Understanding → Application → Evidence → Human Gate`.

Historical Telegram content remains evidence for hypothesis design. It is not treated as automatic truth and is not used to infer protected traits or make automatic employment decisions.

## Implemented files

- `public/demos/hermes-connect/hr.html`
- `public/demos/hermes-connect/hr.css`
- `public/demos/hermes-connect/hr-interview.mjs`
- `scripts/hermes-connect-hr-contract.test.mjs`

## Candidate flow implemented

### Intake metadata

Collected for localization / funnel analysis:

- country/current market;
- interview language;
- acquisition source;
- selected track.

`country`, `language`, and `source` are explicitly excluded from readiness signal computation.

### Phase 1 tracks

- Logistics · Carrier Acquisition
- U.S. Sales · websites / SEO-GEO / SMM
- Marketing · Training

### Base interview sequence

1. Why now / current motivation.
2. 12–24 month professional direction.
3. Evidence of learning a skill from zero.
4. Read a track-specific brief and explain it in the candidate's own words.
5. Apply the role idea to an open-ended work scenario.

### Adaptive behavior

The pilot adds a follow-up when:

- an evidence/understanding answer is too thin to demonstrate a concrete example;
- an application answer moves directly into pitching without discovery questions.

The follow-up reason is deterministic and visible in the stored question path.

## Identity contract

The pilot creates one immutable local identifier and reuses it as:

- `candidate_id`
- `learner_id`

This proves the HR ↔ Academy identity principle before server persistence is introduced.

## Practice signals

The pilot produces explainable practice signals only:

- clarity;
- evidence;
- learning/reflection;
- discovery;
- application.

The current heuristic considers answer structure, concrete actions, observable examples, reflection and discovery questions. It does **not** use country, language or acquisition source.

These signals are development/reviewer aids. They are not a final employment score.

## Safety / employment boundary

The pilot must not:

- auto-hire;
- auto-reject;
- rank candidates using protected or sensitive traits;
- use country/language/source as readiness-scoring inputs;
- promise employment, compensation or Academy outcome;
- grant live customer/carrier access without an authorized human gate.

The UI states that the recommendation is advisory and requires human review.

## Data boundary

V1 persistence is browser-local (`localStorage`) only.

The user can:

- delete pilot data;
- restart the pilot;
- export a sanitized JSON summary.

This is implementation evidence for the interview mechanics, not a production candidate database.

## Execution-board mapping

Current evidence created by this branch:

- HR-010 Candidate entity persistence — **prototype evidence only**; production persistence remains open.
- HR-011 Source attribution — **prototype capture implemented**; campaign/vacancy/creative attribution remains open.
- HR-012 Interview session engine — **pilot implemented locally**; server replayable session storage remains open.
- HR-013 Adaptive branching — **pilot implemented** with concrete-evidence and discovery follow-ups.
- HR-014 Explainable score snapshot — **partial**; dimensions exist, evidence-ID/confidence lineage still open.
- HR-015 Route engine — **advisory development recommendation implemented**; final reviewer workflow remains open.
- HR-017 HR/Academy identity — **pilot identity continuity implemented**; production shared datastore remains open.
- HR-020 Human readiness gate — **UI/product boundary enforced**, production authorization still open.

## Next implementation slice

1. Add HR entry into canonical workspace navigation without creating a second product shell.
2. Build HR owner Command Center: funnel totals, review queue, Academy conversion, source quality.
3. Replace localStorage with private server-side candidate/session persistence.
4. Add immutable event model for source, question path, answer evidence and reviewer overrides.
5. Add reviewer screen with evidence IDs and override reasons.
6. Wire Academy enrollment to the same candidate identity.
7. Run first 30–50 candidate cohort only after privacy/reliability review.

## Validation

Contract test added:

```bash
node scripts/hermes-connect-hr-contract.test.mjs
```

It guards the presence of the three initial tracks, human-review boundary, shared candidate/learner identity, non-scoring context fields, protected-field exclusion and absence of explicit auto-hire/auto-reject states.
