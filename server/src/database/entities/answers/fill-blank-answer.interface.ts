import { BasicAnswer } from './basic-answer.interface';

export interface FillBlankAnswer extends BasicAnswer {
  questionType: 'fill_blank';
  answer: { choiceIndex: number };
}
