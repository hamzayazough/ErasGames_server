import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import { TimelineOrderPromptDto, StringArrayCorrectDto } from './shared.dto';

export class CreateTimelineOrderQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => TimelineOrderPromptDto)
  prompt: TimelineOrderPromptDto;

  @ValidateNested()
  @Type(() => StringArrayCorrectDto)
  correct: StringArrayCorrectDto;
}
