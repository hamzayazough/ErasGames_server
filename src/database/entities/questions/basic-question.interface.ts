export type Difficulty = 'easy' | 'medium' | 'hard';

import type { Choice } from '../choices/choice.type';
import type { AnyPrompt } from '../prompts/any-prompt.type';

export type MediaRef = {
  type: 'image' | 'audio';
  url: string;
};

export type QuestionType =
  | 'album_year_guess'
  | 'song_album_match'
  | 'fill_blank'
  | 'guess_by_lyric'
  | 'odd_one_out'
  | 'ai_visual'
  | 'sound_alike_snippet'
  | 'mood_match'
  | 'inspiration_map'
  | 'life_trivia'
  | 'timeline_order'
  | 'popularity_match'
  | 'longest_song'
  | 'tracklist_order'
  | 'outfit_era'
  | 'lyric_mashup'
  | 'speed_tap'
  | 'reverse_audio'
  | 'one_second';

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
