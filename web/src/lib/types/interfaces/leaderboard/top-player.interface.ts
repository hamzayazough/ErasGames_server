/**
 * LeaderboardEntry interface
 * Represents a single leaderboard entry for a user in a snapshot.
 * Fields are frozen at snapshot time for historical accuracy.
 */
export interface LbEntry {
  userId: string;
  handle: string | null; // frozen at snapshot time (handle can change later)
  country: string | null; // ISO-2, if shareCountryOnLB = true when snapped
  score: number;
  rank: number; // 1-based
}

/**
 * Complete leaderboard snapshot JSON structure
 * Contains top entries, optional user info, and aggregate stats
 */
export interface LbTopJSON {
  // top N entries as captured at snapshot time
  top: LbEntry[];

  // optional meta for the current user (not necessary to fill in cron snapshot)
  me?: { userId: string; rank: number; score: number };

  // optional: per-bucket stats (ex: deciles, p95)
  stats?: {
    totalParticipants: number;
    mean?: number;
    median?: number;
    p95?: number;
  };
}
