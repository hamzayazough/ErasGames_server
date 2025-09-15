import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Question } from '../../entities/question.entity';
import { DailyQuiz } from '../../entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../entities/daily-quiz-question.entity';
import { CompositionLogEntity } from '../../entities/composition-log.entity';
import { DailyQuizComposerService } from './daily-quiz-composer.service';
import { QuestionSelectorService } from './question-selector.service';
import { DifficultyDistributionService } from './difficulty-distribution.service';
import { AntiRepeatService } from './anti-repeat.service';
import { TemplateService } from './template.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Question,
      DailyQuiz,
      DailyQuizQuestion,
      CompositionLogEntity,
    ]),
  ],
  providers: [
    AntiRepeatService,
    DifficultyDistributionService,
    TemplateService,
    QuestionSelectorService,
    DailyQuizComposerService,
  ],
  exports: [
    DailyQuizComposerService,
    QuestionSelectorService,
    DifficultyDistributionService,
    AntiRepeatService,
    TemplateService,
  ],
})
export class DailyQuizComposerModule {}
