import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { QuestionCreationService } from '../../database/services/question-creation/question-creation.service';
import { QuestionService } from '../../database/services/question-creation/question.service';
import { Question } from '../../database/entities/question.entity';
import type { QuestionCreationDto } from '../../database/services/question-creation/dto/question-creation.dto';

// Import specific DTOs for typed endpoints
import { CreateAlbumYearGuessQuestionDto } from '../../database/services/question-creation/dto/create-album-year-guess-question.dto';
import { CreateOneSecondQuestionDto } from '../../database/services/question-creation/dto/create-one-second-question.dto';
import { CreateAiVisualQuestionDto } from '../../database/services/question-creation/dto/create-ai-visual-question.dto';
import { CreateOddOneOutQuestionDto } from '../../database/services/question-creation/dto/create-odd-one-out-question.dto';

@Controller('questions')
@UseGuards(AdminGuard)
export class QuestionController {
  constructor(
    private readonly questionCreationService: QuestionCreationService,
    private readonly questionService: QuestionService,
  ) {}

  @Get('types')
  getSupportedQuestionTypes(): { supportedTypes: string[] } {
    return {
      supportedTypes: this.questionCreationService.getSupportedQuestionTypes(),
    };
  }

  @Get()
  async getAllQuestions(): Promise<Question[]> {
    try {
      return await this.questionService.getAllQuestions();
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve questions: ${error.message}`,
      );
    }
  }

  @Get('stats')
  async getQuestionStats() {
    try {
      return await this.questionService.getQuestionStats();
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve question statistics: ${error.message}`,
      );
    }
  }

  @Get('approved')
  async getApprovedQuestions(): Promise<Question[]> {
    try {
      return await this.questionService.getQuestionsByApprovalStatus(true);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve approved questions: ${error.message}`,
      );
    }
  }

  @Get('pending')
  async getPendingQuestions(): Promise<Question[]> {
    try {
      return await this.questionService.getQuestionsByApprovalStatus(false);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve pending questions: ${error.message}`,
      );
    }
  }

  @Get('type/:type')
  async getQuestionsByType(@Param('type') type: string): Promise<Question[]> {
    try {
      return await this.questionService.getQuestionsByType(type);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve questions by type: ${error.message}`,
      );
    }
  }

  @Get('difficulty/:difficulty')
  async getQuestionsByDifficulty(
    @Param('difficulty') difficulty: string,
  ): Promise<Question[]> {
    try {
      return await this.questionService.getQuestionsByDifficulty(difficulty);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve questions by difficulty: ${error.message}`,
      );
    }
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string): Promise<Question> {
    try {
      const question = await this.questionService.getQuestionById(id);
      if (!question) {
        throw new BadRequestException(`Question with ID ${id} not found`);
      }
      return question;
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve question: ${error.message}`,
      );
    }
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

  @Patch(':id/approve')
  async approveQuestion(@Param('id') id: string): Promise<Question> {
    try {
      return await this.questionService.approveQuestion(id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to approve question: ${error.message}`,
      );
    }
  }

  @Patch(':id/disable')
  async disableQuestion(@Param('id') id: string): Promise<Question> {
    try {
      return await this.questionService.disableQuestion(id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to disable question: ${error.message}`,
      );
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
