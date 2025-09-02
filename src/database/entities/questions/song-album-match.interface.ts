import { BasicQuestion } from './basic-question.interface';
import { StringMapCorrect } from '../corrects/string-map-correct.interface';
import { SongAlbumMatchPrompt } from '../prompts/prompt-interfaces';

export interface SongAlbumMatchQuestion extends BasicQuestion {
  questionType: 'song_album_match';
  prompt: SongAlbumMatchPrompt;
  correct: StringMapCorrect;
}
/**
 * Song ↔ Album Match: Player matches each song to its correct album from two lists.
 */
