import React, { useRef, useEffect } from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorScheme, View, StyleSheet} from 'react-native';
import {useTheme, ThemedBackground} from '../core/theme';
import {useAuth} from '../core/context/AuthContext';
import {FCMService} from '../core/services/FCMService';
import {AnimatedLogo} from '../shared/components';
import {Text} from '../ui';
import type {RootStackParamList} from './types';

// Import our quiz screens
import DailyDropScreen from '../features/quiz/screens/DailyDropScreen';
import StartQuizScreen from '../features/quiz/screens/StartQuizScreen';
import QuizSelectionScreen from '../features/quiz/screens/QuizSelectionScreen';
import QuizScreen from '../features/quiz/screens/QuizScreen';
import TestQuizScreen from '../features/quiz/screens/TestQuizScreen';
import QuizResultsScreen from '../features/quiz/screens/QuizResultsScreen';
import ResultsScreen from '../features/quiz/screens/ResultsScreen';

// Import auth screens
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
// TODO: Create ForgotPasswordScreen if it doesn't exist

// Import leaderboard screen
import LeaderboardScreen from '../features/leaderboard/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<any>();

  useEffect(() => {
    // Setup notification opened handlers when navigation is ready
    if (isAuthenticated) {
      FCMService.setupNotificationOpenedHandler(navigationRef);
    }
  }, [isAuthenticated]);
  
  // Create navigation theme based on our app theme
  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  // Show loading screen while checking authentication state
  if (isLoading) {
    return (
      <ThemedBackground style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <AnimatedLogo size={200} />
        </View>
      </ThemedBackground>
    );
  }
  
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen 
              name="DailyDrop" 
              component={DailyDropScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="StartQuiz" 
              component={StartQuizScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="QuizSelection" 
              component={QuizSelectionScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Quiz" 
              component={QuizScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="TestQuiz" 
              component={TestQuizScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="QuizResults" 
              component={QuizResultsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Results" 
              component={ResultsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Leaderboard" 
              component={LeaderboardScreen}
              options={{headerShown: false}}
            />
          </>
        ) : (
          // Authentication screens
          <>
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 16,
  },
});