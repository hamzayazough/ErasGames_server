import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';
import { StringChoice } from '../choices/string-choice.type';

export interface TracklistOrderQuestion extends BasicQuestion {
  questionType: 'tracklist_order';
  prompt: {
    task: string;
    album: string;
    tracks: string[];
  };
  choices: StringChoice[];
  correct: StringArrayCorrect;
}
/**
 * Tracklist Order: Player arranges tracks in the correct order for a given album.
 */
