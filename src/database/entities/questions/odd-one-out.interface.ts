import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface OddOneOutQuestion extends BasicQuestion {
  questionType: 'odd_one_out';
  prompt: {
    task: string;
    setRule: string;
  };
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Odd One Out: Player selects the item that does not fit the set rule among the choices.
 */
