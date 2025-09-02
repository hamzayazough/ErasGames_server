import { BasicQuestion, MediaRef } from './basic-question.interface';

export interface AiVisualQuestion extends BasicQuestion {
  questionType: 'ai_visual';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}
/**
 * AI-Generated Era Visual: Player is shown AI-generated images and must pick the one matching the described era or theme.
 */
