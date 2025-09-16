import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorScheme} from 'react-native';
import {useAppStore} from '../core/state/appStore';
import {useTheme} from '../core/theme/ThemeProvider';
import type {RootStackParamList} from './types';

// Import screens (we'll create these in features)
import LoginScreen from '../features/auth/screens/LoginScreen';
import FeedScreen from '../features/feed/screens/FeedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
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
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {isAuthenticated ? (
          <>
            {/* Authenticated Stack */}
            <Stack.Screen 
              name="MainTabs" 
              component={FeedScreen} // Temporary, will be replaced with TabNavigator
              options={{headerShown: false}}
            />
            {/* Modal Screens */}
            <Stack.Group screenOptions={{presentation: 'modal'}}>
              <Stack.Screen 
                name="Profile" 
                component={FeedScreen} // Placeholder
                options={{
                  headerShown: true,
                  title: 'Profile',
                }}
              />
              <Stack.Screen 
                name="Settings" 
                component={FeedScreen} // Placeholder
                options={{
                  headerShown: true,
                  title: 'Settings',
                }}
              />
            </Stack.Group>
          </>
        ) : (
          <>
            {/* Unauthenticated Stack */}
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Register" 
              component={LoginScreen} // Placeholder
              options={{
                headerShown: true,
                title: 'Create Account',
              }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={LoginScreen} // Placeholder
              options={{
                headerShown: true,
                title: 'Reset Password',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}