// Universal Hermes Connect Core Domain Models

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
