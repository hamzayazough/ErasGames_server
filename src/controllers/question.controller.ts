import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { QuestionCreationService } from '../database/services/question-creation/question-creation.service';
import { Question } from '../database/entities/question.entity';
import type { QuestionCreationDto } from '../database/services/question-creation/dto/question-creation.dto';

// Import specific DTOs for typed endpoints
import { CreateAlbumYearGuessQuestionDto } from '../database/services/question-creation/dto/create-album-year-guess-question.dto';
import { CreateOneSecondQuestionDto } from '../database/services/question-creation/dto/create-one-second-question.dto';
import { CreateAiVisualQuestionDto } from '../database/services/question-creation/dto/create-ai-visual-question.dto';
import { CreateOddOneOutQuestionDto } from '../database/services/question-creation/dto/create-odd-one-out-question.dto';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionCreationService: QuestionCreationService,
  ) {}

  @Get('types')
  getSupportedQuestionTypes(): { supportedTypes: string[] } {
    return {
      supportedTypes: this.questionCreationService.getSupportedQuestionTypes(),
    };
  }

  @Post('create')
  async createQuestion(
    @Body() questionDto: QuestionCreationDto,
  ): Promise<Question> {
    try {
      return await this.questionCreationService.createQuestion(questionDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('create/batch')
  async createMultipleQuestions(
    @Body() questionDtos: QuestionCreationDto[],
  ): Promise<Question[]> {
    try {
      return await this.questionCreationService.createMultipleQuestions(
        questionDtos,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Specific endpoints for demonstration
  @Post('create/album-year-guess')
  async createAlbumYearGuessQuestion(
    @Body() dto: CreateAlbumYearGuessQuestionDto,
  ): Promise<Question> {
    return this.questionCreationService.createQuestion(dto);
  }

  @Post('create/one-second')
  async createOneSecondQuestion(
    @Body() dto: CreateOneSecondQuestionDto,
  ): Promise<Question> {
    return this.questionCreationService.createQuestion(dto);
  }

  @Post('create/ai-visual')
  async createAiVisualQuestion(
    @Body() dto: CreateAiVisualQuestionDto,
  ): Promise<Question> {
    return this.questionCreationService.createQuestion(dto);
  }

  @Post('create/odd-one-out')
  async createOddOneOutQuestion(
    @Body() dto: CreateOddOneOutQuestionDto,
  ): Promise<Question> {
    return this.questionCreationService.createQuestion(dto);
  }
}
