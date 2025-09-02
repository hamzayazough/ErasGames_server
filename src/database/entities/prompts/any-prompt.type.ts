// General union type for all prompt interfaces
// Import all prompt interfaces from prompt-interfaces.ts

import {
  AlbumYearGuessPrompt,
  SongAlbumMatchPrompt,
  FillBlankPrompt,
  GuessByLyricPrompt,
  OddOneOutPrompt,
  AiVisualPrompt,
  SoundAlikeSnippetPrompt,
  MoodMatchPrompt,
  InspirationMapPrompt,
  LifeTriviaPrompt,
  TimelineOrderPrompt,
  PopularityMatchPrompt,
  LongestSongPrompt,
  TracklistOrderPrompt,
  OutfitEraPrompt,
  LyricMashupPrompt,
  SpeedTapPrompt,
  ReverseAudioPrompt,
  OneSecondPrompt,
} from '../prompts/prompt-interfaces';

export type AnyPrompt =
  | AlbumYearGuessPrompt
  | SongAlbumMatchPrompt
  | FillBlankPrompt
  | GuessByLyricPrompt
  | OddOneOutPrompt
  | AiVisualPrompt
  | SoundAlikeSnippetPrompt
  | MoodMatchPrompt
  | InspirationMapPrompt
  | LifeTriviaPrompt
  | TimelineOrderPrompt
  | PopularityMatchPrompt
  | LongestSongPrompt
  | TracklistOrderPrompt
  | OutfitEraPrompt
  | LyricMashupPrompt
  | SpeedTapPrompt
  | ReverseAudioPrompt
  | OneSecondPrompt;
