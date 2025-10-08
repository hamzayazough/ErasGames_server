/**
 * ErasGames React Native App
 * Taylor Swift-inspired daily quiz app
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ThemeProvider } from './app/core/theme/ThemeProvider';
import { AuthProvider } from './app/core/context/AuthContext';
import { NotificationProvider } from './app/core/context/NotificationContext';
import { RootNavigator } from './app/navigation/RootNavigator';
import { FCMService } from './app/core/services/FCMService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Setup background message handler
    FCMService.setupBackgroundMessageHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <RootNavigator />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
