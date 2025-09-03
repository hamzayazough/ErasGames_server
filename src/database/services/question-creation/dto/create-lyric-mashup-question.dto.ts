import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import { LyricMashupPromptDto, LyricMashupCorrectDto } from './shared.dto';

export class CreateLyricMashupQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => LyricMashupPromptDto)
  prompt: LyricMashupPromptDto;

  @ValidateNested()
  @Type(() => LyricMashupCorrectDto)
  correct: LyricMashupCorrectDto;
}
