import { BasicAnswer } from './basic-answer.interface';

export interface MoodMatchAnswer extends BasicAnswer {
  questionType: 'mood_match';
  answer: { choiceIndex: number };
}
