import { BasicQuestion, MediaRef } from './basic-question.interface';
import { ImageChoice } from '../choices/image-choice.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface OutfitEraQuestion extends BasicQuestion {
  questionType: 'outfit_era';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: ImageChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Outfit Era: Player is shown images and must select the outfit that matches the described era.
 */
