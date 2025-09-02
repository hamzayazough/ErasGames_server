import { BasicQuestion } from './basic-question.interface';

export interface LongestSongQuestion extends BasicQuestion {
  questionType: 'longest_song';
  prompt: { task: string };
  choices: string[];
  correct: number;
}
/**
 * Longest Song: Player selects the longest song from a list of options.
 */
