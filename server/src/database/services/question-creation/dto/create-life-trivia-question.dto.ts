import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  LifeTriviaPromptDto,
} from './shared.dto';

export class CreateLifeTriviaQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => LifeTriviaPromptDto)
  prompt: LifeTriviaPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
