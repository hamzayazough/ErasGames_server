import {
  IsString,
  IsIn,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Difficulty,
  QuestionType,
} from '../../../entities/questions/basic-question.interface';

class MediaRefDto {
  @IsIn(['image', 'audio'])
  type: 'image' | 'audio';

  @IsString()
  url: string;
}

export class CreateQuestionBaseDto {
  @IsIn([
    'album_year_guess',
    'song_album_match',
    'fill_blank',
    'guess_by_lyric',
    'odd_one_out',
    'ai_visual',
    'sound_alike_snippet',
    'mood_match',
    'inspiration_map',
    'life_trivia',
    'timeline_order',
    'popularity_match',
    'longest_song',
    'tracklist_order',
    'outfit_era',
    'lyric_mashup',
    'speed_tap',
    'reverse_audio',
    'one_second',
  ])
  questionType: QuestionType;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty: Difficulty;

  @IsArray()
  @IsString({ each: true })
  themes: string[];

  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaRefDto)
  mediaRefs?: MediaRefDto[];

  @IsOptional()
  scoringHints?: Record<string, any>;
}
