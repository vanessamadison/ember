import React, { createContext, useContext, useCallback } from 'react';
import { create } from 'zustand';
import { AppMode } from '../theme';

export interface AppState {
  mode: AppMode;
  isOnboarded: boolean;
  currentCommunityId: string | null;
  userId: string | null;
}

interface AppStore extends AppState {
  setMode: (mode: AppMode) => void;
  setOnboarded: (onboarded: boolean) => void;
  setCommunity: (communityId: string | null) => void;
  setUser: (userId: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  mode: 'peace',
  isOnboarded: false,
  currentCommunityId: null,
  userId: null,
};

const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  setMode: (mode: AppMode) => set({ mode }),
  setOnboarded: (onboarded: boolean) => set({ isOnboarded: onboarded }),
  setCommunity: (communityId: string | null) =>
    set({ currentCommunityId: communityId }),
  setUser: (userId: string | null) => set({ userId }),
  reset: () => set(initialState),
}));

interface AppContextValue {
  state: AppState;
  setMode: (mode: AppMode) => void;
  setOnboarded: (onboarded: boolean) => void;
  setCommunity: (communityId: string | null) => void;
  setUser: (userId: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const store = useAppStore();

  const value: AppContextValue = {
    state: {
      mode: store.mode,
      isOnboarded: store.isOnboarded,
      currentCommunityId: store.currentCommunityId,
      userId: store.userId,
    },
    setMode: store.setMode,
    setOnboarded: store.setOnboarded,
    setCommunity: store.setCommunity,
    setUser: store.setUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
