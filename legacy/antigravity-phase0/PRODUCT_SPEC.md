# Hermes Connect Next — Product Specification

**Version**: 1.0.0  
**Status**: APPROVED PRODUCT SPECIFICATION  
**Target Repository**: `hermes-connect-next`  
**Primary Vertical**: Hermes Connect for Trainers, Fitness Coaches & Gym Studios

---

## 1. Product Vision & Principles

Hermes Connect Next is a modular, multi-tenant operating platform for service businesses. It unifies client relationships, service delivery, scheduling, operations, knowledge management, AI assistance, and business measurement into a seamless web application.

### Key Product Principles
1. **Modular Core Architecture**: The core system (`Workspace`, `User`, `Client`, `Service`, `Appointment`, `Task`, `Program`, `Activity`, `Metric`, `Document`, `Consent`, `Audit Log`) is domain-agnostic. Vertical business logic extends the core through plugin packs without hardcoding industry-specific logic into core models.
2. **Dual Core UX Questions**:
   - **For Trainers/Coaches**: *"Who needs my attention today?"*
   - **For Clients**: *"What do I do today?"*
3. **Human-First Language**: Operational, concise, empathetic language over corporate jargon. Answers *"What does this mean for me?"* and *"What do I do now?"*.
4. **Human-in-the-Loop AI**: AI assistants summarize, prepare drafts, search scientific evidence, and suggest actions, but consequential state changes (program edits, contract signing, external message publishing, health claims) ALWAYS require human review.
5. **Strict Domain & Claim Boundaries**:
   - Out of scope: Freight Load Board, load matching, DAT integration.
   - Claim Maturity Tiers: `LIVE_VERIFIED`, `PREVIEW`, `CONCEPT`, `EVIDENCE_REQUIRED`.
   - Health Safety Boundary: Fitness coaching is explicitly separated from medical diagnosis.

---

## 2. Target User Personas & Roles

### 1. Alex Morgan — Independent Fitness Coach (Primary Persona)
- **Role**: Trainer / Coach
- **Needs**: Manages 15-30 active online and hybrid clients. Needs a single dashboard to track check-ins, review workout progress, send feedback, assign training programs, and identify at-risk clients.
- **Key Pain Point**: Frustrated by scattered tools (WhatsApp, Google Sheets, email, separate calendar apps) and wasted time doing manual review.

### 2. Marcus Vance — Active Client (Persona Stage: Progressing)
- **Role**: Client
- **Needs**: Mobile-friendly daily checklist. Wants to know exact exercises, sets, reps, habit tasks, and progress trends without overwhelming navigation.
- **Key Pain Point**: Confusion about daily workout goals and delayed feedback from trainer.

### 3. Elena Rostova — New Client (Persona Stage: Onboarding / Intake)
- **Role**: Client
- **Needs**: Simple intake form, goal setting wizard, consent review, and initial consultation setup.

### 4. David Chen — Inactive / At-Risk Client (Persona Stage: Needs Review)
- **Role**: Client
- **Needs**: Automated reminders, re-engagement check-ins, and trainer outreach prompt.

### 5. Studio Manager / Workspace Admin
- **Role**: Admin / Owner
- **Needs**: Team management, service catalog setup, client assignment to coaches, workspace metrics.

---

## 3. Core Operating Platform Capabilities

### A. Modular Operating Core
- **Workspace & Team Management**: Multi-user permissions (Owner, Admin, Trainer, Staff, Client).
- **Client CRM**: Comprehensive client profiles, intake records, goal tracking, status tags (`Active`, `New Intake`, `Needs Review`, `At Risk`, `Completed`).
- **Services & Packages**: Service catalog (1-on-1 Personal Training, Online Coaching, Group Classes, Consultations), duration, and availability rules.
- **Availability & Scheduling**: Recurring availability windows, appointment booking, calendar sync structure.
- **Tasks & Reminders**: Daily task queues for both trainers and clients.
- **Notifications & Audit Log**: Immutable record of sensitive actions, consent forms, and notifications.

### B. Trainer & Fitness Vertical Features
- **Client Intake & Goals**: Medical history screening (PAR-Q+ framework), fitness goals (hypertrophy, fat loss, mobility, endurance), lifestyle inputs, and target timelines.
- **Workout & Program Builder**: Structured training programs (e.g., 4-Week Hypertrophy Phase 1), workout sessions, sets, rep ranges, RPE/intensity, exercise library with video/form guides.
- **Check-ins & Progress Tracking**: Weekly check-in submissions, photo uploads, body measurements (weight, body fat %, waist, chest), strength progression, fatigue/sleep ratings.
- **Trainer Command Center**: Real-time operational dashboard highlighting overdue check-ins, unanswered messages, new intakes, and expiring client plans.
- **Client Daily Experience**: "Today's Plan" screen with interactive workout logger, habit tracking (water, sleep, protein intake), and direct trainer messaging.

---

## 4. Multi-Agent AI System & Science Layer

### AI Router & Specialized Assistants
- **Business Operations Assistant**: Summarizes workspace metrics, lead conversions, and scheduling bottlenecks.
- **Trainer Copilot**: Summarizes client weekly check-ins, flags missed workouts, drafts feedback notes, and proposes program progressions for human approval.
- **Client Assistant**: Answers client exercise questions, provides workout guidance, and prompts daily task completion.
- **Science & Research Agent**: Searches accredited evidence in exercise physiology, muscle hypertrophy, biomechanics, recovery, and nutrition science. Tagged with confidence levels:
  - `FACT`: Well-established scientific consensus (e.g., progressive overload principle).
  - `EVIDENCE`: Peer-reviewed clinical study evidence (e.g., protein intake ranges 1.6–2.2g/kg).
  - `HYPOTHESIS`: Emerging research hypothesis.
  - `COACHING_PRACTICE`: Standard empirical coaching methodology.

---

## 5. Security, Privacy & Health Boundary

- **Health Disclaimer**: Hermes Connect is a training and coaching platform, not a medical or diagnostic system.
- **PII & Data Isolation**: Strict tenant data isolation by workspace ID. Synthetic demo data only for testing.
- **Consequential Action Controls**: Programs, payments, external messages, and contract changes require explicit human confirmation.
