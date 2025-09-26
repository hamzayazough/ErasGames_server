/**
 * Quiz Attempt Service
 * Handles API calls for starting, submitting, and tracking quiz attempts
 */
import {httpService} from '../api/http';
import {AuthApiService} from '../api/auth';

export interface QuizAttempt {
  attemptId: string;
  serverStartAt: string;
  deadline: string;
  seed: number;
  templateUrl: string;
}

export interface QuizSubmission {
  score: number;
  breakdown: {
    base: number;
    accuracyBonus: number;
    speedBonus: number;
    earlyBonus: number;
  };
  accPoints: number;
  finishTimeSec: number;
  questions: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpentMs: number;
    accuracyPoints: number;
  }>;
}

export interface QuizAnswer {
  questionId: string;
  answer: any;
  idempotencyKey: string;
  timeSpentMs: number;
  shuffleProof?: any;
}

export class QuizAttemptService {
  /**
   * Check if user has already attempted today's quiz
   */
  static async getTodayAttemptStatus(): Promise<{
    hasAttempt: boolean;
    attempt?: {
      id: string;
      status: 'active' | 'finished';
      startedAt: string;
      finishedAt?: string;
      score?: number;
    };
  }> {
    console.log("🔍 Checking if user has already attempted today's quiz...");

    try {
      // Ensure user is authenticated
      const authService = new AuthApiService();
      await authService.authenticate();

      const data = await httpService.get<{
        hasAttempt: boolean;
        attempt?: {
          id: string;
          status: 'active' | 'finished';
          startedAt: string;
          finishedAt?: string;
          score?: number;
        };
      }>('/attempts/today');

      console.log('✅ Today attempt status:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to get today attempt status:', error);
      throw error;
    }
  }

  /**
   * Start a new quiz attempt
   */
  static async startAttempt(): Promise<QuizAttempt> {
    console.log('🚀 STARTING QUIZ ATTEMPT - Authenticating user first...');

    try {
      // Ensure user is authenticated with Firebase token
      const authService = new AuthApiService();
      await authService.authenticate();
      console.log('✅ User authenticated, proceeding with quiz attempt...');

      // Get today's date in local format for the request
      const today = new Date();
      const localDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      console.log('📅 Using local date:', localDate);

      // Use httpService which automatically includes Firebase bearer token
      const data = await httpService.post<QuizAttempt>('/attempts/start', {
        localDate,
      });

      console.log('✅ START ATTEMPT Success - Response Data:', data);
      return data;
    } catch (error) {
      console.error('❌ START ATTEMPT Error:', error);
      throw error;
    }
  }

  /**
   * Submit a single answer for a question
   */
  static async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: any,
    timeSpentMs: number,
  ): Promise<{status: string}> {
    console.log('📝 SUBMITTING ANSWER for attempt:', attemptId);
    console.log(
      '📝 Question ID:',
      questionId,
      'Answer:',
      answer,
      'Time:',
      timeSpentMs + 'ms',
    );

    try {
      const idempotencyKey = `${attemptId}-${questionId}-${Date.now()}`;

      const data = await httpService.post<{status: string}>(
        `/attempts/${attemptId}/answer`,
        {
          questionId,
          answer,
          idempotencyKey,
          timeSpentMs,
        },
      );

      console.log('✅ SUBMIT ANSWER Success');
      return data;
    } catch (error) {
      console.error('❌ SUBMIT ANSWER Error:', error);
      throw error;
    }
  }

  /**
   * Finish the quiz attempt and get final score
   */
  static async finishAttempt(attemptId: string): Promise<QuizSubmission> {
    console.log('🏁 FINISHING QUIZ ATTEMPT for attempt:', attemptId);

    try {
      const data = await httpService.post<QuizSubmission>(
        `/attempts/${attemptId}/finish`,
      );

      console.log('✅ FINISH ATTEMPT Success - Final Score:', data.score);
      return data;
    } catch (error) {
      console.error('❌ FINISH ATTEMPT Error:', error);
      throw error;
    }
  }

  /**
   * Calculate time remaining based on deadline
   */
  static getTimeRemaining(deadline: string): number {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiffMs = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(timeDiffMs / 1000)); // Convert to seconds
  }

  /**
   * Check if time is up
   */
  static isTimeUp(deadline: string): boolean {
    return this.getTimeRemaining(deadline) === 0;
  }

  /**
   * Format time remaining as MM:SS
   */
  static formatTimeRemaining(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
}
