import { BasicQuestion } from './basic-question.interface';

export interface TracklistOrderQuestion extends BasicQuestion {
  questionType: 'tracklist_order';
  prompt: {
    task: string;
    album: string;
    tracks: string[];
  };
  correct: string[];
}
/**
 * Tracklist Order: Player arranges tracks in the correct order for a given album.
 */
