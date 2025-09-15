import { BasicAnswer } from './basic-answer.interface';

export interface LifeTriviaAnswer extends BasicAnswer {
  questionType: 'life_trivia';
  answer: { choiceIndex: number };
}
