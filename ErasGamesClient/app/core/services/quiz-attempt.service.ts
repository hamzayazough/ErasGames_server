/**
 * Quiz Attempt Service
 * Handles API calls for starting, submitting, and tracking quiz attempts
 */

const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator IP for localhost

export interface QuizAttempt {
  success: boolean;
  attemptId: string;
  quizTemplateUrl: string;
  timeLimit: number; // in seconds
  startedAt: string;
}

export interface QuizSubmission {
  success: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: string;
}

export interface QuizStatus {
  attemptId: string;
  startedAt: string;
  submittedAt: string | null;
  timeRemaining: number; // in seconds
  isCompleted: boolean;
  isTimeUp: boolean;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export class QuizAttemptService {
  /**
   * Start a new quiz attempt
   */
  static async startAttempt(): Promise<QuizAttempt> {
    try {
      const response = await fetch(`${API_BASE_URL}/daily/attempt/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to start quiz attempt: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answers
   */
  static async submitAttempt(
    attemptId: string,
    answers: QuizAnswer[],
  ): Promise<QuizSubmission> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/daily/attempt/${attemptId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({answers}),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to submit quiz attempt: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Get quiz attempt status
   */
  static async getAttemptStatus(attemptId: string): Promise<QuizStatus> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/daily/attempt/${attemptId}/status`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get quiz status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting quiz status:', error);
      throw error;
    }
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
