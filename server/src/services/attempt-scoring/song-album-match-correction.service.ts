import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SongAlbumMatchCorrectionService {
  private readonly logger = new Logger(SongAlbumMatchCorrectionService.name);

  /**
   * Song-Album match - check matching pairs
   */
  checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking song-album-match answer');

    const userMatches = userAnswer?.answer?.matches;
    const correctMatches = correctAnswer?.answer?.matches;

    if (!userMatches || !correctMatches) {
      return false;
    }

    // Check if all matches are correct
    return Object.keys(correctMatches).every(
      (songId) => userMatches[songId] === correctMatches[songId],
    );
  }
}
