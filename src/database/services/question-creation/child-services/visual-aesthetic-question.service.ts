import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { QuestionTheme } from '../../../enums/question-theme.enum';
import { QuestionType, Difficulty } from '../../../enums/question.enums';
import { CreateAiVisualQuestionDto } from '../dto/create-ai-visual-question.dto';
import { CreateInspirationMapQuestionDto } from '../dto/create-inspiration-map-question.dto';
import { CreateOutfitEraQuestionDto } from '../dto/create-outfit-era-question.dto';
import { CreateMoodMatchQuestionDto } from '../dto/create-mood-match-question.dto';
import type { AnyPrompt } from '../../../entities/prompts/any-prompt.type';
import type { Choice } from '../../../entities/choices/choice.type';
import type { Correct } from '../../../entities/corrects/correct.type';

type VisualAestheticDto =
  | CreateAiVisualQuestionDto
  | CreateInspirationMapQuestionDto
  | CreateOutfitEraQuestionDto
  | CreateMoodMatchQuestionDto;

@Injectable()
export class VisualAestheticQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  private mapTheme(questionType: string): QuestionTheme {
    const themeMap: Record<string, QuestionTheme> = {
      'ai-visual': QuestionTheme.Visuals,
      'inspiration-map': QuestionTheme.Inspiration,
      'outfit-era': QuestionTheme.Outfits,
      'mood-match': QuestionTheme.Mood,
    };
    return themeMap[questionType] || QuestionTheme.Aesthetic;
  }

  async create(dto: VisualAestheticDto): Promise<Question> {
    const theme = this.mapTheme(dto.questionType);

    const question = this.questionRepository.create({
      questionType: dto.questionType as QuestionType,
      difficulty: dto.difficulty as Difficulty,
      themesJSON: [theme],
      subjectsJSON: [], // Can be populated later
      promptJSON: dto.prompt as unknown as AnyPrompt,
      choicesJSON: dto.choices ? (dto.choices as unknown as Choice[]) : null,
      correctJSON: dto.correct as unknown as Correct,
      mediaJSON: null, // Can be populated later
      approved: true,
      disabled: false,
      exposureCount: 0,
      lastUsedAt: null,
      updatedAt: new Date(),
    });

    return await this.questionRepository.save(question);
  }

  async createAiVisualQuestion(
    dto: CreateAiVisualQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createInspirationMapQuestion(
    dto: CreateInspirationMapQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createOutfitEraQuestion(
    dto: CreateOutfitEraQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createMoodMatchQuestion(
    dto: CreateMoodMatchQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }
}
