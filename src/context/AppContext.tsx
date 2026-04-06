import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppMode } from '../theme';

export interface AppState {
  mode: AppMode;
  isOnboarded: boolean;
  currentCommunityId: string | null;
  userId: string | null;
  userDisplayName: string | null;
}

interface AppStore extends AppState {
  setMode: (mode: AppMode) => void;
  setOnboarded: (onboarded: boolean) => void;
  setCommunity: (communityId: string | null) => void;
  setUser: (userId: string | null) => void;
  setUserDisplayName: (name: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  mode: 'peace',
  isOnboarded: false,
  currentCommunityId: null,
  userId: null,
  userDisplayName: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setMode: (mode: AppMode) => set({ mode }),
      setOnboarded: (onboarded: boolean) => set({ isOnboarded: onboarded }),
      setCommunity: (communityId: string | null) =>
        set({ currentCommunityId: communityId }),
      setUser: (userId: string | null) => set({ userId }),
      setUserDisplayName: (userDisplayName: string | null) =>
        set({ userDisplayName }),
      reset: () => set(initialState),
    }),
    {
      name: 'ember-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        mode: s.mode,
        isOnboarded: s.isOnboarded,
        currentCommunityId: s.currentCommunityId,
        userId: s.userId,
        userDisplayName: s.userDisplayName,
      }),
    }
  )
);

interface AppContextValue extends AppState {
  state: AppState;
  setMode: (mode: AppMode) => void;
  setOnboarded: (onboarded: boolean) => void;
  setCommunity: (communityId: string | null) => void;
  setUser: (userId: string | null) => void;
  setUserDisplayName: (name: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const store = useAppStore();

  const value: AppContextValue = {
    mode: store.mode,
    isOnboarded: store.isOnboarded,
    currentCommunityId: store.currentCommunityId,
    userId: store.userId,
    userDisplayName: store.userDisplayName,
    state: {
      mode: store.mode,
      isOnboarded: store.isOnboarded,
      currentCommunityId: store.currentCommunityId,
      userId: store.userId,
      userDisplayName: store.userDisplayName,
    },
    setMode: store.setMode,
    setOnboarded: store.setOnboarded,
    setCommunity: store.setCommunity,
    setUser: store.setUser,
    setUserDisplayName: store.setUserDisplayName,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
