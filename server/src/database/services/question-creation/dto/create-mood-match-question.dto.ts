import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  ChoiceDto,
  SingleChoiceCorrectDto,
  MoodMatchPromptDto,
} from './shared.dto';

export class CreateMoodMatchQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => MoodMatchPromptDto)
  prompt: MoodMatchPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices: ChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
