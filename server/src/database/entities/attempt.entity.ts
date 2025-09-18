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
  JoinColumn,
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
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => DailyQuiz, (quiz) => quiz.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_quiz_id' })
  dailyQuiz!: DailyQuiz;

  @Column({ type: 'timestamptz', name: 'start_at' })
  startAt!: Date;

  @Column({ type: 'timestamptz' })
  deadline!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'finish_at' })
  finishAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'[]'", name: 'answers_json' })
  answersJSON!: Answer[];

  @Column({ type: 'int', default: 0, name: 'acc_points' })
  accPoints!: number;

  @Column({ type: 'int', default: 0, name: 'speed_sec' })
  speedSec!: number;

  @Column({ type: 'int', default: 0, name: 'early_sec' })
  earlySec!: number;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
