import { BasicQuestion } from './basic-question.interface';
import { StringArrayCorrect } from '../corrects/string-array-correct.interface';

export interface TimelineOrderQuestion extends BasicQuestion {
  questionType: 'timeline_order';
  prompt: {
    task: string;
    items: string[];
  };
  correct: StringArrayCorrect;
}
/**
 * Timeline Ordering: Player arranges items (songs, events, etc.) in the correct chronological order.
 */
