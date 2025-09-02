import { BasicQuestion } from './basic-question.interface';

export interface OddOneOutQuestion extends BasicQuestion {
  questionType: 'odd_one_out';
  prompt: {
    task: string;
    setRule: string;
  };
  choices: string[];
  correct: number;
}
/**
 * Odd One Out: Player selects the item that does not fit the set rule among the choices.
 */
