import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface FillBlankQuestion extends BasicQuestion {
  questionType: 'fill_blank';
  prompt: {
    task: string;
    text: string;
  };
  choices: string[];
  correct: SingleChoiceCorrect;
}
/**
 * Fill in the Blank: Player selects the correct word or phrase to complete a lyric or statement.
 */
