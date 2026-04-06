import { STATUS } from '../constants';

export interface Member {
  id: string;
  name: string;
  status: STATUS;
  lastCheckIn: number;
  xp: number;
  level: number;
  role?: string;
  skills?: string[];
  resources?: string[];
  bio?: string;
  avatar?: string;
}

export interface Resource {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: number;
  owner?: string;
  /** From DB; Supply UI defaults if missing. */
  criticalThreshold?: number;
  maxCapacity?: number;
  icon?: string;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'med' | 'hard';
  completedAt: number[];
  participantCount: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  actions: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'alert' | 'resource' | 'drill';
}

export interface Achievement {
  id: string;
  achievedAt: number;
  awardedTo: string;
  title?: string;
  description?: string;
  icon?: string;
}

export interface CommunityState {
  communityId: string;
  communityName: string;
  /** Join cutoff for new members; undefined/0 = no expiry (legacy communities). */
  inviteExpiresAt?: number | null;
  members: Member[];
  resources: Resource[];
  drills: Drill[];
  plans: Plan[];
  messages: Message[];
  achievements: Achievement[];
  readinessScore: number;
  streakDays: number;
}
