import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Question } from '../../database/entities/question.entity';

// External Modules
import { DailyQuizComposerModule } from '../../database/services/daily-quiz-composer';

// Services
import { QuizCreationService } from './quiz-creation.service';
import { AdminService } from './admin.service';
import { AdminCompositionService } from './admin-composition.service';
import { AdminMonitoringService } from './admin-monitoring.service';

/**
 * 🎯 Quiz Creation Module
 *
 * Centralized module for all quiz creation and admin functionality:
 * - QuizCreationService: Core quiz creation operations
 * - AdminService: Administrative quiz management
 * - Admin child services: Specialized admin operations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DailyQuiz, DailyQuizQuestion, Question]),
    DailyQuizComposerModule,
  ],
  providers: [
    QuizCreationService,
    AdminService,
    AdminCompositionService,
    AdminMonitoringService,
  ],
  exports: [
    QuizCreationService,
    AdminService,
    AdminCompositionService,
    AdminMonitoringService,
  ],
})
export class QuizCreationModule {}
