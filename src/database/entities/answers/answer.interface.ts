/**
 * Union type for all possible answer interfaces.
 * Use this type when you need to represent any answer in the system.
 */

import { BasicAnswer } from '../answers/basic-answer.interface';
import { FillBlankAnswer } from '../answers/fill-blank-answer.interface';
import { TracklistOrderAnswer } from '../answers/tracklist-order-answer.interface';
import { TimelineOrderAnswer } from '../answers/timeline-order-answer.interface';
import { SpeedTapAnswer } from '../answers/speed-tap-answer.interface';
import { SoundAlikeSnippetAnswer } from '../answers/sound-alike-snippet-answer.interface';
import { SongAlbumMatchAnswer } from '../answers/song-album-match-answer.interface';
import { ReverseAudioAnswer } from '../answers/reverse-audio-answer.interface';
import { PopularityMatchAnswer } from '../answers/popularity-match-answer.interface';
import { OutfitEraAnswer } from '../answers/outfit-era-answer.interface';
import { OneSecondAnswer } from '../answers/one-second-answer.interface';
import { OddOneOutAnswer } from '../answers/odd-one-out-answer.interface';
import { MoodMatchAnswer } from '../answers/mood-match-answer.interface';
import { LyricMashupAnswer } from '../answers/lyric-mashup-answer.interface';
import { LongestSongAnswer } from '../answers/longest-song-answer.interface';
import { LifeTriviaAnswer } from '../answers/life-trivia-answer.interface';
import { InspirationMapAnswer } from '../answers/inspiration-map-answer.interface';
import { GuessByLyricAnswer } from '../answers/guess-by-lyric-answer.interface';
import { AlbumYearGuessAnswer } from '../answers/album-year-guess-answer.interface';
import { AiVisualAnswer } from '../answers/ai-visual-answer.interface';

export type Answer =
  | BasicAnswer
  | FillBlankAnswer
  | TracklistOrderAnswer
  | TimelineOrderAnswer
  | SpeedTapAnswer
  | SoundAlikeSnippetAnswer
  | SongAlbumMatchAnswer
  | ReverseAudioAnswer
  | PopularityMatchAnswer
  | OutfitEraAnswer
  | OneSecondAnswer
  | OddOneOutAnswer
  | MoodMatchAnswer
  | LyricMashupAnswer
  | LongestSongAnswer
  | LifeTriviaAnswer
  | InspirationMapAnswer
  | GuessByLyricAnswer
  | AlbumYearGuessAnswer
  | AiVisualAnswer;
