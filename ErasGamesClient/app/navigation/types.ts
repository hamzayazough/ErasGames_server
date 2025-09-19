import type {NativeStackScreenProps} from '@react-navigation/native-stack';

// Root Stack Navigator
export type RootStackParamList = {
  // Auth Stack (temporarily disabled)
  // Login: undefined;
  // Register: undefined;
  // ForgotPassword: undefined;

  // Quiz Flow
  DailyDrop: undefined;
  StartQuiz: undefined;
  Quiz: undefined;
  Results: undefined;

  // Main App Stack (future)
  MainTabs: undefined;

  // Modal/Overlay Screens (future)
  Profile: {userId?: string};
  Settings: undefined;
  QuizDetails: {quizId: string};
};

// Main Tab Navigator
export type MainTabParamList = {
  Feed: undefined;
  Quiz: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  NativeStackScreenProps<MainTabParamList, T>;

// Navigation Props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
