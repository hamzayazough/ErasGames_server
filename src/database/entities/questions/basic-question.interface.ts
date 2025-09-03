export type Difficulty = 'easy' | 'medium' | 'hard';

import type { Choice } from '../choices/choice.type';
import type { AnyPrompt } from '../prompts/any-prompt.type';

export type QuestionType =
  | 'album-year-guess'
  | 'song-album-match'
  | 'fill-blank'
  | 'guess-by-lyric'
  | 'odd-one-out'
  | 'ai-visual'
  | 'sound-alike-snippet'
  | 'mood-match'
  | 'inspiration-map'
  | 'life-trivia'
  | 'timeline-order'
  | 'popularity-match'
  | 'longest-song'
  | 'tracklist-order'
  | 'outfit-era'
  | 'lyric-mashup'
  | 'speed-tap'
  | 'reverse-audio'
  | 'one-second';

export type MediaRef = {
  type: 'image' | 'audio';
  url: string;
};

export interface BasicQuestion {
  id: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  themes: string[];
  subjects: string[];
  prompt: AnyPrompt;
  choices?: Choice[];
  correct: any; // fallback for generic/legacy
  mediaRefs?: MediaRef[];
  scoringHints?: Record<string, any>;
}
