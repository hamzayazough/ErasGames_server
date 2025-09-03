import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';

@Injectable()
export class AudioBasedQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(createQuestionDto: any): Promise<any> {
    // Logic for audio-based questions will go here
    console.log('Creating audio-based question:', createQuestionDto);
    return Promise.resolve({});
  }
}
