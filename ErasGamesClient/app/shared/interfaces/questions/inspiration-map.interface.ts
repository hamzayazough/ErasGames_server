import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { InspirationMapPrompt } from '../prompts/prompt-interfaces';

export interface InspirationMapQuestion extends BasicQuestion {
  questionType: 'inspiration-map';
  prompt: InspirationMapPrompt;
  choices: StringChoice[];
  correct?: SingleChoiceCorrect;
}
/**
 * Inspiration Mapping: Player selects the correct inspiration or relationship mapping for a song or event.
 */
