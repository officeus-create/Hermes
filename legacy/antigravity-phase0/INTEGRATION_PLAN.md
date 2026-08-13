# Hermes Connect Next — Ecosystem Integration Plan

**Version**: 1.0.0  
**Status**: APPROVED INTEGRATION PLAN  
**Target Repository**: `hermes-connect-next`

---

## 1. Overview & Strategy

`hermes-connect-next` is built as an independent, reviewable web application repository. This document outlines how the newly developed platform can later be seamlessly integrated with the main Hermes production website (`officeus-create/Hermes`).

---

## 2. Lead Funnel & Request Routing Integration

```
[Main Hermes Site: hermeslogisticsus.com/services/hermes-connect/]
                         │
                         ▼
        [Exact-Origin POST Request to /api/connect-lead]
                         │
                         ▼
    [Hermes Connect Next Receiver & Workspace Onboarding]
                         │
                         ▼
          [Create Workspace & Initial Trainer Profile]
```

### Integration Steps
1. **Lead Receiver Alignment**: The exact-origin POST endpoint `/api/connect-lead` on `connect.hermeslogisticsus.com` accepts access requests and forwards structured payload data (`name`, `email`, `role`, `category: 'fitness_coaching'`).
2. **Automated Workspace Provisioning**: Upon human review and approval, the lead data is passed to `hermes-connect-next`'s workspace initializer (`WorkspaceService.createWorkspace()`), creating an active trainer workspace.

---

## 3. Subdomain Deployment Architecture

- Main Website: `https://hermeslogisticsus.com`
- Approved Connect App Host: `https://connect.hermeslogisticsus.com`
- Routing Rule: Cloudflare Workers / Pages middleware routes requests to `connect.hermeslogisticsus.com` directly into `hermes-connect-next`'s production web app bundle.
