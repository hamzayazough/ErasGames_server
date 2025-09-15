import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { QuestionTheme } from '../../../enums/question-theme.enum';
import { QuestionType, Difficulty } from '../../../enums/question.enums';
import { CreateAlbumYearGuessQuestionDto } from '../dto/create-album-year-guess-question.dto';
import { CreateSongAlbumMatchQuestionDto } from '../dto/create-song-album-match-question.dto';
import { CreateFillBlankQuestionDto } from '../dto/create-fill-blank-question.dto';
import { CreateGuessByLyricQuestionDto } from '../dto/create-guess-by-lyric-question.dto';
import { CreateLifeTriviaQuestionDto } from '../dto/create-life-trivia-question.dto';
import { CreateTimelineOrderQuestionDto } from '../dto/create-timeline-order-question.dto';
import { CreatePopularityMatchQuestionDto } from '../dto/create-popularity-match-question.dto';
import { CreateLongestSongQuestionDto } from '../dto/create-longest-song-question.dto';
import { CreateTracklistOrderQuestionDto } from '../dto/create-tracklist-order-question.dto';
import type { AnyPrompt } from '../../../entities/prompts/any-prompt.type';
import type { Choice } from '../../../entities/choices/choice.type';
import type { Correct } from '../../../entities/corrects/correct.type';

type KnowledgeTriviaDto =
  | CreateAlbumYearGuessQuestionDto
  | CreateSongAlbumMatchQuestionDto
  | CreateFillBlankQuestionDto
  | CreateGuessByLyricQuestionDto
  | CreateLifeTriviaQuestionDto
  | CreateTimelineOrderQuestionDto
  | CreatePopularityMatchQuestionDto
  | CreateLongestSongQuestionDto
  | CreateTracklistOrderQuestionDto;

@Injectable()
export class KnowledgeTriviaQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  private mapTheme(questionType: string): QuestionTheme {
    const themeMap: Record<string, QuestionTheme> = {
      'album-year-guess': QuestionTheme.Albums,
      'song-album-match': QuestionTheme.Albums,
      'fill-blank': QuestionTheme.Lyrics,
      'guess-by-lyric': QuestionTheme.Lyrics,
      'life-trivia': QuestionTheme.Trivia,
      'timeline-order': QuestionTheme.Timeline,
      'popularity-match': QuestionTheme.Popularity,
      'longest-song': QuestionTheme.Songs,
      'tracklist-order': QuestionTheme.Tracklist,
    };
    return themeMap[questionType] || QuestionTheme.Trivia;
  }

  async create(dto: KnowledgeTriviaDto): Promise<Question> {
    const theme = this.mapTheme(dto.questionType);

    const question = this.questionRepository.create({
      questionType: dto.questionType as QuestionType,
      difficulty: dto.difficulty as Difficulty,
      themesJSON: [theme],
      subjectsJSON: [], // Can be populated later
      promptJSON: dto.prompt as unknown as AnyPrompt,
      choicesJSON: (dto as any).choices
        ? ((dto as any).choices as unknown as Choice[])
        : null,
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

  async createAlbumYearGuessQuestion(
    dto: CreateAlbumYearGuessQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createSongAlbumMatchQuestion(
    dto: CreateSongAlbumMatchQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createFillBlankQuestion(
    dto: CreateFillBlankQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createGuessByLyricQuestion(
    dto: CreateGuessByLyricQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createLifeTriviaQuestion(
    dto: CreateLifeTriviaQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createTimelineOrderQuestion(
    dto: CreateTimelineOrderQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createPopularityMatchQuestion(
    dto: CreatePopularityMatchQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createLongestSongQuestion(
    dto: CreateLongestSongQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }

  async createTracklistOrderQuestion(
    dto: CreateTracklistOrderQuestionDto,
  ): Promise<Question> {
    return this.create(dto);
  }
}
