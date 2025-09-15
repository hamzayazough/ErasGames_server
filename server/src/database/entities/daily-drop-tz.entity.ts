import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Check,
} from 'typeorm';

/**
 * DailyDropTZ entity
 *
 * Per-timezone daily drop scheduling for local-time evening windows.
 * Supports "Option A" per-TZ minute scheduling where all users in the same
 * timezone get the same communal drop minute within their evening window.
 *
 * KEY FEATURES:
 * - One row per timezone per local calendar date
 * - Stores chosen random minute within user-configurable evening window
 * - Handles DST transitions via IANA timezone identifiers
 * - Enables communal "same moment" experience for users in same TZ
 * - Supports admin visibility into drop scheduling across regions
 *
 * SCHEDULING PATTERNS:
 * - Pre-computed daily (T-24h): choose random minute per TZ
 * - Push dispatch (T-0): query by drop_at_utc for notification scheduling
 * - User queries: find drop time by local_date + user's TZ
 */
@Entity('daily_drop_tz')
@Index('idx_daily_drop_tz_date_tz', ['localDate', 'tz'], { unique: true })
@Index('idx_daily_drop_tz_date', ['localDate'])
@Index('idx_daily_drop_tz_tz', ['tz'])
@Index('idx_daily_drop_tz_drop_utc', ['dropAtUtc'])
@Check('ck_window_order', 'window_start < window_end')
@Check('ck_window_span', "window_end - window_start >= INTERVAL '3 hours'")
@Check(
  'ck_chosen_minute_in_window',
  'chosen_minute >= window_start AND chosen_minute <= window_end',
)
export class DailyDropTZ {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * The local calendar date for this drop (YYYY-MM-DD).
   * This is the date in the timezone specified by the tz column.
   */
  @Column({ type: 'date' })
  localDate!: string;

  /**
   * IANA timezone identifier (e.g., 'America/Toronto', 'Europe/London').
   * Used for DST-safe time calculations and user grouping.
   */
  @Column({ type: 'varchar', length: 64 })
  tz!: string;

  /**
   * Start of the user-configurable evening window (default 18:00).
   * Users can customize their preferred evening window within guardrails.
   */
  @Column({ type: 'time', default: '18:00:00' })
  windowStart!: string;

  /**
   * End of the user-configurable evening window (default 22:00).
   * Must be at least 3 hours after windowStart for fairness.
   */
  @Column({ type: 'time', default: '22:00:00' })
  windowEnd!: string;

  /**
   * The chosen random minute within the evening window for this TZ/date.
   * Stored as TIME for the local minute (e.g., '19:37:00').
   * All users in this timezone will get their quiz at this local time.
   */
  @Column({ type: 'time' })
  chosenMinute!: string;

  /**
   * Complete local timestamp when quiz becomes available.
   * Computed as: localDate + chosenMinute in the specified timezone.
   * Used for display purposes and local time calculations.
   */
  @Column({ type: 'timestamptz' })
  dropAtLocal!: Date;

  /**
   * UTC equivalent of dropAtLocal for easier server-side queries.
   * Used by push notification systems and job scheduling.
   * Handles DST transitions automatically via timezone conversion.
   */
  @Column({ type: 'timestamptz' })
  dropAtUtc!: Date;

  /** Creation timestamp for audit purposes. */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // Helper methods for common operations

  /**
   * Check if the drop has occurred (based on UTC time).
   */
  hasDropped(): boolean {
    return new Date() >= this.dropAtUtc;
  }

  /**
   * Get the join window end time (1 hour after drop).
   */
  getJoinWindowEnd(): Date {
    return new Date(this.dropAtUtc.getTime() + 60 * 60 * 1000);
  }

  /**
   * Check if we're currently in the join window.
   */
  isInJoinWindow(): boolean {
    const now = new Date();
    return now >= this.dropAtUtc && now <= this.getJoinWindowEnd();
  }

  /**
   * Get minutes until drop (negative if already dropped).
   */
  getMinutesUntilDrop(): number {
    return Math.round((this.dropAtUtc.getTime() - Date.now()) / (1000 * 60));
  }
}
