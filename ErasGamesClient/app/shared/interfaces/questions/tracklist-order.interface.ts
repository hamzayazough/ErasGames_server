import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';
import { StringChoice } from '../choices/string-choice.type';
import { TracklistOrderPrompt } from '../prompts/prompt-interfaces';

export interface TracklistOrderQuestion extends BasicQuestion {
  questionType: 'tracklist-order';
  prompt: TracklistOrderPrompt;
  choices: StringChoice[];
  correct: StringArrayCorrect;
}
/**
 * Tracklist Order: Player arranges tracks in the correct order for a given album.
 */
