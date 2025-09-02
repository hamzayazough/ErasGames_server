import { BasicAnswer } from './basic-answer.interface';

export interface AlbumYearGuessAnswer extends BasicAnswer {
  questionType: 'album_year_guess';
  answer: { choiceIndex: number };
}
