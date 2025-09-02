import { BasicQuestion, MediaRef } from './basic-question.interface';

export interface ReverseAudioQuestion extends BasicQuestion {
  questionType: 'reverse_audio';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}
/**
 * Reverse Audio: Player listens to reversed audio clips and selects the correct original song.
 */
