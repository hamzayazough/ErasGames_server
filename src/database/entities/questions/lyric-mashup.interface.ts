import { BasicQuestion } from './basic-question.interface';

export interface LyricMashupQuestion extends BasicQuestion {
  questionType: 'lyric_mashup';
  prompt: {
    task: string;
    snippets: string[];
    optionsPerSnippet: string[];
  };
  correct: Record<string, string>;
}
/**
 * Lyric Mashup: Player matches lyric snippets to the correct song in a mashup challenge.
 */
