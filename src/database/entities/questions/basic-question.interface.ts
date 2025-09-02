export type Difficulty = 'easy' | 'medium' | 'hard';

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
  prompt: any;
  choices?: string[];
  correct: any;
  mediaRefs?: MediaRef[];
  scoringHints?: Record<string, any>;
}
