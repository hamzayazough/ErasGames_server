import { BasicAnswer } from './basic-answer.interface';

export interface OddOneOutAnswer extends BasicAnswer {
  questionType: 'odd_one_out';
  answer: { choiceIndex: number };
}
