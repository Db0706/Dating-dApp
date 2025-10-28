import { create } from 'zustand';
import { UserProfile } from './firebase';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  heartBalance: string;
  isBoosted: boolean;
  boostTimeRemaining: number;
  userProfile: UserProfile | null;
  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setHeartBalance: (balance: string) => void;
  setBoostStatus: (isBoosted: boolean, timeRemaining: number) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  disconnect: () => void;
}

/**
 * Global state management for wallet and user data
 */
export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  balance: '0',
  heartBalance: '0',
  isBoosted: false,
  boostTimeRemaining: 0,
  userProfile: null,

  setAddress: (address) =>
    set({
      address,
      isConnected: !!address,
    }),

  setBalance: (balance) => set({ balance }),

  setHeartBalance: (heartBalance) => set({ heartBalance }),

  setBoostStatus: (isBoosted, boostTimeRemaining) =>
    set({ isBoosted, boostTimeRemaining }),

  setUserProfile: (userProfile) => set({ userProfile }),

  disconnect: () =>
    set({
      address: null,
      isConnected: false,
      balance: '0',
      heartBalance: '0',
      isBoosted: false,
      boostTimeRemaining: 0,
      userProfile: null,
    }),
}));

interface MatchState {
  showMatchModal: boolean;
  matchedUser: UserProfile | null;
  setMatchModal: (show: boolean, user?: UserProfile) => void;
}

/**
 * State for match modal
 */
export const useMatchStore = create<MatchState>((set) => ({
  showMatchModal: false,
  matchedUser: null,

  setMatchModal: (show, user) =>
    set({
      showMatchModal: show,
      matchedUser: user || null,
    }),
}));
