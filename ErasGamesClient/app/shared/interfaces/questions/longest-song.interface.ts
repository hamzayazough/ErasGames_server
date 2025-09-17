import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { LongestSongPrompt } from '../prompts/prompt-interfaces';
import { StringChoice } from '../choices/string-choice.type';

export interface LongestSongQuestion extends BasicQuestion {
  questionType: 'longest-song';
  prompt: LongestSongPrompt;
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Longest Song: Player selects the longest song from a list of options.
 */
