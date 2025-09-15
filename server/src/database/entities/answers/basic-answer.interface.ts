export interface BasicAnswer {
  questionId: string;
  questionType: string;
  timeSpentMs?: number;
  usedHint?: boolean;
  isRetry?: boolean;
  clientSentAt?: number;
  shuffleProof?: { seed?: string; optionOrderHash?: string };
  idempotencyKey?: string;
}
