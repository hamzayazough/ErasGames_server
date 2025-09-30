import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from './season.entity';
import { User } from './user.entity';
import { DailyQuiz } from './daily-quiz.entity';
import { Attempt } from './attempt.entity';

/**
 * DailySeasonProgress entity
 *
 * Tracks daily progress for each user within a season.
 * Records quiz completion, points earned, streaks, and performance.
 */
@Entity('daily_season_progress')
@Index('idx_daily_season_progress_season_user', ['season', 'user'])
@Index('idx_daily_season_progress_date', ['quizDate'])
@Index('idx_daily_season_progress_streak', ['user', 'streakDay'])
@Index('uniq_daily_season_progress', ['season', 'user', 'quizDate'], {
  unique: true,
})
export class DailySeasonProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relationships
  @ManyToOne(() => Season, (season) => season.dailyProgress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'season_id' })
  season!: Season;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'quiz_date', type: 'date' })
  quizDate!: string; // The local date of the quiz (YYYY-MM-DD)

  // Quiz references (optional, may be null if quiz/attempt deleted)
  @ManyToOne(() => DailyQuiz, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'daily_quiz_id' })
  dailyQuiz!: DailyQuiz | null;

  @ManyToOne(() => Attempt, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'attempt_id' })
  attempt!: Attempt | null;

  // Daily performance
  @Column({ name: 'points_earned', type: 'integer', default: 0 })
  pointsEarned!: number;

  @Column({ name: 'is_perfect_score', type: 'boolean', default: false })
  isPerfectScore!: boolean;

  // Streak tracking
  @Column({ name: 'streak_day', type: 'integer', default: 0 })
  streakDay!: number; // 1, 2, 3, etc. (0 if streak broken)

  // Timing
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  // Audit
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // Computed properties
  get isStreakDay(): boolean {
    return this.streakDay > 0;
  }

  get daysSinceQuiz(): number | null {
    if (!this.completedAt) return null;

    const today = new Date();
    const completed = new Date(this.completedAt);
    return Math.floor(
      (today.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  get performanceGrade(): 'A+' | 'A' | 'B' | 'C' | 'F' {
    if (this.pointsEarned === 0) return 'F';

    const percentage = (this.pointsEarned / 100) * 100; // Assuming max 100 points

    if (this.isPerfectScore) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    return 'F';
  }
}
