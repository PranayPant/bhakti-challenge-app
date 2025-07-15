import { createContext, type ReactNode, useContext, useRef } from 'react';
import { type ChallengeStore, createChallengeStore } from './challenges';
import { useStore } from 'zustand';

export const ChallengeStoreContext = createContext<ReturnType<typeof createChallengeStore> | null>(null);

interface ChallengeStoreProviderProps {
  children: ReactNode;
  initialStore?: Partial<ChallengeStore>;
}

export function ChallengeStoreProvider({ children, initialStore }: ChallengeStoreProviderProps) {
  const store = useRef(createChallengeStore(initialStore)).current;

  return <ChallengeStoreContext.Provider value={store}>{children}</ChallengeStoreContext.Provider>;
}

export function useChallengeStore<U>(selector: (state: ChallengeStore) => U) {
  const store = useContext(ChallengeStoreContext);

  if (!store) {
    throw new Error('useChallengeStore must be used within ChallengeStoreProvider');
  }

  const selectedState = useStore(store, selector);
  return selectedState;
}
