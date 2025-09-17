import { BasicAnswer } from './basic-answer.interface';

export interface SpeedTapAnswer extends BasicAnswer {
  questionType: 'speed_tap';
  answer: {
    roundSeconds: number;
    events: Array<{ ts: number; option: string; action: 'tap' | 'undo' }>;
    clientSummary?: { taps: number; correct: number; wrong: number };
  };
}
