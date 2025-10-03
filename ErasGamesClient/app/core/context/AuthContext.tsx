import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firebaseService from '../services/firebaseService';
import { authApiService } from '../api/auth';
import { AuthenticatedUser } from '../api/config';
import { FCMService } from '../services/FCMService';
import { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  serverUser: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isServerAuthenticated: boolean;
  needsAccountSetup: boolean;
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>;
  signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signUp: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  authenticateWithServer: () => Promise<AuthenticatedUser>;
  refreshServerUserData: () => Promise<AuthenticatedUser>;
  checkAndHandleAccountSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [serverUser, setServerUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsAccountSetup, setNeedsAccountSetup] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Function to handle server authentication and account setup check
  const handleServerAuthentication = async (): Promise<AuthenticatedUser> => {
    try {
      const { user: serverUserData, needsSetup } = await authApiService.authenticateAndCheckSetup();
      
      setServerUser(serverUserData);
      setNeedsAccountSetup(needsSetup);
      
      // Navigate to CompleteAccount if setup is needed
      if (needsSetup && navigationRef.current) {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          navigationRef.current?.navigate('CompleteAccount');
        }, 100);
      }
      
      return serverUserData;
    } catch (error) {
      console.error('Failed to authenticate with server:', error);
      throw error;
    }
  };

  // Setup push notifications for authenticated user
  const setupNotifications = async (userId: string) => {
    try {
      console.log('🔔 Setting up push notifications...');
      
      // Use the smart initialization that avoids duplicate registrations
      const success = await FCMService.initializeForUser(userId);
      
      if (success) {
        console.log('✅ Push notifications setup complete');
      } else {
        console.log('❌ Push notifications setup failed');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  useEffect(() => {
    // Initialize Firebase
    firebaseService.initialize().catch(console.error);

    // Listen to authentication state changes
    const unsubscribe = firebaseService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // User is logged in with Firebase, now authenticate with server and check setup
        try {
          const serverUserData = await handleServerAuthentication();
          console.log('✅ Authenticated with server:', serverUserData.id);
          
          // Setup FCM notifications after successful authentication
          await setupNotifications(authUser.uid);
        } catch (error) {
          console.error('❌ Failed to authenticate with server:', error);
          setServerUser(null);
        }
      } else {
        // User is logged out
        setServerUser(null);
        authApiService.logout();
        // Clear FCM registration data
        await FCMService.clearRegistrationData();
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
    setIsLoading(true);
    try {
      const result = await firebaseService.signIn(email, password);
      return result;
    } catch (error) {
      throw error; // Re-throw the error so it can be caught in the LoginScreen
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
    setIsLoading(true);
    try {
      const result = await firebaseService.signUp(email, password);
      return result;
    } catch (error) {
      throw error; // Re-throw the error so it can be caught in components
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseService.signOut();
      // Clear server user data and auth token
      setServerUser(null);
      authApiService.logout();
      // Clear FCM registration data so token gets re-registered on next login
      await FCMService.clearRegistrationData();
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    return firebaseService.sendPasswordResetEmail(email);
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    return firebaseService.updateProfile(updates);
  };

  const deleteAccount = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseService.deleteAccount();
      // Clear server user data and auth token
      setServerUser(null);
      authApiService.logout();
      // Clear FCM registration data
      await FCMService.clearRegistrationData();
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithServer = async (): Promise<AuthenticatedUser> => {
    return handleServerAuthentication();
  };

  const checkAndHandleAccountSetup = async (): Promise<void> => {
    if (serverUser) {
      const needsSetup = !authApiService.isAccountComplete(serverUser);
      setNeedsAccountSetup(needsSetup);
      
      if (needsSetup && navigationRef.current) {
        navigationRef.current.navigate('CompleteAccount');
      }
    }
  };

  const refreshServerUserData = async (): Promise<AuthenticatedUser> => {
    try {
      const serverUserData = await authApiService.refreshUserData();
      setServerUser(serverUserData);
      return serverUserData;
    } catch (error) {
      console.error('Failed to refresh server user data:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    serverUser,
    isLoading,
    isAuthenticated: !!user,
    isServerAuthenticated: !!serverUser,
    needsAccountSetup,
    navigationRef,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteAccount,
    authenticateWithServer,
    refreshServerUserData,
    checkAndHandleAccountSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};