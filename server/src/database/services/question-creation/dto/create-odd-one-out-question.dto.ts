import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  OddOneOutPromptDto,
} from './shared.dto';

export class CreateOddOneOutQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => OddOneOutPromptDto)
  prompt: OddOneOutPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
