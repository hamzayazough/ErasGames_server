import { BasicQuestion } from './basic-question.interface';

export interface SongAlbumMatchQuestion extends BasicQuestion {
  questionType: 'song_album_match';
  prompt: {
    task: string;
    left: string[];
    right: string[];
  };
  correct: Record<string, string>;
}
/**
 * Song ↔ Album Match: Player matches each song to its correct album from two lists.
 */
