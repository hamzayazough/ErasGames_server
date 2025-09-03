import { IsString, IsArray } from 'class-validator';

export class StringChoiceDto {
  @IsString()
  id: string;

  @IsString()
  text: string;
}

export class ImageChoiceDto {
  @IsString()
  id: string;

  @IsString()
  url: string;
}

export class AudioChoiceDto {
  @IsString()
  id: string;

  @IsString()
  url: string;
}

export class ChoiceDto {
  @IsString()
  id: string;

  @IsString()
  text?: string;

  @IsString()
  url?: string;
}

export class SingleChoiceCorrectDto {
  @IsString()
  choiceId: string;
}

export class StringArrayCorrectDto {
  @IsArray()
  @IsString({ each: true })
  order: string[];
}

export class StringMapCorrectDto {
  [key: string]: string;
}

export class LyricMashupCorrectDto {
  @IsArray()
  matches: Array<{ lyricId: string; songId: string }>;
}

export class SpeedTapCorrectDto {
  @IsArray()
  @IsString({ each: true })
  correctOptions: string[];
}

// Prompt DTOs
export class AlbumYearGuessPromptDto {
  @IsString()
  album_name: string;
}

export class FillBlankPromptDto {
  @IsString()
  sentence: string;
}

export class GuessByLyricPromptDto {
  @IsString()
  lyric: string;
}

export class InspirationMapPromptDto {
  @IsString()
  concept: string;
}

export class SongAlbumMatchPromptDto {
  @IsArray()
  @IsString({ each: true })
  songs: string[];

  @IsArray()
  @IsString({ each: true })
  albums: string[];
}

export class OddOneOutPromptDto {
  @IsString()
  instruction: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];
}

export class SoundAlikeSnippetPromptDto {
  @IsString()
  description: string;
}

export class MoodMatchPromptDto {
  @IsString()
  mood_description: string;
}

export class LifeTriviaPromptDto {
  @IsString()
  question: string;
}

export class TimelineOrderPromptDto {
  @IsString()
  instruction: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];
}

export class PopularityMatchPromptDto {
  @IsString()
  instruction: string;
}

export class LongestSongPromptDto {
  @IsString()
  instruction: string;
}

export class TracklistOrderPromptDto {
  @IsString()
  album_name: string;

  @IsArray()
  @IsString({ each: true })
  tracks: string[];
}

export class OutfitEraPromptDto {
  @IsString()
  era_description: string;
}

export class LyricMashupPromptDto {
  @IsArray()
  lyrics: Array<{ id: string; text: string }>;

  @IsArray()
  songs: Array<{ id: string; title: string }>;
}

export class SpeedTapPromptDto {
  @IsString()
  rule: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class ReverseAudioPromptDto {
  @IsString()
  instruction: string;
}

export class OneSecondPromptDto {
  @IsString()
  instruction: string;
}
