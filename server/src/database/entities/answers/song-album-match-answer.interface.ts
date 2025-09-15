import { BasicAnswer } from './basic-answer.interface';

export interface SongAlbumMatchAnswer extends BasicAnswer {
  questionType: 'song_album_match';
  answer: Record<string, string>; // song → album
}
