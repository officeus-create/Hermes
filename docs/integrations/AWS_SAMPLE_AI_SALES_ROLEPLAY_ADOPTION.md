# Hermes Connect — AWS AI Sales Roleplay Adoption Plan

Status: **Approved candidate / technical spike**

Upstream: `aws-samples/sample-ai-sales-roleplay`
License: **MIT-0**
Target Hermes module: **Hermes Sales Coach / Academy / Sales Intelligence**

## Why it matters

The upstream sample already demonstrates a strong training loop that matches Hermes needs: scenario-driven AI conversations, real-time speech, live scoring, emotional state, goal tracking, compliance checks, reference-document validation, session analysis, rankings, and multilingual support.

Hermes should adopt the product mechanics and selectively port reusable code, while replacing the AWS demo identity and avoiding unnecessary infrastructure coupling.

## Portable product concepts to adopt

1. Scenario schema
   - title / description
   - difficulty
   - industry/category
   - NPC persona
   - goals and success conditions
   - initial emotional / trust / progress state
   - sharing / permissions
   - guardrail rules
   - approved reference documents

2. Real-time coaching state
   - trust
   - progress
   - buyer pressure / anger
   - achieved goals
   - next-best coaching move
   - compliance / accuracy warnings

3. Session loop
   - user turn
   - AI buyer response
   - scoring
   - goal update
   - compliance/reference check
   - live UI update
   - final report

4. Training assets
   - reusable scenarios
   - company scripts
   - pricing sheets
   - contracts / approved claims
   - objection libraries
   - best-call examples

5. Post-session feedback
   - strengths
   - missed discovery questions
   - objection handling
   - accuracy / compliance
   - closing quality
   - next practice assignment

## Hermes initial scenario library

### Logistics
- Carrier owner: “Why should I pay 8%?”
- Owner-operator currently using another dispatcher
- Carrier concerned about control / transparency
- Shipper or dealer cold call with 30-second attention window
- Rate / service objection handling
- Follow-up after no response

### Hermes Connect SaaS
- Founder already has a booking system
- Business owner says AI is unnecessary
- Prospect compares Hermes with incumbent CRM / booking software
- Price objection
- Migration-risk objection

### Marketing / ProgressoPro
- Client burned by a previous agency
- Followers but no revenue
- Low marketing budget
- Owner wants guaranteed results

### HR / Academy
- Candidate with weak call confidence
- Candidate with B1 English
- Manager feedback conversation
- Performance coaching

## Runtime strategy

Do not make Bedrock a hard product dependency before benchmarking.

The upstream implementation is a reference architecture using Bedrock AgentCore, Transcribe, Polly, Guardrails, Knowledge Base, Nova, DynamoDB/RDS/S3/Cognito. Hermes should define provider-neutral interfaces first:

- `ConversationRuntime`
- `SpeechToTextProvider`
- `TextToSpeechProvider`
- `RealtimeScoringProvider`
- `ComplianceProvider`
- `ReferenceCheckProvider`
- `VideoAnalysisProvider`
- `SessionStore`

Then AWS can be one implementation, not the architecture itself.

## Web-first delivery sequence

1. **Visual prototype** — browser-only simulated roleplay.
2. Scenario builder UI.
3. Text conversation runtime + structured scoring.
4. Approved-material reference checks.
5. Voice input/output.
6. Call recording / upload analysis.
7. Optional video/avatar layer.
8. Leaderboards / manager analytics.
9. Mobile-web adaptation.
10. Native app integration after mobile web is approved.

## Current prototype

`public/demos/hermes-connect/sales-roleplay.html`

Boundary: visual simulation only. No real microphone/video/cloud processing yet.

## Acceptance criteria for first production pilot

- A manager can create one Hermes-specific scenario without code changes.
- A trainee can complete a text or voice roleplay.
- Hermes produces structured scores and specific coaching evidence.
- Unsupported product/pricing claims are flagged against approved reference material.
- Session history is available to the trainee and authorized manager.
- The module follows Approved Hermes Connect Brand System V1.
- Provider/runtime layer can be replaced without rewriting the scenario UX.
