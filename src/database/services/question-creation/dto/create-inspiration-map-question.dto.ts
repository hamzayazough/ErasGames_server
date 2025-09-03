import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  SingleChoiceCorrectDto,
  InspirationMapPromptDto,
} from './shared.dto';

export class CreateInspirationMapQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => InspirationMapPromptDto)
  prompt: InspirationMapPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
