import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  AlbumYearGuessPromptDto,
} from './shared.dto';

export class CreateAlbumYearGuessQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => AlbumYearGuessPromptDto)
  prompt: AlbumYearGuessPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
