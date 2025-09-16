import {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from './types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['erasgames://', 'https://erasgames.com'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      MainTabs: {
        screens: {
          Feed: 'feed',
          Quiz: 'quiz',
          Leaderboard: 'leaderboard',
          Profile: 'profile',
        },
      },
      Profile: 'user/:userId',
      Settings: 'settings',
      QuizDetails: 'quiz/:quizId',
      Results: 'results/:quizId',
    },
  },
};

export default linking;
