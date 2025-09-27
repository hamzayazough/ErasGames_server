import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptAnswer } from '../../database/entities/attempt-answer.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Attempt } from '../../database/entities/attempt.entity';
import { QuestionCorrectnessService } from './question-correctness.service';
import { Difficulty } from '../../database/enums/question.enums';

export interface ScoreCalculationResult {
  score: number;
  breakdown: {
    base: number;
    questionPoints: number;
    speedMultiplier: number;
    earlyMultiplier: number;
    totalQuestionPoints: number;
    unusedSeconds: number;
    startDelayMinutes: number;
    minutesEarly: number;
  };
  accPoints: number;
  finishTimeSec: number;
  questions: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpentMs: number;
    accuracyPoints: number;
    difficulty: string;
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

    // New scoring system: 100 base + question points + speed multiplier + early bonus
    let questionPoints = 0;
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpentMs: number;
      accuracyPoints: number;
      difficulty: string;
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
          // Points based on difficulty: Easy=200, Medium=500, Hard=1000
          switch (quizQuestion.question.difficulty) {
            case Difficulty.EASY:
              accuracyPoints = 200;
              break;
            case Difficulty.MEDIUM:
              accuracyPoints = 500;
              break;
            case Difficulty.HARD:
              accuracyPoints = 1000;
              break;
            default:
              accuracyPoints = 200; // fallback to easy
          }
          questionPoints += accuracyPoints;
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
        timeSpentMs: avgTimePerQuestionMs,
        accuracyPoints,
        difficulty: quizQuestion.question.difficulty,
      });
    }

    // Calculate speed multiplier: Each unused second adds to multiplier
    const unusedSeconds = Math.max(0, 60 - finishTimeSec);
    const speedMultiplier = 1 + unusedSeconds * 0.05; // 5% bonus per unused second

    // Calculate early starter multiplier: +2% bonus per minute early (within 60-minute window)
    const quizDropTime = attempt.dailyQuiz.dropAtUTC;
    const startDelay =
      (attempt.startAt.getTime() - quizDropTime.getTime()) / 1000; // seconds after drop
    const startDelayMinutes = Math.max(0, Math.floor(startDelay / 60)); // minutes after drop
    const maxDelayMinutes = 60; // 60 minutes window
    const minutesEarly = Math.max(0, maxDelayMinutes - startDelayMinutes); // how many minutes early
    const earlyMultiplier = 1 + minutesEarly * 0.02; // 2% bonus per minute early (1.0x to 2.2x)

    // Final score calculation
    const basePoints = 100;
    const totalQuestionPoints = Math.round(
      questionPoints * speedMultiplier * earlyMultiplier,
    );
    const score = basePoints + totalQuestionPoints;

    return {
      score,
      breakdown: {
        base: basePoints,
        questionPoints: questionPoints,
        speedMultiplier: Math.round(speedMultiplier * 100) / 100,
        earlyMultiplier: Math.round(earlyMultiplier * 100) / 100,
        totalQuestionPoints: totalQuestionPoints,
        unusedSeconds: unusedSeconds,
        startDelayMinutes: startDelayMinutes,
        minutesEarly: minutesEarly,
      },
      accPoints: questionPoints, // Raw question points before multiplier
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
      difficulty: 'unknown', // We don't store difficulty in answer, so use fallback
    }));

    // Reconstruct breakdown from stored values (approximation since we store final result)
    const basePoints = 100;
    const questionPoints = attempt.accPoints; // Raw question points
    const unusedSeconds = Math.max(0, 60 - attempt.speedSec);
    const speedMultiplier = 1 + unusedSeconds * 0.05;

    // Approximate early multiplier from remaining score
    const totalQuestionPoints = attempt.score - basePoints;
    const expectedWithSpeedOnly = Math.round(questionPoints * speedMultiplier);
    const earlyMultiplier =
      expectedWithSpeedOnly > 0
        ? totalQuestionPoints / expectedWithSpeedOnly
        : 1.0;

    return {
      score: attempt.score,
      breakdown: {
        base: basePoints,
        questionPoints: questionPoints,
        speedMultiplier: Math.round(speedMultiplier * 100) / 100,
        earlyMultiplier: Math.round(earlyMultiplier * 100) / 100,
        totalQuestionPoints: totalQuestionPoints,
        unusedSeconds: unusedSeconds,
        startDelayMinutes: 0, // Can't reconstruct this from stored data
        minutesEarly: 0, // Can't reconstruct this from stored data
      },
      accPoints: attempt.accPoints,
      finishTimeSec: attempt.speedSec,
      questions: questionResults,
    };
  }
}
