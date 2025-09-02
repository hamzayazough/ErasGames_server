import { BasicQuestion } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { MediaRef } from '../media/media-ref.interface';
import { ImageChoice } from '../choices/image-choice.interface';

export interface AiVisualQuestion extends BasicQuestion {
  questionType: 'ai_visual';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: ImageChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * AI-Generated Era Visual: Player is shown AI-generated images and must pick the one matching the described era or theme.
 */
