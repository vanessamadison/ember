import React, { createContext, useContext, useMemo } from 'react';
import { create } from 'zustand';
import { STATUS } from '../constants';

export interface Member {
  id: string;
  name: string;
  status: STATUS;
  lastCheckIn: number; // timestamp
  xp: number;
  level: number;
}

export interface Resource {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: number; // timestamp
  owner?: string;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'med' | 'hard';
  completedAt: number[]; // array of timestamps
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
}

export interface CommunityState {
  communityId: string;
  communityName: string;
  members: Member[];
  resources: Resource[];
  drills: Drill[];
  plans: Plan[];
  messages: Message[];
  achievements: Achievement[];
  readinessScore: number;
  streakDays: number;
}

interface CommunityComputedValues {
  safeCount: number;
  helpCount: number;
  unknownCount: number;
  criticalResources: Resource[];
  drillAverage: number;
  resHealth: number;
  totalXP: number;
}

interface CommunityStore extends CommunityState {
  checkIn: (memberId: string, status: STATUS) => void;
  updateResource: (
    resourceId: string,
    quantity: number,
    unit?: string
  ) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  completeDrill: (drillId: string) => void;
  addMember: (member: Omit<Member, 'xp' | 'level'>) => void;
  addResource: (
    resource: Omit<Resource, 'id' | 'lastUpdated'>
  ) => void;
  updateReadinessScore: (score: number) => void;
  updateStreakDays: (days: number) => void;
  reset: () => void;
}

const createInitialState = (communityId: string): CommunityState => ({
  communityId,
  communityName: 'Community',
  members: [],
  resources: [],
  drills: [],
  plans: [],
  messages: [],
  achievements: [],
  readinessScore: 0,
  streakDays: 0,
});

const createCommunityStore = (communityId: string) =>
  create<CommunityStore>((set) => {
    const initialState = createInitialState(communityId);

    return {
      ...initialState,
      checkIn: (memberId: string, status: STATUS) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  status,
                  lastCheckIn: Date.now(),
                }
              : m
          ),
        })),
      updateResource: (resourceId: string, quantity: number, unit?: string) =>
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === resourceId
              ? {
                  ...r,
                  quantity,
                  unit: unit ?? r.unit,
                  lastUpdated: Date.now(),
                }
              : r
          ),
        })),
      addMessage: (message: Omit<Message, 'id'>) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg_${Date.now()}_${Math.random()}`,
            },
          ],
        })),
      completeDrill: (drillId: string) =>
        set((state) => ({
          drills: state.drills.map((d) =>
            d.id === drillId
              ? {
                  ...d,
                  completedAt: [...d.completedAt, Date.now()],
                  participantCount: d.participantCount + 1,
                }
              : d
          ),
        })),
      addMember: (member: Omit<Member, 'xp' | 'level'>) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              ...member,
              xp: 0,
              level: 1,
            },
          ],
        })),
      addResource: (resource: Omit<Resource, 'id' | 'lastUpdated'>) =>
        set((state) => ({
          resources: [
            ...state.resources,
            {
              ...resource,
              id: `res_${Date.now()}_${Math.random()}`,
              lastUpdated: Date.now(),
            },
          ],
        })),
      updateReadinessScore: (score: number) =>
        set({ readinessScore: Math.min(100, Math.max(0, score)) }),
      updateStreakDays: (days: number) => set({ streakDays: days }),
      reset: () => set(initialState),
    };
  });

interface CommunityContextValue {
  state: CommunityState;
  computed: CommunityComputedValues;
  checkIn: (memberId: string, status: STATUS) => void;
  updateResource: (
    resourceId: string,
    quantity: number,
    unit?: string
  ) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  completeDrill: (drillId: string) => void;
  addMember: (member: Omit<Member, 'xp' | 'level'>) => void;
  addResource: (
    resource: Omit<Resource, 'id' | 'lastUpdated'>
  ) => void;
  updateReadinessScore: (score: number) => void;
  updateStreakDays: (days: number) => void;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(
  undefined
);

interface CommunityProviderProps {
  communityId: string;
  children: React.ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({
  communityId,
  children,
}) => {
  const storeRef = React.useRef(
    createCommunityStore(communityId)
  );

  const state = storeRef.current((s) => ({
    communityId: s.communityId,
    communityName: s.communityName,
    members: s.members,
    resources: s.resources,
    drills: s.drills,
    plans: s.plans,
    messages: s.messages,
    achievements: s.achievements,
    readinessScore: s.readinessScore,
    streakDays: s.streakDays,
  }));

  const computed = useMemo<CommunityComputedValues>(() => {
    const safeCount = state.members.filter((m) => m.status === STATUS.SAFE)
      .length;
    const helpCount = state.members.filter((m) => m.status === STATUS.HELP)
      .length;
    const unknownCount = state.members.filter(
      (m) => m.status === STATUS.UNKNOWN
    ).length;

    const criticalResources = state.resources.filter((r) => r.quantity < 5);

    const drillAverage =
      state.drills.length > 0
        ? state.drills.reduce((sum, d) => sum + d.completedAt.length, 0) /
          state.drills.length
        : 0;

    const resHealth =
      state.resources.length > 0
        ? (state.resources.filter((r) => r.quantity >= 5).length /
            state.resources.length) *
          100
        : 0;

    const totalXP = state.members.reduce((sum, m) => sum + m.xp, 0);

    return {
      safeCount,
      helpCount,
      unknownCount,
      criticalResources,
      drillAverage,
      resHealth,
      totalXP,
    };
  }, [state]);

  const value: CommunityContextValue = {
    state,
    computed,
    checkIn: storeRef.current((s) => s.checkIn),
    updateResource: storeRef.current((s) => s.updateResource),
    addMessage: storeRef.current((s) => s.addMessage),
    completeDrill: storeRef.current((s) => s.completeDrill),
    addMember: storeRef.current((s) => s.addMember),
    addResource: storeRef.current((s) => s.addResource),
    updateReadinessScore: storeRef.current((s) => s.updateReadinessScore),
    updateStreakDays: storeRef.current((s) => s.updateStreakDays),
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export function useCommunity(): CommunityContextValue {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
