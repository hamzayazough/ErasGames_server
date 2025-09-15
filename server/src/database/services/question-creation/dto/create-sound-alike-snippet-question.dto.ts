import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  ChoiceDto,
  SingleChoiceCorrectDto,
  SoundAlikeSnippetPromptDto,
} from './shared.dto';

export class CreateSoundAlikeSnippetQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => SoundAlikeSnippetPromptDto)
  prompt: SoundAlikeSnippetPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices: ChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
