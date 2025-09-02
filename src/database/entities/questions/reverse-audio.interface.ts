import { BasicQuestion, MediaRef } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface ReverseAudioQuestion extends BasicQuestion {
  questionType: 'reverse_audio';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: SingleChoiceCorrect;
}
/**
 * Reverse Audio: Player listens to reversed audio clips and selects the correct original song.
 */
