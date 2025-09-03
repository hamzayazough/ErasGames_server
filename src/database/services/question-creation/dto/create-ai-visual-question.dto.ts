import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';

class AiVisualPromptDto {
  @IsString()
  main_prompt: string;
}

class ImageChoiceDto {
  @IsString()
  id: string;

  @IsString()
  url: string;
}

class SingleChoiceCorrectDto {
  @IsString()
  choiceId: string;
}

export class CreateAiVisualQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => AiVisualPromptDto)
  prompt: AiVisualPromptDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageChoiceDto)
  choices: ImageChoiceDto[];

  @ValidateNested()
  @Type(() => SingleChoiceCorrectDto)
  correct: SingleChoiceCorrectDto;
}
