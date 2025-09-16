# Feature Development Guide

This guide shows you how to build new features following our established patterns and architecture.

## 🎯 Feature Development Process

### **1. Planning Phase**

- Define feature requirements and user flows
- Identify API endpoints needed
- Plan component structure
- Consider state management needs

### **2. Implementation Phase**

- Create feature directory structure
- Implement API layer with validation
- Build React Query hooks
- Create UI components and screens
- Add navigation integration

### **3. Integration Phase**

- Add feature to navigation
- Update global types if needed
- Add translations
- Test integration points

## 📁 Creating a New Feature

Let's walk through creating a new "Leaderboard" feature step by step.

### **Step 1: Create Feature Directory**

```bash
mkdir app/features/leaderboard
mkdir app/features/leaderboard/screens
mkdir app/features/leaderboard/components
```

### **Step 2: Define API Layer**

#### **`app/features/leaderboard/api.ts`**

```typescript
import {api} from '../../core/api/client';
import {z} from 'zod';

// Define schemas
const LeaderboardEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  avatar: z.string().url().optional(),
  score: z.number(),
  rank: z.number(),
  quizzesCompleted: z.number(),
  lastActive: z.string().datetime(),
});

const LeaderboardResponseSchema = z.object({
  entries: z.array(LeaderboardEntrySchema),
  totalPlayers: z.number(),
  userRank: z.number().optional(),
  userEntry: LeaderboardEntrySchema.optional(),
});

// Export types
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;

// API functions
export async function fetchLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly',
): Promise<LeaderboardResponse> {
  const response = await api.get('/leaderboard', {
    params: {period},
  });
  return LeaderboardResponseSchema.parse(response.data);
}

export async function fetchUserRank(userId: string): Promise<LeaderboardEntry> {
  const response = await api.get(`/leaderboard/user/${userId}`);
  return LeaderboardEntrySchema.parse(response.data);
}
```

### **Step 3: Create React Query Hooks**

#### **`app/features/leaderboard/hooks.ts`**

```typescript
import {useQuery} from '@tanstack/react-query';
import * as leaderboardApi from './api';
import {useCurrentUser} from '../../core/state/appStore';

// Query keys
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (period: string) => [...leaderboardKeys.lists(), period] as const,
  user: (userId: string) => [...leaderboardKeys.all, 'user', userId] as const,
} as const;

// Hooks
export function useLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly',
) {
  return useQuery({
    queryKey: leaderboardKeys.list(period),
    queryFn: () => leaderboardApi.fetchLeaderboard(period),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserRank() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: leaderboardKeys.user(user?.id ?? ''),
    queryFn: () => leaderboardApi.fetchUserRank(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### **Step 4: Build UI Components**

#### **`app/features/leaderboard/components/LeaderboardCard.tsx`**

```typescript
import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {LeaderboardEntry} from '../api';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  currentUserId?: string;
}

export default function LeaderboardCard({
  entry,
  currentUserId,
}: LeaderboardCardProps) {
  const theme = useTheme();
  const isCurrentUser = entry.userId === currentUserId;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.colors.textSecondary;
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Card
      style={[
        styles.card,
        isCurrentUser && {borderColor: theme.colors.primary, borderWidth: 2},
      ]}>
      <View style={styles.content}>
        <View style={styles.rankContainer}>
          <Text variant="heading3" style={{color: getRankColor(entry.rank)}}>
            {getRankEmoji(entry.rank)}
          </Text>
        </View>

        <View style={styles.userInfo}>
          {entry.avatar && (
            <View
              style={[styles.avatar, {backgroundColor: theme.colors.surface}]}
            />
          )}
          <View style={styles.details}>
            <Text
              variant="body"
              weight="semibold"
              color={isCurrentUser ? 'primary' : 'primary'}>
              {entry.username}
            </Text>
            <Text variant="caption" color="secondary">
              {entry.quizzesCompleted} quizzes completed
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text variant="heading3" color="primary">
            {entry.score.toLocaleString()}
          </Text>
          <Text variant="caption" color="secondary">
            points
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
});
```

### **Step 5: Create Screen Component**

#### **`app/features/leaderboard/screens/LeaderboardScreen.tsx`**

```typescript
import React, {useState} from 'react';
import {FlatList, StyleSheet, RefreshControl} from 'react-native';
import {useTranslation} from 'react-i18next';
import {View, Text, Button} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useLeaderboard, useUserRank} from '../hooks';
import {useCurrentUser} from '../../../core/state/appStore';
import LeaderboardCard from '../components/LeaderboardCard';

export default function LeaderboardScreen() {
  const {t} = useTranslation();
  const theme = useTheme();
  const user = useCurrentUser();
  const [period, setPeriod] = useState<
    'daily' | 'weekly' | 'monthly' | 'all-time'
  >('weekly');

  const {
    data: leaderboard,
    isLoading,
    isRefetching,
    refetch,
  } = useLeaderboard(period);

  const {data: userRank} = useUserRank();

  const periods = [
    {key: 'daily', label: t('leaderboard.daily')},
    {key: 'weekly', label: t('leaderboard.weekly')},
    {key: 'monthly', label: t('leaderboard.monthly')},
    {key: 'all-time', label: t('leaderboard.all_time')},
  ] as const;

  const renderPeriodButton = ({item}: {item: (typeof periods)[0]}) => (
    <Button
      title={item.label}
      variant={period === item.key ? 'primary' : 'outline'}
      size="sm"
      onPress={() => setPeriod(item.key)}
      style={styles.periodButton}
    />
  );

  const renderLeaderboardEntry = ({item}: {item: any}) => (
    <LeaderboardCard entry={item} currentUserId={user?.id} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="heading2" style={styles.title}>
        🏆 {t('leaderboard.title')}
      </Text>

      <FlatList
        data={periods}
        renderItem={renderPeriodButton}
        keyExtractor={item => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodContainer}
      />

      {userRank && userRank.rank > 10 && (
        <View style={styles.userRankContainer}>
          <Text variant="caption" color="secondary" align="center">
            {t('leaderboard.your_rank')}
          </Text>
          <LeaderboardCard entry={userRank} currentUserId={user?.id} />
        </View>
      )}
    </View>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={leaderboard?.entries ?? []}
        renderItem={renderLeaderboardEntry}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  periodContainer: {
    paddingHorizontal: 8,
  },
  periodButton: {
    marginHorizontal: 4,
  },
  userRankContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
```

### **Step 6: Add Navigation Integration**

#### **Update `app/navigation/types.ts`**

```typescript
export type MainTabParamList = {
  Feed: undefined;
  Quiz: undefined;
  Leaderboard: undefined; // Add this line
  Profile: undefined;
};
```

#### **Update `app/navigation/RootNavigator.tsx`**

```typescript
import LeaderboardScreen from '../features/leaderboard/screens/LeaderboardScreen';

// Add to the navigation stack
<Stack.Screen
  name="Leaderboard"
  component={LeaderboardScreen}
  options={{
    headerShown: true,
    title: 'Leaderboard',
  }}
/>;
```

### **Step 7: Add Translations**

#### **Update `app/core/i18n/locales/en.json`**

```json
{
  "leaderboard": {
    "title": "Leaderboard",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "all_time": "All Time",
    "your_rank": "Your Rank"
  }
}
```

## 🎨 Component Development Patterns

### **Component Structure**

```typescript
// 1. Imports (external first, internal second)
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';

// 2. Types
interface ComponentProps {
  title: string;
  onPress: () => void;
}

// 3. Component
export default function Component({title, onPress}: ComponentProps) {
  const {t} = useTranslation();

  // 4. Hooks and state

  // 5. Event handlers

  // 6. Render functions

  // 7. Main render
  return <View>{/* JSX */}</View>;
}

// 8. Styles
const styles = StyleSheet.create({
  // styles
});
```

### **Styling Patterns**

```typescript
// Use theme for consistency
const theme = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2),
    borderRadius: theme.radius.md,
  },
  text: {
    fontSize: theme.text.size.md,
    color: theme.colors.text,
  },
});
```

### **State Management Patterns**

```typescript
// Local state for UI only
const [isVisible, setIsVisible] = useState(false);

// Global state for shared data
const user = useCurrentUser();
const setTheme = useAppStore(state => state.setTheme);

// Server state with React Query
const {data, isLoading, error} = useQuery({
  queryKey: ['data', id],
  queryFn: () => fetchData(id),
});
```

## 🔧 Testing Your Feature

### **Manual Testing Checklist**

- [ ] Feature loads without errors
- [ ] Loading states work correctly
- [ ] Error states display properly
- [ ] Data updates when expected
- [ ] Navigation flows work
- [ ] Translations display correctly
- [ ] Theme switching works
- [ ] Works on both platforms (iOS/Android)

### **Integration Points to Test**

- [ ] API calls return expected data
- [ ] State updates trigger UI changes
- [ ] Navigation parameters pass correctly
- [ ] Theme tokens apply properly
- [ ] Translations load for all languages

## 📋 Feature Checklist

Before marking a feature complete:

- [ ] **API Layer**: All endpoints implemented with validation
- [ ] **Hooks**: React Query hooks with proper caching
- [ ] **UI**: Components follow design system
- [ ] **Navigation**: Proper type-safe navigation
- [ ] **Translations**: All strings externalized
- [ ] **Error Handling**: Loading and error states
- [ ] **Performance**: Optimistic updates where appropriate
- [ ] **Documentation**: Feature documented in README

---

_Next: Learn about our [UI Components](./ui-components.md) and design system._
