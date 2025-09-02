import { BasicQuestion } from './basic-question.interface';

export interface TimelineOrderQuestion extends BasicQuestion {
  questionType: 'timeline_order';
  prompt: {
    task: string;
    items: string[];
  };
  correct: string[];
}
/**
 * Timeline Ordering: Player arranges items (songs, events, etc.) in the correct chronological order.
 */
