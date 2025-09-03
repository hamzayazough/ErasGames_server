import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { QuestionTheme } from '../../../enums/question-theme.enum';
import { QuestionType, Difficulty } from '../../../enums/question.enums';
import { v4 as uuidv4 } from 'uuid';
import { CreateSoundAlikeSnippetQuestionDto } from '../dto/create-sound-alike-snippet-question.dto';
import { CreateReverseAudioQuestionDto } from '../dto/create-reverse-audio-question.dto';
import { CreateOneSecondQuestionDto } from '../dto/create-one-second-question.dto';
import type { AnyPrompt } from '../../../entities/prompts/any-prompt.type';
import type { Choice } from '../../../entities/choices/choice.type';
import type { Correct } from '../../../entities/corrects/correct.type';

type AudioBasedDto =
  | CreateSoundAlikeSnippetQuestionDto
  | CreateReverseAudioQuestionDto
  | CreateOneSecondQuestionDto;

@Injectable()
export class AudioBasedQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  private mapThemesToEnum(themes: string[]): QuestionTheme[] {
    return themes.map((theme) => {
      if (!Object.values(QuestionTheme).includes(theme as QuestionTheme)) {
        throw new Error(
          `Invalid theme: ${theme}. Valid themes are: ${Object.values(QuestionTheme).join(', ')}`,
        );
      }
      return theme as QuestionTheme;
    });
  }

  async create(createQuestionDto: AudioBasedDto): Promise<Question> {
    // Map DTO to entity structure
    const questionEntity = new Question();
    questionEntity.id = uuidv4();
    questionEntity.questionType =
      createQuestionDto.questionType as QuestionType;
    questionEntity.difficulty = createQuestionDto.difficulty as Difficulty;
    questionEntity.themesJSON = this.mapThemesToEnum(createQuestionDto.themes);
    questionEntity.subjectsJSON = createQuestionDto.subjects;
    questionEntity.promptJSON =
      createQuestionDto.prompt as unknown as AnyPrompt;
    questionEntity.choicesJSON =
      (createQuestionDto.choices as unknown as Choice[]) || null;
    questionEntity.correctJSON =
      createQuestionDto.correct as unknown as Correct;
    questionEntity.mediaJSON = createQuestionDto.mediaRefs || null;
    questionEntity.approved = true;
    questionEntity.disabled = false;
    questionEntity.exposureCount = 0;
    questionEntity.lastUsedAt = null;

    console.log(
      `Creating ${createQuestionDto.questionType} question in AudioBasedQuestionService:`,
      questionEntity,
    );

    const savedQuestion = await this.questionRepository.save(questionEntity);

    console.log(
      `Created ${createQuestionDto.questionType} question:`,
      savedQuestion.id,
    );

    return savedQuestion;
  }
}
