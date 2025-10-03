import { BasicQuestion } from './basic-question.interface';
import { LyricMashupCorrect } from '../corrects/lyric-mashup-correct.interface';
import { LyricMashupPrompt } from '../prompts/prompt-interfaces';

export interface LyricMashupQuestion extends BasicQuestion {
  questionType: 'lyric-mashup';
  prompt: LyricMashupPrompt;
  correct?: LyricMashupCorrect;
}
/**
 * Lyric Mashup: Player matches lyric snippets to the correct song in a mashup challenge.
 */
