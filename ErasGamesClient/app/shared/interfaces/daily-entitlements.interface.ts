/**
 * Interface representing per-user daily entitlements for subscriptions,
 * one-offs, and jitter fairness.
 */
export interface DailyEntitlements {
  userId: string;
  localDate: string;
  assignedJitterSec: number;
  earlyTimeMS: number;
  earlyTimeUsedMS: number;
  retriesGranted: number;
  retriesUsed: number;
  practiceGranted: boolean;
  practiceUsed: boolean;
  restartsGranted: number;
  restartsUsed: number;
  hintsGranted: number;
  hintsUsed: number;
  createdAt: Date;
}
