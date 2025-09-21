import {BasicQuestion, MediaRef} from './basic-question.interface';
import {SingleChoiceCorrect} from '../corrects/single-choice-correct.interface';
import {ReverseAudioPrompt} from '../prompts/prompt-interfaces';

export interface ReverseAudioQuestion extends BasicQuestion {
  questionType: 'reverse-audio';
  prompt: ReverseAudioPrompt;
  mediaRefs: MediaRef[];
  choices: string[];
  correct?: SingleChoiceCorrect;
}
/**
 * Reverse Audio: Player listens to reversed audio clips and selects the correct original song.
 */
