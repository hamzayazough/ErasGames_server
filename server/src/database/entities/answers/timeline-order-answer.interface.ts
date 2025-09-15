import { BasicAnswer } from './basic-answer.interface';

export interface TimelineOrderAnswer extends BasicAnswer {
  questionType: 'timeline_order';
  answer: { orderedItems: string[] };
}
