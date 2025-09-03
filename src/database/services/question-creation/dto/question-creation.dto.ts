// Import all question creation DTOs
import { CreateOneSecondQuestionDto } from './create-one-second-question.dto';
import { CreateReverseAudioQuestionDto } from './create-reverse-audio-question.dto';
import { CreateSoundAlikeSnippetQuestionDto } from './create-sound-alike-snippet-question.dto';
import { CreateOddOneOutQuestionDto } from './create-odd-one-out-question.dto';
import { CreateSpeedTapQuestionDto } from './create-speed-tap-question.dto';
import { CreateLyricMashupQuestionDto } from './create-lyric-mashup-question.dto';
import { CreateAlbumYearGuessQuestionDto } from './create-album-year-guess-question.dto';
import { CreateSongAlbumMatchQuestionDto } from './create-song-album-match-question.dto';
import { CreateFillBlankQuestionDto } from './create-fill-blank-question.dto';
import { CreateGuessByLyricQuestionDto } from './create-guess-by-lyric-question.dto';
import { CreateLifeTriviaQuestionDto } from './create-life-trivia-question.dto';
import { CreateTimelineOrderQuestionDto } from './create-timeline-order-question.dto';
import { CreatePopularityMatchQuestionDto } from './create-popularity-match-question.dto';
import { CreateLongestSongQuestionDto } from './create-longest-song-question.dto';
import { CreateTracklistOrderQuestionDto } from './create-tracklist-order-question.dto';
import { CreateAiVisualQuestionDto } from './create-ai-visual-question.dto';
import { CreateInspirationMapQuestionDto } from './create-inspiration-map-question.dto';
import { CreateOutfitEraQuestionDto } from './create-outfit-era-question.dto';
import { CreateMoodMatchQuestionDto } from './create-mood-match-question.dto';

/**
 * Union type that includes all possible question creation DTOs.
 * This provides type safety when creating questions of any supported type.
 *
 * Supported question categories:
 * - Audio-based: one-second, reverse-audio, sound-alike-snippet
 * - Interactive game: odd-one-out, speed-tap, lyric-mashup
 * - Knowledge & trivia: album-year-guess, song-album-match, fill-blank, guess-by-lyric, life-trivia, timeline-order, popularity-match, longest-song, tracklist-order
 * - Visual & aesthetic: ai-visual, inspiration-map, outfit-era, mood-match
 *
 * @example
 * ```typescript
 * const questionDto: QuestionCreationDto = {
 *   questionType: 'album-year-guess',
 *   prompts: [...],
 *   choices: [...],
 *   corrects: [...]
 * };
 * ```
 */
export type QuestionCreationDto =
  // Audio-based questions
  | CreateOneSecondQuestionDto
  | CreateReverseAudioQuestionDto
  | CreateSoundAlikeSnippetQuestionDto
  // Interactive game questions
  | CreateOddOneOutQuestionDto
  | CreateSpeedTapQuestionDto
  | CreateLyricMashupQuestionDto
  // Knowledge & trivia questions
  | CreateAlbumYearGuessQuestionDto
  | CreateSongAlbumMatchQuestionDto
  | CreateFillBlankQuestionDto
  | CreateGuessByLyricQuestionDto
  | CreateLifeTriviaQuestionDto
  | CreateTimelineOrderQuestionDto
  | CreatePopularityMatchQuestionDto
  | CreateLongestSongQuestionDto
  | CreateTracklistOrderQuestionDto
  // Visual & aesthetic questions
  | CreateAiVisualQuestionDto
  | CreateInspirationMapQuestionDto
  | CreateOutfitEraQuestionDto
  | CreateMoodMatchQuestionDto;

/**
 * Array of question creation DTOs for batch operations
 */
export type QuestionCreationDtoArray = QuestionCreationDto[];
