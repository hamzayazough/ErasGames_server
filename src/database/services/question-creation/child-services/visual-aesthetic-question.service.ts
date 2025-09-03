import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateAiVisualQuestionDto } from '../dto/create-ai-visual-question.dto';
import { AiVisualQuestion } from '../../../../entities/questions/ai-visual.interface';

type VisualAestheticDto = CreateAiVisualQuestionDto;

@Injectable()
export class VisualAestheticQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(
    createQuestionDto: VisualAestheticDto,
  ): Promise<AiVisualQuestion> {
    const newQuestion = {
      id: uuidv4(),
      ...createQuestionDto,
    };
    console.log(
      `Creating ${createQuestionDto.questionType} question in VisualAestheticQuestionService:`,
      newQuestion,
    );
    return newQuestion as any;
  }
}
