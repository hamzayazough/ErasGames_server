# UI Components Guide

This guide covers our design system components and how to use them effectively in your features.

## 🎨 Design System Overview

Our UI components are built with these principles:

- **Consistency**: All components use the same design tokens
- **Flexibility**: Props for customization without breaking the design
- **Accessibility**: Built-in accessibility features
- **Performance**: Optimized for React Native performance
- **Type Safety**: Full TypeScript support

## 🧱 Core Components

### **Text Component**

The foundation of our typography system.

#### **Usage**

```typescript
import {Text} from '../ui';

// Basic usage
<Text>Hello World</Text>

// With variants
<Text variant="heading1">Main Title</Text>
<Text variant="heading2">Section Title</Text>
<Text variant="body">Body text</Text>
<Text variant="caption">Small text</Text>

// With styling props
<Text weight="bold" color="primary" align="center">
  Styled text
</Text>
```

#### **Props Interface**

```typescript
interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: keyof ThemeColors;
  center?: boolean;
}
```

#### **Examples**

```typescript
// Headings
<Text variant="h1">Quiz Results</Text>
<Text variant="h2">Your Score</Text>
<Text variant="h3">Next Quiz</Text>

// Body text with colors
<Text color="primary">Primary text</Text>
<Text color="secondary">Secondary text</Text>
<Text color="error">Error message</Text>
<Text color="success">Success message</Text>

// Weighted text
<Text weight="bold">Important information</Text>
<Text weight="medium">Medium emphasis</Text>
```

### **Button Component**

Flexible button component with multiple variants and states.

#### **Usage**

```typescript
import {Button} from '../ui';

// Basic button
<Button title="Click me" onPress={handlePress} />

// Variants
<Button title="Primary" variant="primary" onPress={handlePress} />
<Button title="Secondary" variant="secondary" onPress={handlePress} />
<Button title="Outline" variant="outline" onPress={handlePress} />
<Button title="Ghost" variant="ghost" onPress={handlePress} />

// Sizes
<Button title="Small" size="sm" onPress={handlePress} />
<Button title="Medium" size="md" onPress={handlePress} />
<Button title="Large" size="lg" onPress={handlePress} />

// States
<Button title="Loading" loading onPress={handlePress} />
<Button title="Disabled" disabled onPress={handlePress} />
```

#### **Props Interface**

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}
```

#### **Examples**

```typescript
// Action buttons
<Button title="Start Quiz" variant="primary" onPress={startQuiz} />
<Button title="View Results" variant="secondary" onPress={viewResults} />

// With loading state
<Button
  title="Submitting..."
  loading={isSubmitting}
  onPress={handleSubmit}
/>

// With icons
<Button
  title="Share"
  icon={<ShareIcon />}
  variant="outline"
  onPress={handleShare}
/>
```

### **Input Component**

Form input component with validation and styling.

#### **Usage**

```typescript
import {Input} from '../ui';

// Basic input
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
/>

// With validation
<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  error={passwordError}
  helperText="Must be at least 8 characters"
/>

// Different types
<Input
  label="Phone"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>
```

#### **Props Interface**

```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
}
```

#### **Examples**

```typescript
// Login form
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="john@example.com"
  keyboardType="email-address"
  autoCapitalize="none"
  error={emailError}
/>

<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  placeholder="Enter password"
  secureTextEntry
  error={passwordError}
/>

// Search input
<Input
  placeholder="Search quizzes..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  leftIcon={<SearchIcon />}
  rightIcon={searchQuery ? <ClearIcon onPress={clearSearch} /> : null}
/>
```

### **Card Component**

Container component for grouping related content.

#### **Usage**

```typescript
import {Card} from '../ui';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// With custom styling
<Card style={styles.customCard}>
  <Text variant="h3">Quiz Title</Text>
  <Text>Quiz description</Text>
</Card>

// Interactive card
<Card onPress={handleCardPress} pressable>
  <Text>Tap me</Text>
</Card>
```

#### **Props Interface**

```typescript
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  pressable?: boolean;
  variant?: 'default' | 'outlined' | 'elevated';
}
```

#### **Examples**

```typescript
// Quiz card
<Card onPress={() => startQuiz(quiz.id)} pressable>
  <Text variant="h3">{quiz.title}</Text>
  <Text color="secondary">{quiz.description}</Text>
  <View style={styles.quizMeta}>
    <Text variant="caption">{quiz.duration} minutes</Text>
    <Text variant="caption">{quiz.difficulty}</Text>
  </View>
</Card>

// Stats card
<Card variant="outlined">
  <Text variant="h2" align="center">{userStats.score}</Text>
  <Text variant="caption" align="center" color="secondary">
    Total Score
  </Text>
</Card>
```

### **View Component**

Enhanced View component with theme integration.

#### **Usage**

```typescript
import {View} from '../ui';

// Basic view
<View>
  <Text>Content</Text>
</View>

// With theme-aware styling
<View background="surface" padding={2} radius="md">
  <Text>Themed container</Text>
</View>
```

#### **Props Interface**

```typescript
interface ViewProps extends RNViewProps {
  background?: keyof ThemeColors;
  padding?: number;
  margin?: number;
  radius?: keyof ThemeRadius;
}
```

### **Separator Component**

Visual separator for content sections.

#### **Usage**

```typescript
import {Separator} from '../ui';

// Horizontal separator
<Separator />

// Vertical separator
<Separator orientation="vertical" />

// Custom spacing
<Separator spacing={24} />
```

## 🎯 Component Composition Patterns

### **Form Components**

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <Card>
      <Text variant="h2" style={styles.title}>
        Login
      </Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
      />

      <Button
        title="Login"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.loginButton}
      />
    </Card>
  );
}
```

### **List Item Components**

```typescript
function QuizListItem({quiz, onPress}) {
  return (
    <Card onPress={() => onPress(quiz)} pressable style={styles.listItem}>
      <View style={styles.listItemContent}>
        <View style={styles.listItemInfo}>
          <Text variant="h3">{quiz.title}</Text>
          <Text color="secondary" numberOfLines={2}>
            {quiz.description}
          </Text>
        </View>

        <View style={styles.listItemMeta}>
          <Text variant="caption" color="secondary">
            {quiz.duration}min
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              {
                backgroundColor: getDifficultyColor(quiz.difficulty),
              },
            ]}>
            <Text variant="caption" color="white">
              {quiz.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
```

### **Empty State Components**

```typescript
function EmptyState({title, description, action}) {
  return (
    <View style={styles.emptyState}>
      <Text variant="h3" align="center" style={styles.emptyTitle}>
        {title}
      </Text>
      <Text color="secondary" align="center" style={styles.emptyDescription}>
        {description}
      </Text>
      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          variant="outline"
          style={styles.emptyAction}
        />
      )}
    </View>
  );
}
```

## 🎨 Styling Best Practices

### **Using Theme Tokens**

```typescript
function MyComponent() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing(2), // 16px
      borderRadius: theme.radius.md,
      ...theme.shadows.sm,
    },
    text: {
      fontSize: theme.text.size.md,
      fontWeight: theme.text.weight.medium,
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed component</Text>
    </View>
  );
}
```

### **Responsive Design**

```typescript
function ResponsiveCard() {
  const {width} = useWindowDimensions();
  const isTablet = width > 768;

  return (
    <Card style={[styles.card, isTablet && styles.cardTablet]}>
      <Text>Responsive content</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  cardTablet: {
    padding: 24,
    maxWidth: 600,
    alignSelf: 'center',
  },
});
```

### **Conditional Styling**

```typescript
function StatusCard({status}) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Card style={[styles.card, {borderLeftColor: getStatusColor()}]}>
      <Text>Status: {status}</Text>
    </Card>
  );
}
```

## 🔧 Accessibility

### **Built-in Accessibility**

All components include accessibility features:

```typescript
// Text components
<Text accessibilityRole="header">Page Title</Text>

// Button components
<Button
  title="Submit"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the current form data"
  onPress={handleSubmit}
/>

// Input components
<Input
  label="Email"
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email address"
/>
```

### **Custom Accessibility**

```typescript
function AccessibleCard({title, description, onPress}) {
  return (
    <Card
      onPress={onPress}
      pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityHint="Double tap to open">
      <Text variant="h3">{title}</Text>
      <Text color="secondary">{description}</Text>
    </Card>
  );
}
```

## 📱 Platform Differences

### **iOS-specific Styling**

```typescript
const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        paddingVertical: 12,
        borderRadius: 8,
      },
      android: {
        paddingVertical: 14,
        borderRadius: 4,
      },
    }),
  },
});
```

### **Safe Area Handling**

```typescript
import {useSafeAreaInsets} from 'react-native-safe-area-context';

function ScreenWithSafeArea() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Text>Content with safe area</Text>
    </View>
  );
}
```

## 🧪 Component Testing

### **Testing Components**

```typescript
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from '../ui';

test('Button calls onPress when pressed', () => {
  const onPress = jest.fn();
  const {getByText} = render(<Button title="Test Button" onPress={onPress} />);

  fireEvent.press(getByText('Test Button'));
  expect(onPress).toHaveBeenCalled();
});
```

---

_Next: Learn about [Navigation](./navigation.md) structure and routing._
