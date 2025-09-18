/**
 * Entity representing a question included in a daily quiz, with difficulty and type for fast lookup.
 */
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { DailyQuiz } from './daily-quiz.entity';
import { Question } from './question.entity';

@Entity('daily_quiz_question')
@Index(['dailyQuiz', 'question'], { unique: true })
export class DailyQuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => DailyQuiz, (dq) => dq.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_quiz_id' })
  dailyQuiz!: DailyQuiz;

  @ManyToOne(() => Question, (q) => q.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  @Column({ type: 'varchar', length: 16 })
  difficulty!: string;

  @Column({ type: 'varchar', length: 32, name: 'question_type' })
  questionType!: string;
}
