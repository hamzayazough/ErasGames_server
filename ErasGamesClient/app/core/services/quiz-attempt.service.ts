/**
 * Quiz Attempt Service
 * Handles API calls for starting, submitting, and tracking quiz attempts
 */

const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator IP for localhost

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
   * Start a new quiz attempt
   */
  static async startAttempt(): Promise<QuizAttempt> {
    console.log(
      '🚀 STARTING QUIZ ATTEMPT - Making API call to:',
      `${API_BASE_URL}/attempts/start`,
    );

    try {
      // Get today's date in local format for the request
      const today = new Date();
      const localDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      console.log('📅 Using local date:', localDate);

      const response = await fetch(`${API_BASE_URL}/attempts/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localDate,
          userId: 'demo-user-id', // Using demo user for testing
        }),
      });

      console.log('📡 START ATTEMPT Response Status:', response.status);
      console.log('📡 START ATTEMPT Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ START ATTEMPT Failed - Response:', errorText);
        throw new Error(
          `Failed to start quiz attempt: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
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
    console.log(
      '📝 SUBMITTING ANSWER - Making API call to:',
      `${API_BASE_URL}/attempts/${attemptId}/answer`,
    );
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

      const response = await fetch(
        `${API_BASE_URL}/attempts/${attemptId}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId,
            answer,
            idempotencyKey,
            timeSpentMs,
          }),
        },
      );

      console.log('📡 SUBMIT ANSWER Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SUBMIT ANSWER Failed - Response:', errorText);
        throw new Error(
          `Failed to submit answer: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
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
    console.log(
      '🏁 FINISHING QUIZ ATTEMPT - Making API call to:',
      `${API_BASE_URL}/attempts/${attemptId}/finish`,
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/attempts/${attemptId}/finish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('📡 FINISH ATTEMPT Response Status:', response.status);
      console.log('📡 FINISH ATTEMPT Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ FINISH ATTEMPT Failed - Response:', errorText);
        throw new Error(
          `Failed to finish quiz attempt: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
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
