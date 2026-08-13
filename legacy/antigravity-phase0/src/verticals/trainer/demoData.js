// Synthetic Realistic Demo Dataset for Hermes Connect Next (Trainers & Coaches Vertical)

export const demoWorkspace = {
  id: 'ws_hermes_fit_01',
  name: 'Hermes Performance & Fitness Lab',
  category: 'fitness_coaching',
  ownerId: 'user_alex_morgan',
  createdAt: '2026-01-15T09:00:00Z'
};

export const demoUsers = [
  {
    id: 'user_alex_morgan',
    workspaceId: 'ws_hermes_fit_01',
    email: 'alex.morgan@hermesfit.com',
    name: 'Alex Morgan',
    role: 'trainer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'user_marcus_vance',
    workspaceId: 'ws_hermes_fit_01',
    email: 'marcus.vance@example.com',
    name: 'Marcus Vance',
    role: 'client',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user_elena_rostova',
    workspaceId: 'ws_hermes_fit_01',
    email: 'elena.rostova@example.com',
    name: 'Elena Rostova',
    role: 'client',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-08-10T14:30:00Z'
  },
  {
    id: 'user_david_chen',
    workspaceId: 'ws_hermes_fit_01',
    email: 'david.chen@example.com',
    name: 'David Chen',
    role: 'client',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-03-12T11:15:00Z'
  }
];

export const demoClients = [
  {
    id: 'cli_marcus_vance',
    workspaceId: 'ws_hermes_fit_01',
    userId: 'user_marcus_vance',
    trainerId: 'user_alex_morgan',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    joinedAt: '2026-02-01T10:00:00Z',
    lastCheckInAt: '2026-08-11T08:30:00Z',
    nextSessionAt: '2026-08-13T16:00:00Z',
    primaryGoal: 'Muscle Hypertrophy & Lower Body Strength',
    tags: ['Online Coaching', 'Hypertrophy', 'Consistent']
  },
  {
    id: 'cli_elena_rostova',
    workspaceId: 'ws_hermes_fit_01',
    userId: 'user_elena_rostova',
    trainerId: 'user_alex_morgan',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 345-6789',
    status: 'new_intake',
    joinedAt: '2026-08-10T14:30:00Z',
    lastCheckInAt: undefined,
    nextSessionAt: '2026-08-14T10:00:00Z',
    primaryGoal: 'Core Stability & Metabolic Conditioning',
    tags: ['New Lead', 'Intake Completed', 'Needs Program']
  },
  {
    id: 'cli_david_chen',
    workspaceId: 'ws_hermes_fit_01',
    userId: 'user_david_chen',
    trainerId: 'user_alex_morgan',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 456-7890',
    status: 'at_risk',
    joinedAt: '2026-03-12T11:15:00Z',
    lastCheckInAt: '2026-07-28T09:00:00Z', // 15 days ago! Overdue!
    nextSessionAt: undefined,
    primaryGoal: 'Fat Loss & General Mobility',
    tags: ['At Risk', 'Check-in Overdue', 'Follow-up Needed']
  }
];

export const demoExercises = [
  {
    id: 'ex_squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Core'],
    equipmentNeeded: 'Barbell & Squat Rack',
    instructions: 'Keep chest upright, brace core, squat until thighs are parallel or below knees.'
  },
  {
    id: 'ex_rdl',
    name: 'Dumbbell Romanian Deadlift',
    category: 'legs',
    targetMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    equipmentNeeded: 'Dumbbells',
    instructions: 'Hinge at hips, maintain neutral spine, lower dumbbells until hamstrings stretch.'
  },
  {
    id: 'ex_bench',
    name: 'Barbell Bench Press',
    category: 'chest',
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
    equipmentNeeded: 'Barbell & Bench',
    instructions: 'Retract scapulae, touch bar lower chest, press upwards evenly.'
  },
  {
    id: 'ex_lat_pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
    equipmentNeeded: 'Cable Machine',
    instructions: 'Pull bar to upper chest, drive elbows down and back.'
  },
  {
    id: 'ex_lateral_raise',
    name: 'Cable Lateral Raise',
    category: 'shoulders',
    targetMuscles: ['Lateral Deltoid'],
    equipmentNeeded: 'Cable Machine',
    instructions: 'Slight bend in elbow, raise arm laterally to shoulder height with smooth control.'
  }
];

export const demoPrograms = [
  {
    id: 'prog_hypertrophy_p1',
    workspaceId: 'ws_hermes_fit_01',
    trainerId: 'user_alex_morgan',
    title: '4-Week Hypertrophy Phase 1',
    description: 'Upper/Lower split focused on progressive overload and high quality mechanical tension.',
    durationWeeks: 4,
    sessionsPerWeek: 4,
    sessions: [
      {
        id: 'sess_upper_a',
        programId: 'prog_hypertrophy_p1',
        title: 'Session A: Upper Body Strength & Hypertrophy',
        dayOfWeek: 1,
        exercises: [
          { exerciseId: 'ex_bench', exerciseName: 'Barbell Bench Press', sets: 4, targetReps: '6-8', restSeconds: 150, targetRpe: 8 },
          { exerciseId: 'ex_lat_pulldown', exerciseName: 'Lat Pulldown', sets: 4, targetReps: '8-10', restSeconds: 120, targetRpe: 8 },
          { exerciseId: 'ex_lateral_raise', exerciseName: 'Cable Lateral Raise', sets: 3, targetReps: '12-15', restSeconds: 90, targetRpe: 9 }
        ]
      },
      {
        id: 'sess_lower_b',
        programId: 'prog_hypertrophy_p1',
        title: 'Session B: Lower Body Power & Legs',
        dayOfWeek: 2,
        exercises: [
          { exerciseId: 'ex_squat', exerciseName: 'Barbell Back Squat', sets: 4, targetReps: '6-8', restSeconds: 180, targetRpe: 8 },
          { exerciseId: 'ex_rdl', exerciseName: 'Dumbbell Romanian Deadlift', sets: 3, targetReps: '8-10', restSeconds: 120, targetRpe: 8 }
        ]
      }
    ]
  }
];

export const demoCheckIns = [
  {
    id: 'chk_marcus_01',
    clientId: 'cli_marcus_vance',
    submittedAt: '2026-08-11T08:30:00Z',
    weightKg: 84.2,
    waistCm: 82.5,
    complianceRating: 5,
    energyLevelRating: 4,
    sleepQualityRating: 4,
    notes: 'Squats felt great this week! Increased weight by 2.5kg on final set.',
    trainerReviewed: true,
    trainerFeedback: 'Awesome progress Marcus! Keep pushing RPE 8 on main lifts.'
  },
  {
    id: 'chk_david_01',
    clientId: 'cli_david_chen',
    submittedAt: '2026-07-28T09:00:00Z',
    weightKg: 91.5,
    waistCm: 94.0,
    complianceRating: 2,
    energyLevelRating: 2,
    sleepQualityRating: 2,
    notes: 'Traveled for work, missed 2 workouts and struggled with nutrition.',
    trainerReviewed: false
  }
];

export const demoTasks = [
  {
    id: 'task_01',
    workspaceId: 'ws_hermes_fit_01',
    assignedToUserId: 'user_alex_morgan',
    createdForClientId: 'cli_david_chen',
    title: 'Send re-engagement message to David Chen',
    description: 'David missed last week check-in. Outreach required.',
    dueDate: '2026-08-12',
    isCompleted: false,
    priority: 'high'
  },
  {
    id: 'task_02',
    workspaceId: 'ws_hermes_fit_01',
    assignedToUserId: 'user_alex_morgan',
    createdForClientId: 'cli_elena_rostova',
    title: 'Review Elena Rostova Intake & Assign Program',
    description: 'Assign initial 4-week strength starter plan.',
    dueDate: '2026-08-12',
    isCompleted: false,
    priority: 'medium'
  },
  {
    id: 'task_03',
    workspaceId: 'ws_hermes_fit_01',
    assignedToUserId: 'user_marcus_vance',
    createdForClientId: 'cli_marcus_vance',
    title: 'Complete Session B: Lower Body Workout',
    description: 'Log reps and sets in client dashboard.',
    dueDate: '2026-08-12',
    isCompleted: false,
    priority: 'high'
  }
];

export const demoScienceKnowledge = [
  {
    id: 'sci_01',
    topic: 'muscle_hypertrophy',
    title: 'Optimal Rest Intervals for Muscle Hypertrophy',
    summary: 'Longer rest periods (2-3 minutes) promote greater muscle growth compared to short rest periods (<60s) by allowing higher volume load retention.',
    evidenceLevel: 'FACT',
    primarySources: ['Schoenfeld et al. (2016) J Strength Cond Res', 'Grgic et al. (2018) Eur J Sport Sci'],
    practicalApplication: 'Rest 2.5-3 minutes on main compound lifts (Squat, Bench, Deadlift) and 90-120 seconds on isolation exercises.'
  },
  {
    id: 'sci_02',
    topic: 'protein_nutrition',
    title: 'Daily Protein Requirements for Resistance Trained Athletes',
    summary: 'Daily protein intake between 1.6 g/kg and 2.2 g/kg (0.73-1.0 g/lb) optimizes muscle protein synthesis in resistance-trained adults.',
    evidenceLevel: 'FACT',
    primarySources: ['Morton et al. (2018) Br J Sports Med'],
    practicalApplication: 'Distribute protein evenly across 3-5 meals (0.4g/kg per meal).'
  },
  {
    id: 'sci_03',
    topic: 'recovery_sleep',
    title: 'Impact of Sleep Restriction on Muscle Protein Synthesis & Recovery',
    summary: 'Sleep restriction (<6 hours/night) decreases muscle protein synthesis rates by ~18% and elevates catabolic cortisol levels.',
    evidenceLevel: 'EVIDENCE',
    primarySources: ['Saner et al. (2020) Physiol Rep', 'Dattilo et al. (2011) Med Hypotheses'],
    practicalApplication: 'Target 7-9 hours of consistent sleep for optimal neural and muscular recovery.'
  }
];
