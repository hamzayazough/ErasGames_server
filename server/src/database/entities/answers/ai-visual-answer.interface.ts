import { BasicAnswer } from './basic-answer.interface';

export interface AiVisualAnswer extends BasicAnswer {
  questionType: 'ai_visual';
  answer: { choiceIndex: number };
}
