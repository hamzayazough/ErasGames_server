import {AnyQuestion} from '../../../../shared/interfaces/questions/any-question.type';

// Answer type definitions for each question type
export interface SingleChoiceAnswer {
  choiceIndex: number;
}

export interface MatchingAnswer {
  [leftItem: string]: string; // maps left item to right item
}

export interface OrderingAnswer {
  orderedItems: string[];
}

export interface SpeedTapAnswer {
  roundSeconds: number;
  events: Array<{
    ts: number;
    option: string;
    action: 'tap' | 'undo';
  }>;
  clientSummary?: {
    taps: number;
    correct: number;
    wrong: number;
  };
}

// Union type for all possible answers
export type QuestionAnswer =
  | SingleChoiceAnswer
  | MatchingAnswer
  | OrderingAnswer
  | SpeedTapAnswer;

// Utility functions for answer handling
export class AnswerHandler {
  static getDefaultAnswer(question: AnyQuestion): QuestionAnswer | null {
    switch (question.questionType) {
      case 'album-year-guess':
      case 'fill-blank':
      case 'guess-by-lyric':
      case 'odd-one-out':
      case 'ai-visual':
      case 'sound-alike-snippet':
      case 'mood-match':
      case 'inspiration-map':
      case 'life-trivia':
      case 'longest-song':
      case 'outfit-era':
      case 'reverse-audio':
      case 'one-second':
        return {choiceIndex: -1};

      case 'song-album-match':
      case 'lyric-mashup':
        return {};

      case 'timeline-order':
        return {orderedItems: (question as any).prompt?.items || []};

      case 'popularity-match':
        return {
          orderedItems:
            (question as any).choices?.map(
              (c: any, i: number) => `choice${i}`,
            ) || [],
        };

      case 'tracklist-order':
        return {orderedItems: (question as any).prompt?.tracks || []};

      case 'speed-tap':
        return {
          roundSeconds: (question as any).prompt?.roundSeconds || 30,
          events: [],
          clientSummary: {taps: 0, correct: 0, wrong: 0},
        };

      default:
        return null;
    }
  }

  static isAnswerComplete(
    question: AnyQuestion,
    answer: QuestionAnswer | null,
  ): boolean {
    if (!answer) return false;

    switch (question.questionType) {
      case 'album-year-guess':
      case 'fill-blank':
      case 'guess-by-lyric':
      case 'odd-one-out':
      case 'ai-visual':
      case 'sound-alike-snippet':
      case 'mood-match':
      case 'inspiration-map':
      case 'life-trivia':
      case 'longest-song':
      case 'outfit-era':
      case 'reverse-audio':
      case 'one-second':
        return 'choiceIndex' in answer && answer.choiceIndex >= 0;

      case 'song-album-match':
      case 'lyric-mashup':
        return Object.keys(answer).length > 0;

      case 'timeline-order':
      case 'popularity-match':
      case 'tracklist-order':
        return 'orderedItems' in answer && answer.orderedItems.length > 0;

      case 'speed-tap':
        return 'events' in answer && answer.events.length > 0;

      default:
        return false;
    }
  }

  static validateAnswer(
    question: AnyQuestion,
    answer: QuestionAnswer,
  ): boolean {
    if (!answer) return false;

    switch (question.questionType) {
      case 'album-year-guess':
      case 'fill-blank':
      case 'guess-by-lyric':
      case 'odd-one-out':
      case 'ai-visual':
      case 'sound-alike-snippet':
      case 'mood-match':
      case 'inspiration-map':
      case 'life-trivia':
      case 'longest-song':
      case 'outfit-era':
      case 'reverse-audio':
      case 'one-second':
        if (!('choiceIndex' in answer)) return false;
        const maxChoices = question.choices?.length || 0;
        return answer.choiceIndex >= 0 && answer.choiceIndex < maxChoices;

      case 'song-album-match':
        if (!('orderedItems' in answer) && typeof answer !== 'object')
          return false;
        // Additional validation could check if all left items are matched
        return true;

      case 'lyric-mashup':
        if (typeof answer !== 'object') return false;
        return true;

      case 'timeline-order':
      case 'tracklist-order':
        if (!('orderedItems' in answer)) return false;
        return Array.isArray(answer.orderedItems);

      case 'popularity-match':
        if (!('orderedItems' in answer)) return false;
        return Array.isArray(answer.orderedItems);

      case 'speed-tap':
        if (!('events' in answer)) return false;
        return Array.isArray(answer.events);

      default:
        return false;
    }
  }

  static formatAnswerForSubmission(
    question: AnyQuestion,
    answer: QuestionAnswer,
  ): any {
    // This formats the answer for API submission based on the response interfaces
    switch (question.questionType) {
      case 'album-year-guess':
      case 'fill-blank':
      case 'guess-by-lyric':
      case 'odd-one-out':
      case 'ai-visual':
      case 'sound-alike-snippet':
      case 'mood-match':
      case 'inspiration-map':
      case 'life-trivia':
      case 'longest-song':
      case 'outfit-era':
      case 'reverse-audio':
      case 'one-second':
        return answer;

      case 'song-album-match':
      case 'lyric-mashup':
        return answer;

      case 'timeline-order':
        return answer;

      case 'popularity-match':
        return {orderedChoices: (answer as OrderingAnswer).orderedItems};

      case 'tracklist-order':
        return {orderedTracks: (answer as OrderingAnswer).orderedItems};

      case 'speed-tap':
        return answer;

      default:
        return answer;
    }
  }
}
