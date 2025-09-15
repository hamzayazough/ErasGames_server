import { BasicAnswer } from './basic-answer.interface';

export interface LongestSongAnswer extends BasicAnswer {
  questionType: 'longest_song';
  answer: { choiceIndex: number };
}
