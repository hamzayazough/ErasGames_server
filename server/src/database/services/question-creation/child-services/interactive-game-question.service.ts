import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { QuestionTheme } from '../../../enums/question-theme.enum';
import { QuestionType, Difficulty } from '../../../enums/question.enums';
import { v4 as uuidv4 } from 'uuid';
import { CreateOddOneOutQuestionDto } from '../dto/create-odd-one-out-question.dto';
import { CreateLyricMashupQuestionDto } from '../dto/create-lyric-mashup-question.dto';
import { CreateSpeedTapQuestionDto } from '../dto/create-speed-tap-question.dto';
import type { AnyPrompt } from '../../../entities/prompts/any-prompt.type';
import type { Choice } from '../../../entities/choices/choice.type';
import type { Correct } from '../../../entities/corrects/correct.type';

type InteractiveGameDto =
  | CreateOddOneOutQuestionDto
  | CreateLyricMashupQuestionDto
  | CreateSpeedTapQuestionDto;

@Injectable()
export class InteractiveGameQuestionService {
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

  async create(createQuestionDto: InteractiveGameDto): Promise<Question> {
    // Map DTO to entity structure
    const questionEntity = new Question();
    questionEntity.id = uuidv4();
    questionEntity.questionType =
      createQuestionDto.questionType as QuestionType;
    questionEntity.difficulty = createQuestionDto.difficulty as Difficulty;
    questionEntity.themesJSON = this.mapThemesToEnum(createQuestionDto.themes);
    questionEntity.subjectsJSON = createQuestionDto.subjects;
    questionEntity.mediaJSON = createQuestionDto.mediaRefs || null;
    questionEntity.approved = true; // Ready to use in daily quiz
    questionEntity.disabled = false;
    questionEntity.exposureCount = 0;
    questionEntity.lastUsedAt = null;

    // Type-safe assignment based on question type
    switch (createQuestionDto.questionType) {
      case 'odd-one-out': {
        const dto = createQuestionDto as CreateOddOneOutQuestionDto;
        questionEntity.promptJSON = dto.prompt as unknown as AnyPrompt;
        questionEntity.choicesJSON = dto.choices as unknown as Choice[];
        questionEntity.correctJSON = dto.correct as unknown as Correct;
        break;
      }
      case 'lyric-mashup': {
        const dto = createQuestionDto as CreateLyricMashupQuestionDto;
        questionEntity.promptJSON = dto.prompt as unknown as AnyPrompt;
        questionEntity.choicesJSON = null;
        questionEntity.correctJSON = dto.correct as unknown as Correct;
        break;
      }
      case 'speed-tap': {
        const dto = createQuestionDto as CreateSpeedTapQuestionDto;
        questionEntity.promptJSON = dto.prompt as unknown as AnyPrompt;
        questionEntity.choicesJSON = null;
        questionEntity.correctJSON = dto.correct as unknown as Correct;
        break;
      }
      default:
        throw new Error(
          `Unsupported interactive game question type: ${(createQuestionDto as any).questionType}`,
        );
    }

    console.log(
      `Creating ${createQuestionDto.questionType} question in InteractiveGameQuestionService:`,
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
