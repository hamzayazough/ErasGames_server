import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateInspirationMapQuestionDto } from '../dto/create-inspiration-map-question.dto';
import { InspirationMapQuestion } from '../../../../entities/questions/inspiration-map.interface';

type InteractiveGameDto = CreateInspirationMapQuestionDto;

@Injectable()
export class InteractiveGameQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(
    createQuestionDto: InteractiveGameDto,
  ): Promise<InspirationMapQuestion> {
    const newQuestion = {
      id: uuidv4(),
      ...createQuestionDto,
    };
    console.log(
      `Creating ${createQuestionDto.questionType} question in InteractiveGameQuestionService:`,
      newQuestion,
    );
    return newQuestion as any;
  }
}
