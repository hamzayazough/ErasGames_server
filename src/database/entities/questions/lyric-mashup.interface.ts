import { BasicQuestion } from './basic-question.interface';
import { LyricMashupCorrect } from '../corrects/lyric-mashup-correct.interface';

export interface LyricMashupQuestion extends BasicQuestion {
  questionType: 'lyric_mashup';
  prompt: {
    task: string;
    snippets: string[];
    optionsPerSnippet: string[];
  };
  correct: LyricMashupCorrect;
}
/**
 * Lyric Mashup: Player matches lyric snippets to the correct song in a mashup challenge.
 */
