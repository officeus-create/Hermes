# Hermes Connect — Academy + Beauty execution plan

Date: 2026-08-18
Status: implementation sequence after vertical-preparation release

## Product rule

Academy and Beauty are configurations of one Hermes Connect product family. Do not create a second Academy website, a separate salon app, a parallel authentication stack, or another generic workspace runtime.

Repair Shops remains the only production-live vertical until another vertical completes its own production acceptance.

## Academy — existing foundation to reuse

The repository already contains public Academy curriculum and application flows:

- U.S. Logistics Operations;
- Practical Marketing;
- How training works;
- Academy resources;
- Academy application.

The existing learning method is:

1. readiness;
2. awareness;
3. understanding;
4. application;
5. feedback / correction;
6. human progression decision.

### Academy V1 execution sequence

#### A1 — learner identity + enrollment

- extract or reuse the safe Hermes Connect account primitives rather than creating a second auth system;
- learner registration/login/recovery;
- learner profile;
- program selection;
- application/enrollment state;
- cohort/group metadata;
- phone and desktop web acceptance.

#### A2 — curriculum delivery

- program → module → lesson data model;
- text/video/resource lesson types;
- lesson completion state;
- next-lesson navigation;
- resume learning;
- existing public curriculum remains the source foundation.

#### A3 — assignments + review

- assignment definition;
- learner submission;
- safe file/link/text evidence boundary;
- reviewer state;
- reviewer feedback;
- correction/resubmission;
- support/questions;
- human progression decision.

#### A4 — progress + completion evidence

- program progress;
- module/lesson/assignment progress;
- cohort state;
- completion evidence;
- no automatic employment, income, client, certification, or promotion claims.

#### A5 — commercial access

Implement only after the exact offer is approved:

- one Logistics offer first;
- one Marketing offer first;
- price and access duration;
- capacity;
- payment state;
- refund/cancellation terms;
- purchase confirmation;
- paid-access enforcement.

Do not build a large pricing matrix before real conversion and retention evidence exists.

### Academy V1 definition of done

A learner can understand the program, register, apply/enroll, see curriculum, complete a lesson and assignment, see reviewer/feedback state, see progress, understand approved price/access terms, request or complete approved payment, and continue from phone or desktop without leaving Hermes Connect.

## Beauty Salons — first production vertical scope

Beauty must reuse the Hermes Connect product core while replacing repair-specific terminology and business rules with salon-specific entities.

### B1 — salon owner core

- owner registration/login/recovery;
- salon profile;
- location/timezone;
- team/specialist foundation;
- service catalog;
- desktop + mobile web acceptance.

### B2 — specialists + availability

- specialist profile;
- specialist-to-service eligibility;
- working hours;
- time off / unavailable periods;
- service duration;
- salon-level and specialist-level availability;
- conflict-safe booking logic.

### B3 — appointments

- public service selection;
- specialist preference where applicable;
- available time selection;
- appointment request/confirmation state;
- reschedule/cancel;
- no-show/completed states;
- owner schedule view.

### B4 — client CRM + retention

- client profile;
- permitted visit/service history;
- follow-up task;
- rebooking window;
- reminder foundation;
- review-request task;
- consent-aware communication state;
- no uncontrolled autonomous outreach.

### B5 — operating view

- today’s appointments;
- pending requests;
- schedule gaps;
- repeat-visit opportunities;
- overdue follow-up;
- exceptions requiring human attention;
- analytics only from real production events, never invented sample revenue.

## Beauty compliance boundary

Beauty/wellness can cross into sensitive health or regulated-procedure data. Before storing or processing medical details, treatment contraindications, diagnostic information, protected health information, prescription information, or regulated consent records, create a separate explicit legal/data-security review and minimum-data model.

The first salon booking release should avoid collecting medical details when they are not necessary for scheduling.

Payments, marketing consent, automated reminders, review requests, and regulated procedures each require their own release boundary before activation.

## Shared core to extract/reuse

Prefer reusable service-business primitives over copy/paste from Repair Shops:

- account/session/recovery patterns;
- organization/owner profile;
- services;
- people/specialists;
- availability;
- booking/appointment state machine;
- customer/client relationship history;
- follow-up tasks;
- localization;
- analytics consent and privacy-safe events;
- production smoke/cleanup pattern;
- mobile web QA.

Repair-specific entities such as vehicle/equipment data must not leak into Beauty or Academy.

## Release order

1. Merge truthful Academy + Beauty preparation surfaces after GREEN CI.
2. Academy A1 learner identity/enrollment.
3. Academy A2 curriculum delivery.
4. Academy A3 assignments/reviewer/progress loop.
5. Validate one Logistics and one Marketing commercial offer before payment expansion.
6. Beauty B1 owner/service/specialist foundation.
7. Beauty B2/B3 availability + appointments with conflict-safe production tests.
8. Beauty B4 retention only after consent/outreach rules are explicit.
9. Promote a vertical from preparation to LIVE PRODUCT only after real production smoke and mobile acceptance pass.

## Non-goals

- no new Hermes brand;
- no duplicate Academy runtime;
- no separate salon app runtime;
- no native-app dependency for launch;
- no fake AI autonomy;
- no fabricated dashboard numbers;
- no legacy tunnel dependency;
- no public claim that Academy or Beauty is live before production verification.
