/**
 * Entity representing a user's practice attempt at a daily quiz (unranked, for Premium users).
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

@Entity('practice_attempt')
@Index(['user', 'dailyQuiz'])
export class PracticeAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => DailyQuiz, (quiz) => quiz.id, { onDelete: 'CASCADE' })
  dailyQuiz!: DailyQuiz;

  @Column({ type: 'timestamptz' })
  startAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  answersJSON!: any[];

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
