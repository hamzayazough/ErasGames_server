import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';
import { TimelineOrderPrompt } from '../prompts/prompt-interfaces';

export interface TimelineOrderQuestion extends BasicQuestion {
  questionType: 'timeline-order';
  prompt: TimelineOrderPrompt;
  correct: StringArrayCorrect;
}
/**
 * Timeline Ordering: Player arranges items (songs, events, etc.) in the correct chronological order.
 */
