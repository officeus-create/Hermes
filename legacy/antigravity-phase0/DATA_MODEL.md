# Hermes Connect Next — Data Model Specifications

**Version**: 1.0.0  
**Status**: APPROVED DATA MODEL  
**Target Repository**: `hermes-connect-next`

---

## 1. Core Domain Interfaces (`src/core/types.ts`)

```typescript
export type UserRole = 'owner' | 'admin' | 'trainer' | 'client';
export type ClientStatus = 'active' | 'new_intake' | 'needs_review' | 'at_risk' | 'inactive';

export interface Workspace {
  id: string;
  name: string;
  category: 'fitness_coaching' | 'beauty_wellness' | 'professional_services';
  ownerId: string;
  createdAt: string;
}

export interface User {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  workspaceId: string;
  userId?: string;
  trainerId: string;
  name: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  joinedAt: string;
  lastCheckInAt?: string;
  nextSessionAt?: string;
  primaryGoal: string;
  tags: string[];
}

export interface Service {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  durationMinutes: number;
  priceFormatted: string;
  category: string;
}

export interface Appointment {
  id: string;
  workspaceId: string;
  clientId: string;
  trainerId: string;
  serviceId: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  location: string;
  notes?: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  assignedToUserId: string;
  createdForClientId?: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}
```

---

## 2. Trainer Vertical Domain Extensions (`src/verticals/trainer/types.ts`)

```typescript
export interface ClientIntake {
  id: string;
  clientId: string;
  medicalClearance: boolean;
  injuriesOrLimitations: string;
  trainingExperienceYears: number;
  daysAvailablePerWeek: number;
  equipmentAccess: 'full_gym' | 'home_dumbbells' | 'bodyweight';
  dietaryPreferences?: string;
  completedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  targetMuscles: string[];
  equipmentNeeded: string;
  instructions: string;
  videoUrl?: string;
}

export interface WorkoutExercisePrescription {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  targetReps: string;
  restSeconds: number;
  targetRpe?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  programId: string;
  title: string;
  dayOfWeek: number; // 1-7
  exercises: WorkoutExercisePrescription[];
}

export interface Program {
  id: string;
  workspaceId: string;
  trainerId: string;
  title: string;
  description: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  sessions: WorkoutSession[];
}

export interface ClientProgramAssignment {
  id: string;
  clientId: string;
  programId: string;
  startDate: string;
  currentWeek: number;
  isActive: boolean;
}

export interface CheckInRecord {
  id: string;
  clientId: string;
  submittedAt: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  complianceRating: number; // 1-5
  energyLevelRating: number; // 1-5
  sleepQualityRating: number; // 1-5
  notes: string;
  trainerReviewed: boolean;
  trainerFeedback?: string;
}

export interface WorkoutLog {
  id: string;
  clientId: string;
  workoutSessionId: string;
  completedAt: string;
  durationMinutes: number;
  performedExercises: {
    exerciseId: string;
    completedSets: { setIndex: number; weightKg: number; repsCompleted: number }[];
  }[];
  rpeRating: number;
  clientComments?: string;
}
```

---

## 3. AI & Science Evidence Data Structures

```typescript
export type EvidenceLevel = 'FACT' | 'EVIDENCE' | 'HYPOTHESIS' | 'COACHING_PRACTICE';

export interface ScienceEvidenceEntry {
  id: string;
  topic: 'muscle_hypertrophy' | 'fat_loss' | 'recovery_sleep' | 'protein_nutrition' | 'biomechanics';
  title: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
  primarySources: string[];
  practicalApplication: string;
}
```
