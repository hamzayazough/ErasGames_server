import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import {
  ImageChoiceDto,
  SingleChoiceCorrectDto,
  OutfitEraPromptDto,
} from './shared.dto';

export class CreateOutfitEraQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => OutfitEraPromptDto)
  prompt: OutfitEraPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageChoiceDto)
  choices: ImageChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
