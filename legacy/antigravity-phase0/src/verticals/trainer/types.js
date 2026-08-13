// Trainer & Fitness Vertical Domain Types

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
