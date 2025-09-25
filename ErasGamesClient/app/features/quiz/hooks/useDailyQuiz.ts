import {useState, useEffect, useCallback, useRef} from 'react';
import {
  dailyQuizService,
  NextQuizDropResponse,
  TodaysQuizResponse,
  QuizTemplate,
  DailyQuizError,
  DailyQuizErrorType,
  QuizResult,
} from '../../../core/api/daily-quiz';

// Hook for countdown timer
export function useQuizCountdown() {
  const [dropData, setDropData] = useState<NextQuizDropResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({hours: 0, minutes: 0, seconds: 0});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDropTime = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dailyQuizService.getNextQuizDropTime();
      setDropData(data);
    } catch (err) {
      console.error('Failed to fetch drop time:', err);
      if (err instanceof DailyQuizError) {
        setError(err.message);
      } else {
        setError('Failed to load countdown');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCountdown = useCallback(() => {
    if (!dropData) return;

    const now = new Date();
    const dropTime = new Date(dropData.nextDropTime);
    const diff = Math.max(0, dropTime.getTime() - now.getTime());

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft({hours, minutes, seconds});

    // If countdown reached zero, refetch drop data
    if (diff === 0) {
      setTimeout(fetchDropTime, 1000);
    }
  }, [dropData, fetchDropTime]);

  useEffect(() => {
    fetchDropTime();
  }, [fetchDropTime]);

  useEffect(() => {
    if (dropData) {
      updateCountdown();
      intervalRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dropData, updateCountdown]);

  return {
    dropData,
    timeLeft,
    isLoading,
    error,
    refetch: fetchDropTime,
    isToday: dropData?.isToday || false,
    hasDropped:
      timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0,
  };
}

// Hook for quiz availability check
export function useQuizAvailability() {
  const [canStart, setCanStart] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [nextAvailableTime, setNextAvailableTime] = useState<string | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = useCallback(async () => {
    try {
      setIsChecking(true);
      const result = await dailyQuizService.canStartQuiz();
      setCanStart(result.canStart);
      setReason(result.reason || null);
      setNextAvailableTime(result.nextAvailableTime || null);
    } catch (err) {
      console.error('Error checking quiz availability:', err);
      setCanStart(false);
      setReason('Error checking availability');
      setNextAvailableTime(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    canStart,
    reason,
    nextAvailableTime,
    isChecking,
    recheck: checkAvailability,
  };
}

// Hook for quiz session management
export function useQuizSession() {
  const [quizInfo, setQuizInfo] = useState<TodaysQuizResponse | null>(null);
  const [template, setTemplate] = useState<QuizTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DailyQuizError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {quizInfo: info, template: temp} =
        await dailyQuizService.startQuizAttempt();
      setQuizInfo(info);
      setTemplate(temp);

      console.log('✅ Quiz session started');
    } catch (err) {
      console.error('Failed to start quiz:', err);
      if (err instanceof DailyQuizError) {
        setError(err);
      } else {
        setError(
          new DailyQuizError(
            'Failed to start quiz',
            DailyQuizErrorType.UNKNOWN_ERROR,
          ),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    (questionId: string, answer: string | number, timeSpent: number) => {
      try {
        dailyQuizService.submitAnswer(questionId, answer, timeSpent);
      } catch (err) {
        console.error('Failed to submit answer:', err);
      }
    },
    [],
  );

  const submitQuiz = useCallback(async (): Promise<QuizResult | null> => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await dailyQuizService.submitQuizAttempt();

      // Clear session after successful submission
      setQuizInfo(null);
      setTemplate(null);

      console.log('✅ Quiz submitted successfully');
      return result;
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      if (err instanceof DailyQuizError) {
        setError(err);
      } else {
        setError(
          new DailyQuizError(
            'Failed to submit quiz',
            DailyQuizErrorType.UNKNOWN_ERROR,
          ),
        );
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    dailyQuizService.clearCurrentSession();
    setQuizInfo(null);
    setTemplate(null);
    setError(null);
    console.log('🧹 Quiz session cleared');
  }, []);

  // Get current attempt info
  const currentAttempt = dailyQuizService.getCurrentAttempt();

  return {
    quizInfo,
    template,
    isLoading,
    error,
    isSubmitting,
    currentAttempt,
    startQuiz,
    submitAnswer,
    submitQuiz,
    clearSession,
    isActive: !!(quizInfo && template),
  };
}

// Hook for error handling with user-friendly messages
export function useDailyQuizErrorHandler() {
  const getErrorMessage = useCallback((error: DailyQuizError): string => {
    switch (error.type) {
      case DailyQuizErrorType.NOT_YET_AVAILABLE:
        return "Quiz hasn't started yet! Check back when the countdown ends.";
      case DailyQuizErrorType.WINDOW_EXPIRED:
        return "Sorry, today's quiz window has closed. Come back tomorrow!";
      case DailyQuizErrorType.TEMPLATE_NOT_READY:
        return 'Quiz is being prepared... Please try again in a few minutes.';
      case DailyQuizErrorType.NO_QUIZ_TODAY:
        return 'No quiz available today. Check back tomorrow!';
      case DailyQuizErrorType.NO_UPCOMING_QUIZ:
        return 'No upcoming quiz found. Please check back later.';
      case DailyQuizErrorType.ALREADY_ATTEMPTED:
        return "You've already completed today's quiz! Come back tomorrow for a new one.";
      case DailyQuizErrorType.NETWORK_ERROR:
        return 'Network connection failed. Please check your internet and try again.';
      case DailyQuizErrorType.CDN_ERROR:
        return 'Failed to load quiz content. Please try again.';
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }, []);

  const getRetryMessage = useCallback(
    (error: DailyQuizError): string | null => {
      if (error.retryAfter) {
        const minutes = Math.ceil(error.retryAfter / 60);
        return `Try again in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
      return null;
    },
    [],
  );

  const shouldShowRetry = useCallback((error: DailyQuizError): boolean => {
    return [
      DailyQuizErrorType.TEMPLATE_NOT_READY,
      DailyQuizErrorType.NETWORK_ERROR,
      DailyQuizErrorType.CDN_ERROR,
      DailyQuizErrorType.UNKNOWN_ERROR,
    ].includes(error.type);
  }, []);

  return {
    getErrorMessage,
    getRetryMessage,
    shouldShowRetry,
  };
}
