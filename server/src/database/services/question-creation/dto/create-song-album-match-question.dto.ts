import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionBaseDto } from './create-question-base.dto';
import { SongAlbumMatchPromptDto, StringMapCorrectDto } from './shared.dto';

export class CreateSongAlbumMatchQuestionDto extends CreateQuestionBaseDto {
  @ValidateNested()
  @Type(() => SongAlbumMatchPromptDto)
  prompt: SongAlbumMatchPromptDto;

  @ValidateNested()
  @Type(() => StringMapCorrectDto)
  correct: StringMapCorrectDto;
}
