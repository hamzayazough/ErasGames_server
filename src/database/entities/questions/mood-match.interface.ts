import { BasicQuestion, MediaRef } from './basic-question.interface';
import { Choice } from '../choices/choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { MoodMatchPrompt } from '../prompts/prompt-interfaces';

export interface MoodMatchQuestion extends BasicQuestion {
  questionType: 'mood_match';
  prompt: MoodMatchPrompt;
  mediaRefs: MediaRef[];
  choices: Choice[];
  correct: SingleChoiceCorrect;
}
/**
 * Mood Matching: Player matches a song or snippet to the correct mood or tag from the options.
 */
