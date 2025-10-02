import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SpeedTapCorrectionService {
  private readonly logger = new Logger(SpeedTapCorrectionService.name);

  /**
   * Speed tap - check final tap counts or score
   */
  checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking speed-tap answer');

    const userSummary = userAnswer?.answer?.clientSummary;
    const correctSummary = correctAnswer?.answer?.clientSummary;

    if (!userSummary || !correctSummary) {
      return false;
    }

    // Check if user achieved the required correct taps
    return userSummary.correct >= correctSummary.correct;
  }
}
