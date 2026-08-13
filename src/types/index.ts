export type VerticalCategory = 
  | 'hero_landing'
  | 'os_command_center'
  | 'integrations'
  | 'sales_coach'
  | 'beauty'
  | 'auto_repair'
  | 'logistics'
  | 'fitness'
  | 'marketing'
  | 'global_network'
  | 'website_demo'
  | 'candidate_auditor';

export type UserRole = 
  | 'owner'
  | 'specialist'
  | 'client'
  | 'driver'
  | 'ai_copilot'
  | 'candidate';

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai' | 'assistant';
  text?: string;
  content?: string;
  timestamp?: string;
  evidenceBadge?: string;
  routedVertical?: VerticalCategory;
  suggestedActions?: any[];
}

export interface Workspace {
  id: string;
  name: string;
  vertical: VerticalCategory;
  description?: string;
  tagline?: string;
  ownerName?: string;
  location?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  metrics?: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export interface ScientificClaim {
  id: string;
  claim?: string;
  title?: string;
  summary?: string;
  citation?: string;
  evidenceLevel?: 'high' | 'medium' | 'experimental';
  evidenceTier?: string;
  source?: string;
}

export interface BrandTheme {
  id?: string;
  active?: boolean;
  brandName?: string;
  moodDescription?: string;
  bgGradient?: string;
  sourceUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  mode?: 'dark' | 'light';
  primaryHex?: string;
  accentHex?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price?: number;
  priceUSD?: number;
  durationMinutes: number;
  description: string;
}

export type ServiceItem = Service;

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientHandle?: string;
  serviceName: string;
  serviceId?: string;
  staffName?: string;
  date: string;
  time?: string;
  timeSlot?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
  priceUSD?: number;
}

export interface VehicleJob {
  id: string;
  customerName?: string;
  clientName?: string;
  clientPhone?: string;
  vehicleModel?: string;
  vehicleMakeModel?: string;
  year?: number;
  vin?: string;
  issueDescription: string;
  assignedTechnician?: string;
  scheduledDate?: string;
  status: 'intake' | 'diagnostics' | 'parts_ordered' | 'repair' | 'ready' | 'in_progress' | 'ready_for_pickup' | 'diagnosing' | 'completed';
  estimatedCost?: number;
  estimatedCostUSD?: number;
  createdAt?: string;
}

export interface FreightLoad {
  id: string;
  origin: string;
  destination: string;
  weightLbs: number;
  rateUsd?: number;
  offerRateUSD?: number;
  ratePerMile?: number;
  miles?: number;
  notes?: string;
  assignedDriver?: string;
  equipmentType: string;
  pickupDate: string;
  deliveryDate?: string;
  shipperName?: string;
  carrierName?: string;
  status: 'posted' | 'bidded' | 'in_transit' | 'delivered' | 'available' | 'bid_submitted' | 'assigned';
  currentBidCount?: number;
}

export interface FitnessClient {
  id: string;
  name: string;
  email?: string;
  goal?: string;
  primaryGoal?: string;
  bodyFatPercent?: number;
  lastWorkoutDate?: string;
  lastCheckInDate?: string;
  dailyProteinGrams?: number;
  weightLbs?: number;
  weeklyCompliance?: number;
  currentProgram?: string;
  stage?: string;
  parqApproved?: boolean;
  status?: 'active' | 'resting' | 'at_risk';
}

export interface WorkspaceConfig {
  id: VerticalCategory;
  title: string;
  description: string;
  primaryColor: string;
  metrics: {
    label: string;
    value: string;
    trend: string;
  }[];
}
