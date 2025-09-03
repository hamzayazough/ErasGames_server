import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  AudioChoiceDto,
  SingleChoiceCorrectDto,
  ReverseAudioPromptDto,
} from './shared.dto';

export class CreateReverseAudioQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => ReverseAudioPromptDto)
  prompt: ReverseAudioPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudioChoiceDto)
  choices: AudioChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
