import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import { SpeedTapPromptDto, SpeedTapCorrectDto } from './shared.dto';

export class CreateSpeedTapQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => SpeedTapPromptDto)
  prompt: SpeedTapPromptDto;

  @ValidateNested()
  @Type(() => SpeedTapCorrectDto)
  correct: SpeedTapCorrectDto;
}
