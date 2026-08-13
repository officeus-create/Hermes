# Hermes Connect Next — Technical Architecture

**Version**: 1.0.0  
**Status**: APPROVED ARCHITECTURE DOCUMENT  
**Target Repository**: `hermes-connect-next`

---

## 1. High-Level Architecture Overview

Hermes Connect Next is designed as a decoupled, layered client-server web application. The core engine is completely independent of specific industry domains, enabling vertical packs (such as Fitness/Coaching) to plug into standardized core interfaces.

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|   Modern Web SPA (HTML5, Vanilla CSS Design System, TypeScript ES)     |
|   - Trainer Command Center ("Who needs attention?")                  |
|   - Client Dashboard ("What do I do today?")                         |
|   - Workout Builder & Interactive AI Drawer                           |
+-----------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                           SERVICE LAYER                               |
|   - Auth & RBAC Manager (Owner, Admin, Trainer, Client)              |
|   - Workspace & CRM Service                                          |
|   - Trainer Vertical Service (Programs, Workouts, Check-ins)          |
|   - AI Router & Copilot Controller (Trainer, Client, Science)         |
+-----------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                          PERSISTENCE LAYER                            |
|   - Firebase Web SDK Adapter (Auth, Firestore, Storage)              |
|   - Local Store Engine (IndexedDB / LocalStorage Fallback)           |
|   - Synthetic Seed Data Registry (Alex Morgan & Multi-stage Clients)  |
+-----------------------------------------------------------------------+
```

---

## 2. Core vs. Vertical Layering

### Universal Core Primitives (`src/core/`)
- `Workspace`: Multi-tenant boundary container.
- `User`: Authenticated user identity with assigned roles (`owner`, `admin`, `trainer`, `client`).
- `Client`: CRM customer record with contact info, status, and activity log.
- `Service`: Business offerings (duration, pricing, booking rules).
- `Appointment`: Scheduled interactions linked to a client and trainer.
- `Task`: Assignable task item with due dates and status.
- `Document`: Files, intake forms, and agreements.
- `Consent`: Explicit privacy and service consent tracking.
- `AuditLog`: Immutable change ledger.

### Trainer Vertical Extension (`src/verticals/trainer/`)
- `ClientIntake`: PAR-Q+ health screening, goals, activity history.
- `Program`: Training plan structure containing multi-week blocks and workout sessions.
- `WorkoutSession`: Prescribed workout containing exercises, target sets, reps, and target load.
- `Exercise`: Library entry (name, category, target muscles, equipment, execution instructions, video reference).
- `CheckInRecord`: Client progress submission (weight, measurements, photos, fatigue, compliance rating).
- `WorkoutLog`: Completed workout record with actual performed sets, reps, weight, and notes.

---

## 3. AI Copilot Architecture

The AI subsystem uses a decoupled Router pattern:

```
                      +-------------------+
                      |  Hermes AI Router |
                      +-------------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +---------------+
| Trainer       |       | Client        |       | Science       |
| Copilot       |       | Assistant     |       | Agent         |
+---------------+       +---------------+       +---------------+
        |                       |                       |
        v                       v                       v
[Check-in Review]       [Today's Tasks]        [Physiology DB]
[Program Draft]         [Workout Prep]         [Evidence Tags]
```

### AI Safety Boundary
1. **Read-Only Context Ingestion**: AI agents read structured client metrics, check-in history, and program templates.
2. **Drafting State**: AI copilot generates *proposed* program updates or message drafts.
3. **Human Action Gate**: State changes are applied to the core database ONLY after explicit trainer button click ("Approve & Apply").

---

## 4. API & Integration Policy

### Compatibility with Existing Hermes System
- **Main Hermes Site Interop**: Connect lead submissions originating from `https://hermeslogisticsus.com/services/hermes-connect/` or `https://connect.hermeslogisticsus.com/` use exact-origin POST requests to `/api/connect-lead`.
- **Private Data Protection**: Internal customer records, training plans, and check-in notes are never exposed via unauthenticated endpoints.
