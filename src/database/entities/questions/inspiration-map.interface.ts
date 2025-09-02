import { BasicQuestion } from './basic-question.interface';

export interface InspirationMapQuestion extends BasicQuestion {
  questionType: 'inspiration_map';
  prompt: {
    task: string;
    disclaimer?: string;
  };
  choices: string[];
  correct: number;
}
/**
 * Inspiration Mapping: Player selects the correct inspiration or relationship mapping for a song or event.
 */
