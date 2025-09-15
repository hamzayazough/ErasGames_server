// Interfaces for all 19 question prompt types for Eras Quiz
// Each interface matches the prompt field for its corresponding question type

export interface AlbumYearGuessPrompt {
  task: string;
  album: string;
}

export interface SongAlbumMatchPrompt {
  task: string;
  left: string[];
  right: string[];
}

export interface FillBlankPrompt {
  task: string;
  text: string;
}

export interface GuessByLyricPrompt {
  task: string;
  lyric: string;
}

export interface OddOneOutPrompt {
  task: string;
  setRule: string;
}

export interface AiVisualPrompt {
  task: string;
}

export interface SoundAlikeSnippetPrompt {
  task: string;
}

export interface MoodMatchPrompt {
  task: string;
  moodTags: string[];
  note?: string;
}

export interface InspirationMapPrompt {
  task: string;
  disclaimer?: string;
}

export interface LifeTriviaPrompt {
  task: string;
  question: string;
}

export interface TimelineOrderPrompt {
  task: string;
  items: string[];
}

export interface PopularityMatchPrompt {
  task: string;
  asOf: string;
}

export interface LongestSongPrompt {
  task: string;
}

export interface TracklistOrderPrompt {
  task: string;
  album: string;
  tracks: string[];
}

export interface OutfitEraPrompt {
  task: string;
}

export interface LyricMashupPrompt {
  task: string;
  snippets: string[];
  optionsPerSnippet: string[];
}

export interface SpeedTapPrompt {
  task: string;
  targetRule: string;
  roundSeconds: number;
  grid: string[];
}

export interface ReverseAudioPrompt {
  task: string;
}

export interface OneSecondPrompt {
  task: string;
}
