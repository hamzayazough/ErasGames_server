import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FillBlankCorrectionService {
  private readonly logger = new Logger(FillBlankCorrectionService.name);

  /**
   * Fill in the blank - check choice index
   */
  checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking fill-blank answer');

    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }
}
