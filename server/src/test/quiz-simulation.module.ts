import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSimulationService } from './quiz-simulation.service';
import { QuizSimulationController } from './quiz-simulation.controller';
import { DebugQuestionsController } from './debug-questions.controller';
import { DebugQuestionsResetController } from './debug-questions-reset.controller';
import { DebugQuizCleanupController } from './debug-quiz-cleanup.controller';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import { UserDevice } from '../database/entities/user-device.entity';
import { DailyQuizComposerModule } from '../database/services/daily-quiz-composer';
import { NotificationService } from '../services/notification.service';

/**
 * 🧪 Quiz Simulation Module
 *
 * Self-contained module for testing the complete daily quiz workflow
 * in a 10-minute simulation environment.
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
  controllers: [QuizSimulationController, DebugQuestionsController, DebugQuestionsResetController, DebugQuizCleanupController],
  providers: [QuizSimulationService, NotificationService],
  exports: [QuizSimulationService],
})
export class QuizSimulationModule {}
