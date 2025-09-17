/**
 * Union type for all possible question interfaces.
 * Use this type when you need to represent any question in the system.
 */

import { BasicQuestion } from './basic-question.interface';
import { FillBlankQuestion } from './fill-blank.interface';
import { TracklistOrderQuestion } from './tracklist-order.interface';
import { TimelineOrderQuestion } from './timeline-order.interface';
import { SpeedTapQuestion } from './speed-tap.interface';
import { SoundAlikeSnippetQuestion } from './sound-alike-snippet.interface';
import { SongAlbumMatchQuestion } from './song-album-match.interface';
import { ReverseAudioQuestion } from './reverse-audio.interface';
import { PopularityMatchQuestion } from './popularity-match.interface';
import { OutfitEraQuestion } from './outfit-era.interface';
import { OneSecondQuestion } from './one-second.interface';
import { OddOneOutQuestion } from './odd-one-out.interface';
import { MoodMatchQuestion } from './mood-match.interface';
import { LyricMashupQuestion } from './lyric-mashup.interface';
import { LongestSongQuestion } from './longest-song.interface';
import { LifeTriviaQuestion } from './life-trivia.interface';
import { InspirationMapQuestion } from './inspiration-map.interface';
import { GuessByLyricQuestion } from './guess-by-lyric.interface';
import { AlbumYearGuessQuestion } from './album-year-guess.interface';
import { AiVisualQuestion } from './ai-visual.interface';

export type Question =
  | BasicQuestion
  | FillBlankQuestion
  | TracklistOrderQuestion
  | TimelineOrderQuestion
  | SpeedTapQuestion
  | SoundAlikeSnippetQuestion
  | SongAlbumMatchQuestion
  | ReverseAudioQuestion
  | PopularityMatchQuestion
  | OutfitEraQuestion
  | OneSecondQuestion
  | OddOneOutQuestion
  | MoodMatchQuestion
  | LyricMashupQuestion
  | LongestSongQuestion
  | LifeTriviaQuestion
  | InspirationMapQuestion
  | GuessByLyricQuestion
  | AlbumYearGuessQuestion
  | AiVisualQuestion;
