import type {NativeStackScreenProps} from '@react-navigation/native-stack';

// Root Stack Navigator
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main App Stack
  MainTabs: undefined;

  // Modal/Overlay Screens
  Profile: {userId?: string};
  Settings: undefined;
  QuizDetails: {quizId: string};
  Results: {quizId: string; score: number};
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
