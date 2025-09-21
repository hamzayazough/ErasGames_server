# API Authentication Integration

This document explains how to use the new authentication system that integrates Firebase authentication with your server.

## Overview

The authentication system now works in two layers:

1. **Firebase Authentication** - Handles user sign-in/sign-up and provides JWT tokens
2. **Server Authentication** - Verifies Firebase tokens and manages user data in your database

## Architecture

```
Mobile App (React Native)
    ↓
Firebase Auth (JWT Token)
    ↓
HTTP Service (Bearer Token)
    ↓
Server Auth Middleware
    ↓
User Database
```

## Usage Examples

### 1. Basic Authentication Flow

```tsx
import {useAuth} from '../core/context/AuthContext';

export function LoginScreen() {
  const {
    signIn,
    isLoading,
    isAuthenticated,
    isServerAuthenticated,
    serverUser,
  } = useAuth();

  const handleLogin = async () => {
    try {
      // This automatically:
      // 1. Signs in with Firebase
      // 2. Gets Firebase JWT token
      // 3. Calls server /auth/authenticate
      // 4. Updates serverUser state
      await signIn(email, password);

      console.log('Firebase authenticated:', isAuthenticated);
      console.log('Server authenticated:', isServerAuthenticated);
      console.log('Server user data:', serverUser);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### 2. Manual Server Authentication

```tsx
import {useAuth} from '../core/context/AuthContext';

export function SomeComponent() {
  const {authenticateWithServer, refreshServerUserData} = useAuth();

  // Force authentication with server (useful for error recovery)
  const handleServerAuth = async () => {
    try {
      const userData = await authenticateWithServer();
      console.log('Server user data:', userData);
    } catch (error) {
      console.error('Server auth failed:', error);
    }
  };

  // Refresh user data from server
  const handleRefresh = async () => {
    try {
      const userData = await refreshServerUserData();
      console.log('Refreshed user data:', userData);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };
}
```

### 3. Using HTTP Service Directly

```tsx
import { httpService } from '../core/api';

export class QuizService {
  async getQuizzes() {
    // Token is automatically included in Authorization header
    return httpService.get('/quizzes');
  }

  async submitQuizAnswer(quizId: string, answer: any) {
    return httpService.post(\`/quizzes/\${quizId}/answers\`, answer);
  }
}
```

### 4. Handling Authentication States

```tsx
import {useAuth} from '../core/context/AuthContext';

export function App() {
  const {isLoading, isAuthenticated, isServerAuthenticated, user, serverUser} =
    useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!isServerAuthenticated) {
    return <ServerConnectionError />;
  }

  // Both Firebase and server authentication successful
  return <MainApp serverUser={serverUser} />;
}
```

## Server User Data Structure

```typescript
interface AuthenticatedUser {
  id: string; // Firebase UID
  email: string | null;
  name: string | null;
  handle: string | null;
  country: string | null;
  tz: string; // Timezone
  role: string; // user, admin, etc.
  status: string; // active, suspended, etc.
  createdAt: string; // ISO date string
}
```

## HTTP Service Features

### Automatic Token Management

- Automatically includes Firebase JWT in Authorization header
- Handles token refresh when needed
- Clears token on logout

### Request/Response Logging

- Logs all API calls for debugging
- Shows request method, URL, and data
- Shows response status and data

### Error Handling

- Network errors (connection issues)
- HTTP errors (4xx, 5xx)
- Timeout errors
- JSON parsing errors

### Request Types

```typescript
// GET with query parameters
httpService.get('/users', {params: {page: 1, limit: 10}});

// POST with data
httpService.post('/quizzes', {title: 'New Quiz'});

// PUT for updates
httpService.put('/users/profile', {name: 'New Name'});

// DELETE
httpService.delete('/quizzes/123');

// Custom headers
httpService.get('/data', {
  headers: {'Custom-Header': 'value'},
});
```

## Configuration

Update `app/core/api/config.ts` to set your server URL:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000' // Development
    : 'https://api.erasgames.com', // Production
  TIMEOUT: 10000,
};
```

## Token Lifecycle

1. **User logs in** → Firebase provides JWT token
2. **AuthContext calls server** → `/auth/authenticate` with Bearer token
3. **Server verifies token** → Creates/updates user in database
4. **Token stored in HTTP service** → All subsequent requests include it
5. **Token expires** → Firebase auto-refreshes, AuthContext re-authenticates
6. **User logs out** → Token cleared from HTTP service

## Best Practices

1. **Always check both auth states**:

   ```tsx
   const {isAuthenticated, isServerAuthenticated} = useAuth();
   const isFullyAuthenticated = isAuthenticated && isServerAuthenticated;
   ```

2. **Handle server auth errors gracefully**:

   ```tsx
   try {
     await authenticateWithServer();
   } catch (error) {
     // Maybe show retry button or logout user
   }
   ```

3. **Use serverUser for app data**:

   ```tsx
   const {serverUser} = useAuth();
   const userDisplayName = serverUser?.name || serverUser?.email || 'User';
   ```

4. **Refresh server data when needed**:
   ```tsx
   // After user updates profile, refresh server data
   await updateProfile({name: 'New Name'});
   await refreshServerUserData();
   ```
