import { BasicQuestion } from './basic-question.interface';
import { SpeedTapCorrect } from '../corrects/speed-tap-correct.interface';
import { SpeedTapPrompt } from '../prompts/prompt-interfaces';

export interface SpeedTapQuestion extends BasicQuestion {
  questionType: 'speed-tap';
  prompt: SpeedTapPrompt;
  correct: SpeedTapCorrect;
  scoringHints?: { perCorrect: number; perWrong: number };
}
/**
 * Speed Tap: Player taps correct options as quickly as possible according to the round's rule.
 */
