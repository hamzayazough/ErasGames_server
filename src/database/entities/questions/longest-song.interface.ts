import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { LongestSongPrompt } from '../prompts/prompt-interfaces';

export interface LongestSongQuestion extends BasicQuestion {
  questionType: 'longest_song';
  prompt: LongestSongPrompt;
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Longest Song: Player selects the longest song from a list of options.
 */
