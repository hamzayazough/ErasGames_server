import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  FillBlankPromptDto,
} from './shared.dto';

export class CreateFillBlankQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => FillBlankPromptDto)
  prompt: FillBlankPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
