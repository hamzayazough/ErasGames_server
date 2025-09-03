import { BasicQuestion, MediaRef } from './basic-question.interface';
import { Choice } from '../choices/choice.type';
import { SingleChoiceCorrect } from '../corrects/single-choice-correct.interface';
import { SoundAlikeSnippetPrompt } from '../prompts/prompt-interfaces';

export interface SoundAlikeSnippetQuestion extends BasicQuestion {
  questionType: 'sound-alike-snippet';
  prompt: SoundAlikeSnippetPrompt;
  mediaRefs: MediaRef[];
  choices: Choice[];
  correct: SingleChoiceCorrect;
}
/**
 * Sound-alike Snippet: Player listens to audio clips and selects the one that matches the described sound or song.
 */
