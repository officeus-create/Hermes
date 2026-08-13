# Hermes Connect Next — Security & Privacy Model

**Version**: 1.0.0  
**Status**: APPROVED SECURITY MODEL  
**Target Repository**: `hermes-connect-next`

---

## 1. Security Principles & Architecture

1. **Least Privilege & Role-Based Access Control (RBAC)**:
   - `owner`: Workspace administration, billing, team member management.
   - `admin`: Operations, client reassignment, service configuration.
   - `trainer`: Full read/write access ONLY to assigned clients, programs, check-ins, and appointments.
   - `client`: Read/write access strictly restricted to own profile, assigned workouts, check-in history, and direct trainer messages.

2. **Data Isolation**:
   - Multi-tenant architecture using strict workspace filtering (`workspaceId`).
   - Client records are isolated by `clientId` and `workspaceId`. No cross-tenant leaks.

3. **Origin & API Security Boundary**:
   - Web application access requests use exact-origin POST handling (`https://connect.hermeslogisticsus.com`).
   - CORS origin validation rejects foreign domain requests before calling internal receivers.
   - Sensitive headers (`Cache-Control: no-store`, `Vary: Origin`).

4. **Credential & Secret Protection**:
   - Zero hardcoded production keys or secrets in source code.
   - All secret configurations use environment variables (`.env`).
   - Mock/synthetic data used exclusively for development and testing.

5. **AI Safety & Consequential Action Guardrails**:
   - Autonomous AI agents operate under human-in-the-loop constraints.
   - AI cannot execute program changes, external messaging, payment handling, or contract signatures without explicit user review and confirmation.
