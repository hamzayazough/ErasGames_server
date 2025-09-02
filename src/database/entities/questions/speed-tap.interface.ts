import { BasicQuestion } from './basic-question.interface';

export interface SpeedTapQuestion extends BasicQuestion {
  questionType: 'speed_tap';
  prompt: {
    task: string;
    targetRule: string;
    roundSeconds: number;
    grid: string[];
  };
  correct: { targets: string[] };
  scoringHints?: { perCorrect: number; perWrong: number };
}
/**
 * Speed Tap: Player taps correct options as quickly as possible according to the round's rule.
 */
