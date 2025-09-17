import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { OddOneOutPrompt } from '../prompts/prompt-interfaces';

export interface OddOneOutQuestion extends BasicQuestion {
  questionType: 'odd-one-out';
  prompt: OddOneOutPrompt;
  choices: StringChoice[];
  correct?: SingleChoiceCorrect;
}
/**
 * Odd One Out: Player selects the item that does not fit the set rule among the choices.
 */
