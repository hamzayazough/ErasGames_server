/**
 * Entity representing a daily quiz event, including drop time, mode, theme plan, and CDN template info.
 */

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { DailyQuizMode } from '../enums/daily-quiz-mode.enum';

@Entity('daily_quiz')
export class DailyQuiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz', name: 'drop_at_utc' })
  dropAtUTC!: Date;

  /**
   * The mode of the daily quiz: 'mix', 'spotlight', or 'event'.
   * - mix: a varied set of themes and question types
   * - spotlight: focused on a single theme or topic
   * - event: special event or themed quiz
   */
  @Column({ type: 'enum', enum: DailyQuizMode })
  mode!: DailyQuizMode;

  /**
   * themePlanJSON stores the plan or configuration for the quiz's themes on a given day.
   * Example contents:
   * {
   *   "themes": ["lyrics", "timeline", "aesthetic"],
   *   "weights": { "lyrics": 2, "timeline": 2, "aesthetic": 2 },
   *   "spotlight": "timeline",
   *   "event": "Speak Now Anniversary"
   * }
   * This allows flexible daily modes (mix, spotlight, event) and stores structured theme-related data for each quiz instance.
   */
  @Column({ type: 'jsonb', default: () => "'{}'", name: 'theme_plan_json' })
  themePlanJSON!: Record<string, any>;

  @Column({ type: 'int', name: 'template_version' })
  templateVersion!: number;

  /**
   * templateCdnUrl stores the CDN URL for the precomputed, immutable quiz template JSON for this daily quiz.
   * The template contains the quiz questions (without answers), metadata, and is versioned for cache busting.
   * Example: https://cdn.example.com/quiz/2025-09-01/v4.json
   * This allows clients to fetch the quiz content efficiently and ensures all players in a region get the same set.
   */
  @Column({ type: 'varchar', length: 512, name: 'template_cdn_url' })
  templateCdnUrl!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
