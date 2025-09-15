import { BasicAnswer } from './basic-answer.interface';

export interface PopularityMatchAnswer extends BasicAnswer {
  questionType: 'popularity_match';
  answer: { orderedChoices: string[] };
}
