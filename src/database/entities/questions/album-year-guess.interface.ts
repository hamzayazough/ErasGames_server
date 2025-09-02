import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: 'album_year_guess';
  prompt: {
    task: string;
    album: string;
  };
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Album Year Guess: Player is shown an album and must select the correct release year from multiple choices.
 */
