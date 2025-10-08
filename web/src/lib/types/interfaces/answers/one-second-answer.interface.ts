import { BasicAnswer } from './basic-answer.interface';

export interface OneSecondAnswer extends BasicAnswer {
  questionType: 'one_second';
  answer: { choiceIndex: number };
}
