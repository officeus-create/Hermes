export type VerticalCategory = 
  | 'beauty' 
  | 'auto_repair' 
  | 'logistics' 
  | 'fitness' 
  | 'marketing' 
  | 'global_network' 
  | 'website_demo';

export type UserRole = 'owner' | 'specialist' | 'client' | 'driver' | 'ai_copilot';

export interface BrandTheme {
  brandName: string;
  sourceUrl: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  bgOverlayUrl?: string;
  moodDescription: string;
  active: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  vertical: VerticalCategory;
  tagline: string;
  ownerName: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  email: string;
  brandTheme?: BrandTheme;
}

// Beauty & Salon Models
export interface Service {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceUSD: number;
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientHandle: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  staffName: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  priceUSD: number;
}

// Auto Repair Models
export interface VehicleJob {
  id: string;
  clientName: string;
  clientPhone: string;
  vehicleMakeModel: string;
  year: number;
  vin?: string;
  issueDescription: string;
  estimatedCostUSD: number;
  status: 'intake' | 'diagnosing' | 'in_progress' | 'ready_for_pickup' | 'completed';
  scheduledDate: string;
  assignedTechnician: string;
}

// Freight & Logistics Load Board Models
export interface FreightLoad {
  id: string;
  origin: string;
  destination: string;
  equipmentType: 'Dry Van' | 'Reefer' | 'Flatbed' | 'Stepdeck' | 'Power Only';
  weightLbs: number;
  miles: number;
  offerRateUSD: number;
  ratePerMile: number;
  pickupDate: string;
  deliveryDate: string;
  status: 'available' | 'bid_submitted' | 'assigned' | 'in_transit' | 'delivered';
  assignedDriver?: string;
  carrierName?: string;
  shipperName: string;
  notes?: string;
}

// Fitness & Science Models
export interface FitnessClient {
  id: string;
  name: string;
  email: string;
  stage: 'Active' | 'New Intake' | 'Needs Review' | 'At Risk';
  primaryGoal: 'Hypertrophy' | 'Fat Loss' | 'Mobility' | 'Endurance';
  parqApproved: boolean;
  weeklyCompliance: number; // percentage 0 - 100
  lastCheckInDate: string;
  currentProgram: string;
  weightLbs: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  targetRpe: number;
  notes: string;
}

export interface ScientificClaim {
  id: string;
  title: string;
  evidenceTier: 'FACT' | 'EVIDENCE' | 'HYPOTHESIS' | 'COACHING_PRACTICE';
  citation: string;
  summary: string;
}

// Front-Door AI Brain Message Model
export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  routedVertical?: VerticalCategory;
  suggestedActions?: string[];
  evidenceBadge?: 'FACT' | 'EVIDENCE' | 'HYPOTHESIS' | 'COACHING_PRACTICE';
}
