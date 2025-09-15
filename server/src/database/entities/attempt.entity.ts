/**
 * Entity representing a user's attempt at a daily quiz, including answers, timing, and scoring breakdown.
 */
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DailyQuiz } from './daily-quiz.entity';
import { Answer } from './answers/answer.interface';

@Entity('attempt')
@Index(['user', 'dailyQuiz'], { unique: true })
export class Attempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => DailyQuiz, (quiz) => quiz.id, { onDelete: 'CASCADE' })
  dailyQuiz!: DailyQuiz;

  @Column({ type: 'timestamptz' })
  startAt!: Date;

  @Column({ type: 'timestamptz' })
  deadline!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  answersJSON!: Answer[];

  @Column({ type: 'int', default: 0 })
  accPoints!: number;

  @Column({ type: 'int', default: 0 })
  speedSec!: number;

  @Column({ type: 'int', default: 0 })
  earlySec!: number;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
