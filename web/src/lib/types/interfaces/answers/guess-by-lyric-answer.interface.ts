import { BasicAnswer } from './basic-answer.interface';

export interface GuessByLyricAnswer extends BasicAnswer {
  questionType: 'guess_by_lyric';
  answer: { choiceIndex: number };
}
