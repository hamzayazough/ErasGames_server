import { BasicQuestion, MediaRef } from './basic-question.interface';
import { AudioChoice } from '../choices/audio-choice.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { ReverseAudioPrompt } from '../prompts/prompt-interfaces';

export interface ReverseAudioQuestion extends BasicQuestion {
  questionType: 'reverse_audio';
  prompt: ReverseAudioPrompt;
  mediaRefs: MediaRef[];
  choices: AudioChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * Reverse Audio: Player listens to reversed audio clips and selects the correct original song.
 */
