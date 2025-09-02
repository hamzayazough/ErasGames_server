import { BasicQuestion, MediaRef } from './basic-question.interface';

export interface OutfitEraQuestion extends BasicQuestion {
  questionType: 'outfit_era';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}
/**
 * Outfit Era: Player is shown images and must select the outfit that matches the described era.
 */
