import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSimulationService } from './quiz-simulation.service';
import { QuizSimulationController } from './quiz-simulation.controller';
import { DailyQuizTestController } from './daily-quiz-test.controller';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import { UserDevice } from '../database/entities/user-device.entity';
import { DailyQuizComposerModule } from '../database/services/daily-quiz-composer';
import { NotificationService } from '../services/notification.service';
import { DailyQuizJobProcessor } from '../services/daily-quiz-job-processor.service';

/**
 * 🧪 Quiz Testing Module
 *
 * Self-contained module for testing the complete daily quiz workflow:
 * - DailyQuizTestController: Centralized endpoint for real-life testing
 * - QuizSimulationController: 10-minute simulation environment
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyQuiz,
      DailyQuizQuestion,
      Question,
      UserDevice,
    ]),
    DailyQuizComposerModule,
  ],
  controllers: [QuizSimulationController, DailyQuizTestController],
  providers: [
    QuizSimulationService,
    NotificationService,
    DailyQuizJobProcessor,
  ],
  exports: [QuizSimulationService],
})
export class QuizSimulationModule {}
