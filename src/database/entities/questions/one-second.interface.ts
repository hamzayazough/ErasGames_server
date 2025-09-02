import { BasicQuestion, MediaRef } from './basic-question.interface';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';

export interface OneSecondQuestion extends BasicQuestion {
  questionType: 'one_second';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: SingleChoiceCorrect;
}
/**
 * One Second Challenge: Player listens to a one-second audio clip and must identify the correct song.
 */
