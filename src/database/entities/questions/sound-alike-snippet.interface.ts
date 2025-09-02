import { BasicQuestion, MediaRef } from './basic-question.interface';

export interface SoundAlikeSnippetQuestion extends BasicQuestion {
  questionType: 'sound_alike_snippet';
  prompt: { task: string };
  mediaRefs: MediaRef[];
  choices: string[];
  correct: number;
}
/**
 * Sound-alike Snippet: Player listens to audio clips and selects the one that matches the described sound or song.
 */
