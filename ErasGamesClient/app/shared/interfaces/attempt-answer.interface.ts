import type {Answer} from './answers/answer.interface';

/**
 * Interface representing a single answer submission within an attempt.
 * Provides idempotency through the idempotencyKey field.
 */
export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerJSON: Answer;
  idempotencyKey: string;
  timeSpentMs: number;
  shuffleProof?: any;
  accuracyPoints: number;
  isCorrect: boolean;
  submittedAt: Date;
}
