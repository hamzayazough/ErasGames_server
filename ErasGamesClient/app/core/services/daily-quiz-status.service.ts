import {httpService} from '../api/http';
import {authApiService} from '../api/auth';

export interface QuizStatusResponse {
  isAvailable: boolean;
  quiz?: {
    localDate: string;
    tz: string;
    window: {
      start: string;
      end: string;
    };
    dropAtLocal: string;
    joinWindowEndsAtLocal: string;
    templateUrl: string;
    templateVersion: number;
  };
  nextDrop: {
    nextDropTime: string;
    nextDropTimeLocal: string;
    localDate: string;
    tz: string;
    isToday: boolean;
    timeUntilDrop: number;
  };
  attempt?: {
    id: string;
    status: 'in_progress' | 'completed';
    score?: number;
    completedAt?: string;
  };
}

class DailyQuizStatusService {
  /**
   * Get comprehensive daily quiz status including availability, timing, and user attempt status
   * This replaces the need for separate /daily and /daily/next API calls
   */
  async getDailyQuizStatus(): Promise<QuizStatusResponse> {
    console.log('🔍 Fetching daily quiz status...');

    try {
      // Ensure user is authenticated before making the API call
      await authApiService.authenticate();

      const response = await httpService.get<QuizStatusResponse>(
        '/daily/status',
      );

      console.log('✅ Daily quiz status fetched:', {
        isAvailable: response.isAvailable,
        hasQuiz: !!response.quiz,
        hasAttempt: !!response.attempt,
        attemptStatus: response.attempt?.status,
        timeUntilDrop: response.nextDrop.timeUntilDrop,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch daily quiz status:', error);

      // If user is not authenticated, the error is expected
      if (error.response?.status === 401) {
        console.log('🔒 User not authenticated - cannot fetch quiz status');
      }

      throw error;
    }
  }
}

export const dailyQuizStatusService = new DailyQuizStatusService();
