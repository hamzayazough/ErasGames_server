/**
 * Interface representing a question included in a daily quiz,
 * with difficulty and type for fast lookup.
 */
export interface DailyQuizQuestion {
  id: string;
  dailyQuizId: string;
  questionId: string;
  difficulty: string;
  questionType: string;
}
