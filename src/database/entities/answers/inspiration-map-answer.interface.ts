import { BasicAnswer } from './basic-answer.interface';

export interface InspirationMapAnswer extends BasicAnswer {
  questionType: 'inspiration_map';
  answer: { choiceIndex: number };
}
