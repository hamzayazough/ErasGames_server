import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  LongestSongPromptDto,
} from './shared.dto';

export class CreateLongestSongQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => LongestSongPromptDto)
  prompt: LongestSongPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
