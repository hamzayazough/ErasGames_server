# Development Workflow

This guide covers the essential steps for setting up your development environment and day-to-day development practices.

## 🚀 Getting Started

### **Prerequisites**

- **Node.js**: Version 18+ recommended
- **npm**: Version 8+ or yarn
- **React Native CLI**: For native development
- **Expo CLI**: For Expo workflow (recommended)
- **VS Code**: With recommended extensions

### **Recommended VS Code Extensions**

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "ms-vscode.vscode-react-native",
    "expo.vscode-expo-tools"
  ]
}
```

### **Initial Setup**

```bash
# 1. Clone the repository
git clone https://github.com/hamzayazough/ErasGames_server.git
cd ErasGames_server/ErasGamesClient

# 2. Install dependencies
npm install

# 3. Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# 4. Start the development server
npm start
```

### **Environment Variables**

Create environment-specific configuration:

```typescript
// app/env/index.ts
const environments = {
  development: {
    API_URL: 'http://localhost:3000/api',
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_URL: 'https://staging-api.erasgames.com',
    LOG_LEVEL: 'info',
  },
  production: {
    API_URL: 'https://api.erasgames.com',
    LOG_LEVEL: 'error',
  },
};
```

## 🔄 Daily Development Workflow

### **1. Starting Development**

```bash
# Start the development server
npm start

# In separate terminals:
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

### **2. Code Quality Checks**

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### **3. Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Development Patterns

### **Creating a New Feature**

1. **Plan the Feature**

   ```bash
   # Create feature directory
   mkdir app/features/my-feature
   mkdir app/features/my-feature/{screens,components}
   ```

2. **Define API Contract**

   ```typescript
   // app/features/my-feature/api.ts
   export async function fetchData(): Promise<Data> {
     // Implementation
   }
   ```

3. **Create React Query Hooks**

   ```typescript
   // app/features/my-feature/hooks.ts
   export function useData() {
     return useQuery({
       queryKey: ['data'],
       queryFn: fetchData,
     });
   }
   ```

4. **Build UI Components**
   ```typescript
   // app/features/my-feature/screens/MyScreen.tsx
   export default function MyScreen() {
     const {data, isLoading} = useData();
     // Implementation
   }
   ```

### **Adding New UI Components**

1. **Create Component File**

   ```typescript
   // app/ui/NewComponent.tsx
   interface NewComponentProps {
     title: string;
     variant?: 'primary' | 'secondary';
   }

   export function NewComponent({
     title,
     variant = 'primary',
   }: NewComponentProps) {
     const theme = useTheme();
     // Implementation
   }
   ```

2. **Export from Index**

   ```typescript
   // app/ui/index.ts
   export {NewComponent} from './NewComponent';
   ```

3. **Document Usage**
   ```typescript
   // Usage example in component docs
   <NewComponent title="Hello" variant="primary" />
   ```

### **API Integration**

1. **Define Schema**

   ```typescript
   const UserSchema = z.object({
     id: z.string(),
     name: z.string(),
     email: z.string().email(),
   });
   ```

2. **Create API Function**

   ```typescript
   export async function fetchUser(id: string): Promise<User> {
     const response = await api.get(`/users/${id}`);
     return UserSchema.parse(response.data);
   }
   ```

3. **Create Hook**
   ```typescript
   export function useUser(id: string) {
     return useQuery({
       queryKey: ['user', id],
       queryFn: () => fetchUser(id),
       enabled: !!id,
     });
   }
   ```

## 🔧 Debugging

### **React Native Debugger**

```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Open debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### **Flipper Integration**

```bash
# Install Flipper
brew install --cask flipper

# Available plugins:
# - Network inspector
# - Redux DevTools
# - React Query DevTools
# - Logs viewer
```

### **Common Debugging Commands**

```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --clear

# Clean build (iOS)
cd ios && xcodebuild clean && cd ..

# Clean build (Android)
cd android && ./gradlew clean && cd ..
```

### **Debug Tools in Development**

```typescript
// Enable React Query DevTools
import {QueryClient} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

if (__DEV__) {
  // DevTools only in development
}
```

## 📱 Platform-Specific Development

### **iOS Development**

```bash
# Open iOS project in Xcode
open ios/ErasGamesClient.xcworkspace

# Build for iOS
npx react-native run-ios

# Specific simulator
npx react-native run-ios --simulator="iPhone 14 Pro"
```

### **Android Development**

```bash
# List available devices
adb devices

# Build for Android
npx react-native run-android

# Specific device
npx react-native run-android --deviceId=DEVICE_ID
```

### **Web Development**

```bash
# Start web development
npm run web

# Build for web
npm run build:web
```

## 🔄 Git Workflow

### **Branch Naming Convention**

```bash
# Feature branches
feature/user-authentication
feature/quiz-timer

# Bug fixes
fix/login-validation
fix/memory-leak

# Hotfixes
hotfix/security-patch
```

### **Commit Message Format**

```bash
# Format: type(scope): description
feat(auth): add login validation
fix(api): handle network errors
docs(readme): update setup instructions
style(ui): improve button spacing
refactor(state): simplify user store
test(auth): add login hook tests
```

### **Pre-commit Hooks**

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 🏗️ Build and Deployment

### **Development Builds**

```bash
# Expo development build
eas build --profile development --platform all

# Local development build
npx expo run:ios
npx expo run:android
```

### **Production Builds**

```bash
# Preview build (for testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

### **Environment-Specific Builds**

```json
// eas.json
{
  "build": {
    "development": {
      "env": {
        "API_URL": "http://localhost:3000/api"
      }
    },
    "staging": {
      "env": {
        "API_URL": "https://staging-api.erasgames.com"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.erasgames.com"
      }
    }
  }
}
```

## 📊 Performance Monitoring

### **Performance Best Practices**

1. **Bundle Analysis**

   ```bash
   # Analyze bundle size
   npx react-native-bundle-visualizer
   ```

2. **Memory Profiling**

   ```bash
   # Profile memory usage
   # Use Flipper or Xcode Instruments
   ```

3. **Network Monitoring**
   ```typescript
   // Monitor API calls
   api.interceptors.request.use(config => {
     console.log('API Request:', config.url);
     return config;
   });
   ```

### **Performance Metrics**

- **App startup time**: < 3 seconds
- **Screen navigation**: < 300ms
- **API response time**: < 2 seconds
- **Memory usage**: Monitor for leaks
- **Bundle size**: Keep under 30MB

## 🚨 Troubleshooting

### **Common Issues**

1. **Metro bundler issues**

   ```bash
   npx react-native start --reset-cache
   ```

2. **Pod installation issues (iOS)**

   ```bash
   cd ios && pod deintegrate && pod install
   ```

3. **Gradle issues (Android)**

   ```bash
   cd android && ./gradlew clean
   ```

4. **TypeScript errors**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules && npm install
   ```

### **Getting Help**

1. **Check documentation** in this folder
2. **Search existing issues** in the repository
3. **Ask in team chat** with code snippets
4. **Create detailed issue** with reproduction steps

---

_Next: Learn about [API Integration](./api-integration.md) patterns and best practices._
