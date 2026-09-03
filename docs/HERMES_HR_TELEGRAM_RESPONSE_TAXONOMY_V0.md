# Hermes HR Telegram Response Taxonomy V0

Date: 2026-09-02  
Status: evidence-grounded hypothesis set for calibration, not an employment decision model

## Purpose

Convert repeated historical Hermes interview/training patterns into an inspectable response taxonomy that can guide adaptive interview follow-ups without pretending historical chat behavior is automatically predictive of job performance.

The source corpus for this V0 is the owner-provided Telegram export set:

- `ProgressoPro Marketing IT`
- `HL Dealers Shippers`
- `SMM Organic Target`

The corpus shows a repeated operating pattern: learners are asked to understand material, explain or process it, apply it in a practical situation, move into a test/practice call, review mistakes and repeat.

## Six response-pattern signals

### R1 — Own-words understanding

**Observed historical behavior**

Candidates were repeatedly expected to process information rather than merely mark material as read. One explicit instruction framed reading through three questions: understand it, realize it, and determine how to apply it.

**Interview signal**

The candidate can explain the role, customer problem or operating idea in language that is meaningfully different from the source brief.

**Weak evidence pattern**

- copies role wording;
- repeats slogans without explaining cause/effect;
- gives a generic summary that could fit any company.

**Adaptive follow-up**

> Explain the same idea without using the wording from the brief. What problem is the business actually trying to solve?

---

### R2 — Cause-and-effect realization

**Observed historical behavior**

Training material repeatedly asks people to connect an action to a business consequence: delays → customer frustration / money / reputation; weak social presence → unused capacity or missed demand; poor questions → premature pitch.

**Interview signal**

The candidate connects a situation to a consequence and can explain why a question or action matters.

**Weak evidence pattern**

- lists steps without explaining why;
- treats a script as the goal instead of a tool;
- jumps from problem to product without a causal bridge.

**Adaptive follow-up**

> Why does that matter to the customer or carrier? What happens if nothing changes?

---

### R3 — Application to an open scenario

**Observed historical behavior**

Hermes training repeatedly moves from material into test calls, live scenarios, recordings and practical work. Theory is not treated as complete until a learner attempts to use it.

**Interview signal**

The candidate turns an idea into specific words, questions, actions and a next step in a realistic scenario.

**Weak evidence pattern**

- explains a sales framework correctly but cannot write the next two lines of a conversation;
- gives motivational or abstract language instead of an action;
- relies on multiple-choice recognition.

**Adaptive follow-up**

> Write exactly what you would say next. Then write the question you would ask after that.

---

### R4 — Discovery before pitching

**Observed historical behavior**

Historical logistics and sales examples repeatedly emphasize asking about the current setup, pain points, consequences, client source, capacity, process or decision-maker before presenting value.

**Interview signal**

The candidate asks questions that reduce uncertainty before offering a solution.

**Weak evidence pattern**

- responds to an objection with a feature dump;
- defends Hermes before understanding what the other person means;
- asks only closed confirmation questions.

**Adaptive follow-up**

> Before you explain Hermes, what 2–4 questions would help you understand the other person’s situation?

---

### R5 — Reflection and error ownership

**Observed historical behavior**

Learners report hearing difficulties, slow reactions, weak call moments and what they would change. Recordings are explicitly used to identify mistakes and improve the next attempt.

**Interview signal**

The candidate can identify a personal mistake or gap, explain the feedback or evidence that revealed it, and state a changed next action.

**Weak evidence pattern**

- describes only success;
- blames the customer, script or environment without identifying a controllable change;
- says “I learned a lot” without naming what changed.

**Adaptive follow-up**

> What did you personally get wrong the first time? What did you change on the next attempt?

---

### R6 — Practice readiness and execution discipline

**Observed historical behavior**

Candidates are repeatedly asked to prepare for a test call, record the call, report results, review previous examples and return when ready for the next controlled stage. Live access follows practice and human approval.

**Interview signal**

The candidate can turn a learning gap into a bounded practice plan and provide evidence of completion.

**Weak evidence pattern**

- waits for more information indefinitely;
- cannot state what practice would prove readiness;
- treats course completion as equivalent to work readiness.

**Adaptive follow-up**

> If you had 48 hours to improve this skill before a supervised test, what exactly would you practice and what evidence would you submit?

## V0 use in Hermes Connect HR

The taxonomy should drive **follow-up selection and reviewer context**, not automatic employment decisions.

Recommended event fields:

```text
response_pattern_observed
question_id
pattern_code = R1..R6
reason_code
observed_evidence_id
confidence = low | medium | high
model_version
```

For Phase 1, confidence should mean only “confidence that the response contains this observable pattern,” not “confidence the candidate will be a good employee.”

## Relationship to practice signals

Current pilot dimensions map to the taxonomy as follows:

| Pilot signal | Primary taxonomy evidence |
| --- | --- |
| clarity | R1 |
| learning | R1 + R2 + R5 |
| evidence | R5 + R6 |
| discovery | R4 |
| application | R3 + R4 |

This mapping is provisional until reviewer calibration is performed.

## Calibration rule

Do not promote a Telegram-derived heuristic into a consequential rule merely because it appears frequently in the historical corpus.

Before any rule affects a readiness gate:

1. sample real candidate answers;
2. have at least two authorized reviewers label the evidence independently;
3. measure agreement and disagreement;
4. inspect false positives / false negatives;
5. keep sensitive and protected attributes out of the feature set;
6. treat model output as advisory;
7. require human approval for supervised/live work access.

## Phase 1 acceptance target

For the first controlled 30–50 candidate cohort, capture R1–R6 evidence and compare it against:

- reviewer decision;
- Academy completion/progress if routed there;
- supervised roleplay/test-call result;
- eventual operational KPI only after authorized live-work access.

The goal is not to maximize interview pass rate. The goal is to learn which observable response patterns correlate with later learning and job-relevant execution while preserving an auditable human gate.
