import { AlbumYearGuessQuestion } from './album-year-guess.interface';
import { SongAlbumMatchQuestion } from './song-album-match.interface';
import { FillBlankQuestion } from './fill-blank.interface';
import { GuessByLyricQuestion } from './guess-by-lyric.interface';
import { OddOneOutQuestion } from './odd-one-out.interface';
import { AiVisualQuestion } from './ai-visual.interface';
import { SoundAlikeSnippetQuestion } from './sound-alike-snippet.interface';
import { MoodMatchQuestion } from './mood-match.interface';
import { InspirationMapQuestion } from './inspiration-map.interface';
import { LifeTriviaQuestion } from './life-trivia.interface';
import { TimelineOrderQuestion } from './timeline-order.interface';
import { PopularityMatchQuestion } from './popularity-match.interface';
import { LongestSongQuestion } from './longest-song.interface';
import { TracklistOrderQuestion } from './tracklist-order.interface';
import { OutfitEraQuestion } from './outfit-era.interface';
import { LyricMashupQuestion } from './lyric-mashup.interface';
import { SpeedTapQuestion } from './speed-tap.interface';
import { ReverseAudioQuestion } from './reverse-audio.interface';
import { OneSecondQuestion } from './one-second.interface';

export type AnyQuestion =
  | AlbumYearGuessQuestion
  | SongAlbumMatchQuestion
  | FillBlankQuestion
  | GuessByLyricQuestion
  | OddOneOutQuestion
  | AiVisualQuestion
  | SoundAlikeSnippetQuestion
  | MoodMatchQuestion
  | InspirationMapQuestion
  | LifeTriviaQuestion
  | TimelineOrderQuestion
  | PopularityMatchQuestion
  | LongestSongQuestion
  | TracklistOrderQuestion
  | OutfitEraQuestion
  | LyricMashupQuestion
  | SpeedTapQuestion
  | ReverseAudioQuestion
  | OneSecondQuestion;
