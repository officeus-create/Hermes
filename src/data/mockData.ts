import { 
  Workspace, 
  Service, 
  Appointment, 
  VehicleJob, 
  FreightLoad, 
  FitnessClient, 
  ScientificClaim,
  AIMessage 
} from '../types';

export const INITIAL_WORKSPACES: Record<string, Workspace> = {
  beauty: {
    id: 'ws_beauty_1',
    name: 'Aura Luxe Beauty Studio',
    vertical: 'beauty',
    tagline: 'Premium Hair, Nails & Skin Aesthetics',
    ownerName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 128,
    location: 'Downtown Chicago, IL',
    phone: '+1 (312) 555-0192',
    email: 'contact@auraluxebeauty.com'
  },
  auto_repair: {
    id: 'ws_auto_1',
    name: 'Apex Precision Auto & Service',
    vertical: 'auto_repair',
    tagline: 'Certified European & Domestic Auto Diagnostics',
    ownerName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 210,
    location: 'Schaumburg, IL',
    phone: '+1 (847) 555-0144',
    email: 'service@apexprecisionauto.com'
  },
  logistics: {
    id: 'ws_logistics_1',
    name: 'Hermes Freight & Dispatch Network',
    vertical: 'logistics',
    tagline: 'US Load Board, Fleet Dispatch & Rate Negotiation',
    ownerName: 'David Chen (Chief Dispatcher)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 340,
    location: 'Atlanta, GA / Nationwide',
    phone: '+1 (404) 555-0811',
    email: 'dispatch@hermeslogisticsus.com'
  },
  fitness: {
    id: 'ws_fitness_1',
    name: 'Alex Morgan Performance & Science',
    vertical: 'fitness',
    tagline: 'Evidence-Based Hypertrophy & Athletic Coaching',
    ownerName: 'Alex Morgan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 94,
    location: 'Miami, FL & Hybrid Remote',
    phone: '+1 (305) 555-0233',
    email: 'alex@morganperformance.io'
  },
  marketing: {
    id: 'ws_marketing_1',
    name: 'ProgressoPro Digital & SEO Agency',
    vertical: 'marketing',
    tagline: 'Website Rebuilds, Local SEO & AI Growth Engine',
    ownerName: 'Vladimir Progresso',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 175,
    location: 'Chicago, IL & Global',
    phone: '+1 (312) 555-0999',
    email: 'vladimir@progressopro.com'
  }
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv_1',
    name: 'Aesthetic Haircut & Precision Styling',
    category: 'Hair',
    durationMinutes: 60,
    priceUSD: 85,
    description: 'Custom wash, scalp treatment, precision haircut, and blow-dry style.'
  },
  {
    id: 'srv_2',
    name: 'Gel Manicure & Russian E-File Prep',
    category: 'Nails',
    durationMinutes: 75,
    priceUSD: 70,
    description: 'Flawless cuticle e-file care, durable gel coat, and hand massage.'
  },
  {
    id: 'srv_3',
    name: 'Hydra-Facial Deep Cleanse & LED',
    category: 'Skin',
    durationMinutes: 90,
    priceUSD: 140,
    description: 'Exfoliation, vortex pore extraction, custom serum infusion & red LED light therapy.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_101',
    clientName: 'Sophia Martinez',
    clientHandle: '@sophiam_chicago',
    clientEmail: 'sophia.m@gmail.com',
    serviceId: 'srv_1',
    serviceName: 'Aesthetic Haircut & Precision Styling',
    staffName: 'Elena Rostova',
    date: '2026-08-14',
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'confirmed',
    priceUSD: 85,
    notes: 'Client requested extra scalp hydration treatment.'
  },
  {
    id: 'apt_102',
    clientName: 'Chloe Bennett',
    clientHandle: '@chloe_beauty_22',
    clientEmail: 'c.bennett@outlook.com',
    serviceId: 'srv_2',
    serviceName: 'Gel Manicure & Russian E-File Prep',
    staffName: 'Maria S.',
    date: '2026-08-14',
    timeSlot: '01:30 PM - 02:45 PM',
    status: 'pending',
    priceUSD: 70,
    notes: 'First time client from Instagram ad.'
  }
];

export const INITIAL_VEHICLE_JOBS: VehicleJob[] = [
  {
    id: 'job_201',
    clientName: 'Robert Sterling',
    clientPhone: '+1 (847) 901-2241',
    vehicleMakeModel: '2021 BMW X5 xDrive40i',
    year: 2021,
    issueDescription: 'Check engine light ON, slight rough idle on cold start.',
    estimatedCostUSD: 420,
    status: 'in_progress',
    scheduledDate: '2026-08-13',
    assignedTechnician: 'Marcus Vance'
  },
  {
    id: 'job_202',
    clientName: 'Amanda Hays',
    clientPhone: '+1 (312) 441-0982',
    vehicleMakeModel: '2023 Ford F-150 SuperCrew',
    year: 2023,
    issueDescription: 'Brake pad squeal & annual 30k mile maintenance check.',
    estimatedCostUSD: 280,
    status: 'intake',
    scheduledDate: '2026-08-14',
    assignedTechnician: 'Jake T.'
  }
];

export const INITIAL_FREIGHT_LOADS: FreightLoad[] = [
  {
    id: 'load_701',
    origin: 'Chicago, IL',
    destination: 'Dallas, TX',
    equipmentType: 'Dry Van',
    weightLbs: 42000,
    miles: 925,
    offerRateUSD: 2850,
    ratePerMile: 3.08,
    pickupDate: '2026-08-14',
    deliveryDate: '2026-08-16',
    status: 'available',
    shipperName: 'Midwest Distribution Logistics',
    notes: 'No touch freight, clean trailer required.'
  },
  {
    id: 'load_702',
    origin: 'Atlanta, GA',
    destination: 'Philadelphia, PA',
    equipmentType: 'Reefer',
    weightLbs: 38500,
    miles: 780,
    offerRateUSD: 2900,
    ratePerMile: 3.72,
    pickupDate: '2026-08-14',
    deliveryDate: '2026-08-15',
    status: 'bid_submitted',
    carrierName: 'Iron Express Fleet LLC',
    shipperName: 'Fresh Coast Produce Inc.',
    notes: 'Continuous temp monitoring set to 34F.'
  },
  {
    id: 'load_703',
    origin: 'Columbus, OH',
    destination: 'Denver, CO',
    equipmentType: 'Flatbed',
    weightLbs: 45000,
    miles: 1240,
    offerRateUSD: 4100,
    ratePerMile: 3.31,
    pickupDate: '2026-08-15',
    deliveryDate: '2026-08-18',
    status: 'in_transit',
    assignedDriver: 'Viktor K. (Truck #104)',
    carrierName: 'Hermes Carrier Partner #12',
    shipperName: 'Apex Steel Fabricators',
    notes: 'Tarps & straps verified at pickup.'
  }
];

export const INITIAL_FITNESS_CLIENTS: FitnessClient[] = [
  {
    id: 'fit_301',
    name: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    stage: 'Active',
    primaryGoal: 'Hypertrophy',
    parqApproved: true,
    weeklyCompliance: 92,
    lastCheckInDate: '2026-08-12',
    currentProgram: '4-Week Hypertrophy Phase 2 (Upper/Lower Split)',
    weightLbs: 188.4
  },
  {
    id: 'fit_302',
    name: 'David Chen',
    email: 'david.c@techcorp.com',
    stage: 'At Risk',
    primaryGoal: 'Fat Loss',
    parqApproved: true,
    weeklyCompliance: 45,
    lastCheckInDate: '2026-08-04',
    currentProgram: 'Metabolic Conditioning & Strength Protocol',
    weightLbs: 212.0
  }
];

export const SCIENTIFIC_CLAIMS: ScientificClaim[] = [
  {
    id: 'sci_1',
    title: 'Optimal Protein Intake for Muscle Hypertrophy',
    evidenceTier: 'FACT',
    citation: 'Morton et al., 2018 (British Journal of Sports Medicine Meta-Analysis)',
    summary: 'Protein intakes of 1.6 to 2.2 g/kg/day maximize muscle protein synthesis in resistance-trained individuals.'
  },
  {
    id: 'sci_2',
    title: 'Progressive Overload & Mechanical Tension',
    evidenceTier: 'FACT',
    citation: 'Schoenfeld BJ, 2010 (Journal of Strength & Conditioning Research)',
    summary: 'Mechanical tension is the primary driver of muscle hypertrophy. Increasing load or volume over time stimulates long-term adaptation.'
  }
];

export const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'msg_0',
    sender: 'assistant',
    content: 'Здравствуйте! Я Front-Door AI Brain для экосистемы Hermes Connect. Чем могу помочь вам сегодня?',
    timestamp: '21:49',
    suggestedActions: [
      'Записаться на салонную услугу',
      'Забронировать диагностику авто',
      'Найти груз на Load Board',
      'Провести SEO-аудит бизнеса',
      'Интегрировать Connect на главный сайт'
    ]
  }
];
