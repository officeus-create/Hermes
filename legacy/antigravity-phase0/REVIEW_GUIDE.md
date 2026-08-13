# Hermes Connect Next — External Review Guide

**Version**: 1.0.0  
**Status**: OFFICIAL REVIEW GUIDE  
**Target Repository**: `hermes-connect-next`

---

## 1. Quick Start Instructions

To run and inspect the application locally on macOS:

```bash
# 1. Navigate to the standalone repository
cd /Users/progressopro/.gemini/antigravity/scratch/hermes-connect-next

# 2. Run the automated test suite
npm test

# 3. Launch the local web server
npm start
# App will open at http://localhost:3000/ (or serve index.html directly)
```

---

## 2. Test Accounts & Personas

The application comes pre-loaded with synthetic demo data for immediate testing:

| Role | Name | Credentials / Action | Key View |
|---|---|---|---|
| **Trainer / Coach** | Alex Morgan | Click "Login as Trainer Alex" | **Trainer Command Center**: Overdue check-ins, urgent reviews, upcoming sessions, workout builder, AI Trainer Copilot. |
| **Active Client** | Marcus Vance | Click "Switch to Client Marcus" | **Client Daily Dashboard**: "What do I do today?", workout logger, habit checklist, trainer feedback. |
| **New Intake Client** | Elena Rostova | Click "Switch to Client Elena" | **Intake & Onboarding View**: PAR-Q+ health screening, fitness goals, program assignment. |
| **At-Risk Client** | David Chen | Inspect in Trainer List | **Needs Review Alert**: Missed check-in indicator, AI outreach recommendation. |

---

## 3. Recommended Review Flows

### Flow A: Trainer Operations ("Who needs my attention today?")
1. Launch app and ensure "Trainer View" is active.
2. Observe the **Command Center Summary**: 2 Urgent Overdue Check-ins, 1 Client Needing Review.
3. Select client **David Chen** -> Click **"Review Check-in"**.
4. Open the **AI Copilot Drawer** -> Click **"Summarize Check-in & Propose Adjustment"**.
5. Observe the AI-generated draft recommendation -> Click **"Approve & Send Feedback"**. Note how state updates cleanly.

### Flow B: Client Daily Experience ("What do I do today?")
1. Switch to **Client View (Marcus Vance)**.
2. View **"Today's Plan"** -> Click **"Start Session B: Legs & Core"**.
3. Log sets and reps for Squat and Lunges -> Click **"Submit Completed Workout"**.
4. Observe daily progress update on the client dashboard.

### Flow C: Science & Research Agent
1. Open the AI Assistant Drawer.
2. Select **"Science Agent"** -> Submit query: *"Explain progressive overload for hypertrophy"*.
3. Inspect scientific confidence tags (`FACT`, `EVIDENCE`) and cited peer-reviewed literature.

---

## 4. Key Architecture & Security Checklist
- [x] Independent repository (`hermes-connect-next`).
- [x] Read-only reference to original Hermes codebase (`officeus-create/Hermes`).
- [x] Load board features strictly excluded.
- [x] Consequential actions require explicit human review.
- [x] Automated test suite passing.
