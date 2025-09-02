import { BasicQuestion, MediaRef } from './basic-question.interface';

export interface MoodMatchQuestion extends BasicQuestion {
  questionType: 'mood_match';
  prompt: {
    task: string;
    moodTags: string[];
    note?: string;
  };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}
/**
 * Mood Matching: Player matches a song or snippet to the correct mood or tag from the options.
 */
