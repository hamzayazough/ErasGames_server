import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { GuessByLyricPrompt } from '../prompts/prompt-interfaces';

export interface GuessByLyricQuestion extends BasicQuestion {
  questionType: 'guess-by-lyric';
  prompt: GuessByLyricPrompt;
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Guess by Lyric: Player is shown a lyric and must pick the correct song from multiple choices.
 */
