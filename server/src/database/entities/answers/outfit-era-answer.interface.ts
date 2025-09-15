import { BasicAnswer } from './basic-answer.interface';

export interface OutfitEraAnswer extends BasicAnswer {
  questionType: 'outfit_era';
  answer: { choiceIndex: number };
}
