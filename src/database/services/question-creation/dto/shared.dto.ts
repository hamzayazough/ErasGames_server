import { IsString } from 'class-validator';

export class StringChoiceDto {
  @IsString()
  id: string;

  @IsString()
  text: string;
}

export class SingleChoiceCorrectDto {
  @IsString()
  choiceId: string;
}

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
