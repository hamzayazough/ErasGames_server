import { BasicQuestion, MediaRef } from './basic-question.interface';
import { AudioChoice } from '../choices/audio-choice.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { OneSecondPrompt } from '../prompts/prompt-interfaces';

export interface OneSecondQuestion extends BasicQuestion {
  questionType: 'one_second';
  prompt: OneSecondPrompt;
  mediaRefs: MediaRef[];
  choices: AudioChoice[];
  correct: SingleChoiceCorrect;
}
/**
 * One Second Challenge: Player listens to a one-second audio clip and must identify the correct song.
 */
