import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSimulationService } from './quiz-simulation.service';
import { QuizSimulationController } from './quiz-simulation.controller';
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
 * - QuizSimulationController: 10-minute simulation environment
 *
 * Note: Daily quiz testing endpoints have been moved to AdminDailyQuizController
 * in the admin module for better organization and security.
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
  controllers: [QuizSimulationController],
  providers: [
    QuizSimulationService,
    NotificationService,
    DailyQuizJobProcessor,
  ],
  exports: [QuizSimulationService],
})
export class QuizSimulationModule {}
