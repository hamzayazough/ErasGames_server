import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { AlbumYearGuessPrompt } from '../prompts/prompt-interfaces';

export interface AlbumYearGuessQuestion extends BasicQuestion {
  questionType: 'album-year-guess';
  prompt: AlbumYearGuessPrompt;
  choices: StringChoice[];
  correct?: SingleChoiceCorrect;
}
/**
 * Album Year Guess: Player is shown an album and must select the correct release year from multiple choices.
 */
