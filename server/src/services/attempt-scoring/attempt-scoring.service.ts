import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptAnswer } from '../../database/entities/attempt-answer.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Attempt } from '../../database/entities/attempt.entity';
import { QuestionCorrectnessService } from './question-correctness.service';

export interface ScoreCalculationResult {
  score: number;
  breakdown: {
    base: number;
    accuracyBonus: number;
    speedBonus: number;
    earlyBonus: number;
  };
  accPoints: number;
  finishTimeSec: number;
  questions: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpentMs: number;
    accuracyPoints: number;
  }>;
}

@Injectable()
export class AttemptScoringService {
  private readonly logger = new Logger(AttemptScoringService.name);

  constructor(
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    private readonly questionCorrectnessService: QuestionCorrectnessService,
  ) {}

  /**
   * Calculate the final score for a completed attempt
   */
  async calculateScore(
    attempt: Attempt,
    answers: AttemptAnswer[],
    quizQuestions: DailyQuizQuestion[],
    finishTime: Date,
  ): Promise<ScoreCalculationResult> {
    // Calculate overall timing first
    const finishTimeSec = Math.round(
      (finishTime.getTime() - attempt.startAt.getTime()) / 1000,
    );
    const totalTimeMs = finishTime.getTime() - attempt.startAt.getTime();

    // Distribute time evenly across questions for display purposes
    const avgTimePerQuestionMs = Math.round(totalTimeMs / quizQuestions.length);

    this.logger.log(
      `📊 Quiz timing: Total ${finishTimeSec}s (${totalTimeMs}ms), Avg per question: ${avgTimePerQuestionMs}ms`,
    );

    // Calculate accuracy points
    let totalAccuracyPoints = 0;
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpentMs: number;
      accuracyPoints: number;
    }> = [];

    for (const quizQuestion of quizQuestions) {
      const answer = answers.find(
        (a) => a.questionId === quizQuestion.question.id,
      );
      let isCorrect = false;
      let accuracyPoints = 0;

      if (answer) {
        // Use question correctness service to check answer
        isCorrect = this.questionCorrectnessService.checkAnswerCorrectness(
          answer.answerJSON,
          quizQuestion.question.correctJSON,
          quizQuestion.question.questionType,
        );

        if (isCorrect) {
          // Base points per question (total 100 accuracy points possible, integer values)
          accuracyPoints = Math.round(100 / quizQuestions.length);
          totalAccuracyPoints += accuracyPoints;
        }

        // Update answer record with calculated timing and correctness
        answer.isCorrect = isCorrect;
        answer.accuracyPoints = accuracyPoints;
        answer.timeSpentMs = avgTimePerQuestionMs; // Use average time for display
        await this.attemptAnswerRepository.save(answer);
      }

      questionResults.push({
        questionId: quizQuestion.question.id,
        isCorrect,
        timeSpentMs: avgTimePerQuestionMs, // Use average time for display
        accuracyPoints,
      });
    }

    // Calculate score using the specified formula
    const base = 100;
    const accuracyBonus = 25 * (totalAccuracyPoints / 100); // Now out of 100 total accuracy points
    const speedBonus = Math.max(0, Math.min(25, 25 * (1 - finishTimeSec / 60))); // clamp 0..25
    const earlyBonus = 0; // Out of scope for MVP

    const score = Math.round(base + accuracyBonus + speedBonus + earlyBonus);

    return {
      score,
      breakdown: {
        base,
        accuracyBonus: Math.round(accuracyBonus * 100) / 100,
        speedBonus: Math.round(speedBonus * 100) / 100,
        earlyBonus,
      },
      accPoints: totalAccuracyPoints,
      finishTimeSec,
      questions: questionResults,
    };
  }

  /**
   * Recalculate score breakdown from stored attempt data (for idempotent requests)
   */
  getFinishedAttemptResult(
    attempt: Attempt,
    answers: AttemptAnswer[],
  ): ScoreCalculationResult {
    const questionResults = answers.map((answer) => ({
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
      timeSpentMs: answer.timeSpentMs,
      accuracyPoints: answer.accuracyPoints,
    }));

    // Recalculate breakdown from stored values
    const base = 100;
    const accuracyBonus = 25 * (attempt.accPoints / 100);
    const speedBonus = Math.max(
      0,
      Math.min(25, 25 * (1 - attempt.speedSec / 60)),
    );
    const earlyBonus = 0;

    return {
      score: attempt.score,
      breakdown: {
        base,
        accuracyBonus: Math.round(accuracyBonus * 100) / 100,
        speedBonus: Math.round(speedBonus * 100) / 100,
        earlyBonus,
      },
      accPoints: attempt.accPoints,
      finishTimeSec: attempt.speedSec,
      questions: questionResults,
    };
  }
}
