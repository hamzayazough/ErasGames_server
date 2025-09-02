import { BasicQuestion } from './basic-question.interface';

export interface FillBlankQuestion extends BasicQuestion {
  questionType: 'fill_blank';
  prompt: {
    task: string;
    text: string;
  };
  choices: string[];
  correct: number;
}
/**
 * Fill in the Blank: Player selects the correct word or phrase to complete a lyric or statement.
 */
