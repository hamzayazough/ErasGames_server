import { Injectable, BadRequestException } from '@nestjs/common';
import { Question } from '../../entities/question.entity';
import { AudioBasedQuestionService } from './child-services/audio-based-question.service';
import { InteractiveGameQuestionService } from './child-services/interactive-game-question.service';
import { KnowledgeTriviaQuestionService } from './child-services/knowledge-trivia-question.service';
import { VisualAestheticQuestionService } from './child-services/visual-aesthetic-question.service';
import { QuestionCreationDto } from './dto/question-creation.dto';

// Import specific DTOs for type casting
import { CreateOneSecondQuestionDto } from './dto/create-one-second-question.dto';
import { CreateReverseAudioQuestionDto } from './dto/create-reverse-audio-question.dto';
import { CreateSoundAlikeSnippetQuestionDto } from './dto/create-sound-alike-snippet-question.dto';
import { CreateOddOneOutQuestionDto } from './dto/create-odd-one-out-question.dto';
import { CreateSpeedTapQuestionDto } from './dto/create-speed-tap-question.dto';
import { CreateLyricMashupQuestionDto } from './dto/create-lyric-mashup-question.dto';
import { CreateAlbumYearGuessQuestionDto } from './dto/create-album-year-guess-question.dto';
import { CreateSongAlbumMatchQuestionDto } from './dto/create-song-album-match-question.dto';
import { CreateFillBlankQuestionDto } from './dto/create-fill-blank-question.dto';
import { CreateGuessByLyricQuestionDto } from './dto/create-guess-by-lyric-question.dto';
import { CreateLifeTriviaQuestionDto } from './dto/create-life-trivia-question.dto';
import { CreateTimelineOrderQuestionDto } from './dto/create-timeline-order-question.dto';
import { CreatePopularityMatchQuestionDto } from './dto/create-popularity-match-question.dto';
import { CreateLongestSongQuestionDto } from './dto/create-longest-song-question.dto';
import { CreateTracklistOrderQuestionDto } from './dto/create-tracklist-order-question.dto';
import { CreateAiVisualQuestionDto } from './dto/create-ai-visual-question.dto';
import { CreateInspirationMapQuestionDto } from './dto/create-inspiration-map-question.dto';
import { CreateOutfitEraQuestionDto } from './dto/create-outfit-era-question.dto';
import { CreateMoodMatchQuestionDto } from './dto/create-mood-match-question.dto';

@Injectable()
export class QuestionCreationService {
  constructor(
    private readonly audioBasedQuestionService: AudioBasedQuestionService,
    private readonly interactiveGameQuestionService: InteractiveGameQuestionService,
    private readonly knowledgeTriviaQuestionService: KnowledgeTriviaQuestionService,
    private readonly visualAestheticQuestionService: VisualAestheticQuestionService,
  ) {}

  async createQuestion(questionDto: QuestionCreationDto): Promise<Question> {
    const questionType = questionDto.questionType;

    // Route to appropriate service based on question type
    switch (questionType) {
      // Audio-based questions
      case 'one-second':
        return this.audioBasedQuestionService.create(
          questionDto as CreateOneSecondQuestionDto,
        );
      case 'reverse-audio':
        return this.audioBasedQuestionService.create(
          questionDto as CreateReverseAudioQuestionDto,
        );
      case 'sound-alike-snippet':
        return this.audioBasedQuestionService.create(
          questionDto as CreateSoundAlikeSnippetQuestionDto,
        );

      // Interactive game questions
      case 'odd-one-out':
        return this.interactiveGameQuestionService.create(
          questionDto as CreateOddOneOutQuestionDto,
        );
      case 'speed-tap':
        return this.interactiveGameQuestionService.create(
          questionDto as CreateSpeedTapQuestionDto,
        );
      case 'lyric-mashup':
        return this.interactiveGameQuestionService.create(
          questionDto as CreateLyricMashupQuestionDto,
        );

      // Knowledge & trivia questions
      case 'album-year-guess':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateAlbumYearGuessQuestionDto,
        );
      case 'song-album-match':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateSongAlbumMatchQuestionDto,
        );
      case 'fill-blank':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateFillBlankQuestionDto,
        );
      case 'guess-by-lyric':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateGuessByLyricQuestionDto,
        );
      case 'life-trivia':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateLifeTriviaQuestionDto,
        );
      case 'timeline-order':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateTimelineOrderQuestionDto,
        );
      case 'popularity-match':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreatePopularityMatchQuestionDto,
        );
      case 'longest-song':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateLongestSongQuestionDto,
        );
      case 'tracklist-order':
        return this.knowledgeTriviaQuestionService.create(
          questionDto as CreateTracklistOrderQuestionDto,
        );

      // Visual & aesthetic questions
      case 'ai-visual':
        return this.visualAestheticQuestionService.create(
          questionDto as CreateAiVisualQuestionDto,
        );
      case 'inspiration-map':
        return this.visualAestheticQuestionService.create(
          questionDto as CreateInspirationMapQuestionDto,
        );
      case 'outfit-era':
        return this.visualAestheticQuestionService.create(
          questionDto as CreateOutfitEraQuestionDto,
        );
      case 'mood-match':
        return this.visualAestheticQuestionService.create(
          questionDto as CreateMoodMatchQuestionDto,
        );

      default: {
        // This should never happen if all question types are handled
        throw new BadRequestException(
          `Unsupported question type: ${String(questionType)}`,
        );
      }
    }
  }

  // Convenience methods for bulk operations
  async createMultipleQuestions(
    questionDtos: QuestionCreationDto[],
  ): Promise<Question[]> {
    const createdQuestions: Question[] = [];

    for (const dto of questionDtos) {
      const question = await this.createQuestion(dto);
      createdQuestions.push(question);
    }

    return createdQuestions;
  }

  // Get supported question types
  getSupportedQuestionTypes(): string[] {
    return [
      // Audio-based
      'one-second',
      'reverse-audio',
      'sound-alike-snippet',
      // Interactive game
      'odd-one-out',
      'speed-tap',
      'lyric-mashup',
      // Knowledge & trivia
      'album-year-guess',
      'song-album-match',
      'fill-blank',
      'guess-by-lyric',
      'life-trivia',
      'timeline-order',
      'popularity-match',
      'longest-song',
      'tracklist-order',
      // Visual & aesthetic
      'ai-visual',
      'inspiration-map',
      'outfit-era',
      'mood-match',
    ];
  }
}
