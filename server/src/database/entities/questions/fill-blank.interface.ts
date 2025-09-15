import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { FillBlankPrompt } from '../prompts/prompt-interfaces';

export interface FillBlankQuestion extends BasicQuestion {
  questionType: 'fill-blank';
  prompt: FillBlankPrompt;
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Fill in the Blank: Player selects the correct word or phrase to complete a lyric or statement.
 */
