# Hermes Connect Next — Architectural Decision Records (ADRs)

**Version**: 1.0.0  
**Status**: APPROVED DECISIONS REGISTER  
**Target Repository**: `hermes-connect-next`

---

## ADR-001: Standalone Sibling Repository Strategy

- **Context**: The existing Hermes repository (`officeus-create/Hermes`) contains production marketing, Cloudflare workers, and legacy prototypes.
- **Decision**: Initialize `hermes-connect-next` as an independent Git repository at `/Users/progressopro/.gemini/antigravity/scratch/hermes-connect-next/`. Treat the main Hermes repo as READ-ONLY reference.
- **Rationale**: Isolates new product development, avoids unintentional production disruptions, and ensures clean review boundaries.

---

## ADR-002: Client Technology Stack & Mobile Strategy

- **Context**: Target users operate across macOS, iOS (iPhone), and Android. We evaluated Flutter vs Native Web SPA.
- **Decision**: Build Hermes Connect Next as a modern TypeScript Web Application (SPA) using HTML5, Vanilla CSS Design System, and ES Modules.
- **Rationale**:
  1. Hermes Connect has an approved web-only product funnel strategy (`connect.hermeslogisticsus.com`).
  2. Flutter SDK was not pre-installed in the target environment, whereas Node.js and modern browser environments are natively available.
  3. Responsive web design provides instant cross-platform compatibility across Mac, iPhone, and Android browsers without app store distribution barriers.

---

## ADR-003: Core Engine vs. Vertical Extensibility

- **Context**: Hermes Connect must serve multiple service industries in the future (beauty, consulting, local services) while prioritizing Fitness/Coaching now.
- **Decision**: Decouple universal primitives (`Workspace`, `User`, `Client`, `Service`, `Appointment`, `Task`, `Document`, `Consent`, `AuditLog`) from vertical domain extensions (`ClientIntake`, `Program`, `WorkoutSession`, `CheckInRecord`, `WorkoutLog`).
- **Rationale**: Prevents hardcoding domain-specific fields into core database tables, allowing future verticals to plug in seamlessly.

---

## ADR-004: Consequential Action Safety Boundary for AI Agents

- **Context**: Autonomous AI agents must assist trainers and clients without introducing liability or silent data corruption.
- **Decision**: Implement a hard safety gate in code: Any AI-generated workout plan, client message, or administrative action is tagged as a `DRAFT`. State changes require explicit human confirmation.
- **Rationale**: Eliminates medical/health risk, silent program corruption, and unauthorized communications.
