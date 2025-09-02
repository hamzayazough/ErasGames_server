import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediaRef } from './media/media-ref.interface';
import { Correct } from './corrects/correct.type';
import { Difficulty, QuestionType } from '../enums/question.enums';
import { DailyQuizQuestion } from './daily-quiz-question.entity';
import { Choice } from './choices/choice.type';
import type { AnyPrompt } from './prompts/any-prompt.type';
import { QuestionTheme } from '../enums/question-theme.enum';

@Entity('questions')
@Index('idx_question_lastused_diff', ['lastUsedAt', 'difficulty'])
@Index('idx_question_exposure', ['exposureCount'])
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: QuestionType })
  questionType!: QuestionType;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty!: Difficulty;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  themesJSON!: QuestionTheme[];

  /**
   * SUBJECTS EXPLANATION:
   *
   * The `subjectsJSON` array contains structured, queryable tags describing the main focus of each question.
   * These are used for filtering, analytics, anti-repeat logic, themed events, and leaderboards.
   *
   * Subjects should be granular and follow a `type:value` convention. Supported types include:
   *   - song:   e.g., "song:Love Story", "song:All Too Well"
   *   - album:  e.g., "album:1989", "album:Red"
   *   - era:    e.g., "era:Reputation", "era:Midnights"
   *   - tour:   e.g., "tour:Eras Tour", "tour:1989 World Tour"
   *   - theme:  e.g., "theme:lyrics", "theme:timeline", "theme:career"
   *   - person: e.g., "person:Jack Antonoff", "person:Joe Alwyn"
   *   - event:  e.g., "event:Grammy Awards", "event:Album Release"
   *   - misc:   e.g., "misc:easter-egg", "misc:fan-theory"
   *
   * Example:
   *   [
   *     "song:All Too Well",
   *     "album:Red",
   *     "era:Red",
   *     "theme:lyrics"
   *   ]
   *
   * This structure enables filtering, anti-repeat, themed quizzes, and subject-based leaderboards.
   */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  subjectsJSON!: string[];

  @Column({ type: 'jsonb' })
  promptJSON!: AnyPrompt;

  @Column({ type: 'jsonb', nullable: true })
  choicesJSON!: Choice[] | null;

  @Column({ type: 'jsonb', nullable: true })
  correctJSON!: Correct | null;

  @Column({ type: 'jsonb', nullable: true })
  mediaJSON!: MediaRef[] | null;

  @Column({ type: 'boolean', default: false })
  approved!: boolean;

  @Column({ type: 'boolean', default: false })
  disabled!: boolean;

  @Column({ type: 'int', default: 0 })
  exposureCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @OneToMany(() => DailyQuizQuestion, (dq) => dq.question)
  appearances!: DailyQuizQuestion[];
}
