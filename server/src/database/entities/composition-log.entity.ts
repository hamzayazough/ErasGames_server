import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { DailyQuiz } from './daily-quiz.entity';
import { DailyQuizMode } from '../enums/daily-quiz-mode.enum';

/**
 * Entity for storing daily quiz composition logs
 * Used for monitoring, analytics, and troubleshooting
 */
@Entity('composition_logs')
@Index(['dailyQuiz'], { unique: true }) // One log per daily quiz
@Index(['createdAt'])
export class CompositionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => DailyQuiz, { onDelete: 'CASCADE' })
  dailyQuiz!: DailyQuiz;

  @Column({ type: 'timestamptz' })
  targetDate!: Date;

  @Column({ type: 'enum', enum: DailyQuizMode })
  mode!: DailyQuizMode;

  @Column({ name: 'theme_plan_json', type: 'jsonb' })
  themePlanJSON!: Record<string, any>;

  @Column({ name: 'selection_process_json', type: 'jsonb' })
  selectionProcessJSON!: Array<{
    difficulty: string;
    attempted: number;
    selected: number;
    relaxationLevel: number;
    issues: string[];
  }>;

  @Column({ name: 'final_selection_json', type: 'jsonb' })
  finalSelectionJSON!: {
    totalQuestions: number;
    difficultyActual: Record<string, number>;
    difficultyTarget: Record<string, number>;
    themeDistribution: Record<string, number>;
    averageExposure: number;
    oldestLastUsed: Date | null;
    newestLastUsed: Date | null;
  };

  @Column({ name: 'warnings_json', type: 'jsonb', default: () => "'[]'" })
  warningsJSON!: string[];

  @Column({ name: 'performance_json', type: 'jsonb' })
  performanceJSON!: {
    durationMs: number;
    dbQueries: number;
  };

  @Column({ type: 'boolean', default: false })
  hasErrors!: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Computed properties for easier access
  get averageExposure(): number {
    return this.finalSelectionJSON?.averageExposure || 0;
  }

  get relaxationLevel(): number {
    return Math.max(...this.selectionProcessJSON.map((p) => p.relaxationLevel));
  }

  get themeDistribution(): Record<string, number> {
    return this.finalSelectionJSON?.themeDistribution || {};
  }

  get warnings(): string[] {
    return this.warningsJSON || [];
  }
}
