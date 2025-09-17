import type {Answer} from './answers/answer.interface';

/**
 * Interface representing a user's attempt at a daily quiz,
 * including answers, timing, and scoring breakdown.
 */
export interface Attempt {
  id: string;
  userId: string;
  dailyQuizId: string;
  startAt: Date;
  deadline: Date;
  finishAt: Date | null;
  answersJSON: Answer[];
  accPoints: number;
  speedSec: number;
  earlySec: number;
  score: number;
  status: string;
  createdAt: Date;
}
