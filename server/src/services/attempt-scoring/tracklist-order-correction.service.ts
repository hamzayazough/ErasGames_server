import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TracklistOrderCorrectionService {
  private readonly logger = new Logger(TracklistOrderCorrectionService.name);

  /**
   * Tracklist order - check array order
   */
  checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking tracklist-order answer');

    const userTracks = userAnswer?.answer?.orderedTracks;
    const correctTracks = correctAnswer?.answer?.orderedTracks;

    if (!Array.isArray(userTracks) || !Array.isArray(correctTracks)) {
      return false;
    }

    if (userTracks.length !== correctTracks.length) {
      return false;
    }

    return userTracks.every((track, index) => track === correctTracks[index]);
  }
}
