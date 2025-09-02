import { BasicAnswer } from './basic-answer.interface';

export interface ReverseAudioAnswer extends BasicAnswer {
  questionType: 'reverse_audio';
  answer: { choiceIndex: number };
}
