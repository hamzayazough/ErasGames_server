import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  StringArrayCorrectDto,
  PopularityMatchPromptDto,
} from './shared.dto';

export class CreatePopularityMatchQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => PopularityMatchPromptDto)
  prompt: PopularityMatchPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => StringArrayCorrectDto)
  correct: StringArrayCorrectDto;
}
