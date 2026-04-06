import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand/react';
import { STATUS } from '../constants';
import type {
  Member,
  Resource,
  Message,
  CommunityState,
} from '../domain/community';
import {
  loadCommunityStateFromDb,
  persistMemberCheckIn,
  persistResourceQuantity,
} from '../db/communityLifecycle';
import { subscribeCommunityDataRefresh } from '../sync/refreshHub';
import { useApp } from './AppContext';

export type {
  Member,
  Resource,
  Drill,
  Plan,
  Message,
  Achievement,
  CommunityState,
} from '../domain/community';

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
  hydrate: (data: Partial<CommunityState>) => void;
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
  inviteExpiresAt: null,
  members: [],
  resources: [],
  drills: [],
  plans: [],
  messages: [],
  achievements: [],
  readinessScore: 0,
  streakDays: 0,
});

const createCommunityStore = (communityId: string) => {
  const shouldPersist =
    communityId !== '__none__' && communityId !== 'local';

  return createStore<CommunityStore>((set, get) => {
    const initialState = createInitialState(communityId);

    return {
      ...initialState,
      hydrate: (data: Partial<CommunityState>) =>
        set((state) => ({
          ...state,
          ...data,
          communityId: data.communityId ?? state.communityId,
          communityName: data.communityName ?? state.communityName,
          inviteExpiresAt:
            data.inviteExpiresAt !== undefined
              ? data.inviteExpiresAt
              : state.inviteExpiresAt,
          members: data.members ?? state.members,
          resources: data.resources ?? state.resources,
          drills: data.drills ?? state.drills,
          plans: data.plans ?? state.plans,
          messages: data.messages ?? state.messages,
          achievements: data.achievements ?? state.achievements,
          readinessScore: data.readinessScore ?? state.readinessScore,
          streakDays: data.streakDays ?? state.streakDays,
        })),
      checkIn: (memberId: string, status: STATUS) => {
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
        }));
        if (shouldPersist) {
          void persistMemberCheckIn(memberId, status).catch((err) =>
            console.error('[ember] persistMemberCheckIn', err)
          );
        }
      },
      updateResource: (resourceId: string, quantity: number, unit?: string) => {
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
        }));
        if (shouldPersist) {
          void persistResourceQuantity(resourceId, quantity, unit).catch(
            (err) => console.error('[ember] persistResourceQuantity', err)
          );
        }
      },
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
      reset: () => set(createInitialState(get().communityId)),
    };
  });
};

interface CommunityContextValue
  extends CommunityState,
    CommunityComputedValues {
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
  communityId?: string;
  children: React.ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({
  communityId = '__none__',
  children,
}) => {
  const store = useMemo(
    () => createCommunityStore(communityId),
    [communityId]
  );
  const snap = useStore(store);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    if (!communityId || communityId === '__none__' || communityId === 'local') {
      return;
    }
    const token = ++loadTokenRef.current;
    let cancelled = false;

    void loadCommunityStateFromDb(communityId).then((data) => {
      if (cancelled || token !== loadTokenRef.current || !data) return;
      store.getState().hydrate(data);
    });

    return () => {
      cancelled = true;
    };
  }, [communityId, store]);

  useEffect(() => {
    return subscribeCommunityDataRefresh(() => {
      if (!communityId || communityId === '__none__' || communityId === 'local') {
        return;
      }
      void loadCommunityStateFromDb(communityId).then((data) => {
        if (data) store.getState().hydrate(data);
      });
    });
  }, [communityId, store]);

  const state: CommunityState = useMemo(
    () => ({
      communityId: snap.communityId,
      communityName: snap.communityName,
      inviteExpiresAt: snap.inviteExpiresAt,
      members: snap.members,
      resources: snap.resources,
      drills: snap.drills,
      plans: snap.plans,
      messages: snap.messages,
      achievements: snap.achievements,
      readinessScore: snap.readinessScore,
      streakDays: snap.streakDays,
    }),
    [
      snap.communityId,
      snap.communityName,
      snap.inviteExpiresAt,
      snap.members,
      snap.resources,
      snap.drills,
      snap.plans,
      snap.messages,
      snap.achievements,
      snap.readinessScore,
      snap.streakDays,
    ]
  );

  const computed = useMemo<CommunityComputedValues>(() => {
    const safeCount = state.members.filter((m) => m.status === STATUS.SAFE)
      .length;
    const helpCount = state.members.filter((m) => m.status === STATUS.HELP)
      .length;
    const unknownCount = state.members.filter(
      (m) => m.status === STATUS.UNKNOWN
    ).length;

    const criticalResources = state.resources.filter((r) => {
      const t = r.criticalThreshold ?? 5;
      return r.quantity <= t;
    });

    const drillAverage =
      state.drills.length > 0
        ? state.drills.reduce((sum, d) => sum + d.completedAt.length, 0) /
          state.drills.length
        : 0;

    const resHealth =
      state.resources.length > 0
        ? (state.resources.filter((r) => {
            const t = r.criticalThreshold ?? 5;
            return r.quantity > t;
          }).length /
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

  const value: CommunityContextValue = useMemo(
    () => ({
      state,
      computed,
      ...state,
      ...computed,
      checkIn: snap.checkIn,
      updateResource: snap.updateResource,
      addMessage: snap.addMessage,
      completeDrill: snap.completeDrill,
      addMember: snap.addMember,
      addResource: snap.addResource,
      updateReadinessScore: snap.updateReadinessScore,
      updateStreakDays: snap.updateStreakDays,
    }),
    [state, computed, snap]
  );

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export function RootCommunityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOnboarded, currentCommunityId } = useApp();
  const id =
    isOnboarded && currentCommunityId ? currentCommunityId : '__none__';

  return (
    <CommunityProvider key={id} communityId={id}>
      {children}
    </CommunityProvider>
  );
}

export function useCommunity(): CommunityContextValue {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
