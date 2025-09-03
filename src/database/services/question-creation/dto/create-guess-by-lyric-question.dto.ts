import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  GuessByLyricPromptDto,
} from './shared.dto';

export class CreateGuessByLyricQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => GuessByLyricPromptDto)
  prompt: GuessByLyricPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
