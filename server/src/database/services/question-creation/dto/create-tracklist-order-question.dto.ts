import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  StringChoiceDto,
  StringArrayCorrectDto,
  TracklistOrderPromptDto,
} from './shared.dto';

export class CreateTracklistOrderQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => TracklistOrderPromptDto)
  prompt: TracklistOrderPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StringChoiceDto)
  choices: StringChoiceDto[];

  @ValidateNested()
  @Type(() => StringArrayCorrectDto)
  correct: StringArrayCorrectDto;
}
