import { BasicAnswer } from './basic-answer.interface';

export interface LyricMashupAnswer extends BasicAnswer {
  questionType: 'lyric_mashup';
  answer: Record<string, string>; // snippet → song
}
