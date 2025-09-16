# Architecture Summary

This document provides a comprehensive overview of the ErasGames React Native architecture for quick reference.

## 📋 Quick Reference

### **Project Structure**

```
app/
├── app.tsx                 # Main app with providers
├── index.ts               # Entry point
├── core/                  # Infrastructure layer
│   ├── api/              # HTTP client, validation, types
│   ├── state/            # Global state (Zustand)
│   ├── theme/            # Design system tokens
│   ├── i18n/             # Internationalization
│   └── utils/            # Shared utilities
├── features/             # Business logic modules
│   ├── auth/             # Authentication
│   ├── feed/             # Quiz feed
│   └── profile/          # User profiles
├── navigation/           # Routing and navigation
├── ui/                   # Design system components
└── assets/               # Static resources
```

### **Technology Stack**

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State**: Zustand (client) + React Query (server)
- **Validation**: Zod schemas
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet + Theme tokens
- **i18n**: i18next + react-i18next
- **HTTP**: Axios with interceptors

## 🏗️ Architecture Patterns

### **Feature-Based Organization**

Each feature is self-contained:

```
features/feature-name/
├── api.ts              # API calls + Zod validation
├── hooks.ts            # React Query hooks
├── screens/            # Screen components
└── components/         # Feature-specific components
```

### **Data Flow**

```
User Action → Component → Hook → API → Server
     ↓           ↑        ↑        ↑
  UI Update ← React Query ← Response ← HTTP
```

### **State Management Strategy**

- **Server State**: React Query (caching, sync, background updates)
- **Client State**: Zustand (UI preferences, auth session)
- **Local State**: useState (component-specific)

### **Type Safety**

- **API**: Zod schemas for runtime validation
- **Navigation**: Type-safe route parameters
- **Components**: Strict TypeScript interfaces
- **State**: Typed actions and selectors

## 🔧 Core Systems

### **API Layer** (`app/core/api/`)

```typescript
// client.ts - Axios configuration
const api = axios.create({
  baseURL: getEnv().API_URL,
  timeout: 12000,
});

// types.ts - Zod schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

// error.ts - Error handling
export class ApiError extends Error {
  status?: number;
  code?: string;
}
```

### **State Management** (`app/core/state/`)

```typescript
// appStore.ts - Zustand store
interface AppState {
  session: Session | null;
  theme: 'light' | 'dark' | 'system';
  setSession: (session: Session) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      session: null,
      theme: 'system',
      setSession: session => set({session}),
    }),
    {name: 'app-store', storage: AsyncStorage},
  ),
);
```

### **Theming** (`app/core/theme/`)

```typescript
// index.ts - Design tokens
const themes = {
  light: {
    colors: {primary: '#6366f1', background: '#ffffff'},
    spacing: (n: number) => n * 8,
    text: {size: {md: 16}, weight: {bold: '700'}},
  },
  dark: {
    /* dark theme */
  },
};

// ThemeProvider.tsx - Context provider
export function ThemeProvider({children}) {
  const theme = themes[currentMode];
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
```

### **Navigation** (`app/navigation/`)

```typescript
// types.ts - Route definitions
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Profile: {userId: string};
};

// RootNavigator.tsx - Navigation structure
export function RootNavigator() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 🎨 UI Components

### **Design System** (`app/ui/`)

```typescript
// Consistent component API
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  // Theme integration
}

// Usage with theme
function MyComponent() {
  const theme = useTheme();
  return (
    <Button
      variant="primary"
      size="md"
      style={{backgroundColor: theme.colors.primary}}
    />
  );
}
```

### **Component Categories**

- **Typography**: Text with variants and weights
- **Forms**: Input, Button with states
- **Layout**: View, Card, Separator
- **Navigation**: Headers, tabs, drawers

## 🔄 Development Workflow

### **Adding a New Feature**

```bash
# 1. Create feature structure
mkdir app/features/my-feature/{screens,components}

# 2. Implement layers
# - api.ts: API calls + validation
# - hooks.ts: React Query hooks
# - screens/: UI components
# - Add to navigation

# 3. Export and integrate
# - Update navigation types
# - Add route to navigator
# - Add translations
```

### **API Integration Pattern**

```typescript
// 1. Define schema
const DataSchema = z.object({id: z.string()});

// 2. Create API function
export async function fetchData(): Promise<Data> {
  const response = await api.get('/data');
  return DataSchema.parse(response.data);
}

// 3. Create hook
export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
}

// 4. Use in component
function DataScreen() {
  const {data, isLoading, error} = useData();
  // Render logic
}
```

### **Component Development Pattern**

```typescript
// 1. Interface definition
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

// 2. Component implementation
export function MyComponent({title, onPress}: MyComponentProps) {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Button
      title={t(title)}
      onPress={onPress}
      style={{color: theme.colors.primary}}
    />
  );
}

// 3. Export from ui/index.ts
export {MyComponent} from './MyComponent';
```

## 📊 Best Practices

### **Performance**

- Use React Query for server state caching
- Implement optimistic updates where appropriate
- Lazy load components and features
- Optimize images and assets

### **Code Quality**

- Strict TypeScript configuration
- ESLint + Prettier for consistency
- Zod for runtime validation
- Component composition over inheritance

### **User Experience**

- Loading states for all async operations
- Error boundaries and error handling
- Offline support with React Query
- Accessibility built into components

### **Maintainability**

- Feature-based organization
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive documentation

## 🚀 Getting Started Checklist

For new developers:

- [ ] Read [Architecture Overview](./architecture-overview.md)
- [ ] Understand [Folder Structure](./folder-structure.md)
- [ ] Set up development environment with [Development Workflow](./development-workflow.md)
- [ ] Study [Core Systems](./core-systems.md) implementation
- [ ] Practice with [Feature Development](./feature-development.md) guide
- [ ] Learn [UI Components](./ui-components.md) usage
- [ ] Build first feature following established patterns

## 🤝 Contributing Guidelines

### **Code Standards**

- Use TypeScript strictly (no `any` types)
- Follow existing patterns and conventions
- Write self-documenting code with clear naming
- Add proper error handling and loading states

### **Testing**

- Write unit tests for utilities and hooks
- Test component interactions
- Validate API integrations
- Ensure accessibility compliance

### **Documentation**

- Update README for new features
- Document complex business logic
- Keep architecture docs current
- Add code comments for non-obvious logic

---

This architecture provides a solid foundation for building scalable, maintainable React Native applications. The patterns established here will help your team move quickly while maintaining code quality and consistency.

_For detailed information on any topic, refer to the specific documentation files in this directory._
