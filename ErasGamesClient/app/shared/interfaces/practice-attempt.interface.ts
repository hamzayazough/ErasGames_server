import type {Answer} from './answers/answer.interface';

/**
 * Interface representing a user's practice attempt at a daily quiz
 * (unranked, for Premium users).
 */
export interface PracticeAttempt {
  id: string;
  userId: string;
  dailyQuizId: string;
  startAt: Date;
  finishAt: Date | null;
  answersJSON: Answer[];
  score: number;
  status: string;
  createdAt: Date;
}
