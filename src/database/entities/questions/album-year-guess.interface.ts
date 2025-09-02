import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: 'album_year_guess';
  prompt: {
    task: string;
    album: string;
  };
  choices: string[];
  correct: SingleChoiceCorrect;
}
/**
 * Album Year Guess: Player is shown an album and must select the correct release year from multiple choices.
 */
