# Core Systems

This document provides a deep dive into our core infrastructure systems that power the entire application.

## 🌐 API System (`app/core/api/`)

### **API Client Configuration**

Our API system is built around a centralized Axios instance with intelligent interceptors and error handling.

#### **`client.ts` - HTTP Client**

```typescript
// Automatic token injection
api.interceptors.request.use(async config => {
  const token = useAppStore.getState().session?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standardized error handling
api.interceptors.response.use(
  response => response,
  error => Promise.reject(normalizeApiError(error)),
);
```

**Features:**

- Automatic authentication token injection
- Request/response logging in development
- Timeout configuration per environment
- Retry logic for failed requests
- Base URL configuration

#### **`error.ts` - Error Management**

```typescript
export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}
```

**Benefits:**

- Consistent error structure across the app
- Type-safe error handling
- Network vs server error differentiation
- User-friendly error messages

#### **`types.ts` - Schema Validation**

```typescript
// Runtime validation with Zod
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  // ... more fields
});

export type User = z.infer<typeof UserSchema>;
```

**Features:**

- Runtime type validation
- TypeScript type generation
- API response validation
- Schema versioning support

#### **`queries.ts` - React Query Configuration**

```typescript
export const defaultQueryOptions = {
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  retry: 1,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
};
```

**Features:**

- Centralized query configuration
- Pagination utilities
- Query key factories
- Cache management strategies

### **Usage Example**

```typescript
// In a feature's api.ts file
export async function fetchQuiz(id: string): Promise<Quiz> {
  const response = await api.get(`/quizzes/${id}`);
  return QuizSchema.parse(response.data); // Runtime validation
}

// In a feature's hooks.ts file
export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuiz(id),
    ...defaultQueryOptions,
  });
}
```

## 🗄️ State Management (`app/core/state/`)

### **Zustand Store Architecture**

We use Zustand for client-side state with persistence for important data.

#### **`appStore.ts` - Global State**

```typescript
interface AppState {
  // Authentication
  session: Session | null;
  isAuthenticated: boolean;

  // UI Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;

  // App State
  isOnboarded: boolean;
  notificationsEnabled: boolean;

  // Actions
  setSession: (session: Session) => void;
  clearSession: () => void;
  // ... more actions
}
```

**Features:**

- Persistent storage with AsyncStorage
- Computed selectors for performance
- Type-safe actions and state
- Partial persistence configuration

**State Categories:**

1. **Authentication State**

   - User session and token
   - Authentication status
   - User profile data

2. **UI Preferences**

   - Theme selection (light/dark/system)
   - Language preference
   - Accessibility settings

3. **App State**
   - Onboarding completion
   - Feature flags
   - Notification preferences

### **Usage Patterns**

```typescript
// Reading state
const isAuth = useAppStore(state => state.isAuthenticated);
const user = useCurrentUser(); // Computed selector

// Updating state
const setTheme = useAppStore(state => state.setTheme);
setTheme('dark');

// Multiple updates
const {setSession, setOnboarded} = useAppStore(state => ({
  setSession: state.setSession,
  setOnboarded: state.setOnboarded,
}));
```

## 🎨 Theming System (`app/core/theme/`)

### **Design Token Architecture**

Our theming system provides consistent design tokens across the application.

#### **`index.ts` - Theme Tokens**

```typescript
const base = {
  spacing: (n: number) => n * 8,
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  text: {
    size: {xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24},
    weight: {normal: '400', medium: '500', semibold: '600', bold: '700'},
  },
  shadows: {
    sm: {shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05},
    // ... more shadows
  },
};
```

**Token Categories:**

1. **Spacing**: Consistent spacing scale (8px base unit)
2. **Colors**: Semantic color system with light/dark variants
3. **Typography**: Font sizes and weights
4. **Borders**: Border radius values
5. **Shadows**: Elevation and depth

#### **`ThemeProvider.tsx` - Context Provider**

```typescript
export function ThemeProvider({children}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const themePref = useAppStore(state => state.theme);

  const themeMode =
    themePref === 'system' ? systemColorScheme ?? 'light' : themePref;

  const theme = themes[themeMode];

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
```

**Features:**

- System theme detection
- Manual theme override
- Automatic theme switching
- Type-safe theme access

### **Usage in Components**

```typescript
function MyComponent() {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        padding: theme.spacing(2), // 16px
        borderRadius: theme.radius.md,
        ...theme.shadows.sm,
      }}>
      <Text
        style={{
          fontSize: theme.text.size.lg,
          fontWeight: theme.text.weight.semibold,
          color: theme.colors.text,
        }}>
        Hello World
      </Text>
    </View>
  );
}
```

## 🌍 Internationalization (`app/core/i18n/`)

### **i18next Configuration**

#### **`i18n.ts` - Setup**

```typescript
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  resources: {
    en: {translation: en},
    fr: {translation: fr},
  },
  interpolation: {escapeValue: false},
});
```

**Features:**

- Multiple language support
- Namespace organization
- Interpolation and pluralization
- Device language detection

### **Translation Structure**

```json
// locales/en.json
{
  "auth": {
    "login": "Login",
    "register": "Sign Up",
    "welcome_back": "Welcome back!"
  },
  "feed": {
    "start_quiz": "Start Quiz",
    "no_quizzes": "No quizzes available"
  },
  "common": {
    "loading": "Loading",
    "error": "Error"
  }
}
```

**Organization:**

- Feature-based namespaces
- Common strings in shared namespace
- Consistent key naming
- Hierarchical structure

### **Usage in Components**

```typescript
function LoginScreen() {
  const {t} = useTranslation();

  return (
    <View>
      <Text>{t('auth.welcome_back')}</Text>
      <Button title={t('auth.login')} />
    </View>
  );
}
```

## 🛠️ Configuration (`app/env/`)

### **Environment Management**

#### **`index.ts` - Environment Configuration**

```typescript
interface Env {
  API_URL: string;
  API_TIMEOUT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export function getEnv(): Env {
  return {
    API_URL: __DEV__
      ? 'http://localhost:3000/api'
      : 'https://api.erasgames.com',
    API_TIMEOUT: 12000,
    LOG_LEVEL: __DEV__ ? 'debug' : 'warn',
    ENVIRONMENT: __DEV__ ? 'development' : 'production',
  };
}
```

**Features:**

- Type-safe environment variables
- Development vs production configs
- Easy to extend for new environments
- Centralized configuration access

## 🔧 Utility Functions (`app/core/utils/`)

### **Common Utilities**

```typescript
// dates.ts
export function formatDate(date: Date): string;
export function timeAgo(date: Date): string;

// logger.ts
export function logError(error: Error): void;
export function logInfo(message: string): void;

// platform.ts
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
```

**Categories:**

- Date/time formatting
- Logging utilities
- Platform detection
- Validation helpers
- String manipulation

## 🔄 Integration Points

### **How Core Systems Work Together**

1. **API + State**: API calls update Zustand store automatically
2. **Theme + Components**: All UI components use theme tokens
3. **i18n + Navigation**: Route titles and tab labels are translated
4. **Environment + API**: API URLs change based on environment
5. **State + Navigation**: Auth state drives navigation flow

### **Data Flow Example**

```
User Login → LoginScreen → useLogin hook → API call →
Response → Validation → Store update → Navigation change
```

1. User enters credentials
2. LoginScreen calls `useLogin` hook
3. Hook makes API call via centralized client
4. Response validated with Zod schema
5. Session stored in Zustand store
6. Navigation automatically updates based on auth state

---

_Next: Learn how to build new features with [Feature Development](./feature-development.md)._
