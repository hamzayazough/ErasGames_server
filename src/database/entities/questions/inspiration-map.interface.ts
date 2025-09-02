import { BasicQuestion } from './basic-question.interface';
import { StringChoice } from '../choices/string-choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface InspirationMapQuestion extends BasicQuestion {
  questionType: 'inspiration_map';
  prompt: {
    task: string;
    disclaimer?: string;
  };
  choices: StringChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Inspiration Mapping: Player selects the correct inspiration or relationship mapping for a song or event.
 */
