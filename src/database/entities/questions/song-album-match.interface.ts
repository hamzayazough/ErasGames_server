import { BasicQuestion } from './basic-question.interface';
import { StringMapCorrect } from '../corrects/string-map-correct.interface';

export interface SongAlbumMatchQuestion extends BasicQuestion {
  questionType: 'song_album_match';
  prompt: {
    task: string;
    left: string[];
    right: string[];
  };
  correct: StringMapCorrect;
}
/**
 * Song ↔ Album Match: Player matches each song to its correct album from two lists.
 */
