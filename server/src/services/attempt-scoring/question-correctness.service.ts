import { Injectable, Logger } from '@nestjs/common';
import { Answer } from '../../database/entities/answers/answer.interface';

@Injectable()
export class QuestionCorrectnessService {
  private readonly logger = new Logger(QuestionCorrectnessService.name);

  constructor() {}

  /**
   * Main method to check answer correctness based on question type
   */
  checkAnswerCorrectness(
    userAnswer: Answer,
    correctAnswer: any,
    questionType: string,
  ): boolean {
    try {
      this.logger.debug(
        `🔍 Checking answer for question type: ${questionType}`,
      );

      switch (questionType) {
        case 'fill-blank':
          return this.checkFillBlankAnswer(userAnswer, correctAnswer);

        case 'tracklist-order':
          return this.checkTracklistOrderAnswer(userAnswer, correctAnswer);

        case 'timeline-order':
          return this.checkTimelineOrderAnswer(userAnswer, correctAnswer);

        case 'speed-tap':
          return this.checkSpeedTapAnswer(userAnswer, correctAnswer);

        case 'song-album-match':
          return this.checkSongAlbumMatchAnswer(userAnswer, correctAnswer);

        case 'popularity-match':
          return this.checkPopularityMatchAnswer(userAnswer, correctAnswer);

        case 'odd-one-out':
          return this.checkOddOneOutAnswer(userAnswer, correctAnswer);

        case 'guess-by-lyric':
          return this.checkGuessByLyricAnswer(userAnswer, correctAnswer);

        case 'album-year-guess':
          return this.checkAlbumYearGuessAnswer(userAnswer, correctAnswer);

        case 'life-trivia':
          return this.checkLifeTriviaAnswer(userAnswer, correctAnswer);

        // Add more question types as needed
        default:
          // Fallback to basic comparison for unknown types
          this.logger.warn(
            `⚠️ Unknown question type: ${questionType}, using basic comparison`,
          );
          return this.checkBasicAnswer(userAnswer, correctAnswer);
      }
    } catch (error) {
      this.logger.error(
        `❌ Error checking answer for type ${questionType}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Basic answer check (fallback for unknown question types)
   */
  private checkBasicAnswer(userAnswer: any, correctAnswer: any): boolean {
    try {
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } catch {
      return false;
    }
  }

  /**
   * Fill in the blank - check choice index
   */
  private checkFillBlankAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking fill-blank answer');
    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }

  /**
   * Tracklist order - check array order
   */
  private checkTracklistOrderAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
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

  /**
   * Timeline order - check array order (similar to tracklist)
   */
  private checkTimelineOrderAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
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

  /**
   * Speed tap - check final tap counts or score
   */
  private checkSpeedTapAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking speed-tap answer');

    const userSummary = userAnswer?.answer?.clientSummary;
    const correctSummary = correctAnswer?.answer?.clientSummary;

    if (!userSummary || !correctSummary) {
      return false;
    }

    // Check if user achieved the required correct taps
    return userSummary.correct >= correctSummary.correct;
  }

  /**
   * Song-Album match - check matching pairs
   */
  private checkSongAlbumMatchAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
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

  /**
   * Popularity match - check ranking order
   */
  private checkPopularityMatchAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    this.logger.debug('🔍 Checking popularity-match answer');

    const userRanking = userAnswer?.answer?.ranking;
    const correctRanking = correctAnswer?.answer?.ranking;

    if (!Array.isArray(userRanking) || !Array.isArray(correctRanking)) {
      return false;
    }

    return (
      userRanking.length === correctRanking.length &&
      userRanking.every((item, index) => item === correctRanking[index])
    );
  }

  /**
   * Odd one out - check selected item
   */
  private checkOddOneOutAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking odd-one-out answer');

    return (
      userAnswer?.answer?.selectedItem === correctAnswer?.answer?.selectedItem
    );
  }

  /**
   * Guess by lyric - check selected choice
   */
  private checkGuessByLyricAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    this.logger.debug('🔍 Checking guess-by-lyric answer');

    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }

  /**
   * Album year guess - check if within acceptable range
   */
  private checkAlbumYearGuessAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    this.logger.debug('🔍 Checking album-year-guess answer');

    const userYear = userAnswer?.answer?.year;
    const correctYear = correctAnswer?.answer?.year;
    const tolerance = correctAnswer?.answer?.tolerance || 0;

    if (typeof userYear !== 'number' || typeof correctYear !== 'number') {
      return false;
    }

    return Math.abs(userYear - correctYear) <= tolerance;
  }

  /**
   * Life trivia - check choice index
   */
  private checkLifeTriviaAnswer(userAnswer: any, correctAnswer: any): boolean {
    this.logger.debug('🔍 Checking life-trivia answer');

    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }
}
