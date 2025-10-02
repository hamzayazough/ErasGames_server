import {httpService} from './http';

// Types for Daily Quiz API responses
export interface NextQuizDropResponse {
  nextDropTime: string; // UTC ISO string
  nextDropTimeLocal: string; // Toronto timezone ISO string
  localDate: string; // YYYY-MM-DD format
  tz: string; // "America/Toronto"
  isToday: boolean; // true if quiz drops today, false if tomorrow
  timeUntilDrop: number; // seconds until drop (for countdown)
}

export interface TodaysQuizResponse {
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
}

export interface QuizTemplate {
  id: string;
  mode: 'mix' | 'spotlight' | 'event';
  version: number;
  dropTime: string;
  metadata: {
    totalQuestions: number;
    estimatedDuration: number;
    themes: string[];
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  theme: string;
  prompt: string;
  choices?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  points: number;
  timeLimit: number; // seconds
}

export interface QuizAttempt {
  id?: string; // Server-generated attempt ID
  quizId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  answers: QuizAnswer[];
  status?: 'in_progress' | 'completed' | 'expired';
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
  timeSpent: number; // seconds
  answeredAt?: string; // ISO timestamp when answered
  isCorrect?: boolean; // Set after submission
  pointsEarned?: number; // Set after submission
}

export interface QuizResult {
  attemptId: string;
  quizId: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  rank?: number;
  percentile?: number;
  answers: QuizAnswer[]; // Includes correct answers and points earned
}

// Error types specific to Daily Quiz
export enum DailyQuizErrorType {
  NOT_YET_AVAILABLE = 'NOT_YET_AVAILABLE',
  WINDOW_EXPIRED = 'WINDOW_EXPIRED',
  TEMPLATE_NOT_READY = 'TEMPLATE_NOT_READY',
  NO_QUIZ_TODAY = 'NO_QUIZ_TODAY',
  NO_UPCOMING_QUIZ = 'NO_UPCOMING_QUIZ',
  ALREADY_ATTEMPTED = 'ALREADY_ATTEMPTED',
  ATTEMPT_EXPIRED = 'ATTEMPT_EXPIRED',
  ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND',
  SUBMISSION_FAILED = 'SUBMISSION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CDN_ERROR = 'CDN_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class DailyQuizError extends Error {
  type: DailyQuizErrorType;
  statusCode?: number;
  retryAfter?: number; // seconds until can retry

  constructor(
    message: string,
    type: DailyQuizErrorType,
    statusCode?: number,
    retryAfter?: number,
  ) {
    super(message);
    this.name = 'DailyQuizError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

export class DailyQuizService {
  private static instance: DailyQuizService;
  private currentQuizTemplate: QuizTemplate | null = null;
  private currentAttempt: QuizAttempt | null = null;

  public static getInstance(): DailyQuizService {
    if (!DailyQuizService.instance) {
      DailyQuizService.instance = new DailyQuizService();
    }
    return DailyQuizService.instance;
  }

  /**
   * Get next quiz drop time for countdown display
   */
  async getNextQuizDropTime(): Promise<NextQuizDropResponse> {
    try {
      console.log('🕐 Fetching next quiz drop time...');

      const response = await httpService.get<NextQuizDropResponse>(
        '/daily/next',
      );

      console.log('✅ Next quiz drop time fetched:', {
        isToday: response.isToday,
        dropTime: response.nextDropTimeLocal,
        timeUntilDrop: `${Math.floor(
          response.timeUntilDrop / 3600,
        )}h ${Math.floor((response.timeUntilDrop % 3600) / 60)}m`,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch next quiz drop time:', error);

      if (error.status === 404) {
        throw new DailyQuizError(
          'No upcoming quiz found',
          DailyQuizErrorType.NO_UPCOMING_QUIZ,
          404,
        );
      }

      throw this.handleApiError(error);
    }
  }

  /**
   * Get today's quiz (only available during the 1-hour window)
   */
  async getTodaysQuiz(
    suppressNotifications = false,
  ): Promise<TodaysQuizResponse> {
    try {
      if (!suppressNotifications) {
        console.log("📋 Fetching today's quiz...");
      }

      const response = await httpService.get<TodaysQuizResponse>('/daily');

      if (!suppressNotifications) {
        console.log("✅ Today's quiz fetched:", {
          quizId: response.localDate,
          templateUrl: response.templateUrl,
          windowEnd: response.joinWindowEndsAtLocal,
        });
      }

      return response;
    } catch (error: any) {
      if (!suppressNotifications) {
        console.error("❌ Failed to fetch today's quiz:", error);
      }

      // Handle specific HTTP status codes
      switch (error.status) {
        case 404:
          throw new DailyQuizError(
            'No daily quiz available for today',
            DailyQuizErrorType.NO_QUIZ_TODAY,
            404,
          );
        case 403:
          throw new DailyQuizError(
            error.message || 'Daily quiz is not yet available',
            DailyQuizErrorType.NOT_YET_AVAILABLE,
            403,
          );
        case 410:
          // For expected window expiration, create a "silent" error when suppressNotifications is true
          const windowExpiredError = new DailyQuizError(
            error.message || 'Daily quiz window has expired',
            DailyQuizErrorType.WINDOW_EXPIRED,
            410,
          );
          // Mark as silent to prevent global error handlers from showing notifications
          if (suppressNotifications) {
            (windowExpiredError as any).silent = true;
          }
          throw windowExpiredError;
        case 503:
          throw new DailyQuizError(
            'Daily quiz template is not ready yet',
            DailyQuizErrorType.TEMPLATE_NOT_READY,
            503,
            300, // retry after 5 minutes
          );
        default:
          throw this.handleApiError(error);
      }
    }
  }

  /**
   * Fetch quiz template from CDN
   */
  async fetchQuizTemplate(templateUrl: string): Promise<QuizTemplate> {
    try {
      console.log('🌐 Fetching quiz template from CDN:', templateUrl);

      const response = await fetch(templateUrl, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(
          `CDN responded with ${response.status}: ${response.statusText}`,
        );
      }

      const template: QuizTemplate = await response.json();

      // Validate template structure
      if (
        !template.id ||
        !template.questions ||
        !Array.isArray(template.questions)
      ) {
        throw new Error('Invalid template format received from CDN');
      }

      console.log('✅ Quiz template fetched from CDN:', {
        quizId: template.id,
        questionsCount: template.questions.length,
        version: template.version,
      });

      // Cache the template
      this.currentQuizTemplate = template;

      return template;
    } catch (error: any) {
      console.error('❌ Failed to fetch quiz template from CDN:', error);

      if (error.name === 'AbortError') {
        throw new DailyQuizError(
          'CDN request timed out',
          DailyQuizErrorType.CDN_ERROR,
          408,
          60, // retry after 1 minute
        );
      }

      throw new DailyQuizError(
        error.message || 'Failed to load quiz content',
        DailyQuizErrorType.CDN_ERROR,
        0,
        30, // retry after 30 seconds
      );
    }
  }

  /**
   * Start a new quiz attempt (combines getting quiz info, fetching template, and creating server attempt)
   */
  async startQuizAttempt(): Promise<{
    quizInfo: TodaysQuizResponse;
    template: QuizTemplate;
    attempt: QuizAttempt;
  }> {
    try {
      console.log('🚀 Starting quiz attempt...');

      // First, get today's quiz info
      const quizInfo = await this.getTodaysQuiz();

      // Then fetch the template from CDN
      const template = await this.fetchQuizTemplate(quizInfo.templateUrl);

      // Create server-side attempt record
      const serverAttempt = await this.createQuizAttempt(template.id);

      // Initialize local attempt tracking
      this.currentAttempt = {
        id: serverAttempt.id,
        quizId: template.id,
        startTime: serverAttempt.startTime,
        answers: [],
        status: 'in_progress',
      };

      console.log('✅ Quiz attempt started successfully:', {
        attemptId: serverAttempt.id,
        quizId: template.id,
      });

      return {quizInfo, template, attempt: serverAttempt};
    } catch (error) {
      console.error('❌ Failed to start quiz attempt:', error);
      throw error; // Re-throw the specific error
    }
  }

  /**
   * Create a quiz attempt on the server
   */
  private async createQuizAttempt(quizId: string): Promise<QuizAttempt> {
    try {
      const response = await httpService.post<QuizAttempt>(
        '/quiz/attempt/start',
        {
          quizId,
        },
      );

      console.log('✅ Server quiz attempt created:', response.id);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create quiz attempt:', error);

      if (error.status === 409) {
        throw new DailyQuizError(
          'You have already attempted this quiz today',
          DailyQuizErrorType.ALREADY_ATTEMPTED,
          409,
        );
      }

      if (error.status === 403) {
        throw new DailyQuizError(
          'Quiz is not available for attempts',
          DailyQuizErrorType.NOT_YET_AVAILABLE,
          403,
        );
      }

      if (error.status === 401) {
        throw new DailyQuizError(
          'Please log in to attempt the quiz',
          DailyQuizErrorType.AUTHENTICATION_ERROR,
          401,
        );
      }

      throw this.handleApiError(error);
    }
  }

  /**
   * Submit an answer for the current attempt
   */
  submitAnswer(
    questionId: string,
    answer: string | number,
    timeSpent: number,
  ): void {
    if (!this.currentAttempt) {
      throw new DailyQuizError(
        'No active quiz attempt',
        DailyQuizErrorType.UNKNOWN_ERROR,
      );
    }

    // Remove any previous answer for this question
    this.currentAttempt.answers = this.currentAttempt.answers.filter(
      a => a.questionId !== questionId,
    );

    // Add the new answer with timestamp
    this.currentAttempt.answers.push({
      questionId,
      answer,
      timeSpent,
      answeredAt: new Date().toISOString(),
    });

    console.log(`📝 Answer submitted for question ${questionId}:`, {
      answer,
      timeSpent,
    });
  }

  /**
   * Get current attempt status from server
   */
  async getAttemptStatus(attemptId: string): Promise<QuizAttempt> {
    try {
      const response = await httpService.get<QuizAttempt>(
        `/quiz/attempt/${attemptId}`,
      );
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get attempt status:', error);

      if (error.status === 404) {
        throw new DailyQuizError(
          'Quiz attempt not found',
          DailyQuizErrorType.ATTEMPT_NOT_FOUND,
          404,
        );
      }

      if (error.status === 410) {
        throw new DailyQuizError(
          'Quiz attempt has expired',
          DailyQuizErrorType.ATTEMPT_EXPIRED,
          410,
        );
      }

      throw this.handleApiError(error);
    }
  }

  /**
   * Submit the complete quiz attempt
   */
  async submitQuizAttempt(): Promise<QuizResult> {
    if (!this.currentAttempt || !this.currentAttempt.id) {
      throw new DailyQuizError(
        'No active quiz attempt to submit',
        DailyQuizErrorType.UNKNOWN_ERROR,
      );
    }

    try {
      console.log('📤 Submitting quiz attempt:', this.currentAttempt.id);

      const result = await httpService.post<QuizResult>(
        `/quiz/attempt/${this.currentAttempt.id}/submit`,
        {
          answers: this.currentAttempt.answers,
          endTime: new Date().toISOString(),
        },
      );

      console.log('✅ Quiz attempt submitted successfully:', {
        attemptId: result.attemptId,
        score: result.score,
        maxScore: result.maxScore,
        correctAnswers: result.correctAnswers,
      });

      // Update current attempt status
      this.currentAttempt.status = 'completed';
      this.currentAttempt.endTime = result.completedAt;

      return result;
    } catch (error: any) {
      console.error('❌ Failed to submit quiz attempt:', error);

      if (error.status === 409) {
        throw new DailyQuizError(
          'Quiz attempt has already been submitted',
          DailyQuizErrorType.ALREADY_ATTEMPTED,
          409,
        );
      }

      if (error.status === 410) {
        throw new DailyQuizError(
          'Quiz attempt has expired',
          DailyQuizErrorType.ATTEMPT_EXPIRED,
          410,
        );
      }

      if (error.status === 404) {
        throw new DailyQuizError(
          'Quiz attempt not found',
          DailyQuizErrorType.ATTEMPT_NOT_FOUND,
          404,
        );
      }

      throw new DailyQuizError(
        error.message || 'Failed to submit quiz answers',
        DailyQuizErrorType.SUBMISSION_FAILED,
        error.status,
      );
    }
  }

  /**
   * Check if user can start a quiz right now
   */
  async canStartQuiz(): Promise<{
    canStart: boolean;
    reason?: string;
    nextAvailableTime?: string;
  }> {
    try {
      // Try to get today's quiz - suppress notifications for expected errors
      console.log('🔍 Checking if daily quiz is available...');
      await this.getTodaysQuiz(true); // suppressNotifications = true
      console.log('✅ Daily quiz is available and can be started');
      return {canStart: true};
    } catch (error) {
      if (error instanceof DailyQuizError) {
        // Handle expected error cases gracefully without showing notifications
        switch (error.type) {
          case DailyQuizErrorType.NOT_YET_AVAILABLE:
            console.log('⏰ Quiz not yet available');
            const nextDrop = await this.getNextQuizDropTime();
            return {
              canStart: false,
              reason: 'Quiz not yet available',
              nextAvailableTime: nextDrop.nextDropTime,
            };
          case DailyQuizErrorType.WINDOW_EXPIRED:
            console.log('⏰ Quiz window has expired');
            const tomorrow = await this.getNextQuizDropTime();
            return {
              canStart: false,
              reason: 'Quiz window expired',
              nextAvailableTime: tomorrow.nextDropTime,
            };
          case DailyQuizErrorType.TEMPLATE_NOT_READY:
            console.log('⏳ Quiz template is still preparing');
            return {
              canStart: false,
              reason: 'Quiz is preparing, try again in a few minutes',
            };
          case DailyQuizErrorType.NO_QUIZ_TODAY:
            console.log('❌ No quiz available today');
            return {
              canStart: false,
              reason: 'No quiz available today',
            };
          default:
            console.log('❌ Quiz availability check failed:', error.message);
            return {
              canStart: false,
              reason: error.message,
            };
        }
      }

      console.error('❌ Unknown error checking quiz availability:', error);
      return {
        canStart: false,
        reason: 'Unknown error occurred',
      };
    }
  }

  /**
   * Get current quiz attempt (if any)
   */
  getCurrentAttempt(): QuizAttempt | null {
    return this.currentAttempt;
  }

  /**
   * Get cached quiz template (if any)
   */
  getCurrentTemplate(): QuizTemplate | null {
    return this.currentQuizTemplate;
  }

  /**
   * Clear current attempt and template (for cleanup)
   */
  clearCurrentSession(): void {
    this.currentAttempt = null;
    this.currentQuizTemplate = null;
    console.log('🧹 Quiz session cleared');
  }

  /**
   * Handle API errors and convert to DailyQuizError
   */
  private handleApiError(error: any): DailyQuizError {
    if (error.status === 0) {
      return new DailyQuizError(
        'Network connection failed',
        DailyQuizErrorType.NETWORK_ERROR,
        0,
        30,
      );
    }

    return new DailyQuizError(
      error.message || 'An unexpected error occurred',
      DailyQuizErrorType.UNKNOWN_ERROR,
      error.status,
    );
  }
}

// Export singleton instance
export const dailyQuizService = DailyQuizService.getInstance();
