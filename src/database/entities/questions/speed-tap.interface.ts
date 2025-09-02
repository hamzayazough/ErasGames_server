import { BasicQuestion } from './basic-question.interface';
import { SpeedTapCorrect } from '../corrects/speed-tap-correct.interface';

export interface SpeedTapQuestion extends BasicQuestion {
  questionType: 'speed_tap';
  prompt: {
    task: string;
    targetRule: string;
    roundSeconds: number;
    grid: string[];
  };
  correct: SpeedTapCorrect;
  scoringHints?: { perCorrect: number; perWrong: number };
}
/**
 * Speed Tap: Player taps correct options as quickly as possible according to the round's rule.
 */
