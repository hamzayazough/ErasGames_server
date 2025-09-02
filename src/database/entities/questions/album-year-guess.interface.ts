import { BasicQuestion } from './basic-question.interface';

export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: 'album_year_guess';
  prompt: {
    task: string;
    album: string;
  };
  choices: string[];
  correct: number;
}
/**
 * Album Year Guess: Player is shown an album and must select the correct release year from multiple choices.
 */
