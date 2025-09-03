import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateAlbumYearGuessQuestionDto } from '../dto/create-album-year-guess-question.dto';
import { CreateFillBlankQuestionDto } from '../dto/create-fill-blank-question.dto';
import { CreateGuessByLyricQuestionDto } from '../dto/create-guess-by-lyric-question.dto';
import { AlbumYearGuessQuestion } from '../../../../entities/questions/album-year-guess.interface';
import { FillBlankQuestion } from '../../../../entities/questions/fill-blank.interface';
import { GuessByLyricQuestion } from '../../../../entities/questions/guess-by-lyric.interface';

type KnowledgeTriviaDto =
  | CreateAlbumYearGuessQuestionDto
  | CreateFillBlankQuestionDto
  | CreateGuessByLyricQuestionDto;

@Injectable()
export class KnowledgeTriviaQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(
    createQuestionDto: KnowledgeTriviaDto,
  ): Promise<
    AlbumYearGuessQuestion | FillBlankQuestion | GuessByLyricQuestion
  > {
    const newQuestion = {
      id: uuidv4(),
      ...createQuestionDto,
    };
    console.log(
      `Creating ${createQuestionDto.questionType} question in KnowledgeTriviaQuestionService:`,
      newQuestion,
    );
    // await this.questionRepository.save(newQuestion);
    return newQuestion as any;
  }
}
