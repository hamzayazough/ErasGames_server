import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
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
  @JoinColumn({ name: 'attempt_id' })
  attempt!: Attempt;

  @Column({ name: 'question_id', type: 'varchar', length: 255 })
  questionId!: string;

  @Column({ name: 'answer_json', type: 'jsonb' })
  answerJSON!: Answer;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  idempotencyKey!: string;

  @Column({ name: 'time_spent_ms', type: 'int', default: 0 })
  timeSpentMs!: number;

  @Column({ name: 'shuffle_proof', type: 'jsonb', nullable: true })
  shuffleProof!: any;

  @Column({ name: 'accuracy_points', type: 'int', default: 0 })
  accuracyPoints!: number;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect!: boolean;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamptz' })
  submittedAt!: Date;
}
