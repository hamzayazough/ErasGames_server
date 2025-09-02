import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';

export interface PopularityMatchQuestion extends BasicQuestion {
  questionType: 'popularity_match';
  prompt: {
    task: string;
    asOf: string;
  };
  choices: string[];
  correct: StringArrayCorrect;
}
/**
 * Popularity Match: Player matches items (songs, albums, etc.) to their correct popularity ranking or order.
 */
