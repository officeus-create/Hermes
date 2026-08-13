# Hermes Connect Next — User Journeys & Workflows

**Version**: 1.0.0  
**Status**: APPROVED USER FLOWS DOCUMENT  
**Target Repository**: `hermes-connect-next`

---

## 1. Primary Trainer Workflow: "Who Needs My Attention Today?"

```
[Log into Workspace] 
         │
         ▼
[Command Center Dashboard]
 ├── Check Overdue Client Check-ins (Badge: 2 Urgent)
 ├── Check Clients Needing Review (Badge: 1 Review Needed)
 └── Check Today's Scheduled Sessions (3 Sessions)
         │
         ├──► Click Client: "David Chen" (Needs Review / Overdue)
         │       │
         │       ▼
         │   [Review Check-in Submission]
         │       ├── View Weight/Fatigue Metrics & Photos
         │       ├── Trigger Trainer Copilot: "Summarize & Suggest Adjustment"
         │       ├── Review AI Proposed Plan Draft (Progressive Overload modification)
         │       ├── Edit Feedback & Click "Approve & Send to Client"
         │       └── Client Status updates to: "Active (Reviewed)"
         │
         └──► Click Client: "Elena Rostova" (New Intake)
                 │
                 ▼
             [Review Intake & Assign Program]
                 ├── Inspect PAR-Q+ Screening & Fitness Goals
                 ├── Select Program from Library ("4-Week Beginner Strength")
                 └── Click "Assign & Notify Client"
```

---

## 2. Primary Client Workflow: "What Do I Do Today?"

```
[Log in / Open App on Mobile Browser]
         │
         ▼
[Client Daily Dashboard]
 ├── Hero Card: Today's Scheduled Workout ("Legs & Core - Session B")
 ├── Daily Habit Checklist (Water Intake: 2.5L, Protein Goal: 160g, Sleep: 7.5h)
 └── Message Banner from Trainer Alex Morgan ("Great effort on squats yesterday!")
         │
         ├──► Click "Start Today's Workout"
         │       │
         │       ▼
         │   [Interactive Workout Logger]
         │       ├── Exercise 1: Barbell Back Squat (Set 1: 80kg x 8, Set 2: 85kg x 8...)
         │       ├── View Exercise Form Video / Instruction Guide if needed
         │       ├── Log Reps & Weight for all sets
         │       ├── Rate Session Difficulty (RPE: 8/10) & add client note
         │       └── Click "Finish & Submit Workout" (Progress automatically recorded)
         │
         └──► Click "Submit Weekly Check-In"
                 │
                 ▼
             [Check-in Form]
                 ├── Enter Morning Weight & Waist Measurement
                 ├── Rate Sleep Quality (4/5) & Compliance (5/5)
                 └── Submit to Trainer Dashboard
```

---

## 3. Science Agent Workflow: Trainer Knowledge Query

```
[Trainer opens AI Drawer]
         │
         ▼
[Select AI Agent: "Science Research Agent"]
         │
         ▼
[Enter Query]: "What is the optimal rest interval between heavy compound sets for hypertrophy?"
         │
         ▼
[Science Agent Response]:
 ├── Key Fact (Confidence: FACT): 2 to 3 minute rest intervals produce superior hypertrophy compared to 60s rest.
 ├── Scientific Evidence (Confidence: EVIDENCE): Schoenfeld et al. (2016) demonstrated greater muscle thickness growth in long rest groups.
 ├── Practical Coaching Application: Recommend 2.5 min rest on Squat/Bench, 90s on isolation exercises.
 └── Primary Sources Cited: PMID 26605807, J Strength Cond Res.
```
