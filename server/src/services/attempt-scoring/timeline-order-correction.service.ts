import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TimelineOrderCorrectionService {
  private readonly logger = new Logger(TimelineOrderCorrectionService.name);

  /**
   * Timeline order - check array order (similar to tracklist)
   */
  checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking timeline-order answer');

    const userOrder = userAnswer?.answer?.orderedItems;
    const correctOrder = correctAnswer?.answer?.orderedItems;

    if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) {
      return false;
    }

    return (
      userOrder.length === correctOrder.length &&
      userOrder.every((item, index) => item === correctOrder[index])
    );
  }
}
