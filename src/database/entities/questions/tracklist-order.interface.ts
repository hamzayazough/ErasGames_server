import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';

export interface TracklistOrderQuestion extends BasicQuestion {
  questionType: 'tracklist_order';
  prompt: {
    task: string;
    album: string;
    tracks: string[];
  };
  correct: StringArrayCorrect;
}
/**
 * Tracklist Order: Player arranges tracks in the correct order for a given album.
 */
