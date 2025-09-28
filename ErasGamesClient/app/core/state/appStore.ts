import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../api/types';

// Session type
type Session = {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
} | null;

// App state interface
interface AppState {
  // Authentication
  session: Session;
  isAuthenticated: boolean;

  // UI preferences (simplified - only one theme now)
  language: string;

  // App state
  isOnboarded: boolean;
  notificationsEnabled: boolean;

  // Actions
  setSession: (session: Session) => void;
  clearSession: () => void;
  setLanguage: (language: string) => void;
  setOnboarded: (onboarded: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      // Initial state
      session: null,
      isAuthenticated: false,
      language: 'en',
      isOnboarded: false,
      notificationsEnabled: true,

      // Actions
      setSession: (session: Session) => {
        set({
          session,
          isAuthenticated: !!session,
        });
      },

      clearSession: () => {
        set({
          session: null,
          isAuthenticated: false,
        });
      },

      setLanguage: (language: string) => {
        set({language});
      },

      setOnboarded: (onboarded: boolean) => {
        set({isOnboarded: onboarded});
      },

      setNotificationsEnabled: (enabled: boolean) => {
        set({notificationsEnabled: enabled});
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        session: state.session,
        language: state.language,
        isOnboarded: state.isOnboarded,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);

// Computed selectors
export const useIsAuthenticated = () =>
  useAppStore(state => state.isAuthenticated);
export const useCurrentUser = () => useAppStore(state => state.session?.user);
export const useAuthToken = () => useAppStore(state => state.session?.token);
