import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';
import { StringChoice } from '../choices/string-choice.type';
import { PopularityMatchPrompt } from '../prompts/prompt-interfaces';

export interface PopularityMatchQuestion extends BasicQuestion {
  questionType: 'popularity-match';
  prompt: PopularityMatchPrompt;
  choices: StringChoice[];
  correct: StringArrayCorrect;
}
/**
 * Popularity Match: Player matches items (songs, albums, etc.) to their correct popularity ranking or order.
 */
