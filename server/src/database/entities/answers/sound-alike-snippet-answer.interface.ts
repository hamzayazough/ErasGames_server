import { BasicAnswer } from './basic-answer.interface';

export interface SoundAlikeSnippetAnswer extends BasicAnswer {
  questionType: 'sound_alike_snippet';
  answer: { choiceIndex: number };
}
