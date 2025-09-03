import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  AudioChoiceDto,
  SingleChoiceCorrectDto,
  OneSecondPromptDto,
} from './shared.dto';

export class CreateOneSecondQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => OneSecondPromptDto)
  prompt: OneSecondPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioChoiceDto)
  choices: AudioChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
