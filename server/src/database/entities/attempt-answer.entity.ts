import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Attempt } from './attempt.entity';
import type { Answer } from './answers/answer.interface';

/**
 * Entity representing a single answer submission within an attempt.
 * Provides idempotency through the idempotencyKey field.
 */
@Entity('attempt_answer')
@Index(['attempt', 'questionId'], { unique: true })
export class AttemptAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Attempt, (attempt) => attempt.id, { onDelete: 'CASCADE' })
  attempt!: Attempt;

  @Column({ type: 'varchar', length: 255 })
  questionId!: string;

  @Column({ type: 'jsonb' })
  answerJSON!: Answer;

  @Column({ type: 'varchar', length: 255, unique: true })
  idempotencyKey!: string;

  @Column({ type: 'int', default: 0 })
  timeSpentMs!: number;

  @Column({ type: 'jsonb', nullable: true })
  shuffleProof!: any;

  @Column({ type: 'int', default: 0 })
  accuracyPoints!: number;

  @Column({ type: 'boolean', default: false })
  isCorrect!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  submittedAt!: Date;
}
