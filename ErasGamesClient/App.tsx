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
import { ThemeProvider } from './app/core/theme/ThemeProvider';
import { AuthProvider } from './app/core/context/AuthContext';
import { RootNavigator } from './app/navigation/RootNavigator';
import { FCMService } from './app/core/services/FCMService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Setup background message handler
    FCMService.setupBackgroundMessageHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
