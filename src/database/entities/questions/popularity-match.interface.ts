import { BasicQuestion } from './basic-question.interface';

export interface PopularityMatchQuestion extends BasicQuestion {
  questionType: 'popularity_match';
  prompt: {
    task: string;
    asOf: string;
  };
  choices: string[];
  correct: string[];
}
/**
 * Popularity Match: Player matches items (songs, albums, etc.) to their correct popularity ranking or order.
 */
