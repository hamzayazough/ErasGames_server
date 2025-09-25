import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firebaseService from '../services/firebaseService';
import { authApiService } from '../api/auth';
import { AuthenticatedUser } from '../api/config';
import { FCMService } from '../services/FCMService';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  serverUser: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isServerAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signUp: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  authenticateWithServer: () => Promise<AuthenticatedUser>;
  refreshServerUserData: () => Promise<AuthenticatedUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [serverUser, setServerUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup push notifications for authenticated user
  const setupNotifications = async (userId: string) => {
    try {
      console.log('🔔 Setting up push notifications...');
      
      // Request permission and get FCM token
      const fcmToken = await FCMService.requestPermissionAndGetToken();
      
      if (fcmToken) {
        // Register token with server
        await FCMService.registerTokenWithServer(fcmToken, userId);
        
        // Setup message handlers
        FCMService.setupForegroundMessageHandler();
        FCMService.setupTokenRefreshHandler(userId);
        
        console.log('✅ Push notifications setup complete');
      } else {
        console.log('❌ Failed to get FCM token');
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
        // User is logged in with Firebase, now authenticate with server
        try {
          const serverUserData = await authApiService.authenticate();
          setServerUser(serverUserData);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
    setIsLoading(true);
    try {
      const result = await firebaseService.signUp(email, password);
      return result;
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
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithServer = async (): Promise<AuthenticatedUser> => {
    try {
      const serverUserData = await authApiService.authenticate();
      setServerUser(serverUserData);
      return serverUserData;
    } catch (error) {
      console.error('Failed to authenticate with server:', error);
      throw error;
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
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteAccount,
    authenticateWithServer,
    refreshServerUserData,
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