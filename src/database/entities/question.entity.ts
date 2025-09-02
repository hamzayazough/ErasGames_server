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
  themesJSON!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  subjectsJSON!: string[];

  @Column({ type: 'jsonb' })
  promptJSON!: any;

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
