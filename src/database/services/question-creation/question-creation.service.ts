import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { QuestionType } from '../../../entities/questions/basic-question.interface';
import { AiVisualQuestionService } from './child-services/ai-visual-question.service';
import { AlbumYearGuessQuestionService } from './child-services/album-year-guess-question.service';
import { FillBlankQuestionService } from './child-services/fill-blank-question.service';
import { GuessByLyricQuestionService } from './child-services/guess-by-lyric-question.service';
import { InspirationMapQuestionService } from './child-services/inspiration-map-question.service';

@Injectable()
export class QuestionCreationService {
  private serviceMap: Map<QuestionType, any>;

  constructor(
    private readonly aiVisualQuestionService: AiVisualQuestionService,
    private readonly albumYearGuessQuestionService: AlbumYearGuessQuestionService,
    private readonly fillBlankQuestionService: FillBlankQuestionService,
    private readonly guessByLyricQuestionService: GuessByLyricQuestionService,
    private readonly inspirationMapQuestionService: InspirationMapQuestionService,
  ) {
    this.serviceMap = new Map<QuestionType, any>([
      ['ai_visual', this.aiVisualQuestionService],
      ['album_year_guess', this.albumYearGuessQuestionService],
      ['fill_blank', this.fillBlankQuestionService],
      ['guess_by_lyric', this.guessByLyricQuestionService],
      ['inspiration_map', this.inspirationMapQuestionService],
    ]);
  }

  async createQuestion(questionDto: any): Promise<any> {
    const questionType = questionDto.questionType;
    const service = this.serviceMap.get(questionType);

    if (!service) {
      throw new BadRequestException(
        `Unsupported question type: ${questionType}`,
      );
    }

    return service.create(questionDto);
  }
}
