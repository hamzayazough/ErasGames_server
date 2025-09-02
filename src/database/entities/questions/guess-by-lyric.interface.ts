import { BasicQuestion } from './basic-question.interface';

export interface GuessByLyricQuestion extends BasicQuestion {
  questionType: 'guess_by_lyric';
  prompt: {
    task: string;
    lyric: string;
  };
  choices: string[];
  correct: number;
}
/**
 * Guess by Lyric: Player is shown a lyric and must pick the correct song from multiple choices.
 */
