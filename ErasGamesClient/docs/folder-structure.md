# Folder Structure

This document explains our feature-based folder organization and the purpose of each directory and file.

## 📁 High-Level Structure

```
app/
├── app.tsx                 # App bootstrap with providers
├── index.ts               # Entry point and root component registration
├── core/                  # Shared infrastructure
│   ├── api/              # API client and utilities
│   ├── config/           # App configuration and constants
│   ├── i18n/             # Internationalization setup
│   ├── state/            # Global state management
│   ├── theme/            # Theming system
│   └── utils/            # Shared utility functions
├── features/             # Feature-based modules
│   ├── auth/             # Authentication feature
│   ├── feed/             # Quiz feed feature
│   └── profile/          # User profile feature
├── navigation/           # Navigation configuration
├── ui/                   # Design system components
├── assets/               # Static assets
└── env/                  # Environment configuration
```

## 🔧 Core Infrastructure (`app/core/`)

### **API Layer (`app/core/api/`)**

```typescript
api/
├── client.ts             # Axios instance with interceptors
├── error.ts              # Error handling and normalization
├── queries.ts            # Shared query configurations
└── types.ts              # API schemas and TypeScript types
```

#### **`client.ts`**

- Axios instance with base configuration
- Request interceptor for authentication tokens
- Response interceptor for error handling
- Timeout and retry logic

#### **`error.ts`**

- `ApiError` class for consistent error handling
- `normalizeApiError` function to standardize error responses
- Error types for different scenarios (network, server, validation)

#### **`queries.ts`**

- Default React Query configuration
- Pagination utilities
- Query key factories
- Common query options (staleTime, cacheTime, retry logic)

#### **`types.ts`**

- Zod schemas for API responses
- TypeScript types derived from schemas
- Common interfaces (User, Session, Pagination)

### **State Management (`app/core/state/`)**

```typescript
state/
└── appStore.ts           # Zustand store for global app state
```

#### **`appStore.ts`**

- Authentication state (session, user)
- UI preferences (theme, language)
- App-wide settings (notifications, onboarding status)
- Persistence with AsyncStorage
- Computed selectors for common use cases

### **Theming (`app/core/theme/`)**

```typescript
theme/
├── index.ts              # Theme tokens and type definitions
└── ThemeProvider.tsx     # React context provider
```

#### **`index.ts`**

- Design tokens (colors, spacing, typography)
- Light and dark theme definitions
- TypeScript types for theme structure

#### **`ThemeProvider.tsx`**

- React context for theme access
- System theme detection
- Theme switching logic

### **Internationalization (`app/core/i18n/`)**

```typescript
i18n/
├── i18n.ts               # i18next configuration
└── locales/              # Translation files
    ├── en.json           # English translations
    └── fr.json           # French translations
```

#### **`i18n.ts`**

- i18next initialization
- Language detection
- Fallback language configuration

## 🎯 Features (`app/features/`)

Each feature follows the same structure pattern:

```typescript
features/
└── {feature-name}/
    ├── api.ts            # API calls specific to this feature
    ├── hooks.ts          # React Query hooks and custom logic
    ├── screens/          # Screen components
    │   └── FeatureScreen.tsx
    └── components/       # Feature-specific components
        └── FeatureComponent.tsx
```

### **Authentication (`app/features/auth/`)**

#### **`api.ts`**

- Login, register, logout API calls
- Password reset functionality
- Session refresh logic
- Zod schema validation

#### **`hooks.ts`**

- `useLogin()` - Login mutation with session management
- `useRegister()` - Registration with automatic login
- `useLogout()` - Logout with state cleanup
- `useSession()` - Current session state

#### **`screens/LoginScreen.tsx`**

- Login form UI
- Input validation
- Error handling
- Navigation to other auth screens

### **Feed (`app/features/feed/`)**

#### **`api.ts`**

- Quiz feed fetching with pagination
- Individual quiz details
- Search and filtering
- Quiz metadata

#### **`hooks.ts`**

- `useFeed()` - Infinite query for quiz feed
- `useQuiz()` - Individual quiz data
- Cache management and optimistic updates

#### **`screens/FeedScreen.tsx`**

- Quiz card list
- Pull to refresh
- Infinite scrolling
- Empty states and loading

## 🎨 UI Components (`app/ui/`)

```typescript
ui/
├── index.ts              # Barrel exports for all components
├── Button.tsx            # Button component with variants
├── Text.tsx              # Typography component
├── Input.tsx             # Form input component
├── Card.tsx              # Card container component
├── View.tsx              # Enhanced View component
└── Separator.tsx         # Divider component
```

### **Design System Components**

- Consistent API across all components
- Theme integration
- TypeScript props for customization
- Accessibility support

#### **Component Structure**

```typescript
interface ComponentProps extends NativeComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  // ... other props
}
```

## 🧭 Navigation (`app/navigation/`)

```typescript
navigation/
├── RootNavigator.tsx     # Main navigation component
├── types.ts              # Navigation type definitions
└── linking.ts            # Deep linking configuration
```

#### **`RootNavigator.tsx`**

- Stack navigator with auth flow
- Conditional rendering based on auth state
- Theme integration
- Screen options and animations

#### **`types.ts`**

- TypeScript definitions for all routes
- Parameter types for each screen
- Navigation prop types

#### **`linking.ts`**

- Deep link URL patterns
- Route mapping for web/universal links

## 🌍 Environment (`app/env/`)

```typescript
env/
└── index.ts              # Environment variables and configuration
```

#### **`index.ts`**

- API URLs for different environments
- Feature flags
- Configuration constants
- Development vs production settings

## 📱 Assets (`app/assets/`)

```typescript
assets/
├── fonts/                # Custom font files
└── images/               # App images and icons
```

## 📋 File Naming Conventions

### **Components**

- `PascalCase.tsx` for React components
- `camelCase.ts` for utilities and hooks

### **Directories**

- `kebab-case` for feature names
- `camelCase` for technical directories

### **Files**

- `api.ts` - API functions
- `hooks.ts` - Custom React hooks
- `types.ts` - TypeScript type definitions
- `utils.ts` - Utility functions
- `constants.ts` - Constant values

## 🔍 Finding Files

### **Need to find a specific type of file?**

- **API calls**: `app/features/{feature}/api.ts`
- **React hooks**: `app/features/{feature}/hooks.ts`
- **Screens**: `app/features/{feature}/screens/`
- **Components**: `app/ui/` or `app/features/{feature}/components/`
- **Types**: `app/core/api/types.ts` or `app/features/{feature}/types.ts`
- **Navigation**: `app/navigation/`
- **Styling**: `app/core/theme/`
- **State**: `app/core/state/`

### **Need to add a new feature?**

1. Create `app/features/{feature-name}/`
2. Add `api.ts`, `hooks.ts`
3. Create `screens/` and `components/` directories
4. Follow existing patterns from `auth` or `feed` features

---

_Next: Learn about [Core Systems](./core-systems.md) to understand the infrastructure._
