import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorScheme} from 'react-native';
import {useTheme} from '../core/theme/ThemeProvider';
import type {RootStackParamList} from './types';

// Import our quiz screens
import DailyDropScreen from '../features/quiz/screens/DailyDropScreen';
import StartQuizScreen from '../features/quiz/screens/StartQuizScreen';
import QuizSelectionScreen from '../features/quiz/screens/QuizSelectionScreen';
import QuizScreen from '../features/quiz/screens/QuizScreen';
import ResultsScreen from '../features/quiz/screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
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
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="DailyDrop"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {/* Quiz Flow */}
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
          name="Results" 
          component={ResultsScreen}
          options={{headerShown: false}}
        />
        
        {/* Future screens */}
        {/* <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{headerShown: false}}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}